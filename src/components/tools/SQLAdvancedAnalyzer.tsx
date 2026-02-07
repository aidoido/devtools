import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import ToolLayout from '../ToolLayout'

/** Oracle SQL keywords to exclude from column/operand extraction */
const SQL_KEYWORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'CROSS', 'ON', 'AND', 'OR', 'NOT',
  'GROUP', 'BY', 'HAVING', 'ORDER', 'ASC', 'DESC', 'NULLS', 'FIRST', 'LAST', 'FETCH', 'ROWS', 'ONLY',
  'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS', 'NULL', 'AS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
  'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'DISTINCT', 'WITH', 'UNION', 'ALL', 'INSERT', 'UPDATE', 'DELETE',
  'VALUES', 'SET', 'INTO', 'ROWNUM', 'OVER', 'PARTITION', 'RANGE', 'ROWS', 'PRECEDING', 'FOLLOWING'
])

interface ParsedCondition {
  left: string
  operator: string
  right: string
  type: 'FILTER' | 'JOIN'
}

interface ParsedJoin {
  joinType: string
  leftTable: string
  rightTable: string
  condition: string
}

export default function SQLAdvancedAnalyzer() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    try {
      const sql = normalizeWhitespace(input.trim())
      const result = analyzeOracleSQL(sql)
      setOutput(result)
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Analysis failed'}`)
    }
  }, [input])

  function normalizeWhitespace(s: string): string {
    return s.replace(/\s+/g, ' ').trim()
  }

  /** Get base table name from schema.table or table */
  function baseTableName(ref: string): string {
    const trimmed = ref.trim().replace(/^["`]|["`]$/g, '')
    const parts = trimmed.split('.')
    return parts.length > 1 ? parts[parts.length - 1] : trimmed
  }

  /** Check if token looks like a literal or bind (exclude from columns) */
  function isLiteralOrBind(token: string): boolean {
    if (!token) return true
    const t = token.trim()
    if (/^\d+(\.\d+)?$/.test(t)) return true
    if (/^['"].*['"]$/.test(t)) return true
    if (/^:\w+$/.test(t)) return true
    if (SQL_KEYWORDS.has(t.toUpperCase())) return true
    return false
  }

  /** Extract all table references (FROM + JOIN), unique by base name, with alias map */
  function extractTables(sql: string): { tables: string[]; aliasToTable: Map<string, string> } {
    const tables: string[] = []
    const seen = new Set<string>()
    const aliasToTable = new Map<string, string>()

    // FROM clause: FROM table [alias] or FROM schema.table [alias]
    const fromRegex = /\bFROM\s+([\w.$]+)(?:\s+(?:AS\s+)?(\w+))?(?=\s+JOIN|\s+WHERE|\s+GROUP|\s+ORDER|\s+HAVING|\s*$)/gi
    let m
    while ((m = fromRegex.exec(sql)) !== null) {
      const ref = m[1].trim()
      const base = baseTableName(ref)
      const alias = m[2] && !/^(JOIN|WHERE|GROUP|ORDER|HAVING|ON)$/i.test(m[2]) ? m[2] : null
      if (!seen.has(base)) {
        seen.add(base)
        tables.push(base)
      }
      if (alias) aliasToTable.set(alias, base)
    }

    // JOIN clauses: [type] JOIN table [alias]
    const joinRegex = /\b(?:INNER|LEFT|RIGHT|FULL|CROSS)?\s*JOIN\s+([\w.$]+)(?:\s+(?:AS\s+)?(\w+))?(?=\s+ON|\s+JOIN|\s+WHERE|\s+GROUP|\s+ORDER|\s+HAVING|\s*$)/gi
    while ((m = joinRegex.exec(sql)) !== null) {
      const ref = m[1].trim()
      const base = baseTableName(ref)
      const alias = m[2] && !/^(ON|WHERE|GROUP|ORDER|HAVING)$/i.test(m[2]) ? m[2] : null
      if (!seen.has(base)) {
        seen.add(base)
        tables.push(base)
      }
      if (alias) aliasToTable.set(alias, base)
    }

    // Old-style Oracle: FROM a, b WHERE a.x = b.y (+)  → tables from comma list
    const fromCommaMatch = sql.match(/\bFROM\s+([^WHERE]+?)(?=\s+WHERE|\s+GROUP|\s+ORDER|\s+HAVING|\s*$)/i)
    if (fromCommaMatch) {
      const list = fromCommaMatch[1]
      if (list.includes(',')) {
        const parts = splitTopLevel(list, ',')
        parts.forEach(p => {
          const ref = p.replace(/\s+(?:AS\s+)?\w+\s*$/, '').trim()
          if (ref && !/^\s*\(/.test(ref)) {
            const base = baseTableName(ref)
            if (!seen.has(base)) {
              seen.add(base)
              tables.push(base)
            }
            const aliasMatch = p.trim().match(/\s+(?:AS\s+)?(\w+)\s*$/)
            if (aliasMatch) aliasToTable.set(aliasMatch[1], base)
          }
        })
      }
    }

    return { tables, aliasToTable }
  }

  /** Split by delimiter only at top level (ignoring parentheses) */
  function splitTopLevel(text: string, delim: string): string[] {
    const result: string[] = []
    let current = ''
    let depth = 0
    let i = 0
    while (i < text.length) {
      const c = text[i]
      if (c === '(') depth++
      else if (c === ')') depth--
      else if (depth === 0 && text.substring(i, i + delim.length) === delim) {
        result.push(current.trim())
        current = ''
        i += delim.length
        continue
      }
      current += c
      i++
    }
    if (current.trim()) result.push(current.trim())
    return result
  }

  /** Extract column references from a clause; return unique column names (optionally with table/alias prefix for grouping) */
  function extractColumnRefsFromClause(
    clause: string,
    aliasToTable: Map<string, string>,
    tableList: string[]
  ): Array<{ table: string | null; column: string }> {
    const refs: Array<{ table: string | null; column: string }> = []
    const seen = new Set<string>()

    // schema.table.column or alias.column or table.column
    const qualifiedRegex = /\b([\w.]+)\.(\w+)\b/g
    let m
    while ((m = qualifiedRegex.exec(clause)) !== null) {
      const left = m[1]
      const col = m[2]
      if (isLiteralOrBind(col)) continue
      const key = `${left}.${col}`
      if (seen.has(key)) continue
      seen.add(key)
      const base = left.includes('.') ? left.split('.').pop()! : left
      const table = aliasToTable.get(base) ?? (tableList.includes(base) ? base : null)
      refs.push({ table, column: col })
    }

    // Unqualified column: word that is not keyword, not literal, not in "table.column" (already matched)
    const skipPattern = /\b([\w.]+)\.(\w+)\b/g
    let withoutQualified = clause
    while ((m = skipPattern.exec(clause)) !== null) {
      withoutQualified = withoutQualified.replace(m[0], ' ')
    }
    const wordPattern = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g
    while ((m = wordPattern.exec(withoutQualified)) !== null) {
      const col = m[1]
      if (SQL_KEYWORDS.has(col.toUpperCase())) continue
      if (isLiteralOrBind(col)) continue
      if (seen.has(col)) continue
      // Only accept if it looks like a column in a predicate/list (e.g. "salary >", "job_id =", "first_name,")
      const idx = m.index
      const after = withoutQualified.slice(idx + col.length, idx + col.length + 20)
      if (!/^[\s]*[=<>!]|^[\s]*,|^[\s]+(?:ASC|DESC|NULLS)/i.test(after) && !/^[\s]*\s+(?:IN|LIKE|BETWEEN|IS)/i.test(after)) continue
      seen.add(col)
      refs.push({ table: tableList.length === 1 ? tableList[0] : null, column: col })
    }

    return refs
  }

  /** Gather all columns from SELECT, WHERE, ON, ORDER BY, GROUP BY, HAVING */
  function extractColumns(
    sql: string,
    tables: string[],
    aliasToTable: Map<string, string>
  ): Map<string, Set<string>> {
    const byTable = new Map<string, Set<string>>()
    tables.forEach(t => byTable.set(t, new Set()))

    function addColumn(table: string | null, column: string) {
      if (table) {
        byTable.get(table)?.add(column)
      } else {
        if (tables.length === 1) byTable.get(tables[0])?.add(column)
        else tables.forEach(t => byTable.get(t)?.add(column))
      }
    }

    // SELECT list
    const selectMatch = sql.match(/\bSELECT\s+(.*?)\s+FROM/i)
    if (selectMatch) {
      const selectList = selectMatch[1]
      const cols = splitTopLevel(selectList, ',')
      cols.forEach(c => {
        const clean = c.replace(/\s+AS\s+\w+$/i, '').trim()
        if (clean === '*') {
          tables.forEach(t => byTable.get(t)?.add('*'))
          return
        }
        const qualified = clean.match(/(\w+)\.(\w+)/)
        if (qualified) {
          const tableOrAlias = qualified[1]
          const col = qualified[2]
          const table = aliasToTable.get(tableOrAlias) ?? (tables.includes(tableOrAlias) ? tableOrAlias : null)
          addColumn(table, col)
        } else {
          const colMatch = clean.match(/^([a-zA-Z_][a-zA-Z0-9_]*)$/)
          if (colMatch && !SQL_KEYWORDS.has(colMatch[1].toUpperCase())) addColumn(tables.length === 1 ? tables[0] : null, colMatch[1])
        }
      })
    }

    // WHERE
    const whereMatch = sql.match(/\bWHERE\s+(.*?)(?=\bGROUP\b|\bORDER\b|\bHAVING\b|\bFETCH\b|\bROWNUM\b|$)/i)
    if (whereMatch) {
      const refs = extractColumnRefsFromClause(whereMatch[1], aliasToTable, tables)
      refs.forEach(({ table, column }) => addColumn(table, column))
    }

    // JOIN ON
    let onMatch: RegExpExecArray | null
    const onPattern = /\bON\s+([^JOIN]+?)(?=\bJOIN\b|\bWHERE\b|\bGROUP\b|\bORDER\b|\bHAVING\b|$)/gi
    while ((onMatch = onPattern.exec(sql)) !== null) {
      const refs = extractColumnRefsFromClause(onMatch[1], aliasToTable, tables)
      refs.forEach(({ table, column }) => addColumn(table, column))
    }

    // ORDER BY
    const orderMatch = sql.match(/\bORDER\s+BY\s+(.*?)(?=\bFETCH\b|\bROWNUM\b|$)/i)
    if (orderMatch) {
      const parts = splitTopLevel(orderMatch[1], ',')
      parts.forEach(p => {
        const clean = p.replace(/\s+(?:ASC|DESC|NULLS\s+FIRST|NULLS\s+LAST)\s*$/i, '').trim()
        const qualified = clean.match(/(\w+)\.(\w+)/)
        if (qualified) {
          const table = aliasToTable.get(qualified[1]) ?? (tables.includes(qualified[1]) ? qualified[1] : null)
          addColumn(table, qualified[2])
        } else if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(clean) && !SQL_KEYWORDS.has(clean.toUpperCase())) {
          addColumn(tables.length === 1 ? tables[0] : null, clean)
        }
      })
    }

    // GROUP BY
    const groupMatch = sql.match(/\bGROUP\s+BY\s+(.*?)(?=\bHAVING\b|\bORDER\b|$)/i)
    if (groupMatch) {
      const refs = extractColumnRefsFromClause(groupMatch[1], aliasToTable, tables)
      refs.forEach(({ table, column }) => addColumn(table, column))
    }

    // HAVING
    const havingMatch = sql.match(/\bHAVING\s+(.*?)(?=\bORDER\b|$)/i)
    if (havingMatch) {
      const refs = extractColumnRefsFromClause(havingMatch[1], aliasToTable, tables)
      refs.forEach(({ table, column }) => addColumn(table, column))
    }

    return byTable
  }

  /** Extract conditions: WHERE and HAVING → FILTER; JOIN ON → JOIN. Format: left operator right */
  function extractConditions(
    sql: string,
    aliasToTable: Map<string, string>
  ): ParsedCondition[] {
    const conditions: ParsedCondition[] = []

    function parsePredicates(clause: string, type: 'FILTER' | 'JOIN') {
      const parts = splitByAndOr(clause)
      const opPatterns = [
        /\s*(!=|<>|<=|>=|=|<|>)\s*/,
        /\s+IN\s+/i,
        /\s+LIKE\s+/i,
        /\s+BETWEEN\s+/i,
        /\s+IS\s+(?:NOT\s+)?NULL/i
      ]
      parts.forEach(pred => {
        const trimmed = pred.trim()
        if (!trimmed) return
        let bestIdx = -1
        let opStr = ''
        let opLen = 0
        for (const re of opPatterns) {
          const m = trimmed.match(re)
          if (m) {
            const idx = trimmed.indexOf(m[0])
            if (bestIdx < 0 || idx < bestIdx) {
              bestIdx = idx
              opStr = m[0].trim().toUpperCase()
              opLen = m[0].length
            }
          }
        }
        if (bestIdx < 0) return
        const left = trimmed.slice(0, bestIdx).trim()
        const rest = trimmed.slice(bestIdx + opLen).trim()
        if (isLiteralOrBind(left)) return
        let right = rest
        if (/^IN\s*\(/i.test(rest)) right = rest
        else if (/^LIKE\s+/i.test(rest)) right = rest
        else if (/^BETWEEN\s+/i.test(rest)) right = rest
        else if (/^IS\s+(?:NOT\s+)?NULL/i.test(rest)) right = rest
        else right = rest.split(/\s+(?:AND|OR)\s+/i)[0]?.trim() ?? rest
        conditions.push({
          left: left.replace(/\s+/g, ' '),
          operator: opStr,
          right: right.replace(/\s+/g, ' ').slice(0, 80),
          type
        })
      })
    }

    function splitByAndOr(clause: string): string[] {
      const result: string[] = []
      let current = ''
      let depth = 0
      for (let i = 0; i < clause.length; i++) {
        const c = clause[i]
        if (c === '(') depth++
        else if (c === ')') depth--
        else if (depth === 0 && /\b(AND|OR)\b/i.test(clause.slice(i))) {
          const match = clause.slice(i).match(/^\s*(AND|OR)\s+/i)
          if (match) {
            result.push(current.trim())
            current = ''
            i += match[0].length - 1
            continue
          }
        }
        current += c
      }
      if (current.trim()) result.push(current.trim())
      return result
    }

    const whereMatch = sql.match(/\bWHERE\s+(.*?)(?=\bGROUP\b|\bORDER\b|\bHAVING\b|\bFETCH\b|\bROWNUM\b|$)/i)
    if (whereMatch) parsePredicates(whereMatch[1], 'FILTER')

    const havingMatch = sql.match(/\bHAVING\s+(.*?)(?=\bORDER\b|$)/i)
    if (havingMatch) parsePredicates(havingMatch[1], 'FILTER')

    let onCondMatch: RegExpExecArray | null
    const onRegex = /\bON\s+([^JOIN]+?)(?=\bJOIN\b|\bWHERE\b|\bGROUP\b|\bORDER\b|\bHAVING\b|$)/gi
    while ((onCondMatch = onRegex.exec(sql)) !== null) parsePredicates(onCondMatch[1], 'JOIN')

    return conditions
  }

  /** Extract ANSI joins and old-style Oracle (+) joins */
  function extractJoins(sql: string, tables: string[], aliasToTable: Map<string, string>): ParsedJoin[] {
    const joins: ParsedJoin[] = []

    // ANSI: FROM t1 [type] JOIN t2 ON ...
    const ansiJoinRegex = /\b(?:FROM|JOIN)\s+([\w.$]+)(?:\s+(?:AS\s+)?(\w+))?\s+(INNER\s+JOIN|LEFT\s+JOIN|RIGHT\s+JOIN|FULL\s+JOIN|CROSS\s+JOIN|JOIN)\s+([\w.$]+)(?:\s+(?:AS\s+)?(\w+))?(?=\s+ON\s+)/gi
    let m
    const ansiMatches: Array<{ type: string; left: string; right: string; onClause: string }> = []
    while ((m = ansiJoinRegex.exec(sql)) !== null) {
      const leftRef = m[1]
      const rightRef = m[4]
      const joinType = (m[3] || 'JOIN').trim().replace(/\s+/, ' ')
      const leftBase = baseTableName(leftRef)
      const rightBase = baseTableName(rightRef)
      const after = sql.slice(m.index + m[0].length)
      const onMatch = after.match(/\s+ON\s+(.*?)(?=\bJOIN\b|\bWHERE\b|\bGROUP\b|\bORDER\b|\bHAVING\b|$)/i)
      const onClause = onMatch ? onMatch[1].trim() : ''
      ansiMatches.push({ type: joinType, left: leftBase, right: rightBase, onClause })
    }

    // Simpler: ... JOIN table ON condition
    const simpleJoinRegex = /\b(INNER\s+JOIN|LEFT\s+JOIN|RIGHT\s+JOIN|FULL\s+JOIN|CROSS\s+JOIN|JOIN)\s+([\w.$]+)(?:\s+(?:AS\s+)?(\w+))?\s+ON\s+([^JOIN]+?)(?=\bJOIN\b|\bWHERE\b|\bGROUP\b|\bORDER\b|\bHAVING\b|$)/gi
    let prevRight: string | null = null
    while ((m = simpleJoinRegex.exec(sql)) !== null) {
      const joinType = (m[1] || 'INNER JOIN').trim()
      const rightBase = baseTableName(m[2])
      const onClause = m[4].trim()
      const leftBase = prevRight || (tables[0] ?? '')
      joins.push({ joinType, leftTable: leftBase, rightTable: rightBase, condition: onClause })
      prevRight = rightBase
    }

    if (joins.length === 0 && ansiMatches.length > 0) {
      ansiMatches.forEach(({ type, left, right, onClause }) => {
        joins.push({ joinType: type, leftTable: left, rightTable: right, condition: onClause })
      })
    }

    // Old-style Oracle: WHERE a.col = b.col (+) or a.col (+) = b.col
    if (joins.length === 0 && /\+/.test(sql)) {
      const fromComma = sql.match(/\bFROM\s+([^WHERE]+)\s+WHERE/i)
      if (fromComma) {
        const tableList = splitTopLevel(fromComma[1], ',').map(p => baseTableName(p.replace(/\s+(?:AS\s+)?\w+\s*$/, '').trim()))
        const whereClause = sql.match(/\bWHERE\s+(.+?)(?=\bGROUP\b|\bORDER\b|\bHAVING\b|$)/i)?.[1] ?? ''
        const plusConditions = whereClause.split(/\bAND\b/i).filter(part => /\+/.test(part))
        plusConditions.forEach(cond => {
          const leftSide = cond.replace(/\s*\(\s*\+\s*\)\s*$/, '').trim()
          const rightSide = cond.replace(/^.*?\(\s*\+\s*\)/, '').replace(/^[=<>]+\s*/, '').trim()
          const leftTbl = leftSide.includes('.') ? leftSide.split('.')[0] : null
          const rightTbl = rightSide.includes('.') ? rightSide.split('.')[0] : null
          const t1 = leftTbl && tableList.includes(leftTbl) ? leftTbl : tableList[0]
          const t2 = rightTbl && tableList.includes(rightTbl) ? rightTbl : tableList[1]
          if (t1 && t2) joins.push({ joinType: 'OUTER JOIN (+)', leftTable: t1, rightTable: t2, condition: cond.trim() })
        })
      }
    }

    return joins
  }

  function analyzeOracleSQL(sql: string): string {
    const lines: string[] = []

    const { tables, aliasToTable } = extractTables(sql)
    const columnsByTable = extractColumns(sql, tables, aliasToTable)
    const conditions = extractConditions(sql, aliasToTable)
    const joins = extractJoins(sql, tables, aliasToTable)

    // --- Section 1: Tables Used ---
    lines.push('TABLES USED')
    lines.push('──────────')
    if (tables.length === 0) {
      lines.push('None')
    } else {
      tables.forEach((t, i) => lines.push(`${i + 1}. ${t}`))
    }
    lines.push('')

    // --- Section 2: Columns Used ---
    lines.push('COLUMNS USED')
    lines.push('───────────')
    if (tables.length === 0) {
      lines.push('None')
    } else {
      for (const table of tables) {
        const cols = columnsByTable.get(table)
        const list = cols ? Array.from(cols).sort() : []
        if (list.length === 0) {
          lines.push(`${table}: (none detected)`)
        } else {
          lines.push(`${table}: ${list.join(', ')}`)
        }
      }
      const allCols = new Set<string>()
      columnsByTable.forEach(s => s.forEach(c => allCols.add(c)))
      if (allCols.size > 0) {
        lines.push('')
        lines.push(`All unique columns: ${Array.from(allCols).sort().join(', ')}`)
      }
    }
    lines.push('')

    // --- Section 3: Conditions Used ---
    lines.push('CONDITIONS USED')
    lines.push('───────────────')
    if (conditions.length === 0) {
      lines.push('None')
    } else {
      conditions.forEach((c, i) => {
        lines.push(`${i + 1}. [${c.type}] ${c.left} ${c.operator} ${c.right}`)
      })
      lines.push('')
      const filterCount = conditions.filter(c => c.type === 'FILTER').length
      const joinCount = conditions.filter(c => c.type === 'JOIN').length
      lines.push(`Total: ${conditions.length} (FILTER: ${filterCount}, JOIN: ${joinCount})`)
    }
    lines.push('')

    // --- Section 4: Joins ---
    lines.push('JOINS')
    lines.push('─────')
    if (joins.length === 0) {
      lines.push('None')
    } else {
      joins.forEach((j, i) => {
        lines.push(`${i + 1}. ${j.joinType}: ${j.leftTable} ⋈ ${j.rightTable}`)
        if (j.condition) lines.push(`   ON ${j.condition}`)
      })
    }

    return lines.join('\n')
  }

  return (
    <ToolLayout
      title="Oracle SQL Advanced Analyzer"
      description="Static structural metadata: Tables Used, Columns Used, Conditions Used, Joins (Oracle SQL only)"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="sql"
      outputLanguage="plaintext"
      onCopy={() => {
        if (output && !output.startsWith('Error:')) {
          navigator.clipboard.writeText(output)
          toast.success('Copied to clipboard')
        }
      }}
    />
  )
}

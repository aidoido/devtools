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
  leftAlias?: string
  rightAlias?: string
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
  function extractTables(sql: string): { tables: string[]; aliasToTable: Map<string, string>; fromHasComma: boolean } {
    const tables: string[] = []
    const seen = new Set<string>()
    const aliasToTable = new Map<string, string>()
    let fromHasComma = false

    // FROM clause content (up to WHERE/GROUP/ORDER/HAVING)
    const fromClauseMatch = sql.match(/\bFROM\s+(.+?)(?=\s+WHERE|\s+GROUP|\s+ORDER|\s+HAVING|$)/i)
    const fromClause = fromClauseMatch ? fromClauseMatch[1].trim() : ''

    if (fromClause && splitTopLevel(fromClause, ',').length > 1) {
      fromHasComma = true
      const parts = splitTopLevel(fromClause, ',')
      parts.forEach(p => {
        const seg = p.trim()
        if (!seg || /^\s*\(/.test(seg)) return
        const refMatch = seg.match(/^\s*([\w.]+)(?:\s+(?:AS\s+)?(\w+))?\s*$/)
        if (refMatch) {
          const ref = refMatch[1].trim()
          const alias = refMatch[2] && !/^(JOIN|WHERE|GROUP|ORDER|HAVING|ON)$/i.test(refMatch[2]) ? refMatch[2] : null
          const base = baseTableName(ref)
          if (!seen.has(base)) {
            seen.add(base)
            tables.push(base)
          }
          if (alias) aliasToTable.set(alias, base)
        }
      })
    }

    if (!fromHasComma) {
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
    }

    const joinRegex = /\b(?:INNER|LEFT|RIGHT|FULL|CROSS)?\s*JOIN\s+([\w.$]+)(?:\s+(?:AS\s+)?(\w+))?(?=\s+ON|\s+JOIN|\s+WHERE|\s+GROUP|\s+ORDER|\s+HAVING|\s*$)/gi
    let m
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

    return { tables, aliasToTable, fromHasComma }
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

    // Analytic clauses: OVER (PARTITION BY ... ORDER BY ...)
    const overStart = sql.search(/\bOVER\s*\(/gi)
    if (overStart >= 0) {
      let depth = 0
      let end = -1
      for (let i = sql.indexOf('(', overStart); i < sql.length; i++) {
        if (sql[i] === '(') depth++
        else if (sql[i] === ')') { depth--; if (depth === 0) { end = i; break } }
      }
      if (end > overStart) {
        const overClause = sql.slice(overStart, end + 1)
        const partitionByMatch = overClause.match(/\bPARTITION\s+BY\s+([^ORDER)]+?)(?=\s+ORDER|\s*\))/i)
        if (partitionByMatch) {
          const refs = extractColumnRefsFromClause(partitionByMatch[1], aliasToTable, tables)
          refs.forEach(({ table, column }) => addColumn(table, column))
        }
        const orderByInOver = overClause.match(/\bORDER\s+BY\s+([^)]+?)\s*\)/i)
        if (orderByInOver) {
          const refs = extractColumnRefsFromClause(orderByInOver[1], aliasToTable, tables)
          refs.forEach(({ table, column }) => addColumn(table, column))
        }
      }
    }

    return byTable
  }

  /** Classify predicate as JOIN (alias1.col = alias2.col, different tables) or FILTER */
  function classifyCondition(
    left: string,
    right: string,
    aliasToTable: Map<string, string>
  ): 'FILTER' | 'JOIN' {
    const leftQual = left.match(/^(\w+)\.(\w+)$/)
    const rightQual = right.match(/^(\w+)\.(\w+)$/)
    if (leftQual && rightQual) {
      const t1 = aliasToTable.get(leftQual[1]) ?? (aliasToTable.has(leftQual[1]) ? undefined : leftQual[1])
      const t2 = aliasToTable.get(rightQual[1]) ?? (aliasToTable.has(rightQual[1]) ? undefined : rightQual[1])
      const base1 = t1 ?? leftQual[1]
      const base2 = t2 ?? rightQual[1]
      if (base1 && base2 && base1 !== base2) return 'JOIN'
    }
    return 'FILTER'
  }

  /** Extract conditions: WHERE and HAVING → FILTER or JOIN by classification; JOIN ON → JOIN. */
  function extractConditions(
    sql: string,
    aliasToTable: Map<string, string>
  ): ParsedCondition[] {
    const conditions: ParsedCondition[] = []

    function parsePredicates(clause: string, defaultType: 'FILTER' | 'JOIN', classifyWhere?: boolean) {
      const raw = clause.trim()
      if (!raw) return
      const parts = splitByAndOr(clause)
      const opPatterns: { re: RegExp; order: number }[] = [
        { re: /\s*(!=|<>|<=|>=)\s*/, order: 0 },
        { re: /\s*([=<>])\s*/, order: 1 },
        { re: /\s+IN\s+/i, order: 2 },
        { re: /\s+LIKE\s+/i, order: 3 },
        { re: /\s+BETWEEN\s+/i, order: 4 },
        { re: /\s+IS\s+(?:NOT\s+)?NULL/i, order: 5 }
      ]
      let added = 0
      parts.forEach(pred => {
        const trimmed = pred.trim()
        if (!trimmed) return
        let bestIdx = -1
        let opStr = ''
        let opLen = 0
        let bestOrder = 999
        for (const { re, order } of opPatterns) {
          const match = trimmed.match(re)
          if (match) {
            const idx = trimmed.indexOf(match[0])
            if (bestIdx < 0 || idx < bestIdx || (idx === bestIdx && order < bestOrder)) {
              bestIdx = idx
              bestOrder = order
              opStr = match[0].trim().toUpperCase()
              opLen = match[0].length
            }
          }
        }
        if (bestIdx >= 0) {
          const left = trimmed.slice(0, bestIdx).trim()
          const rest = trimmed.slice(bestIdx + opLen).trim()
          if (!isLiteralOrBind(left)) {
            let right = rest
            if (/^IN\s*\(/i.test(rest)) right = rest
            else if (/^LIKE\s+/i.test(rest)) right = rest
            else if (/^BETWEEN\s+/i.test(rest)) right = rest
            else if (/^IS\s+(?:NOT\s+)?NULL/i.test(rest)) right = rest
            else right = rest.split(/\s+(?:AND|OR)\s+/i)[0]?.trim() ?? rest
            const type = classifyWhere ? classifyCondition(left, right, aliasToTable) : defaultType
            conditions.push({
              left: left.replace(/\s+/g, ' '),
              operator: opStr,
              right: right.replace(/\s+/g, ' ').slice(0, 80),
              type
            })
            added++
          }
        }
      })
      if (added === 0 && raw.length > 0) {
        conditions.push({
          left: raw.slice(0, 40).replace(/\s+/g, ' '),
          operator: '—',
          right: raw.length > 40 ? '…' : '',
          type: defaultType
        })
      }
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
    if (whereMatch) parsePredicates(whereMatch[1], 'FILTER', true)

    const havingMatch = sql.match(/\bHAVING\s+(.*?)(?=\bORDER\b|$)/i)
    if (havingMatch) parsePredicates(havingMatch[1], 'FILTER', false)

    let onCondMatch: RegExpExecArray | null
    const onRegex = /\bON\s+([^JOIN]+?)(?=\bJOIN\b|\bWHERE\b|\bGROUP\b|\bORDER\b|\bHAVING\b|$)/gi
    while ((onCondMatch = onRegex.exec(sql)) !== null) parsePredicates(onCondMatch[1], 'JOIN', false)

    return conditions
  }

  /** Extract ANSI joins, old-style (+) joins, and implicit (comma-FROM) joins */
  function extractJoins(
    sql: string,
    tables: string[],
    aliasToTable: Map<string, string>,
    fromHasComma: boolean
  ): ParsedJoin[] {
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

    // Implicit joins: FROM t1 a, t2 b, t3 c WHERE a.x = b.y AND b.z = c.w → synthesize [IMPLICIT] entries
    if (joins.length === 0 && fromHasComma && aliasToTable.size > 0) {
      const whereMatch = sql.match(/\bWHERE\s+(.*?)(?=\bGROUP\b|\bORDER\b|\bHAVING\b|\bFETCH\b|\bROWNUM\b|$)/i)
      if (whereMatch) {
        const whereClause = whereMatch[1]
        const parts = splitByAndOr(whereClause)
        const opRe = /\s*(!=|<>|<=|>=|=|<|>)\s*/
        parts.forEach(pred => {
          const trimmed = pred.trim()
          if (!trimmed) return
          const opMatch = trimmed.match(opRe)
          if (!opMatch) return
          const idx = trimmed.indexOf(opMatch[0])
          const left = trimmed.slice(0, idx).trim()
          const right = trimmed.slice(idx + opMatch[0].length).trim().split(/\s+(?:AND|OR)\s+/i)[0]?.trim() ?? ''
          if (!/^\w+\.\w+$/.test(left) || !/^\w+\.\w+$/.test(right)) return
          const t1 = aliasToTable.get(left.split('.')[0]) ?? left.split('.')[0]
          const t2 = aliasToTable.get(right.split('.')[0]) ?? right.split('.')[0]
          if (t1 && t2 && t1 !== t2) {
            const leftAlias = left.split('.')[0]
            const rightAlias = right.split('.')[0]
            joins.push({
              joinType: '[IMPLICIT] INNER JOIN',
              leftTable: t1,
              rightTable: t2,
              leftAlias,
              rightAlias,
              condition: `${left} = ${right}`
            })
          }
        })
      }
    }

    return joins
  }

  function analyzeOracleSQL(sql: string): string {
    const lines: string[] = []

    const { tables, aliasToTable, fromHasComma } = extractTables(sql)
    const columnsByTable = extractColumns(sql, tables, aliasToTable)
    const conditions = extractConditions(sql, aliasToTable)
    const joins = extractJoins(sql, tables, aliasToTable, fromHasComma)

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
    }
    lines.push('')

    // --- Section 4: Joins ---
    lines.push('JOINS')
    lines.push('─────')
    if (joins.length === 0) {
      lines.push('None')
    } else {
      joins.forEach((j, i) => {
        const leftLabel = j.leftAlias != null ? `${j.leftTable}(${j.leftAlias})` : j.leftTable
        const rightLabel = j.rightAlias != null ? `${j.rightTable}(${j.rightAlias})` : j.rightTable
        lines.push(`${i + 1}. ${j.joinType}: ${leftLabel} ⋈ ${rightLabel}`)
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

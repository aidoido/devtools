import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import ToolLayout from '../ToolLayout'

interface TableInfo {
  name: string
  alias?: string
  columns: Set<string>
  conditions: number
  joins: number
  usage: string[]
}

interface Issue {
  type: 'warning' | 'error' | 'info' | 'suggestion'
  message: string
  line?: number
}

interface IndexSuggestion {
  table: string
  columns: string[]
  reason: string
  type?: 'btree' | 'bitmap' | 'composite'
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
      const sql = input.trim()
      
      // Check if input is EXPLAIN PLAN output
      if (sql.match(/^\s*PLAN\s+TABLE\s+OUTPUT/i) || sql.match(/^\s*\|/)) {
        analyzeExplainPlan(sql)
        return
      }
      
      analyzeOracleSQL(sql)
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Analysis failed'}`)
    }
  }, [input])

  function analyzeExplainPlan(plan: string) {
    const results: string[] = []
    results.push('═══════════════════════════════════════')
    results.push('  ORACLE EXPLAIN PLAN ANALYSIS')
    results.push('═══════════════════════════════════════')
    results.push('')
    
    const lines = plan.split('\n')
    const planSteps: Array<{ id: string, operation: string, name: string, cost?: string, rows?: string, depth: number }> = []
    
    lines.forEach(line => {
      if (line.includes('|')) {
        const parts = line.split('|').map(p => p.trim()).filter(p => p)
        if (parts.length >= 3) {
          const id = parts[0]
          const operation = parts[1]
          const name = parts[2]
          const cost = parts.find(p => p.includes('Cost='))?.replace('Cost=', '') || parts[parts.length - 2]
          const rows = parts.find(p => p.includes('Rows='))?.replace('Rows=', '') || parts[parts.length - 1]
          
          const depth = id.length - id.replace(/ /g, '').length
          planSteps.push({ id, operation, name, cost, rows, depth })
        }
      }
    })
    
    if (planSteps.length === 0) {
      results.push('Could not parse EXPLAIN PLAN. Please paste Oracle EXPLAIN PLAN output.')
      setOutput(results.join('\n'))
      return
    }
    
    // Render tree view
    results.push('EXECUTION PLAN TREE:')
    results.push('')
    planSteps.forEach(step => {
      const indent = '  '.repeat(step.depth)
      results.push(`${indent}${step.operation.padEnd(20)} ${step.name}`)
      if (step.cost) results.push(`${indent}  Cost: ${step.cost}`)
      if (step.rows) results.push(`${indent}  Rows: ${step.rows}`)
    })
    
    results.push('')
    results.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    results.push('PERFORMANCE ANALYSIS')
    results.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // Detect full table scans
    const fullScans = planSteps.filter(s => 
      s.operation.includes('TABLE ACCESS') && s.operation.includes('FULL')
    )
    if (fullScans.length > 0) {
      results.push(`⚠️  FULL TABLE SCANS: ${fullScans.length}`)
      fullScans.forEach(scan => {
        results.push(`   - ${scan.name}`)
      })
      results.push('')
    }
    
    // Detect high-cost operations
    const highCost = planSteps.filter(s => {
      const cost = parseFloat(s.cost || '0')
      return cost > 1000
    })
    if (highCost.length > 0) {
      results.push(`⚠️  HIGH-COST OPERATIONS (>1000): ${highCost.length}`)
      highCost.forEach(op => {
        results.push(`   - ${op.operation} on ${op.name} (Cost: ${op.cost})`)
      })
      results.push('')
    }
    
    // Join methods
    const hashJoins = planSteps.filter(s => s.operation.includes('HASH JOIN'))
    const nestedLoops = planSteps.filter(s => s.operation.includes('NESTED LOOPS'))
    const mergeJoins = planSteps.filter(s => s.operation.includes('MERGE JOIN'))
    
    if (hashJoins.length > 0) results.push(`HASH JOINs: ${hashJoins.length}`)
    if (nestedLoops.length > 0) results.push(`NESTED LOOPS JOINs: ${nestedLoops.length}`)
    if (mergeJoins.length > 0) results.push(`MERGE JOINs: ${mergeJoins.length}`)
    
    setOutput(results.join('\n'))
  }

  function analyzeOracleSQL(sql: string) {
    const results: string[] = []
    const issues: Issue[] = []
    const indexSuggestions: IndexSuggestion[] = []
    const tables = new Map<string, TableInfo>()
    
    // ========== EXTRACT ALL DATA FIRST ==========
    // Extract tables
    const fromMatches = sql.match(/\bFROM\s+([\w.$]+)(?:\s+(?:AS\s+)?(\w+))?/gi)
    if (fromMatches) {
      fromMatches.forEach(match => {
        const parts = match.replace(/FROM\s+/i, '').trim().split(/\s+/)
        const tableName = parts[0].replace(/^`|`$/g, '').replace(/^"|"$/g, '')
        const alias = parts[1] && !/^(AS|JOIN|WHERE|GROUP|ORDER|HAVING)$/i.test(parts[1]) ? parts[1] : undefined
        
        if (!tables.has(tableName)) {
          tables.set(tableName, {
            name: tableName,
            alias,
            columns: new Set(),
            conditions: 0,
            joins: 0,
            usage: ['FROM']
          })
        }
      })
    }
    
    // Extract JOIN tables
    const joinMatches = sql.match(/\b(?:INNER|LEFT|RIGHT|FULL|CROSS)?\s*JOIN\s+([\w.$]+)(?:\s+(?:AS\s+)?(\w+))?/gi)
    if (joinMatches) {
      joinMatches.forEach(match => {
        const parts = match.replace(/.*JOIN\s+/i, '').trim().split(/\s+/)
        const tableName = parts[0].replace(/^`|`$/g, '').replace(/^"|"$/g, '')
        const alias = parts[1] && !/^(ON|WHERE|GROUP|ORDER|HAVING)$/i.test(parts[1]) ? parts[1] : undefined
        
        if (!tables.has(tableName)) {
          tables.set(tableName, {
            name: tableName,
            alias,
            columns: new Set(),
            conditions: 0,
            joins: 1,
            usage: ['JOIN']
          })
        } else {
          const table = tables.get(tableName)!
          table.joins++
          if (!table.usage.includes('JOIN')) table.usage.push('JOIN')
        }
      })
    }
    
    // Count JOINs
    const joinCount = (sql.match(/\bJOIN\b/gi) || []).length
    const leftJoinCount = (sql.match(/\bLEFT\s+JOIN\b/gi) || []).length
    const innerJoinCount = (sql.match(/\bINNER\s+JOIN\b/gi) || []).length
    
    // Detect old-style joins (+)
    const oldStyleJoins = (sql.match(/\+/g) || []).length
    if (oldStyleJoins > 0) {
      issues.push({
        type: 'warning',
        message: `Old-style Oracle joins (+) detected: ${oldStyleJoins}. Consider converting to ANSI JOIN syntax.`
      })
    }
    
    // Subquery depth
    const subqueryDepth = (sql.match(/\(\s*SELECT/gi) || []).length
    const subqueryCount = subqueryDepth
    
    // CTE detection
    const cteCount = (sql.match(/\bWITH\s+\w+\s+AS\s*\(/gi) || []).length
    
    // Inline views
    const inlineViewCount = (sql.match(/\(\s*SELECT[^)]+\)\s+\w+/gi) || []).length
    
    // SELECT * usage
    const selectStar = sql.match(/\bSELECT\s+\*/gi)
    if (selectStar) {
      issues.push({
        type: 'warning',
        message: 'SELECT * detected. Consider specifying columns explicitly for better performance and maintainability.'
      })
    }
    
    // Alias clarity (A, B, C)
    const singleLetterAliases = sql.match(/\bFROM\s+[\w.]+\s+([A-Z])\b/gi)
    if (singleLetterAliases && singleLetterAliases.length > 2) {
      issues.push({
        type: 'info',
        message: `Single-letter aliases detected (${singleLetterAliases.length}). Consider using descriptive aliases.`
      })
    }
    
    // Extract columns from SELECT
    const selectMatch = sql.match(/\bSELECT\s+(.*?)\s+FROM/i)
    if (selectMatch) {
      const selectClause = selectMatch[1].trim()
      if (selectClause !== '*') {
        const columns = parseColumns(selectClause)
        columns.forEach(col => {
          const tableCol = col.match(/(\w+)\.(\w+)/)
          if (tableCol) {
            const [tablePrefix, columnName] = [tableCol[1], tableCol[2]]
            for (const [tableName, tableInfo] of tables.entries()) {
              if (tableName === tablePrefix || tableInfo.alias === tablePrefix) {
                tableInfo.columns.add(columnName)
              }
            }
          }
        })
      }
    }
    
    // Extract columns from WHERE
    const whereMatch = sql.match(/\bWHERE\s+(.*?)(?:\bGROUP|\bORDER|\bHAVING|\bFETCH|\bROWNUM|$)/i)
    if (whereMatch) {
      const whereClause = whereMatch[1]
      const tableColumnRefs = whereClause.match(/(\w+)\.(\w+)/g) || []
      tableColumnRefs.forEach(ref => {
        const [tablePrefix, columnName] = ref.split('.')
        for (const [tableName, tableInfo] of tables.entries()) {
          if (tableName === tablePrefix || tableInfo.alias === tablePrefix) {
            tableInfo.columns.add(columnName)
            tableInfo.conditions++
            indexSuggestions.push({
              table: tableName,
              columns: [columnName],
              reason: 'Used in WHERE predicate',
              type: 'btree'
            })
          }
        }
      })
    }
    
    // Extract columns from JOIN ON
    const joinOnPattern = /\bJOIN\s+[\w.]+\s+ON\s+([^JOIN]+?)(?=\b(?:JOIN|WHERE|GROUP|ORDER|HAVING|$))/gi
    let joinOnMatch
    while ((joinOnMatch = joinOnPattern.exec(sql)) !== null) {
      const onClause = joinOnMatch[1]
      const columnRefs = onClause.match(/(\w+)\.(\w+)/g) || []
      columnRefs.forEach(ref => {
        const [tablePrefix, columnName] = ref.split('.')
        for (const [tableName, tableInfo] of tables.entries()) {
          if (tableName === tablePrefix || tableInfo.alias === tablePrefix) {
            tableInfo.columns.add(columnName)
            indexSuggestions.push({
              table: tableName,
              columns: [columnName],
              reason: 'Used in JOIN condition',
              type: 'btree'
            })
          }
        }
      })
    }
    
    // Extract columns from ORDER BY
    const orderByMatch = sql.match(/\bORDER\s+BY\s+(.*?)(?:\bFETCH|\bROWNUM|$)/i)
    if (orderByMatch) {
      const orderClause = orderByMatch[1]
      const orderColumns = orderClause.match(/(\w+)\.(\w+)/g) || []
      orderColumns.forEach(ref => {
        const [tablePrefix, columnName] = ref.split('.')
        for (const [tableName, tableInfo] of tables.entries()) {
          if (tableName === tablePrefix || tableInfo.alias === tablePrefix) {
            tableInfo.columns.add(columnName)
            indexSuggestions.push({
              table: tableName,
              columns: [columnName],
              reason: 'Used in ORDER BY',
              type: 'btree'
            })
          }
        }
      })
    }
    
    // Calculate complexity score
    let complexityScore = 1
    complexityScore += Math.min(tables.size, 5) * 0.5
    complexityScore += Math.min(joinCount, 5) * 0.3
    complexityScore += Math.min(subqueryCount, 3) * 0.5
    complexityScore += cteCount * 0.2
    complexityScore = Math.min(Math.round(complexityScore * 10) / 10, 10)
    
    // ========== BUILD OUTPUT - START WITH TABLES & COLUMNS ==========
    results.push('═══════════════════════════════════════')
    results.push('  ORACLE SQL ADVANCED ANALYZER')
    results.push('═══════════════════════════════════════')
    results.push('')
    
    // ========== TABLES & COLUMNS SUMMARY (AT TOP) ==========
    results.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    results.push('TABLES & COLUMNS SUMMARY')
    results.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    results.push('')
    
    if (tables.size === 0) {
      results.push('No tables detected in SQL query.')
      results.push('')
    } else {
      // All tables used
      results.push(`TABLES USED (${tables.size}):`)
      let tableIdx = 1
      for (const [tableName, tableInfo] of tables.entries()) {
        results.push(`  ${tableIdx}. ${tableName}${tableInfo.alias ? ` (alias: ${tableInfo.alias})` : ''}`)
        tableIdx++
      }
      results.push('')
      
      // All columns used (grouped by table)
      results.push('COLUMNS USED BY TABLE:')
      for (const [tableName, tableInfo] of tables.entries()) {
        if (tableInfo.columns.size > 0) {
          const cols = Array.from(tableInfo.columns).sort()
          results.push(`  ${tableName}${tableInfo.alias ? ` (${tableInfo.alias})` : ''}:`)
          results.push(`    ${cols.join(', ')}`)
          results.push(`    Total: ${tableInfo.columns.size} columns`)
        } else {
          results.push(`  ${tableName}${tableInfo.alias ? ` (${tableInfo.alias})` : ''}: (no columns explicitly referenced)`)
        }
        results.push('')
      }
      
      // All unique columns (flattened list)
      const allColumns = new Set<string>()
      tables.forEach(tableInfo => {
        tableInfo.columns.forEach(col => allColumns.add(col))
      })
      if (allColumns.size > 0) {
        results.push(`ALL COLUMNS REFERENCED (${allColumns.size} unique):`)
        const sortedCols = Array.from(allColumns).sort()
        results.push(`  ${sortedCols.join(', ')}`)
        results.push('')
      }
    }
    
    // ========== A. SQL PARSING & STRUCTURE ANALYSIS ==========
    results.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    results.push('A. STRUCTURE ANALYSIS')
    results.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    results.push(`Tables: ${tables.size}`)
    results.push(`JOINs: ${joinCount} (INNER: ${innerJoinCount}, LEFT: ${leftJoinCount})`)
    results.push(`Subqueries: ${subqueryCount}`)
    results.push(`CTEs (WITH): ${cteCount}`)
    results.push(`Inline Views: ${inlineViewCount}`)
    results.push(`Complexity Score: ${complexityScore}/10`)
    results.push('')
    
    // Detailed table information
    if (tables.size > 0) {
      results.push('TABLE DETAILS:')
      let idx = 1
      for (const [tableName, tableInfo] of tables.entries()) {
        results.push(`  ${idx}. ${tableName}${tableInfo.alias ? ` (alias: ${tableInfo.alias})` : ''}`)
        results.push(`     Usage: ${tableInfo.usage.join(', ')}`)
        results.push(`     Columns: ${tableInfo.columns.size}`)
        if (tableInfo.columns.size > 0) {
          const cols = Array.from(tableInfo.columns).sort()
          results.push(`     - ${cols.join(', ')}`)
        }
        results.push(`     Conditions: ${tableInfo.conditions}`)
        results.push('')
        idx++
      }
    }
    
    // ========== B. PERFORMANCE ANTI-PATTERNS ==========
    results.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    results.push('B. PERFORMANCE ANTI-PATTERNS')
    results.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // Functions on indexed columns
    const truncOnDate = sql.match(/\bTRUNC\s*\([^)]*\)/gi)
    if (truncOnDate) {
      issues.push({
        type: 'error',
        message: `TRUNC() function on date column detected (${truncOnDate.length}x). This prevents index usage.`
      })
    }
    
    const nvlOnCol = sql.match(/\bNVL\s*\([^,)]+,\s*[^)]+\)/gi)
    if (nvlOnCol && nvlOnCol.length > 3) {
      issues.push({
        type: 'warning',
        message: `Multiple NVL() functions detected (${nvlOnCol.length}x). Consider COALESCE or handle NULLs in application.`
      })
    }
    
    const toCharOnDate = sql.match(/\bTO_CHAR\s*\([^,)]+,\s*['"][^'"]+['"]\s*\)/gi)
    if (toCharOnDate) {
      issues.push({
        type: 'error',
        message: `TO_CHAR() on date column detected (${toCharOnDate.length}x). This prevents index usage.`
      })
    }
    
    // LEFT JOIN filtered in WHERE
    if (leftJoinCount > 0) {
      const leftJoinWhere = sql.match(/\bLEFT\s+JOIN[^WHERE]+WHERE[^=]+=\s*NULL/gi)
      if (leftJoinWhere) {
        issues.push({
          type: 'warning',
          message: 'LEFT JOIN result filtered in WHERE clause. Move filter to ON clause.'
        })
      }
    }
    
    // Missing join predicates
    const crossJoins = (sql.match(/\bCROSS\s+JOIN\b/gi) || []).length
    if (crossJoins > 0) {
      issues.push({
        type: 'error',
        message: `CROSS JOIN detected (${crossJoins}x). Verify this is intentional (Cartesian product).`
      })
    }
    
    // Excessive OR conditions
    const orCount = (sql.match(/\bOR\b/gi) || []).length
    if (orCount > 5) {
      issues.push({
        type: 'warning',
        message: `Excessive OR conditions (${orCount}). Consider UNION ALL or IN clause.`
      })
    }
    
    // LIKE '%value' patterns
    const likeWildcardStart = sql.match(/\bLIKE\s+['"]%[^'"]+['"]/gi)
    if (likeWildcardStart) {
      issues.push({
        type: 'error',
        message: `LIKE pattern starting with % detected (${likeWildcardStart.length}x). This prevents index usage.`
      })
    }
    
    // ========== C. ORACLE SQL SMELLS ==========
    results.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    results.push('C. ORACLE SQL SMELLS')
    results.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // ROWNUM misuse
    const rownumUsage = (sql.match(/\bROWNUM\b/gi) || []).length
    if (rownumUsage > 0) {
      issues.push({
        type: 'suggestion',
        message: `ROWNUM detected (${rownumUsage}x). Consider FETCH FIRST n ROWS ONLY (Oracle 12c+).`
      })
    }
    
    // Missing FETCH FIRST
    const hasOrderBy = /\bORDER\s+BY\b/gi.test(sql)
    const hasFetchFirst = /\bFETCH\s+FIRST\b/gi.test(sql)
    if (hasOrderBy && !hasFetchFirst && rownumUsage === 0) {
      issues.push({
        type: 'info',
        message: 'ORDER BY without FETCH FIRST. Consider limiting result set if only top N rows needed.'
      })
    }
    
    // Correlated subqueries
    const correlatedSubquery = sql.match(/\bEXISTS\s*\(\s*SELECT[^)]+\b\w+\.\w+\s*=\s*\w+\.\w+/gi)
    if (correlatedSubquery) {
      issues.push({
        type: 'warning',
        message: 'Correlated subquery detected. Consider rewriting as JOIN for better performance.'
      })
    }
    
    // HAVING used instead of WHERE
    const havingWithoutGroup = sql.match(/\bHAVING\b/gi) && !/\bGROUP\s+BY\b/gi.test(sql)
    if (havingWithoutGroup) {
      issues.push({
        type: 'error',
        message: 'HAVING clause without GROUP BY. Move condition to WHERE clause.'
      })
    }
    
    // Redundant DISTINCT
    const distinctCount = (sql.match(/\bDISTINCT\b/gi) || []).length
    if (distinctCount > 1) {
      issues.push({
        type: 'warning',
        message: `Multiple DISTINCT keywords detected (${distinctCount}). Verify if all are necessary.`
      })
    }
    
    // Hardcoded literals
    const hardcodedIds = sql.match(/\b(?:WHERE|AND|OR)\s+\w+\s*=\s*\d{4,}/gi)
    if (hardcodedIds && hardcodedIds.length > 3) {
      issues.push({
        type: 'warning',
        message: `Multiple hardcoded numeric literals detected (${hardcodedIds.length}). Consider bind variables.`
      })
    }
    
    // ========== D. INDEX SUGGESTIONS ==========
    results.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    results.push('D. INDEX SUGGESTIONS')
    results.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // Group index suggestions by table
    const indexByTable = new Map<string, IndexSuggestion[]>()
    indexSuggestions.forEach(suggestion => {
      if (!indexByTable.has(suggestion.table)) {
        indexByTable.set(suggestion.table, [])
      }
      indexByTable.get(suggestion.table)!.push(suggestion)
    })
    
    if (indexByTable.size > 0) {
      indexByTable.forEach((suggestions, table) => {
        results.push(`Table: ${table}`)
        const uniqueColumns = new Set<string>()
        suggestions.forEach(s => s.columns.forEach(c => uniqueColumns.add(c)))
        const cols = Array.from(uniqueColumns)
        results.push(`  Suggested Index: CREATE INDEX idx_${table}_${cols.join('_')} ON ${table} (${cols.join(', ')});`)
        results.push(`  Reason: ${suggestions[0].reason}`)
        results.push('')
      })
    } else {
      results.push('No index suggestions (no WHERE/JOIN/ORDER BY columns detected)')
      results.push('')
    }
    
    // ========== E. REWRITE SUGGESTIONS ==========
    results.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    results.push('E. REWRITE SUGGESTIONS')
    results.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    if (oldStyleJoins > 0) {
      results.push('• Convert old-style joins (+) to ANSI JOIN syntax')
    }
    if (rownumUsage > 0) {
      results.push('• Replace ROWNUM with FETCH FIRST n ROWS ONLY')
    }
    if (correlatedSubquery) {
      results.push('• Rewrite correlated subquery as JOIN')
    }
    if (nvlOnCol && nvlOnCol.length > 0) {
      results.push('• Replace NVL() with COALESCE() for ANSI compatibility')
    }
    if (inlineViewCount > 0) {
      results.push('• Consider converting inline views to CTEs (WITH clause)')
    }
    if (issues.length === 0) {
      results.push('No rewrite suggestions')
    }
    results.push('')
    
    // ========== F. SECURITY & MAINTAINABILITY ==========
    results.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    results.push('F. SECURITY & MAINTAINABILITY')
    results.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // Missing bind variables
    const stringLiterals = sql.match(/['"][^'"]+['"]/g)
    const numericLiterals = sql.match(/\b\d+\b/g)
    const totalLiterals = (stringLiterals?.length || 0) + (numericLiterals?.length || 0)
    if (totalLiterals > 5) {
      issues.push({
        type: 'warning',
        message: `Multiple hardcoded literals detected (${totalLiterals}). Use bind variables to prevent SQL injection and improve plan reuse.`
      })
    }
    
    // SQL injection patterns
    const concatPattern = sql.match(/\|\|/g)
    if (concatPattern && stringLiterals && stringLiterals.length > 3) {
      issues.push({
        type: 'error',
        message: 'String concatenation with literals detected. High risk of SQL injection. Use bind variables.'
      })
    }
    
    // Unclear column qualification
    const unqualifiedColumns = sql.match(/\b(?:WHERE|SELECT|ORDER|GROUP)\s+([a-z_][a-z0-9_]*)\s*[=,]/gi)
    if (unqualifiedColumns && unqualifiedColumns.length > tables.size * 2) {
      issues.push({
        type: 'info',
        message: 'Some columns may be unqualified. Consider using table aliases for clarity.'
      })
    }
    
    // ========== ISSUES SUMMARY ==========
    if (issues.length > 0) {
      results.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      results.push('ISSUES & WARNINGS')
      results.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      
      const errors = issues.filter(i => i.type === 'error')
      const warnings = issues.filter(i => i.type === 'warning')
      const suggestions = issues.filter(i => i.type === 'suggestion')
      const info = issues.filter(i => i.type === 'info')
      
      if (errors.length > 0) {
        results.push(`❌ ERRORS (${errors.length}):`)
        errors.forEach(issue => results.push(`   • ${issue.message}`))
        results.push('')
      }
      
      if (warnings.length > 0) {
        results.push(`⚠️  WARNINGS (${warnings.length}):`)
        warnings.forEach(issue => results.push(`   • ${issue.message}`))
        results.push('')
      }
      
      if (suggestions.length > 0) {
        results.push(`💡 SUGGESTIONS (${suggestions.length}):`)
        suggestions.forEach(issue => results.push(`   • ${issue.message}`))
        results.push('')
      }
      
      if (info.length > 0) {
        results.push(`ℹ️  INFO (${info.length}):`)
        info.forEach(issue => results.push(`   • ${issue.message}`))
        results.push('')
      }
    } else {
      results.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      results.push('✅ No issues detected!')
      results.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    }
    
    setOutput(results.join('\n'))
  }

  function parseColumns(selectClause: string): string[] {
    const columns: string[] = []
    let current = ''
    let depth = 0
    let inString = false
    let stringChar = ''
    
    for (let i = 0; i < selectClause.length; i++) {
      const char = selectClause[i]
      
      if ((char === '"' || char === "'" || char === '`') && (i === 0 || selectClause[i - 1] !== '\\')) {
        if (!inString) {
          inString = true
          stringChar = char
        } else if (char === stringChar) {
          inString = false
        }
      } else if (!inString) {
        if (char === '(') depth++
        else if (char === ')') depth--
        else if (char === ',' && depth === 0) {
          columns.push(current.trim())
          current = ''
          continue
        }
      }
      
      current += char
    }
    if (current.trim()) columns.push(current.trim())
    
    return columns
  }

  return (
    <ToolLayout
      title="Oracle SQL Advanced Analyzer"
      description="Oracle-specific SQL analysis: structure, performance anti-patterns, index suggestions, EXPLAIN PLAN parsing, and security checks"
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

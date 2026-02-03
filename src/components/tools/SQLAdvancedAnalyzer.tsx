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
      const tables = new Map<string, TableInfo>()
      
      // Extract tables from FROM clause
      const fromMatches = sql.match(/\bFROM\s+([\w.]+)(?:\s+AS\s+(\w+))?(?:\s+(\w+))?/gi)
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
      
      // Extract tables from JOIN clauses
      const joinMatches = sql.match(/\b(?:INNER|LEFT|RIGHT|FULL|CROSS)?\s*JOIN\s+([\w.]+)(?:\s+AS\s+(\w+))?(?:\s+(\w+))?/gi)
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
      
      // Extract tables from INSERT, UPDATE, DELETE
      const insertMatch = sql.match(/\bINSERT\s+INTO\s+([\w.]+)/i)
      if (insertMatch) {
        const tableName = insertMatch[1].replace(/^`|`$/g, '').replace(/^"|"$/g, '')
        if (!tables.has(tableName)) {
          tables.set(tableName, {
            name: tableName,
            columns: new Set(),
            conditions: 0,
            joins: 0,
            usage: ['INSERT']
          })
        } else {
          tables.get(tableName)!.usage.push('INSERT')
        }
      }
      
      const updateMatch = sql.match(/\bUPDATE\s+([\w.]+)/i)
      if (updateMatch) {
        const tableName = updateMatch[1].replace(/^`|`$/g, '').replace(/^"|"$/g, '')
        if (!tables.has(tableName)) {
          tables.set(tableName, {
            name: tableName,
            columns: new Set(),
            conditions: 0,
            joins: 0,
            usage: ['UPDATE']
          })
        } else {
          tables.get(tableName)!.usage.push('UPDATE')
        }
      }
      
      const deleteMatch = sql.match(/\bDELETE\s+FROM\s+([\w.]+)/i)
      if (deleteMatch) {
        const tableName = deleteMatch[1].replace(/^`|`$/g, '').replace(/^"|"$/g, '')
        if (!tables.has(tableName)) {
          tables.set(tableName, {
            name: tableName,
            columns: new Set(),
            conditions: 0,
            joins: 0,
            usage: ['DELETE']
          })
        } else {
          tables.get(tableName)!.usage.push('DELETE')
        }
      }
      
      // Extract columns from SELECT
      const selectMatch = sql.match(/\bSELECT\s+(.*?)\s+FROM/i)
      if (selectMatch) {
        const selectClause = selectMatch[1].trim()
        
        // Handle SELECT *
        if (selectClause === '*') {
          Array.from(tables.keys()).forEach(tableName => {
            tables.get(tableName)!.columns.add('* (all columns)')
          })
        } else {
          // Split columns by comma, handling nested parentheses
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
          
          // Process each column
          columns.forEach(col => {
            const trimmed = col.trim()
            
            // Handle SELECT table.*
            if (trimmed.endsWith('.*')) {
              const tablePrefix = trimmed.replace(/\.\*$/, '')
              for (const [tableName, tableInfo] of tables.entries()) {
                if (tableName === tablePrefix || tableInfo.alias === tablePrefix) {
                  tableInfo.columns.add('* (all columns)')
                }
              }
              return
            }
            
            // Handle plain *
            if (trimmed === '*') {
              Array.from(tables.keys()).forEach(tableName => {
                tables.get(tableName)!.columns.add('* (all columns)')
              })
              return
            }
            
            // Remove AS alias
            const withoutAlias = trimmed.replace(/\s+AS\s+\w+/i, '').replace(/\s+\w+$/, '')
            
            // Extract table.column pattern
            const tableDotCol = withoutAlias.match(/(\w+)\.(\w+)/)
            if (tableDotCol) {
              const tablePrefix = tableDotCol[1]
              const columnName = tableDotCol[2]
              
              // Find matching table
              for (const [tableName, tableInfo] of tables.entries()) {
                if (tableName === tablePrefix || tableInfo.alias === tablePrefix) {
                  tableInfo.columns.add(columnName)
                  break
                }
              }
            } else {
              // Column without table prefix - extract column name
              // Remove function calls and extract the column
              const cleanCol = withoutAlias
                .replace(/^\w+\s*\(/, '') // Remove function name
                .replace(/\)$/, '') // Remove closing paren
                .replace(/^`|`$/g, '') // Remove backticks
                .replace(/^"|"$/g, '') // Remove quotes
                .replace(/^'|'$/g, '') // Remove single quotes
                .trim()
              
              // Extract simple column name (word characters only)
              const colMatch = cleanCol.match(/^([a-zA-Z_][a-zA-Z0-9_]*)$/)
              if (colMatch) {
                const colName = colMatch[1]
                // Skip SQL keywords
                if (!/^(COUNT|SUM|AVG|MAX|MIN|DISTINCT|CASE|WHEN|THEN|ELSE|END|AS|SELECT|FROM|WHERE)$/i.test(colName)) {
                  // Add to all tables (ambiguous)
                  Array.from(tables.values()).forEach(table => {
                    table.columns.add(colName)
                  })
                }
              }
            }
          })
        }
      }
      
      // Extract columns from WHERE clause
      const whereMatch = sql.match(/\bWHERE\s+(.*?)(?:\bGROUP|\bORDER|\bHAVING|LIMIT|$)/i)
      if (whereMatch) {
        const whereClause = whereMatch[1]
        
        // Extract column references with table prefix (e.g., u.id, users.name)
        const tableColumnRefs = whereClause.match(/(\w+)\.(\w+)/g) || []
        tableColumnRefs.forEach(ref => {
          const parts = ref.split('.')
          if (parts.length === 2) {
            const [tablePrefix, columnName] = parts
            for (const [tableName, tableInfo] of tables.entries()) {
              if (tableName === tablePrefix || tableInfo.alias === tablePrefix) {
                tableInfo.columns.add(columnName)
                tableInfo.conditions++
              }
            }
          }
        })
        
        // Extract columns without table prefix (e.g., status = 'active', id IN (...))
        // Match patterns like: column =, column >, column <, column IN, column LIKE, etc.
        const columnPatterns = [
          /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*[=<>!]+/g,  // column =, >, <, !=
          /\b([a-zA-Z_][a-zA-Z0-9_]*)\s+IN\s*\(/gi,  // column IN (
          /\b([a-zA-Z_][a-zA-Z0-9_]*)\s+LIKE\s+/gi,  // column LIKE
          /\b([a-zA-Z_][a-zA-Z0-9_]*)\s+BETWEEN\s+/gi,  // column BETWEEN
          /\b([a-zA-Z_][a-zA-Z0-9_]*)\s+IS\s+(?:NOT\s+)?NULL/gi,  // column IS NULL
        ]
        
        const foundColumns = new Set<string>()
        columnPatterns.forEach(pattern => {
          let match
          while ((match = pattern.exec(whereClause)) !== null) {
            const colName = match[1]
            if (colName && !foundColumns.has(colName.toLowerCase())) {
              foundColumns.add(colName.toLowerCase())
              if (!/^(AND|OR|NOT|IN|LIKE|BETWEEN|IS|NULL|EXISTS|SELECT|FROM|WHERE)$/i.test(colName)) {
                // Add to all tables (ambiguous)
                Array.from(tables.values()).forEach(table => {
                  table.columns.add(colName)
                  table.conditions++
                })
              }
            }
          }
        })
      }
      
      // Extract columns from JOIN ON conditions
      const joinOnPattern = /\b(?:INNER|LEFT|RIGHT|FULL|CROSS)?\s*JOIN\s+[\w.]+\s+ON\s+([^JOIN]+?)(?=\b(?:JOIN|WHERE|GROUP|ORDER|HAVING|LIMIT|$))/gi
      let joinOnMatch
      while ((joinOnMatch = joinOnPattern.exec(sql)) !== null) {
        const onClause = joinOnMatch[1]
        const columnRefs = onClause.match(/(\w+)\.(\w+)/g) || []
        columnRefs.forEach(ref => {
          const parts = ref.split('.')
          if (parts.length === 2) {
            const [tablePrefix, columnName] = parts
            for (const [tableName, tableInfo] of tables.entries()) {
              if (tableName === tablePrefix || tableInfo.alias === tablePrefix) {
                tableInfo.columns.add(columnName)
              }
            }
          }
        })
      }
      
      // Extract columns from SET (UPDATE statements)
      const setMatch = sql.match(/\bSET\s+(.*?)(?:\bWHERE|$)/i)
      if (setMatch) {
        const setClause = setMatch[1]
        const assignments = setClause.split(',').map(a => a.trim())
        assignments.forEach(assign => {
          const colMatch = assign.match(/^(\w+)\s*=/)
          if (colMatch) {
            const colName = colMatch[1]
            Array.from(tables.values()).forEach(table => {
              table.columns.add(colName)
            })
          }
        })
      }
      
      // Extract columns from INSERT VALUES
      const valuesMatch = sql.match(/\bVALUES\s*\(([^)]+)\)/i)
      if (valuesMatch) {
        // Count columns in VALUES
        const values = valuesMatch[1].split(',').length
        Array.from(tables.values()).forEach(table => {
          for (let i = 1; i <= values; i++) {
            table.columns.add(`column_${i}`)
          }
        })
      }
      
      // Build output
      const results: string[] = []
      results.push('═══════════════════════════════════════')
      results.push('  ADVANCED SQL ANALYSIS')
      results.push('═══════════════════════════════════════')
      results.push('')
      
      if (tables.size === 0) {
        results.push('No tables detected in SQL query.')
        setOutput(results.join('\n'))
        return
      }
      
      results.push(`Total Tables: ${tables.size}`)
      results.push('')
      
      let tableIndex = 1
      for (const [tableName, tableInfo] of tables.entries()) {
        results.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
        results.push(`${tableIndex}. TABLE: ${tableName}`)
        if (tableInfo.alias) {
          results.push(`   Alias: ${tableInfo.alias}`)
        }
        results.push(`   Usage: ${tableInfo.usage.join(', ')}`)
        results.push(`   JOINs: ${tableInfo.joins}`)
        results.push(`   Conditions: ${tableInfo.conditions}`)
        results.push(`   Columns Used: ${tableInfo.columns.size}`)
        results.push('')
        
        if (tableInfo.columns.size > 0) {
          results.push('   Columns:')
          const sortedColumns = Array.from(tableInfo.columns).sort()
          sortedColumns.forEach((col, idx) => {
            results.push(`     ${idx + 1}. ${col}`)
          })
        } else {
          results.push('   Columns: (none explicitly referenced)')
        }
        
        results.push('')
        tableIndex++
      }
      
      // Overall statistics
      const totalColumns = Array.from(tables.values()).reduce((sum, t) => sum + t.columns.size, 0)
      const totalConditions = Array.from(tables.values()).reduce((sum, t) => sum + t.conditions, 0)
      const totalJoins = Array.from(tables.values()).reduce((sum, t) => sum + t.joins, 0)
      
      results.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      results.push('OVERALL STATISTICS')
      results.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      results.push(`Total Tables: ${tables.size}`)
      results.push(`Total Columns Referenced: ${totalColumns}`)
      results.push(`Total Conditions: ${totalConditions}`)
      results.push(`Total JOINs: ${totalJoins}`)
      results.push(`Average Columns per Table: ${(totalColumns / tables.size).toFixed(1)}`)
      results.push(`Average Conditions per Table: ${(totalConditions / tables.size).toFixed(1)}`)
      
      setOutput(results.join('\n'))
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Analysis failed'}`)
    }
  }, [input])

  return (
    <ToolLayout
      title="SQL Advanced Analyzer"
      description="Advanced analysis: tables, columns per table, conditions, and detailed statistics"
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

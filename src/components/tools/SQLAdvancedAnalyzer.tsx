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
        const selectClause = selectMatch[1]
        const columnMatches = selectClause.split(',').map(col => col.trim())
        
        columnMatches.forEach(col => {
          if (col === '*' || col.toLowerCase().includes('count(*)') || col.toLowerCase().includes('sum(*)')) {
            // Handle SELECT *
            Array.from(tables.keys()).forEach(tableName => {
              tables.get(tableName)!.columns.add('* (all columns)')
            })
          } else {
            // Extract column name (remove functions, aliases, etc.)
            const cleanCol = col
              .replace(/\s+AS\s+\w+/i, '')
              .replace(/^\w+\./, '')
              .replace(/\(.*?\)/g, '')
              .replace(/^`|`$/g, '')
              .replace(/^"|"$/g, '')
              .trim()
            
            if (cleanCol && cleanCol !== '*') {
              // Try to determine which table this column belongs to
              const tablePrefixMatch = col.match(/^(\w+)\./)
              if (tablePrefixMatch) {
                const tablePrefix = tablePrefixMatch[1]
                // Find table by name or alias
                for (const [tableName, tableInfo] of tables.entries()) {
                  if (tableName === tablePrefix || tableInfo.alias === tablePrefix) {
                    tableInfo.columns.add(cleanCol.replace(/^\w+\./, ''))
                    break
                  }
                }
              } else {
                // Column without table prefix - add to all tables (ambiguous)
                Array.from(tables.values()).forEach(table => {
                  table.columns.add(cleanCol)
                })
              }
            }
          }
        })
      }
      
      // Extract columns from WHERE clause
      const whereMatch = sql.match(/\bWHERE\s+(.*?)(?:\bGROUP|\bORDER|\bHAVING|$)/i)
      if (whereMatch) {
        const whereClause = whereMatch[1]
        
        // Count conditions (AND, OR)
        const andCount = (whereClause.match(/\bAND\b/gi) || []).length
        const orCount = (whereClause.match(/\bOR\b/gi) || []).length
        const totalConditions = andCount + orCount + 1 // +1 for the base condition
        
        // Extract column references in WHERE
        const columnRefs = whereClause.match(/(\w+)\.(\w+)/g) || []
        columnRefs.forEach(ref => {
          const [tablePrefix, columnName] = ref.split('.')
          for (const [tableName, tableInfo] of tables.entries()) {
            if (tableName === tablePrefix || tableInfo.alias === tablePrefix) {
              tableInfo.columns.add(columnName)
              tableInfo.conditions++
            }
          }
        })
        
        // Also count conditions without table prefix
        const conditionsWithoutPrefix = whereClause.match(/\b(\w+)\s*[=<>!]+/g) || []
        conditionsWithoutPrefix.forEach(cond => {
          const colName = cond.match(/^(\w+)/)?.[1]
          if (colName && !/^(AND|OR|NOT|IN|LIKE|BETWEEN|IS|NULL)$/i.test(colName)) {
            Array.from(tables.values()).forEach(table => {
              table.columns.add(colName)
              table.conditions++
            })
          }
        })
      }
      
      // Extract columns from JOIN ON conditions
      const joinOnMatches = sql.match(/\bJOIN\s+[\w.]+\s+ON\s+([^JOIN]+?)(?:\bJOIN|\bWHERE|\bGROUP|\bORDER|$)/gi)
      if (joinOnMatches) {
        joinOnMatches.forEach(match => {
          const onClause = match.replace(/.*ON\s+/i, '').trim()
          const columnRefs = onClause.match(/(\w+)\.(\w+)/g) || []
          columnRefs.forEach(ref => {
            const [tablePrefix, columnName] = ref.split('.')
            for (const [tableName, tableInfo] of tables.entries()) {
              if (tableName === tablePrefix || tableInfo.alias === tablePrefix) {
                tableInfo.columns.add(columnName)
              }
            }
          })
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

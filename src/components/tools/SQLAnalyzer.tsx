import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import ToolLayout from '../ToolLayout'

export default function SQLAnalyzer() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    
    try {
      const analysis: string[] = []
      
      // Extract table names
      const tableMatches = input.match(/\bFROM\s+([\w.]+)/gi) || []
      const joinMatches = input.match(/\bJOIN\s+([\w.]+)/gi) || []
      const insertMatches = input.match(/\bINTO\s+([\w.]+)/gi) || []
      const updateMatches = input.match(/\bUPDATE\s+([\w.]+)/gi) || []
      const deleteMatches = input.match(/\bDELETE\s+FROM\s+([\w.]+)/gi) || []
      
      const tables = new Set([
        ...tableMatches.map(m => m.replace(/FROM\s+/i, '').trim()),
        ...joinMatches.map(m => m.replace(/JOIN\s+/i, '').trim()),
        ...insertMatches.map(m => m.replace(/INTO\s+/i, '').trim()),
        ...updateMatches.map(m => m.replace(/UPDATE\s+/i, '').trim()),
        ...deleteMatches.map(m => m.replace(/DELETE\s+FROM\s+/i, '').trim()),
      ])
      
      if (tables.size > 0) {
        analysis.push('Tables:')
        Array.from(tables).forEach(table => analysis.push(`  • ${table}`))
        analysis.push('')
      }
      
      // Extract column names
      const selectMatches = input.match(/\bSELECT\s+(.*?)\s+FROM/i)
      if (selectMatches) {
        const columns = selectMatches[1]
          .split(',')
          .map(col => col.trim().replace(/\s+AS\s+\w+/i, '').replace(/.*\./, ''))
          .filter(col => col && col !== '*')
        if (columns.length > 0) {
          analysis.push('Columns:')
          columns.forEach(col => analysis.push(`  • ${col}`))
          analysis.push('')
        }
      }
      
      // Detect query type
      if (/^\s*SELECT/i.test(input)) analysis.push('Query Type: SELECT')
      else if (/^\s*INSERT/i.test(input)) analysis.push('Query Type: INSERT')
      else if (/^\s*UPDATE/i.test(input)) analysis.push('Query Type: UPDATE')
      else if (/^\s*DELETE/i.test(input)) analysis.push('Query Type: DELETE')
      else if (/^\s*CREATE/i.test(input)) analysis.push('Query Type: CREATE')
      else if (/^\s*ALTER/i.test(input)) analysis.push('Query Type: ALTER')
      else if (/^\s*DROP/i.test(input)) analysis.push('Query Type: DROP')
      
      // Count JOINs
      const joinCount = (input.match(/\bJOIN\b/gi) || []).length
      if (joinCount > 0) {
        analysis.push(`JOINs: ${joinCount}`)
      }
      
      // Detect subqueries
      const subqueryCount = (input.match(/\(\s*SELECT/gi) || []).length
      if (subqueryCount > 0) {
        analysis.push(`Subqueries: ${subqueryCount}`)
      }
      
      // Detect CTEs
      const cteCount = (input.match(/\bWITH\s+\w+\s+AS/i) || []).length
      if (cteCount > 0) {
        analysis.push(`CTEs (WITH clauses): ${cteCount}`)
      }
      
      // Count WHERE conditions
      const whereMatches = input.match(/\bWHERE\s+(.*?)(?:\bGROUP|\bORDER|\bHAVING|$)/i)
      if (whereMatches) {
        const conditions = whereMatches[1].split(/\bAND\b|\bOR\b/i).length
        analysis.push(`WHERE Conditions: ${conditions}`)
      }
      
      setOutput(analysis.join('\n') || 'No analysis available')
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Analysis failed'}`)
    }
  }, [input])

  return (
    <ToolLayout
      title="SQL Analyzer"
      description="Analyze SQL queries and extract tables, columns, and query structure"
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

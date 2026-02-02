import { useState, useEffect } from 'react'
import ToolLayout from '../ToolLayout'

export default function SQLValidator() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    
    const errors: string[] = []
    const warnings: string[] = []
    
    // Basic SQL syntax validation
    const sql = input.trim()
    
    // Check for balanced parentheses
    const openParens = (sql.match(/\(/g) || []).length
    const closeParens = (sql.match(/\)/g) || []).length
    if (openParens !== closeParens) {
      errors.push(`Unbalanced parentheses: ${openParens} opening, ${closeParens} closing`)
    }
    
    // Check for balanced quotes
    const singleQuotes = (sql.match(/'/g) || []).length
    if (singleQuotes % 2 !== 0) {
      errors.push('Unbalanced single quotes')
    }
    const doubleQuotes = (sql.match(/"/g) || []).length
    if (doubleQuotes % 2 !== 0) {
      errors.push('Unbalanced double quotes')
    }
    
    // Check for common SQL keywords
    const hasSelect = /SELECT/i.test(sql)
    const hasFrom = /FROM/i.test(sql)
    if (hasSelect && !hasFrom) {
      warnings.push('SELECT statement without FROM clause (may be valid for some databases)')
    }
    
    // Check for semicolon at end
    if (!sql.endsWith(';') && sql.length > 10) {
      warnings.push('Query does not end with semicolon')
    }
    
    // Check for common syntax issues
    if (/,\s*,/.test(sql)) {
      errors.push('Consecutive commas found')
    }
    
    if (errors.length === 0 && warnings.length === 0) {
      setOutput('✓ SQL appears to be syntactically valid\n\nNo obvious syntax errors detected.')
    } else {
      const result: string[] = []
      if (errors.length > 0) {
        result.push('✗ Syntax Errors:')
        errors.forEach(err => result.push(`  • ${err}`))
        result.push('')
      }
      if (warnings.length > 0) {
        result.push('⚠ Warnings:')
        warnings.forEach(warn => result.push(`  • ${warn}`))
      }
      setOutput(result.join('\n'))
    }
  }, [input])

  return (
    <ToolLayout
      title="SQL Validator"
      description="Validate SQL syntax and check for common errors"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="sql"
      outputLanguage="plaintext"
    />
  )
}

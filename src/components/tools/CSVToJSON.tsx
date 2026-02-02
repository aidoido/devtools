import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import ToolLayout from '../ToolLayout'

export default function CSVToJSON() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    
    try {
      const lines = input.split('\n').filter(line => line.trim())
      if (lines.length === 0) {
        setOutput('[]')
        return
      }
      
      const headers = lines[0].split(',').map(h => h.trim())
      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim())
        const obj: any = {}
        headers.forEach((header, i) => {
          obj[header] = values[i] || ''
        })
        return obj
      })
      
      setOutput(JSON.stringify(rows, null, 2))
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'CSV parsing failed'}`)
    }
  }, [input])

  return (
    <ToolLayout
      title="CSV to JSON"
      description="Convert CSV data to JSON format"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="plaintext"
      outputLanguage="json"
      onCopy={() => {
        if (output && !output.startsWith('Error:')) {
          navigator.clipboard.writeText(output)
          toast.success('Copied to clipboard')
        }
      }}
    />
  )
}

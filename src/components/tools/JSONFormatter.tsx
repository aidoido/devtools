import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import ToolLayout from '../ToolLayout'

export default function JSONFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    try {
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, 2)
      setOutput(formatted)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid JSON'
      setOutput(`Error: ${message}`)
    }
  }, [input])

  return (
    <ToolLayout
      title="JSON Formatter"
      description="Pretty print and format JSON with proper indentation"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="json"
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


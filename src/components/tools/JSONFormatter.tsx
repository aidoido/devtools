import { useState } from 'react'
import toast from 'react-hot-toast'
import ToolLayout from '../ToolLayout'

export default function JSONFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const format = () => {
    try {
      if (!input.trim()) {
        toast.error('Please enter JSON to format')
        return
      }
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, 2)
      setOutput(formatted)
      toast.success('JSON formatted successfully')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid JSON'
      toast.error(`Format error: ${message}`)
      setOutput(`Error: ${message}`)
    }
  }

  return (
    <ToolLayout
      title="JSON Formatter"
      description="Pretty print and format JSON with proper indentation"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="json"
      outputLanguage="json"
      onFormat={format}
      onCopy={() => {
        navigator.clipboard.writeText(output)
        toast.success('Copied to clipboard')
      }}
    />
  )
}


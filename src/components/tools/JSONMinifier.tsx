import { useState } from 'react'
import toast from 'react-hot-toast'
import ToolLayout from '../ToolLayout'

export default function JSONMinifier() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const minify = () => {
    try {
      if (!input.trim()) {
        toast.error('Please enter JSON to minify')
        return
      }
      const parsed = JSON.parse(input)
      const minified = JSON.stringify(parsed)
      setOutput(minified)
      toast.success('JSON minified successfully')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid JSON'
      toast.error(`Minify error: ${message}`)
      setOutput(`Error: ${message}`)
    }
  }

  return (
    <ToolLayout
      title="JSON Minifier"
      description="Remove all whitespace and minify JSON"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="json"
      outputLanguage="json"
      onFormat={minify}
      onCopy={() => {
        navigator.clipboard.writeText(output)
        toast.success('Copied to clipboard')
      }}
    />
  )
}


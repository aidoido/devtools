import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import ToolLayout from '../ToolLayout'

export default function JSONValidator() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    try {
      JSON.parse(input)
      setOutput('✓ Valid JSON\n\nThe JSON is well-formed and valid.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid JSON'
      const errorOutput = `✗ Invalid JSON\n\nError: ${message}\n\nPosition: ${error instanceof SyntaxError ? 'Check your syntax' : 'Unknown'}`
      setOutput(errorOutput)
    }
  }, [input])

  return (
    <ToolLayout
      title="JSON Validator"
      description="Validate JSON syntax and show clear error messages"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="json"
      outputLanguage="plaintext"
      onCopy={() => {
        if (output) {
          navigator.clipboard.writeText(output)
          toast.success('Copied to clipboard')
        }
      }}
    />
  )
}


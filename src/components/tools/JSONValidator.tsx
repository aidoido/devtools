import { useState } from 'react'
import toast from 'react-hot-toast'
import ToolLayout from '../ToolLayout'

export default function JSONValidator() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const validate = () => {
    try {
      if (!input.trim()) {
        toast.error('Please enter JSON to validate')
        return
      }
      JSON.parse(input)
      setOutput('✓ Valid JSON\n\nThe JSON is well-formed and valid.')
      toast.success('JSON is valid')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid JSON'
      const errorOutput = `✗ Invalid JSON\n\nError: ${message}\n\nPosition: ${error instanceof SyntaxError ? 'Check your syntax' : 'Unknown'}`
      setOutput(errorOutput)
      toast.error(`Validation failed: ${message}`)
    }
  }

  return (
    <ToolLayout
      title="JSON Validator"
      description="Validate JSON syntax and show clear error messages"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="json"
      outputLanguage="plaintext"
      onFormat={validate}
      onCopy={() => {
        navigator.clipboard.writeText(output)
        toast.success('Copied to clipboard')
      }}
    />
  )
}


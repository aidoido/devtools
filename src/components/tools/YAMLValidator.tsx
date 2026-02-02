import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import * as yaml from 'js-yaml'
import ToolLayout from '../ToolLayout'

export default function YAMLValidator() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    try {
      yaml.load(input)
      setOutput('✓ Valid YAML\n\nThe YAML is well-formed and valid.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid YAML'
      setOutput(`✗ Invalid YAML\n\nError: ${message}`)
    }
  }, [input])

  return (
    <ToolLayout
      title="YAML Validator"
      description="Validate YAML syntax and show clear error messages"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="yaml"
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


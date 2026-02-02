import { useState } from 'react'
import toast from 'react-hot-toast'
import * as yaml from 'js-yaml'
import ToolLayout from '../ToolLayout'

export default function YAMLValidator() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const validate = () => {
    try {
      if (!input.trim()) {
        toast.error('Please enter YAML to validate')
        return
      }
      yaml.load(input)
      setOutput('✓ Valid YAML\n\nThe YAML is well-formed and valid.')
      toast.success('YAML is valid')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid YAML'
      setOutput(`✗ Invalid YAML\n\nError: ${message}`)
      toast.error(`Validation failed: ${message}`)
    }
  }

  return (
    <ToolLayout
      title="YAML Validator"
      description="Validate YAML syntax and show clear error messages"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="yaml"
      outputLanguage="plaintext"
      onFormat={validate}
      onCopy={() => {
        navigator.clipboard.writeText(output)
        toast.success('Copied to clipboard')
      }}
    />
  )
}


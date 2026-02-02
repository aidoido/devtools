import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import * as yaml from 'js-yaml'
import ToolLayout from '../ToolLayout'

export default function YAMLFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    try {
      const parsed = yaml.load(input)
      const formatted = yaml.dump(parsed, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      })
      setOutput(formatted)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid YAML'
      setOutput(`Error: ${message}`)
    }
  }, [input])

  return (
    <ToolLayout
      title="YAML Formatter"
      description="Pretty print and format YAML with proper indentation"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="yaml"
      outputLanguage="yaml"
      onCopy={() => {
        if (output && !output.startsWith('Error:')) {
          navigator.clipboard.writeText(output)
          toast.success('Copied to clipboard')
        }
      }}
    />
  )
}


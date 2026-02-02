import { useState } from 'react'
import toast from 'react-hot-toast'
import * as yaml from 'js-yaml'
import ToolLayout from '../ToolLayout'

export default function YAMLFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const format = () => {
    try {
      if (!input.trim()) {
        toast.error('Please enter YAML to format')
        return
      }
      const parsed = yaml.load(input)
      const formatted = yaml.dump(parsed, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      })
      setOutput(formatted)
      toast.success('YAML formatted successfully')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid YAML'
      toast.error(`Format error: ${message}`)
      setOutput(`Error: ${message}`)
    }
  }

  return (
    <ToolLayout
      title="YAML Formatter"
      description="Pretty print and format YAML with proper indentation"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="yaml"
      outputLanguage="yaml"
      onFormat={format}
      onCopy={() => {
        navigator.clipboard.writeText(output)
        toast.success('Copied to clipboard')
      }}
    />
  )
}


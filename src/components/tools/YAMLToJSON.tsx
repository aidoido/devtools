import { useState } from 'react'
import toast from 'react-hot-toast'
import * as yaml from 'js-yaml'
import ToolLayout from '../ToolLayout'

export default function YAMLToJSON() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const convert = () => {
    try {
      if (!input.trim()) {
        toast.error('Please enter YAML to convert')
        return
      }
      const parsed = yaml.load(input)
      const json = JSON.stringify(parsed, null, 2)
      setOutput(json)
      toast.success('YAML converted to JSON successfully')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid YAML'
      toast.error(`Conversion error: ${message}`)
      setOutput(`Error: ${message}`)
    }
  }

  return (
    <ToolLayout
      title="YAML to JSON"
      description="Convert YAML to JSON format"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="yaml"
      outputLanguage="json"
      onFormat={convert}
      onCopy={() => {
        navigator.clipboard.writeText(output)
        toast.success('Copied to clipboard')
      }}
    />
  )
}


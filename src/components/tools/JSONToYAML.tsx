import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import * as yaml from 'js-yaml'
import ToolLayout from '../ToolLayout'

export default function JSONToYAML() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    try {
      const json = JSON.parse(input)
      const yamlStr = yaml.dump(json, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      })
      setOutput(yamlStr)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid JSON'
      setOutput(`Error: ${message}`)
    }
  }, [input])

  return (
    <ToolLayout
      title="JSON to YAML"
      description="Convert JSON to YAML format"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="json"
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

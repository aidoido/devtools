import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { XMLParser } from 'fast-xml-parser'
import ToolLayout from '../ToolLayout'

export default function XMLToJSON() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    try {
      const parser = new XMLParser({
        ignoreAttributes: false,
        preserveOrder: false,
      })
      const json = parser.parse(input)
      setOutput(JSON.stringify(json, null, 2))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid XML'
      setOutput(`Error: ${message}`)
    }
  }, [input])

  return (
    <ToolLayout
      title="XML to JSON"
      description="Convert XML to JSON format"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="xml"
      outputLanguage="json"
      onCopy={() => {
        if (output && !output.startsWith('Error:')) {
          navigator.clipboard.writeText(output)
          toast.success('Copied to clipboard')
        }
      }}
    />
  )
}

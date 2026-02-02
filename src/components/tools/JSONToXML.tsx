import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { XMLBuilder } from 'fast-xml-parser'
import ToolLayout from '../ToolLayout'

export default function JSONToXML() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    try {
      const json = JSON.parse(input)
      const builder = new XMLBuilder({
        ignoreAttributes: false,
        format: true,
        indentBy: '  ',
      })
      const xml = builder.build(json)
      setOutput(xml)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid JSON'
      setOutput(`Error: ${message}`)
    }
  }, [input])

  return (
    <ToolLayout
      title="JSON to XML"
      description="Convert JSON to XML format"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="json"
      outputLanguage="xml"
      onCopy={() => {
        if (output && !output.startsWith('Error:')) {
          navigator.clipboard.writeText(output)
          toast.success('Copied to clipboard')
        }
      }}
    />
  )
}

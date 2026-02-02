import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { XMLBuilder, XMLParser } from 'fast-xml-parser'
import ToolLayout from '../ToolLayout'

export default function XMLFormatter() {
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
        trimValues: true,
      })
      const builder = new XMLBuilder({
        ignoreAttributes: false,
        format: true,
        indentBy: '  ',
      })
      const parsed = parser.parse(input)
      const formatted = builder.build(parsed)
      setOutput(formatted)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid XML'
      setOutput(`Error: ${message}`)
    }
  }, [input])

  return (
    <ToolLayout
      title="XML Formatter"
      description="Pretty print and format XML with proper indentation"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="xml"
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


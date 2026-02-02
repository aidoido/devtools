import { useState } from 'react'
import toast from 'react-hot-toast'
import { XMLBuilder, XMLParser } from 'fast-xml-parser'
import ToolLayout from '../ToolLayout'

export default function XMLFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const format = () => {
    try {
      if (!input.trim()) {
        toast.error('Please enter XML to format')
        return
      }
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
      toast.success('XML formatted successfully')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid XML'
      toast.error(`Format error: ${message}`)
      setOutput(`Error: ${message}`)
    }
  }

  return (
    <ToolLayout
      title="XML Formatter"
      description="Pretty print and format XML with proper indentation"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="xml"
      outputLanguage="xml"
      onFormat={format}
      onCopy={() => {
        navigator.clipboard.writeText(output)
        toast.success('Copied to clipboard')
      }}
    />
  )
}


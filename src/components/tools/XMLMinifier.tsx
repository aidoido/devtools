import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { XMLBuilder, XMLParser } from 'fast-xml-parser'
import ToolLayout from '../ToolLayout'

export default function XMLMinifier() {
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
        format: false,
      })
      const parsed = parser.parse(input)
      const minified = builder.build(parsed)
      setOutput(minified)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid XML'
      setOutput(`Error: ${message}`)
    }
  }, [input])

  return (
    <ToolLayout
      title="XML Minifier"
      description="Remove all whitespace and minify XML"
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


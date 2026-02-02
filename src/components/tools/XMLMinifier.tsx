import { useState } from 'react'
import toast from 'react-hot-toast'
import { XMLBuilder, XMLParser } from 'fast-xml-parser'
import ToolLayout from '../ToolLayout'

export default function XMLMinifier() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const minify = () => {
    try {
      if (!input.trim()) {
        toast.error('Please enter XML to minify')
        return
      }
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
      toast.success('XML minified successfully')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid XML'
      toast.error(`Minify error: ${message}`)
      setOutput(`Error: ${message}`)
    }
  }

  return (
    <ToolLayout
      title="XML Minifier"
      description="Remove all whitespace and minify XML"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="xml"
      outputLanguage="xml"
      onFormat={minify}
      onCopy={() => {
        navigator.clipboard.writeText(output)
        toast.success('Copied to clipboard')
      }}
    />
  )
}


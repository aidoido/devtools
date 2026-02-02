import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { XMLParser } from 'fast-xml-parser'
import ToolLayout from '../ToolLayout'

export default function XMLValidator() {
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
      parser.parse(input)
      setOutput('✓ Valid XML\n\nThe XML is well-formed and valid.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid XML'
      setOutput(`✗ Invalid XML\n\nError: ${message}`)
    }
  }, [input])

  return (
    <ToolLayout
      title="XML Validator"
      description="Validate XML syntax and show clear error messages"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="xml"
      outputLanguage="plaintext"
      onCopy={() => {
        if (output) {
          navigator.clipboard.writeText(output)
          toast.success('Copied to clipboard')
        }
      }}
    />
  )
}


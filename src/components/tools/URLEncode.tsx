import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import ToolLayout from '../ToolLayout'

export default function URLEncode() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    try {
      const encoded = encodeURIComponent(input)
      setOutput(encoded)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Encoding error'
      setOutput(`Error: ${message}`)
    }
  }, [input])

  return (
    <ToolLayout
      title="URL Encode"
      description="Encode text for use in URLs"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="plaintext"
      outputLanguage="plaintext"
      onCopy={() => {
        if (output && !output.startsWith('Error:')) {
          navigator.clipboard.writeText(output)
          toast.success('Copied to clipboard')
        }
      }}
    />
  )
}


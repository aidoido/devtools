import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import ToolLayout from '../ToolLayout'

export default function URLDecode() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    try {
      const decoded = decodeURIComponent(input)
      setOutput(decoded)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Decoding error'
      setOutput(`Error: ${message}`)
    }
  }, [input])

  return (
    <ToolLayout
      title="URL Decode"
      description="Decode URL-encoded text"
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


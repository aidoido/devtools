import { useState } from 'react'
import toast from 'react-hot-toast'
import ToolLayout from '../ToolLayout'

export default function Base64Encode() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const encode = () => {
    try {
      if (!input.trim()) {
        toast.error('Please enter text to encode')
        return
      }
      const encoded = btoa(unescape(encodeURIComponent(input)))
      setOutput(encoded)
      toast.success('Encoded successfully')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Encoding error'
      toast.error(`Encoding failed: ${message}`)
      setOutput(`Error: ${message}`)
    }
  }

  return (
    <ToolLayout
      title="Base64 Encode"
      description="Encode text to Base64"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="plaintext"
      outputLanguage="plaintext"
      onFormat={encode}
      onCopy={() => {
        navigator.clipboard.writeText(output)
        toast.success('Copied to clipboard')
      }}
    />
  )
}


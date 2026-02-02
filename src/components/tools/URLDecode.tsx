import { useState } from 'react'
import toast from 'react-hot-toast'
import ToolLayout from '../ToolLayout'

export default function URLDecode() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const decode = () => {
    try {
      if (!input.trim()) {
        toast.error('Please enter URL-encoded text to decode')
        return
      }
      const decoded = decodeURIComponent(input)
      setOutput(decoded)
      toast.success('Decoded successfully')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Decoding error'
      toast.error(`Decoding failed: ${message}`)
      setOutput(`Error: ${message}`)
    }
  }

  return (
    <ToolLayout
      title="URL Decode"
      description="Decode URL-encoded text"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="plaintext"
      outputLanguage="plaintext"
      onFormat={decode}
      onCopy={() => {
        navigator.clipboard.writeText(output)
        toast.success('Copied to clipboard')
      }}
    />
  )
}


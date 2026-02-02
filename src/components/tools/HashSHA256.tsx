import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import ToolLayout from '../ToolLayout'

export default function HashSHA256() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  useEffect(() => {
    const hash = async () => {
      if (!input.trim()) {
        setOutput('')
        return
      }
      try {
        const encoder = new TextEncoder()
        const data = encoder.encode(input)
        const hashBuffer = await crypto.subtle.digest('SHA-256', data)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
        setOutput(hashHex)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Hashing error'
        setOutput(`Error: ${message}`)
      }
    }
    hash()
  }, [input])

  return (
    <ToolLayout
      title="SHA-256 Hash"
      description="Generate SHA-256 hash using Web Crypto API"
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


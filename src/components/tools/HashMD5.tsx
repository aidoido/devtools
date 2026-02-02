import { useState } from 'react'
import toast from 'react-hot-toast'
import CryptoJS from 'crypto-js'
import ToolLayout from '../ToolLayout'

export default function HashMD5() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const hash = () => {
    try {
      if (!input.trim()) {
        toast.error('Please enter text to hash')
        return
      }
      const hash = CryptoJS.MD5(input).toString()
      setOutput(hash)
      toast.success('Hash generated successfully')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Hashing error'
      toast.error(`Hashing failed: ${message}`)
      setOutput(`Error: ${message}`)
    }
  }

  return (
    <ToolLayout
      title="MD5 Hash"
      description="Generate MD5 hash of text"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="plaintext"
      outputLanguage="plaintext"
      onFormat={hash}
      onCopy={() => {
        navigator.clipboard.writeText(output)
        toast.success('Copied to clipboard')
      }}
    />
  )
}


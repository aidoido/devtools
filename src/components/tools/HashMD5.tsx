import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import CryptoJS from 'crypto-js'
import ToolLayout from '../ToolLayout'

export default function HashMD5() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    try {
      const hash = CryptoJS.MD5(input).toString()
      setOutput(hash)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Hashing error'
      setOutput(`Error: ${message}`)
    }
  }, [input])

  return (
    <ToolLayout
      title="MD5 Hash"
      description="Generate MD5 hash of text"
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


import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import ToolLayout from '../ToolLayout'

export default function JWTDecoder() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    
    try {
      const parts = input.split('.')
      if (parts.length !== 3) {
        setOutput('Error: Invalid JWT format. Expected 3 parts separated by dots.')
        return
      }
      
      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')))
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      
      const results = [
        'Header:',
        JSON.stringify(header, null, 2),
        '',
        'Payload:',
        JSON.stringify(payload, null, 2),
      ].join('\n')
      
      setOutput(results)
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Invalid JWT'}`)
    }
  }, [input])

  return (
    <ToolLayout
      title="JWT Decoder"
      description="Decode and view JWT token header and payload"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="plaintext"
      outputLanguage="json"
      onCopy={() => {
        if (output && !output.startsWith('Error:')) {
          navigator.clipboard.writeText(output)
          toast.success('Copied to clipboard')
        }
      }}
    />
  )
}

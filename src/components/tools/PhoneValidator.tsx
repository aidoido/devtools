import { useState, useEffect } from 'react'
import ToolLayout from '../ToolLayout'

export default function PhoneValidator() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    
    const cleaned = input.replace(/\D/g, '')
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    const isValid = phoneRegex.test(cleaned) && cleaned.length >= 10 && cleaned.length <= 15
    
    if (isValid) {
      setOutput(`✓ Valid Phone Number\n\nCleaned: ${cleaned}\nLength: ${cleaned.length} digits`)
    } else {
      setOutput('✗ Invalid Phone Number\n\nMust be 10-15 digits, optionally starting with +')
    }
  }, [input])

  return (
    <ToolLayout
      title="Phone Validator"
      description="Validate phone number format"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="plaintext"
      outputLanguage="plaintext"
    />
  )
}

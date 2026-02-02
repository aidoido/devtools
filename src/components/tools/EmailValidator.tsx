import { useState, useEffect } from 'react'
import ToolLayout from '../ToolLayout'

export default function EmailValidator() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const isValid = emailRegex.test(input)
    
    if (isValid) {
      const [local, domain] = input.split('@')
      setOutput(`✓ Valid Email\n\nLocal part: ${local}\nDomain: ${domain}`)
    } else {
      setOutput('✗ Invalid Email\n\nPlease check the format: user@example.com')
    }
  }, [input])

  return (
    <ToolLayout
      title="Email Validator"
      description="Validate email address format"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="plaintext"
      outputLanguage="plaintext"
    />
  )
}

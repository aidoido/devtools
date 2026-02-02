import { useState, useEffect } from 'react'
import ToolLayout from '../ToolLayout'

function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '').split('').map(Number)
  let sum = 0
  let isEven = false
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i]
    if (isEven) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    isEven = !isEven
  }
  
  return sum % 10 === 0
}

export default function CreditCardValidator() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    
    const cleaned = input.replace(/\D/g, '')
    const isValid = luhnCheck(cleaned) && cleaned.length >= 13 && cleaned.length <= 19
    
    let cardType = 'Unknown'
    if (/^4/.test(cleaned)) cardType = 'Visa'
    else if (/^5[1-5]/.test(cleaned)) cardType = 'Mastercard'
    else if (/^3[47]/.test(cleaned)) cardType = 'American Express'
    else if (/^6/.test(cleaned)) cardType = 'Discover'
    
    if (isValid) {
      setOutput(`✓ Valid Credit Card\n\nType: ${cardType}\nNumber: ${cleaned.replace(/(.{4})/g, '$1 ').trim()}`)
    } else {
      setOutput('✗ Invalid Credit Card\n\nFailed Luhn algorithm check or invalid length')
    }
  }, [input])

  return (
    <ToolLayout
      title="Credit Card Validator"
      description="Validate credit card numbers using Luhn algorithm"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="plaintext"
      outputLanguage="plaintext"
    />
  )
}

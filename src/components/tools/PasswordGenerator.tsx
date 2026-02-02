import { useState } from 'react'
import toast from 'react-hot-toast'
import ToolLayout from '../ToolLayout'

export default function PasswordGenerator() {
  const [output, setOutput] = useState('')
  const [length, setLength] = useState(16)
  const [includeUpper, setIncludeUpper] = useState(true)
  const [includeLower, setIncludeLower] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [count, setCount] = useState(1)

  const generatePassword = () => {
    let charset = ''
    if (includeUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (includeLower) charset += 'abcdefghijklmnopqrstuvwxyz'
    if (includeNumbers) charset += '0123456789'
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    if (!charset) {
      toast.error('Please select at least one character type')
      return
    }
    
    const passwords: string[] = []
    const array = new Uint8Array(length)
    
    for (let i = 0; i < count; i++) {
      crypto.getRandomValues(array)
      const password = Array.from(array, byte => charset[byte % charset.length]).join('')
      passwords.push(password)
    }
    
    setOutput(passwords.join('\n'))
    toast.success(`Generated ${count} password${count > 1 ? 's' : ''}`)
  }

  return (
    <ToolLayout
      title="Password Generator"
      description="Generate secure passwords with customizable options"
      input=""
      output={output}
      onInputChange={() => {}}
      inputLanguage="plaintext"
      outputLanguage="plaintext"
      showOutput={true}
      actions={
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="4"
            max="128"
            value={length}
            onChange={(e) => setLength(Math.max(4, Math.min(128, parseInt(e.target.value) || 16)))}
            className="w-16 px-2 py-1.5 bg-black text-white rounded border border-white/10 text-xs focus:outline-none focus:border-white/30"
            title="Length"
          />
          <button
            onClick={generatePassword}
            className="px-3 py-1.5 bg-white text-black rounded text-xs font-medium hover:bg-white/90 transition-colors"
          >
            Generate
          </button>
        </div>
      }
      onCopy={() => {
        if (output) {
          navigator.clipboard.writeText(output)
          toast.success('Copied to clipboard')
        }
      }}
    />
  )
}

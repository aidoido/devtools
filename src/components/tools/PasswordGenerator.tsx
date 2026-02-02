import { useState } from 'react'
import toast from 'react-hot-toast'
import CodeEditor from '../CodeEditor'

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
    <div className="flex flex-col h-full">
      <div className="border-b border-white/10 px-6 py-4 bg-black">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white tracking-tight">Password Generator</h2>
            <p className="text-xs text-white/60 mt-1">
              Generate secure passwords with customizable options
            </p>
          </div>
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
            <input
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              className="w-16 px-2 py-1.5 bg-black text-white rounded border border-white/10 text-xs focus:outline-none focus:border-white/30"
              title="Count"
            />
            <button
              onClick={generatePassword}
              className="px-3 py-1.5 bg-white text-black rounded text-xs font-medium hover:bg-white/90 transition-colors"
            >
              Generate
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-white/80">
            <input
              type="checkbox"
              checked={includeUpper}
              onChange={(e) => setIncludeUpper(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-white/20 bg-black text-white focus:ring-1 focus:ring-white"
            />
            Uppercase
          </label>
          <label className="flex items-center gap-2 text-xs text-white/80">
            <input
              type="checkbox"
              checked={includeLower}
              onChange={(e) => setIncludeLower(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-white/20 bg-black text-white focus:ring-1 focus:ring-white"
            />
            Lowercase
          </label>
          <label className="flex items-center gap-2 text-xs text-white/80">
            <input
              type="checkbox"
              checked={includeNumbers}
              onChange={(e) => setIncludeNumbers(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-white/20 bg-black text-white focus:ring-1 focus:ring-white"
            />
            Numbers
          </label>
          <label className="flex items-center gap-2 text-xs text-white/80">
            <input
              type="checkbox"
              checked={includeSymbols}
              onChange={(e) => setIncludeSymbols(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-white/20 bg-black text-white focus:ring-1 focus:ring-white"
            />
            Symbols
          </label>
        </div>
      </div>
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <label className="text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">
            Generated Passwords
          </label>
          <CodeEditor
            value={output}
            onChange={() => {}}
            language="plaintext"
            readOnly
            height="100%"
          />
          {output && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(output)
                toast.success('Copied to clipboard')
              }}
              className="mt-2 px-3 py-1.5 bg-white text-black rounded text-xs font-medium hover:bg-white/90 transition-colors self-start"
            >
              Copy
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

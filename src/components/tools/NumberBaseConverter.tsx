import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import ToolLayout from '../ToolLayout'

export default function NumberBaseConverter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [fromBase, setFromBase] = useState<number>(10)

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    
    try {
      const num = parseInt(input, fromBase)
      if (isNaN(num)) {
        setOutput('Error: Invalid number for selected base')
        return
      }
      
      const results: string[] = []
      results.push(`Decimal: ${num.toString(10)}`)
      results.push(`Binary: ${num.toString(2)}`)
      results.push(`Octal: ${num.toString(8)}`)
      results.push(`Hexadecimal: ${num.toString(16).toUpperCase()}`)
      
      setOutput(results.join('\n'))
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Conversion failed'}`)
    }
  }, [input, fromBase])

  return (
    <ToolLayout
      title="Number Base Converter"
      description="Convert numbers between binary, decimal, octal, and hexadecimal"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="plaintext"
      outputLanguage="plaintext"
      actions={
        <div className="flex items-center gap-2">
          <select
            value={fromBase}
            onChange={(e) => setFromBase(parseInt(e.target.value))}
            className="px-2 py-1.5 bg-black text-white rounded border border-white/10 text-xs focus:outline-none focus:border-white/30"
          >
            <option value="2">Binary (2)</option>
            <option value="8">Octal (8)</option>
            <option value="10">Decimal (10)</option>
            <option value="16">Hex (16)</option>
          </select>
        </div>
      }
      onCopy={() => {
        if (output && !output.startsWith('Error:')) {
          navigator.clipboard.writeText(output)
          toast.success('Copied to clipboard')
        }
      }}
    />
  )
}

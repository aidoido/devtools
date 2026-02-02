import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import ToolLayout from '../ToolLayout'

export default function TextSort() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    
    const lines = input.split('\n')
    const sorted = [...lines].sort((a, b) => {
      return order === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
    })
    setOutput(sorted.join('\n'))
  }, [input, order])

  return (
    <ToolLayout
      title="Sort Lines"
      description="Sort lines alphabetically"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="plaintext"
      outputLanguage="plaintext"
      actions={
        <select
          value={order}
          onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
          className="px-3 py-1.5 bg-black text-white rounded border border-white/10 text-xs focus:outline-none focus:border-white/30"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
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

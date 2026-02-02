import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import ToolLayout from '../ToolLayout'

export default function TextReverse() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'text' | 'lines' | 'words'>('text')

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    
    let reversed = ''
    if (mode === 'text') {
      reversed = input.split('').reverse().join('')
    } else if (mode === 'lines') {
      reversed = input.split('\n').reverse().join('\n')
    } else if (mode === 'words') {
      reversed = input.split(' ').reverse().join(' ')
    }
    setOutput(reversed)
  }, [input, mode])

  return (
    <ToolLayout
      title="Reverse Text"
      description="Reverse text, lines, or words"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="plaintext"
      outputLanguage="plaintext"
      actions={
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as 'text' | 'lines' | 'words')}
          className="px-3 py-1.5 bg-black text-white rounded border border-white/10 text-xs focus:outline-none focus:border-white/30"
        >
          <option value="text">Reverse Text</option>
          <option value="lines">Reverse Lines</option>
          <option value="words">Reverse Words</option>
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

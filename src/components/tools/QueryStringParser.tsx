import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import ToolLayout from '../ToolLayout'

export default function QueryStringParser() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'parse' | 'build'>('parse')

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    
    try {
      if (mode === 'parse') {
        const params = new URLSearchParams(input.startsWith('?') ? input.slice(1) : input)
        const obj: any = {}
        params.forEach((value, key) => {
          obj[key] = value
        })
        setOutput(JSON.stringify(obj, null, 2))
      } else {
        // Build mode - expects JSON
        const obj = JSON.parse(input)
        const params = new URLSearchParams()
        Object.entries(obj).forEach(([key, value]) => {
          params.append(key, String(value))
        })
        setOutput(params.toString())
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Operation failed'}`)
    }
  }, [input, mode])

  return (
    <ToolLayout
      title="Query String Parser"
      description="Parse or build URL query strings"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage={mode === 'parse' ? 'plaintext' : 'json'}
      outputLanguage={mode === 'parse' ? 'json' : 'plaintext'}
      actions={
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as 'parse' | 'build')}
          className="px-3 py-1.5 bg-black text-white rounded border border-white/10 text-xs focus:outline-none focus:border-white/30"
        >
          <option value="parse">Parse Query String</option>
          <option value="build">Build Query String</option>
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

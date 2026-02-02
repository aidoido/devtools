import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import ToolLayout from '../ToolLayout'

export default function EscapeUnescape() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'escape' | 'unescape'>('escape')
  const [type, setType] = useState<'html' | 'js' | 'json'>('html')

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    
    try {
      let result = ''
      if (mode === 'escape') {
        if (type === 'html') {
          result = input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
        } else if (type === 'js') {
          result = JSON.stringify(input).slice(1, -1)
        } else if (type === 'json') {
          result = JSON.stringify(input)
        }
      } else {
        if (type === 'html') {
          result = input
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
        } else if (type === 'js' || type === 'json') {
          result = JSON.parse('"' + input + '"')
        }
      }
      setOutput(result)
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Operation failed'}`)
    }
  }, [input, mode, type])

  return (
    <ToolLayout
      title="Escape/Unescape"
      description="Escape or unescape HTML, JavaScript, or JSON"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="plaintext"
      outputLanguage="plaintext"
      actions={
        <div className="flex items-center gap-2">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as 'escape' | 'unescape')}
            className="px-2 py-1.5 bg-black text-white rounded border border-white/10 text-xs focus:outline-none focus:border-white/30"
          >
            <option value="escape">Escape</option>
            <option value="unescape">Unescape</option>
          </select>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'html' | 'js' | 'json')}
            className="px-2 py-1.5 bg-black text-white rounded border border-white/10 text-xs focus:outline-none focus:border-white/30"
          >
            <option value="html">HTML</option>
            <option value="js">JavaScript</option>
            <option value="json">JSON</option>
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

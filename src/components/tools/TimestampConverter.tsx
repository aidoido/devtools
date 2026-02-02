import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import ToolLayout from '../ToolLayout'

export default function TimestampConverter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'timestamp-to-date' | 'date-to-timestamp'>('timestamp-to-date')

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    
    try {
      if (mode === 'timestamp-to-date') {
        const timestamp = input.includes('.') ? parseFloat(input) : parseInt(input)
        const date = new Date(timestamp * (timestamp < 10000000000 ? 1000 : 1))
        if (isNaN(date.getTime())) {
          setOutput('Error: Invalid timestamp')
          return
        }
        setOutput(date.toISOString() + '\n' + date.toLocaleString())
      } else {
        const date = new Date(input)
        if (isNaN(date.getTime())) {
          setOutput('Error: Invalid date')
          return
        }
        const unixSeconds = Math.floor(date.getTime() / 1000)
        const unixMilliseconds = date.getTime()
        setOutput(`Unix (seconds): ${unixSeconds}\nUnix (milliseconds): ${unixMilliseconds}`)
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Conversion failed'}`)
    }
  }, [input, mode])

  return (
    <ToolLayout
      title="Timestamp Converter"
      description="Convert between Unix timestamps and readable dates"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="plaintext"
      outputLanguage="plaintext"
      actions={
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as any)}
          className="px-3 py-1.5 bg-black text-white rounded border border-white/10 text-xs focus:outline-none focus:border-white/30"
        >
          <option value="timestamp-to-date">Timestamp → Date</option>
          <option value="date-to-timestamp">Date → Timestamp</option>
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

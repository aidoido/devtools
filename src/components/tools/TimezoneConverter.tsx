import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import ToolLayout from '../ToolLayout'

const timezones = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
  'Asia/Dubai', 'Australia/Sydney', 'America/Sao_Paulo'
]

export default function TimezoneConverter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [fromTz, setFromTz] = useState('UTC')
  const [toTz, setToTz] = useState('America/New_York')

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    
    try {
      const date = new Date(input)
      if (isNaN(date.getTime())) {
        setOutput('Error: Invalid date format')
        return
      }
      
      // Note: This is a simplified converter. Full timezone support requires a library like date-fns-tz
      const fromDate = new Date(date.toLocaleString('en-US', { timeZone: fromTz }))
      const toDate = new Date(date.toLocaleString('en-US', { timeZone: toTz }))
      
      const results = [
        `From ${fromTz}:`,
        fromDate.toISOString(),
        '',
        `To ${toTz}:`,
        toDate.toISOString(),
      ].join('\n')
      
      setOutput(results)
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Conversion failed'}`)
    }
  }, [input, fromTz, toTz])

  return (
    <ToolLayout
      title="Timezone Converter"
      description="Convert dates between timezones"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="plaintext"
      outputLanguage="plaintext"
      actions={
        <div className="flex items-center gap-2">
          <select
            value={fromTz}
            onChange={(e) => setFromTz(e.target.value)}
            className="px-2 py-1.5 bg-black text-white rounded border border-white/10 text-xs focus:outline-none focus:border-white/30"
          >
            {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
          </select>
          <span className="text-white/60">→</span>
          <select
            value={toTz}
            onChange={(e) => setToTz(e.target.value)}
            className="px-2 py-1.5 bg-black text-white rounded border border-white/10 text-xs focus:outline-none focus:border-white/30"
          >
            {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
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

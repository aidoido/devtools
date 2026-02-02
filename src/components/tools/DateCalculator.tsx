import { useState, useEffect } from 'react'
import CodeEditor from '../CodeEditor'

export default function DateCalculator() {
  const [date1, setDate1] = useState('')
  const [date2, setDate2] = useState('')
  const [output, setOutput] = useState('')

  useEffect(() => {
    if (!date1.trim() || !date2.trim()) {
      setOutput('')
      return
    }
    
    try {
      const d1 = new Date(date1)
      const d2 = new Date(date2)
      
      if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
        setOutput('Error: Invalid date format')
        return
      }
      
      const diff = Math.abs(d2.getTime() - d1.getTime())
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      const results = [
        `Difference: ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`,
        `Total days: ${days}`,
        `Total hours: ${Math.floor(diff / (1000 * 60 * 60))}`,
        `Total minutes: ${Math.floor(diff / (1000 * 60))}`,
        `Total seconds: ${Math.floor(diff / 1000)}`,
      ].join('\n')
      
      setOutput(results)
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Calculation failed'}`)
    }
  }, [date1, date2])

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-white/10 px-6 py-4 bg-black">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">Date Calculator</h2>
          <p className="text-xs text-white/60 mt-1">
            Calculate differences between two dates
          </p>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-6 p-6 overflow-hidden">
        <div className="flex gap-6">
          <div className="flex-1 flex flex-col">
            <label className="text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">
              Date 1
            </label>
            <input
              type="text"
              value={date1}
              onChange={(e) => setDate1(e.target.value)}
              placeholder="YYYY-MM-DD or ISO format"
              className="px-3 py-2 bg-black text-white rounded border border-white/10 text-sm focus:outline-none focus:border-white/30"
            />
          </div>
          <div className="flex-1 flex flex-col">
            <label className="text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">
              Date 2
            </label>
            <input
              type="text"
              value={date2}
              onChange={(e) => setDate2(e.target.value)}
              placeholder="YYYY-MM-DD or ISO format"
              className="px-3 py-2 bg-black text-white rounded border border-white/10 text-sm focus:outline-none focus:border-white/30"
            />
          </div>
        </div>
        {output && (
          <div className="flex-1 flex flex-col">
            <label className="text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">
              Result
            </label>
            <CodeEditor
              value={output}
              onChange={() => {}}
              language="plaintext"
              readOnly
              height="100%"
            />
          </div>
        )}
      </div>
    </div>
  )
}

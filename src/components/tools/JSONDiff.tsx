import { useState, useEffect } from 'react'
import CodeEditor from '../CodeEditor'

export default function JSONDiff() {
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')
  const [diff, setDiff] = useState('')

  useEffect(() => {
    if (!left.trim() || !right.trim()) {
      setDiff('')
      return
    }
    try {
      const leftParsed = JSON.parse(left)
      const rightParsed = JSON.parse(right)
      
      const differences: string[] = []
      
      // Simple diff logic
      const leftStr = JSON.stringify(leftParsed, null, 2)
      const rightStr = JSON.stringify(rightParsed, null, 2)
      
      if (leftStr === rightStr) {
        setDiff('✓ Both JSON objects are identical')
      } else {
        differences.push('✗ JSON objects are different\n')
        differences.push('Left JSON:')
        differences.push(leftStr)
        differences.push('\n---\n')
        differences.push('Right JSON:')
        differences.push(rightStr)
        setDiff(differences.join('\n'))
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid JSON'
      setDiff(`Error: ${message}`)
    }
  }, [left, right])

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-white/10 px-6 py-4 bg-black">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">JSON Diff</h2>
          <p className="text-xs text-white/60 mt-1">
            Compare two JSON objects side-by-side
          </p>
        </div>
      </div>

      <div className="flex-1 flex gap-6 p-6 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <label className="text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">
            Left JSON
          </label>
          <CodeEditor
            value={left}
            onChange={setLeft}
            language="json"
            height="100%"
          />
        </div>
        <div className="flex-1 flex flex-col">
          <label className="text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">
            Right JSON
          </label>
          <CodeEditor
            value={right}
            onChange={setRight}
            language="json"
            height="100%"
          />
        </div>
      </div>

      {diff && (
        <div className="border-t border-white/10 px-6 py-4 bg-black">
          <label className="text-xs font-medium text-white/60 mb-2 block uppercase tracking-wider">
            Comparison Result
          </label>
          <CodeEditor
            value={diff}
            onChange={() => {}}
            language="plaintext"
            readOnly
            height="200px"
          />
        </div>
      )}
    </div>
  )
}


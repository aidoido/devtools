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
      <div className="border-b border-gray-800 p-4 bg-gray-900">
        <div className="mb-2">
          <h2 className="text-xl font-semibold text-white">JSON Diff</h2>
          <p className="text-sm text-gray-400 mt-1">
            Compare two JSON objects side-by-side
          </p>
        </div>
      </div>

      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <label className="text-sm font-medium text-gray-400 mb-2">
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
          <label className="text-sm font-medium text-gray-400 mb-2">
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
        <div className="border-t border-gray-800 p-4 bg-gray-900">
          <label className="text-sm font-medium text-gray-400 mb-2 block">
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


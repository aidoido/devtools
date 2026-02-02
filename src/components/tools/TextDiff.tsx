import { useState, useEffect } from 'react'
import CodeEditor from '../CodeEditor'

export default function TextDiff() {
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')
  const [diff, setDiff] = useState('')

  useEffect(() => {
    if (!left.trim() || !right.trim()) {
      setDiff('')
      return
    }
    
    if (left === right) {
      setDiff('✓ Both texts are identical')
    } else {
      const leftLines = left.split('\n')
      const rightLines = right.split('\n')
      const maxLines = Math.max(leftLines.length, rightLines.length)
      
      const differences: string[] = []
      differences.push('✗ Texts are different\n')
      differences.push(`Left: ${leftLines.length} lines`)
      differences.push(`Right: ${rightLines.length} lines\n`)
      
      for (let i = 0; i < maxLines; i++) {
        const leftLine = leftLines[i] || ''
        const rightLine = rightLines[i] || ''
        if (leftLine !== rightLine) {
          differences.push(`Line ${i + 1}:`)
          if (leftLine) differences.push(`  - ${leftLine}`)
          if (rightLine) differences.push(`  + ${rightLine}`)
        }
      }
      
      setDiff(differences.join('\n'))
    }
  }, [left, right])

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-white/10 px-6 py-4 bg-black">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">Text Diff</h2>
          <p className="text-xs text-white/60 mt-1">
            Compare two text blocks side-by-side
          </p>
        </div>
      </div>
      <div className="flex-1 flex gap-6 p-6 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <label className="text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">
            Left Text
          </label>
          <CodeEditor
            value={left}
            onChange={setLeft}
            language="plaintext"
            height="100%"
          />
        </div>
        <div className="flex-1 flex flex-col">
          <label className="text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">
            Right Text
          </label>
          <CodeEditor
            value={right}
            onChange={setRight}
            language="plaintext"
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

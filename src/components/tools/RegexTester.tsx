import { useState } from 'react'
import toast from 'react-hot-toast'
import CodeEditor from '../CodeEditor'

export default function RegexTester() {
  const [pattern, setPattern] = useState('')
  const [testString, setTestString] = useState('')
  const [flags, setFlags] = useState('g')
  const [output, setOutput] = useState('')

  const test = () => {
    try {
      if (!pattern.trim()) {
        toast.error('Please enter a regex pattern')
        return
      }
      if (!testString.trim()) {
        toast.error('Please enter a test string')
        return
      }

      const matches = [...testString.matchAll(new RegExp(pattern, flags + 'g'))]
      
      const results: string[] = []
      results.push(`Pattern: /${pattern}/${flags}`)
      results.push(`Test String: "${testString}"`)
      results.push('')
      
      if (matches.length === 0) {
        results.push('✗ No matches found')
      } else {
        results.push(`✓ Found ${matches.length} match(es)`)
        results.push('')
        matches.forEach((match, index) => {
          results.push(`Match ${index + 1}:`)
          results.push(`  Full match: "${match[0]}"`)
          results.push(`  Index: ${match.index}`)
          if (match.length > 1) {
            results.push(`  Groups:`)
            match.slice(1).forEach((group, i) => {
              results.push(`    Group ${i + 1}: "${group || '(empty)'}"`)
            })
          }
          results.push('')
        })
      }
      
      setOutput(results.join('\n'))
      toast.success('Regex test completed')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid regex'
      toast.error(`Regex error: ${message}`)
      setOutput(`Error: ${message}`)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-white/10 px-6 py-4 bg-black">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white tracking-tight">Regex Tester</h2>
            <p className="text-xs text-white/60 mt-1">
              Test regular expressions with match highlighting
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              className="px-2 py-1.5 bg-black text-white rounded border border-white/10 text-xs focus:outline-none focus:border-white/30"
            >
              <option value="g">Global (g)</option>
              <option value="gi">Global + Case-insensitive (gi)</option>
              <option value="gm">Global + Multiline (gm)</option>
              <option value="gim">All (gim)</option>
            </select>
            <button
              onClick={test}
              className="px-3 py-1.5 bg-white text-black rounded text-xs font-medium hover:bg-white/90 transition-colors"
            >
              Test
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6 p-6 overflow-hidden">
        <div className="h-24 flex flex-col">
          <label className="text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">
            Regex Pattern
          </label>
          <CodeEditor
            value={pattern}
            onChange={setPattern}
            language="plaintext"
            height="100%"
          />
        </div>
        <div className="flex-1 flex flex-col">
          <label className="text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">
            Test String
          </label>
          <CodeEditor
            value={testString}
            onChange={setTestString}
            language="plaintext"
            height="100%"
          />
        </div>
        {output && (
          <div className="h-64 flex flex-col">
            <label className="text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">
              Match Results
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


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
      <div className="border-b border-gray-800 p-4 bg-gray-900">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xl font-semibold text-white">Regex Tester</h2>
            <p className="text-sm text-gray-400 mt-1">
              Test regular expressions with match highlighting
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              className="px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 text-sm"
            >
              <option value="g">Global (g)</option>
              <option value="gi">Global + Case-insensitive (gi)</option>
              <option value="gm">Global + Multiline (gm)</option>
              <option value="gim">All (gim)</option>
            </select>
            <button
              onClick={test}
              className="px-4 py-2 bg-white text-black rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Test
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 p-4 overflow-hidden">
        <div className="h-24 flex flex-col">
          <label className="text-sm font-medium text-gray-400 mb-2">
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
          <label className="text-sm font-medium text-gray-400 mb-2">
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
            <label className="text-sm font-medium text-gray-400 mb-2">
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


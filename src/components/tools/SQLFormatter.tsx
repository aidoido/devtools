import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { format as formatSQL } from 'sql-formatter'
import CodeEditor from '../CodeEditor'

export default function SQLFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [uppercaseKeywords, setUppercaseKeywords] = useState(true)
  const [indentation, setIndentation] = useState<'2' | '4' | 'tab'>('2')
  const [minifyMode, setMinifyMode] = useState(false)

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    try {
      if (minifyMode) {
        // Minify by formatting with minimal whitespace and then removing extra spaces
        const formatted = formatSQL(input, {
          language: 'sql',
          tabWidth: 0,
          useTabs: false,
          keywordCase: uppercaseKeywords ? 'upper' : 'lower',
          linesBetweenQueries: 1,
          indentStyle: 'standard',
        })
        
        // Remove extra whitespace and newlines
        const minified = formatted
          .replace(/\s+/g, ' ')
          .replace(/\s*([,;()])\s*/g, '$1')
          .replace(/\s*([=<>!]+)\s*/g, ' $1 ')
          .trim()

        setOutput(minified)
      } else {
        const formatted = formatSQL(input, {
          language: 'sql',
          tabWidth: indentation === 'tab' ? 1 : parseInt(indentation),
          useTabs: indentation === 'tab',
          keywordCase: uppercaseKeywords ? 'upper' : 'lower',
          linesBetweenQueries: 2,
          indentStyle: 'standard',
        })
        setOutput(formatted)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Formatting error'
      setOutput(`Error: ${message}`)
    }
  }, [input, uppercaseKeywords, indentation, minifyMode])

  const copy = () => {
    if (!output) {
      toast.error('No output to copy')
      return
    }
    navigator.clipboard.writeText(output)
    toast.success('Copied to clipboard')
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'c' && output && !output.startsWith('Error:')) {
      e.preventDefault()
      copy()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-800 p-4 bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">SQL Formatter</h2>
            <p className="text-sm text-gray-400 mt-1">
              Format and minify SQL queries with customizable options
            </p>
          </div>
          <div className="flex items-center gap-2">
            {output && !output.startsWith('Error:') && (
              <button
                onClick={copy}
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Copy
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={minifyMode}
              onChange={(e) => setMinifyMode(e.target.checked)}
              className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-white"
            />
            Minify
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={uppercaseKeywords}
              onChange={(e) => setUppercaseKeywords(e.target.checked)}
              className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-white"
            />
            Uppercase Keywords
          </label>
          
          {!minifyMode && (
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <span>Indentation:</span>
              <select
                value={indentation}
                onChange={(e) => setIndentation(e.target.value as '2' | '4' | 'tab')}
                className="px-3 py-1 bg-gray-800 text-white rounded-md border border-gray-700 text-sm"
              >
                <option value="2">2 Spaces</option>
                <option value="4">4 Spaces</option>
                <option value="tab">Tabs</option>
              </select>
            </label>
          )}
        </div>
        
        {output && !output.startsWith('Error:') && (
          <div className="text-xs text-gray-500 mt-2">
            Press Cmd/Ctrl + C to copy output
          </div>
        )}
      </div>

      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <label className="text-sm font-medium text-gray-400 mb-2">
            SQL Input
          </label>
          <CodeEditor
            value={input}
            onChange={setInput}
            language="sql"
            onKeyDown={handleKeyDown}
            height="100%"
          />
        </div>
        <div className="flex-1 flex flex-col">
          <label className="text-sm font-medium text-gray-400 mb-2">
            Formatted Output
          </label>
          <CodeEditor
            value={output}
            onChange={() => {}}
            language="sql"
            readOnly
            height="100%"
          />
        </div>
      </div>
    </div>
  )
}


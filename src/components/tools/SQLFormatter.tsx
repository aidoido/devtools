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
  const [dialect, setDialect] = useState<'sql' | 'mysql' | 'postgresql' | 'mariadb' | 'sqlite' | 'mssql' | 'bigquery' | 'db2' | 'redshift' | 'plsql'>('sql')
  const [removeComments, setRemoveComments] = useState(false)
  const [linesBetweenQueries, setLinesBetweenQueries] = useState(2)

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    try {
      let sqlToFormat = input
      
      // Remove comments if requested
      if (removeComments) {
        sqlToFormat = sqlToFormat
          .replace(/--.*$/gm, '') // Remove single-line comments
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      }
      
      if (minifyMode) {
        // Minify by formatting with minimal whitespace and then removing extra spaces
        const formatted = formatSQL(sqlToFormat, {
          language: dialect,
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
        const formatted = formatSQL(sqlToFormat, {
          language: dialect,
          tabWidth: indentation === 'tab' ? 1 : parseInt(indentation),
          useTabs: indentation === 'tab',
          keywordCase: uppercaseKeywords ? 'upper' : 'lower',
          linesBetweenQueries: linesBetweenQueries,
          indentStyle: 'standard',
        })
        setOutput(formatted)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Formatting error'
      setOutput(`Error: ${message}`)
    }
  }, [input, uppercaseKeywords, indentation, minifyMode, dialect, removeComments, linesBetweenQueries])

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
      <div className="border-b border-white/10 px-6 py-4 bg-black">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white tracking-tight">SQL Formatter</h2>
            <p className="text-xs text-white/60 mt-1">
              Format and minify SQL queries with customizable options
            </p>
          </div>
          <div className="flex items-center gap-2">
            {output && !output.startsWith('Error:') && (
              <button
                onClick={copy}
                className="px-3 py-1.5 bg-white text-black rounded text-xs font-medium hover:bg-white/90 transition-colors"
              >
                Copy
              </button>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-6 flex-wrap">
            <label className="flex items-center gap-2 text-xs text-white/80">
              <input
                type="checkbox"
                checked={minifyMode}
                onChange={(e) => setMinifyMode(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-white/20 bg-black text-white focus:ring-1 focus:ring-white"
              />
              Minify
            </label>
            <label className="flex items-center gap-2 text-xs text-white/80">
              <input
                type="checkbox"
                checked={uppercaseKeywords}
                onChange={(e) => setUppercaseKeywords(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-white/20 bg-black text-white focus:ring-1 focus:ring-white"
              />
              Uppercase Keywords
            </label>
            <label className="flex items-center gap-2 text-xs text-white/80">
              <input
                type="checkbox"
                checked={removeComments}
                onChange={(e) => setRemoveComments(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-white/20 bg-black text-white focus:ring-1 focus:ring-white"
              />
              Remove Comments
            </label>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-xs text-white/80">
              <span>Dialect:</span>
              <select
                value={dialect}
                onChange={(e) => setDialect(e.target.value as any)}
                className="px-2 py-1 bg-black text-white rounded border border-white/10 text-xs focus:outline-none focus:border-white/30"
              >
                <option value="sql">Standard SQL</option>
                <option value="mysql">MySQL</option>
                <option value="postgresql">PostgreSQL</option>
                <option value="mariadb">MariaDB</option>
                <option value="sqlite">SQLite</option>
                <option value="mssql">SQL Server</option>
                <option value="bigquery">BigQuery</option>
                <option value="db2">DB2</option>
                <option value="redshift">Redshift</option>
                <option value="plsql">PL/SQL</option>
              </select>
            </label>
            
            {!minifyMode && (
              <>
                <label className="flex items-center gap-2 text-xs text-white/80">
                  <span>Indentation:</span>
                  <select
                    value={indentation}
                    onChange={(e) => setIndentation(e.target.value as '2' | '4' | 'tab')}
                    className="px-2 py-1 bg-black text-white rounded border border-white/10 text-xs focus:outline-none focus:border-white/30"
                  >
                    <option value="2">2 Spaces</option>
                    <option value="4">4 Spaces</option>
                    <option value="tab">Tabs</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 text-xs text-white/80">
                  <span>Lines Between Queries:</span>
                  <select
                    value={linesBetweenQueries}
                    onChange={(e) => setLinesBetweenQueries(parseInt(e.target.value))}
                    className="px-2 py-1 bg-black text-white rounded border border-white/10 text-xs focus:outline-none focus:border-white/30"
                  >
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                </label>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 p-6 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <label className="text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">
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
          <label className="text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">
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


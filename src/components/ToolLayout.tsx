import { ReactNode } from 'react'
import CodeEditor from './CodeEditor'

interface ToolLayoutProps {
  title: string
  description?: string
  inputLabel?: string
  outputLabel?: string
  input: string
  output: string
  onInputChange: (value: string) => void
  inputLanguage?: string
  outputLanguage?: string
  actions?: ReactNode
  onCopy?: () => void
  showOutput?: boolean
  outputReadOnly?: boolean
}

export default function ToolLayout({
  title,
  description,
  inputLabel = 'Input',
  outputLabel = 'Output',
  input,
  output,
  onInputChange,
  inputLanguage = 'plaintext',
  outputLanguage = 'plaintext',
  actions,
  onCopy,
  showOutput = true,
  outputReadOnly = true,
}: ToolLayoutProps) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'c' && onCopy && output) {
      e.preventDefault()
      onCopy()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-800 p-4 bg-gray-900">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            {description && (
              <p className="text-sm text-gray-400 mt-1">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {actions}
            {onCopy && output && (
              <button
                onClick={onCopy}
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Copy
              </button>
            )}
          </div>
        </div>
        {onCopy && output && (
          <div className="text-xs text-gray-500 mt-2">
            Press Cmd/Ctrl + C to copy output
          </div>
        )}
      </div>

      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <label className="text-sm font-medium text-gray-400 mb-2">
            {inputLabel}
          </label>
          <CodeEditor
            value={input}
            onChange={onInputChange}
            language={inputLanguage}
            onKeyDown={handleKeyDown}
            height="100%"
          />
        </div>
        {showOutput && (
          <div className="flex-1 flex flex-col">
            <label className="text-sm font-medium text-gray-400 mb-2">
              {outputLabel}
            </label>
            <CodeEditor
              value={output}
              onChange={() => {}}
              language={outputLanguage}
              readOnly={outputReadOnly}
              height="100%"
            />
          </div>
        )}
      </div>
    </div>
  )
}


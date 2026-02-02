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
      <div className="border-b border-white/10 px-6 py-4 bg-black">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white tracking-tight">{title}</h2>
            {description && (
              <p className="text-xs text-white/60 mt-1">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {actions}
            {onCopy && output && !output.startsWith('Error:') && (
              <button
                onClick={onCopy}
                className="px-3 py-1.5 bg-white text-black rounded text-xs font-medium hover:bg-white/90 transition-colors"
              >
                Copy
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 p-6 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <label className="text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">
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
            <label className="text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">
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


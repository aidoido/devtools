import { useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { editor } from 'monaco-editor'
import * as monaco from 'monaco-editor'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  readOnly?: boolean
  onKeyDown?: (e: KeyboardEvent) => void
  height?: string
}

export default function CodeEditor({
  value,
  onChange,
  language = 'plaintext',
  readOnly = false,
  height = '100%',
}: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (onKeyDown) {
        onKeyDown(e)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onKeyDown])

  const handleEditorDidMount = (editorInstance: editor.IStandaloneCodeEditor) => {
    editorRef.current = editorInstance
    
    // Add keyboard shortcuts to Monaco Editor
    if (onKeyDown) {
      // Cmd/Ctrl + Enter
      editorInstance.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
        () => {
          const event = new KeyboardEvent('keydown', {
            key: 'Enter',
            ctrlKey: !navigator.platform.includes('Mac'),
            metaKey: navigator.platform.includes('Mac'),
          } as KeyboardEventInit)
          onKeyDown(event as KeyboardEvent)
        }
      )
      
      // Cmd/Ctrl + C (only when there's content to copy)
      editorInstance.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC,
        () => {
          const event = new KeyboardEvent('keydown', {
            key: 'c',
            ctrlKey: !navigator.platform.includes('Mac'),
            metaKey: navigator.platform.includes('Mac'),
          } as KeyboardEventInit)
          onKeyDown(event as KeyboardEvent)
        }
      )
    }
  }

  return (
    <div className="flex-1 border border-gray-800 rounded-lg overflow-hidden">
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={(val) => onChange(val || '')}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          automaticLayout: true,
          tabSize: 2,
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
    </div>
  )
}


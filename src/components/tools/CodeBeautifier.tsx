import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import ToolLayout from '../ToolLayout'

export default function CodeBeautifier() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [language, setLanguage] = useState<'js' | 'css' | 'html'>('js')

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    
    try {
      let beautified = input
      
      if (language === 'js') {
        // Basic JS beautification - just format with indentation
        let indent = 0
        const indentSize = 2
        beautified = input
          .replace(/\{/g, '{\n')
          .replace(/\}/g, '\n}')
          .replace(/;/g, ';\n')
          .split('\n')
          .map(line => {
            line = line.trim()
            if (line.endsWith('}')) indent--
            const indented = ' '.repeat(Math.max(0, indent * indentSize)) + line
            if (line.endsWith('{')) indent++
            return indented
          })
          .join('\n')
      } else if (language === 'css') {
        beautified = input
          .replace(/\{/g, ' {\n  ')
          .replace(/\}/g, '\n}\n')
          .replace(/;/g, ';\n  ')
          .replace(/\n\s*\n/g, '\n')
      } else if (language === 'html') {
        // Basic HTML formatting
        beautified = input
          .replace(/>\s*</g, '>\n<')
          .split('\n')
          .map((line, i, arr) => {
            const trimmed = line.trim()
            if (!trimmed) return ''
            let indent = 0
            for (let j = 0; j < i; j++) {
              if (arr[j].includes('<') && !arr[j].includes('</') && !arr[j].includes('/>')) indent++
              if (arr[j].includes('</')) indent--
            }
            return '  '.repeat(Math.max(0, indent)) + trimmed
          })
          .filter(line => line)
          .join('\n')
      }
      
      setOutput(beautified)
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Beautification failed'}`)
    }
  }, [input, language])

  return (
    <ToolLayout
      title="Code Beautifier"
      description="Beautify JavaScript, CSS, or HTML"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage={language}
      outputLanguage={language}
      actions={
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'js' | 'css' | 'html')}
          className="px-3 py-1.5 bg-black text-white rounded border border-white/10 text-xs focus:outline-none focus:border-white/30"
        >
          <option value="js">JavaScript</option>
          <option value="css">CSS</option>
          <option value="html">HTML</option>
        </select>
      }
      onCopy={() => {
        if (output && !output.startsWith('Error:')) {
          navigator.clipboard.writeText(output)
          toast.success('Copied to clipboard')
        }
      }}
    />
  )
}

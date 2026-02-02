import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import ToolLayout from '../ToolLayout'

export default function CodeMinifier() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [language, setLanguage] = useState<'js' | 'css' | 'html'>('js')

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    
    try {
      let minified = input
      
      if (language === 'js') {
        // Basic JS minification
        minified = input
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
          .replace(/\/\/.*$/gm, '') // Remove line comments
          .replace(/\s+/g, ' ') // Collapse whitespace
          .replace(/\s*([{}();,=+\-*/])\s*/g, '$1') // Remove spaces around operators
          .trim()
      } else if (language === 'css') {
        minified = input
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
          .replace(/\s+/g, ' ') // Collapse whitespace
          .replace(/\s*([{}:;,])\s*/g, '$1') // Remove spaces
          .trim()
      } else if (language === 'html') {
        minified = input
          .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
          .replace(/\s+/g, ' ') // Collapse whitespace
          .replace(/>\s+</g, '><') // Remove spaces between tags
          .trim()
      }
      
      setOutput(minified)
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Minification failed'}`)
    }
  }, [input, language])

  return (
    <ToolLayout
      title="Code Minifier"
      description="Minify JavaScript, CSS, or HTML"
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

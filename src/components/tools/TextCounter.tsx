import { useState, useEffect } from 'react'
import ToolLayout from '../ToolLayout'

export default function TextCounter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    
    const characters = input.length
    const charactersNoSpaces = input.replace(/\s/g, '').length
    const words = input.trim() ? input.trim().split(/\s+/).length : 0
    const lines = input.split('\n').length
    const paragraphs = input.split(/\n\s*\n/).filter(p => p.trim()).length
    
    const stats = [
      `Characters: ${characters}`,
      `Characters (no spaces): ${charactersNoSpaces}`,
      `Words: ${words}`,
      `Lines: ${lines}`,
      `Paragraphs: ${paragraphs}`,
    ].join('\n')
    
    setOutput(stats)
  }, [input])

  return (
    <ToolLayout
      title="Text Counter"
      description="Count characters, words, lines, and paragraphs"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="plaintext"
      outputLanguage="plaintext"
      showOutput={true}
    />
  )
}

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import ToolLayout from '../ToolLayout'

export default function CaseConverter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [caseType, setCaseType] = useState<'upper' | 'lower' | 'title' | 'sentence' | 'camel' | 'pascal' | 'snake' | 'kebab'>('lower')

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    
    let converted = ''
    switch (caseType) {
      case 'upper':
        converted = input.toUpperCase()
        break
      case 'lower':
        converted = input.toLowerCase()
        break
      case 'title':
        converted = input.replace(/\w\S*/g, (txt) => 
          txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        )
        break
      case 'sentence':
        converted = input.charAt(0).toUpperCase() + input.slice(1).toLowerCase()
        break
      case 'camel':
        converted = input.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
          index === 0 ? word.toLowerCase() : word.toUpperCase()
        ).replace(/\s+/g, '')
        break
      case 'pascal':
        converted = input.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => 
          word.toUpperCase()
        ).replace(/\s+/g, '')
        break
      case 'snake':
        converted = input.toLowerCase().replace(/\s+/g, '_')
        break
      case 'kebab':
        converted = input.toLowerCase().replace(/\s+/g, '-')
        break
    }
    setOutput(converted)
  }, [input, caseType])

  return (
    <ToolLayout
      title="Case Converter"
      description="Convert text between different case styles"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="plaintext"
      outputLanguage="plaintext"
      actions={
        <select
          value={caseType}
          onChange={(e) => setCaseType(e.target.value as any)}
          className="px-3 py-1.5 bg-black text-white rounded border border-white/10 text-xs focus:outline-none focus:border-white/30"
        >
          <option value="lower">lowercase</option>
          <option value="upper">UPPERCASE</option>
          <option value="title">Title Case</option>
          <option value="sentence">Sentence case</option>
          <option value="camel">camelCase</option>
          <option value="pascal">PascalCase</option>
          <option value="snake">snake_case</option>
          <option value="kebab">kebab-case</option>
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

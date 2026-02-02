import { useState } from 'react'
import toast from 'react-hot-toast'
import { XMLParser } from 'fast-xml-parser'
import CodeEditor from '../CodeEditor'

export default function XPathTester() {
  const [xml, setXml] = useState('')
  const [xpath, setXpath] = useState('')
  const [output, setOutput] = useState('')

  const test = () => {
    try {
      if (!xml.trim() || !xpath.trim()) {
        toast.error('Please enter both XML and XPath expression')
        return
      }
      
      const parser = new XMLParser({
        ignoreAttributes: false,
        preserveOrder: false,
      })
      const parsed = parser.parse(xml)
      
      // Basic XPath-like evaluation (simplified)
      // Note: This is a basic implementation. For full XPath support, you'd need a library like xpath
      const result = evaluateXPath(parsed, xpath)
      
      if (result !== null && result !== undefined) {
        setOutput(JSON.stringify(result, null, 2))
        toast.success('XPath evaluation successful')
      } else {
        setOutput('No matches found for the XPath expression')
        toast('No matches found', { icon: 'ℹ️' })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error'
      toast.error(`XPath error: ${message}`)
      setOutput(`Error: ${message}\n\nNote: This is a basic XPath tester. Complex XPath expressions may not be fully supported.`)
    }
  }

  // Simplified XPath evaluation (basic implementation)
  const evaluateXPath = (obj: any, path: string): any => {
    if (path.startsWith('/')) {
      path = path.substring(1)
    }
    const parts = path.split('/').filter(p => p)
    let current = obj
    
    for (const part of parts) {
      if (current && typeof current === 'object') {
        if (part.includes('[')) {
          // Handle array indices like [0] or [@attr='value']
          const [name, index] = part.split('[')
          if (name && current[name]) {
            current = current[name]
            if (index) {
              const idx = parseInt(index.replace(']', ''))
              if (Array.isArray(current) && !isNaN(idx)) {
                current = current[idx]
              }
            }
          }
        } else {
          current = current[part]
        }
      } else {
        return null
      }
    }
    return current
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-white/10 px-6 py-4 bg-black">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white tracking-tight">XPath Tester</h2>
            <p className="text-xs text-white/60 mt-1">
              Test XPath expressions against XML (basic implementation)
            </p>
          </div>
          <button
            onClick={test}
            className="px-3 py-1.5 bg-white text-black rounded text-xs font-medium hover:bg-white/90 transition-colors"
          >
            Test XPath
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6 p-6 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <label className="text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">
            XML Document
          </label>
          <CodeEditor
            value={xml}
            onChange={setXml}
            language="xml"
            height="100%"
          />
        </div>
        <div className="h-32 flex flex-col">
          <label className="text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">
            XPath Expression
          </label>
          <CodeEditor
            value={xpath}
            onChange={setXpath}
            language="plaintext"
            height="100%"
          />
        </div>
        {output && (
          <div className="flex-1 flex flex-col">
            <label className="text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">
              Result
            </label>
            <CodeEditor
              value={output}
              onChange={() => {}}
              language="json"
              readOnly
              height="100%"
            />
          </div>
        )}
      </div>
    </div>
  )
}


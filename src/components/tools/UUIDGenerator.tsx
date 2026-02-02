import { useState } from 'react'
import toast from 'react-hot-toast'
import ToolLayout from '../ToolLayout'

export default function UUIDGenerator() {
  const [output, setOutput] = useState('')
  const [count, setCount] = useState(1)
  const [version, setVersion] = useState<'v4' | 'v1'>('v4')

  const generateUUID = () => {
    if (version === 'v4') {
      const uuids: string[] = []
      for (let i = 0; i < count; i++) {
        uuids.push(crypto.randomUUID())
      }
      setOutput(uuids.join('\n'))
    } else {
      // Simple v1-like UUID (not true v1, but timestamp-based)
      const uuids: string[] = []
      for (let i = 0; i < count; i++) {
        const timestamp = Date.now()
        const random = Math.random().toString(16).substring(2, 14)
        const uuid = `${timestamp.toString(16)}-${random.substring(0, 4)}-4${random.substring(4, 7)}-${((Math.random() * 4) | 0).toString(16)}${random.substring(7, 11)}-${random.substring(11)}`
        uuids.push(uuid)
      }
      setOutput(uuids.join('\n'))
    }
    toast.success(`Generated ${count} UUID${count > 1 ? 's' : ''}`)
  }

  return (
    <ToolLayout
      title="UUID Generator"
      description="Generate UUIDs (v1, v4)"
      input=""
      output={output}
      onInputChange={() => {}}
      inputLanguage="plaintext"
      outputLanguage="plaintext"
      showOutput={true}
      actions={
        <div className="flex items-center gap-2">
          <select
            value={version}
            onChange={(e) => setVersion(e.target.value as 'v4' | 'v1')}
            className="px-2 py-1.5 bg-black text-white rounded border border-white/10 text-xs focus:outline-none focus:border-white/30"
          >
            <option value="v4">v4 (Random)</option>
            <option value="v1">v1 (Time-based)</option>
          </select>
          <input
            type="number"
            min="1"
            max="100"
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
            className="w-16 px-2 py-1.5 bg-black text-white rounded border border-white/10 text-xs focus:outline-none focus:border-white/30"
          />
          <button
            onClick={generateUUID}
            className="px-3 py-1.5 bg-white text-black rounded text-xs font-medium hover:bg-white/90 transition-colors"
          >
            Generate
          </button>
        </div>
      }
      onCopy={() => {
        if (output) {
          navigator.clipboard.writeText(output)
          toast.success('Copied to clipboard')
        }
      }}
    />
  )
}

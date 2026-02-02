import { ToolType, Tool } from '../types'

interface SidebarProps {
  activeTool: ToolType
  onToolChange: (tool: ToolType) => void
  isOpen: boolean
  onToggle: () => void
}

const tools: Tool[] = [
  // JSON Tools
  { id: 'json-formatter', name: 'JSON Formatter', category: 'json', description: 'Pretty print JSON' },
  { id: 'json-minifier', name: 'JSON Minifier', category: 'json', description: 'Minify JSON' },
  { id: 'json-validator', name: 'JSON Validator', category: 'json', description: 'Validate JSON syntax' },
  { id: 'json-diff', name: 'JSON Diff', category: 'json', description: 'Compare two JSON objects' },
  
  // XML Tools
  { id: 'xml-formatter', name: 'XML Formatter', category: 'xml', description: 'Pretty print XML' },
  { id: 'xml-minifier', name: 'XML Minifier', category: 'xml', description: 'Minify XML' },
  { id: 'xml-validator', name: 'XML Validator', category: 'xml', description: 'Validate XML syntax' },
  { id: 'xpath-tester', name: 'XPath Tester', category: 'xml', description: 'Test XPath expressions' },
  
  // YAML Tools
  { id: 'yaml-formatter', name: 'YAML Formatter', category: 'yaml', description: 'Pretty print YAML' },
  { id: 'yaml-validator', name: 'YAML Validator', category: 'yaml', description: 'Validate YAML syntax' },
  { id: 'yaml-to-json', name: 'YAML to JSON', category: 'yaml', description: 'Convert YAML to JSON' },
  
  // Encoding Tools
  { id: 'base64-encode', name: 'Base64 Encode', category: 'encoding', description: 'Encode to Base64' },
  { id: 'base64-decode', name: 'Base64 Decode', category: 'encoding', description: 'Decode from Base64' },
  { id: 'url-encode', name: 'URL Encode', category: 'encoding', description: 'Encode URL' },
  { id: 'url-decode', name: 'URL Decode', category: 'encoding', description: 'Decode URL' },
  
  // Hashing Tools
  { id: 'hash-md5', name: 'MD5 Hash', category: 'hashing', description: 'Generate MD5 hash' },
  { id: 'hash-sha1', name: 'SHA-1 Hash', category: 'hashing', description: 'Generate SHA-1 hash' },
  { id: 'hash-sha256', name: 'SHA-256 Hash', category: 'hashing', description: 'Generate SHA-256 hash' },
  
  // Regex
  { id: 'regex-tester', name: 'Regex Tester', category: 'regex', description: 'Test regular expressions' },
  
  // SQL (Primary Feature)
  { id: 'sql-formatter', name: 'SQL Formatter', category: 'sql', description: 'Format and minify SQL queries' },
]

const categories = [
  { id: 'json', name: 'JSON Tools' },
  { id: 'xml', name: 'XML Tools' },
  { id: 'yaml', name: 'YAML Tools' },
  { id: 'encoding', name: 'Encoding' },
  { id: 'hashing', name: 'Hashing' },
  { id: 'regex', name: 'Regex' },
  { id: 'sql', name: 'SQL Formatter' },
]

export default function Sidebar({ activeTool, onToolChange, isOpen, onToggle }: SidebarProps) {
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed left-0 top-4 z-50 p-2 bg-gray-900 border-r border-b border-gray-800 rounded-r-md hover:bg-gray-800 transition-colors"
        title="Show sidebar"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    )
  }

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col transition-all">
      <div className="p-6 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">DevHelper</h1>
          <p className="text-sm text-gray-400 mt-1">Dev & Scripting Utilities</p>
        </div>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
          title="Hide sidebar"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        {categories.map((category) => {
          const categoryTools = tools.filter(t => t.category === category.id)
          return (
            <div key={category.id} className="mb-6">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                {category.name}
              </h2>
              <div className="space-y-1">
                {categoryTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => onToolChange(tool.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      activeTool === tool.id
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                    title={tool.description}
                  >
                    {tool.name}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </nav>
    </div>
  )
}


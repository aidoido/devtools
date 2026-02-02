import { ToolType, Tool } from '../types'

interface SidebarProps {
  activeTool: ToolType
  onToolChange: (tool: ToolType) => void
  isOpen: boolean
  onToggle: () => void
}

const tools: Tool[] = [
  // SQL (Primary Feature) - Moved to top
  { id: 'sql-formatter', name: 'SQL Formatter', category: 'sql', description: 'Format and minify SQL queries' },
  
  // JSON Tools
  { id: 'json-formatter', name: 'JSON Formatter', category: 'json', description: 'Pretty print JSON' },
  { id: 'json-minifier', name: 'JSON Minifier', category: 'json', description: 'Minify JSON' },
  { id: 'json-validator', name: 'JSON Validator', category: 'json', description: 'Validate JSON syntax' },
  { id: 'json-diff', name: 'JSON Diff', category: 'json', description: 'Compare two JSON objects' },
  { id: 'json-to-xml', name: 'JSON to XML', category: 'json', description: 'Convert JSON to XML' },
  { id: 'json-to-yaml', name: 'JSON to YAML', category: 'json', description: 'Convert JSON to YAML' },
  
  // XML Tools
  { id: 'xml-formatter', name: 'XML Formatter', category: 'xml', description: 'Pretty print XML' },
  { id: 'xml-minifier', name: 'XML Minifier', category: 'xml', description: 'Minify XML' },
  { id: 'xml-validator', name: 'XML Validator', category: 'xml', description: 'Validate XML syntax' },
  { id: 'xpath-tester', name: 'XPath Tester', category: 'xml', description: 'Test XPath expressions' },
  { id: 'xml-to-json', name: 'XML to JSON', category: 'xml', description: 'Convert XML to JSON' },
  
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
  
  // Text Utilities
  { id: 'case-converter', name: 'Case Converter', category: 'text', description: 'Convert text case styles' },
  { id: 'text-counter', name: 'Text Counter', category: 'text', description: 'Count characters, words, lines' },
  { id: 'text-diff', name: 'Text Diff', category: 'text', description: 'Compare two text blocks' },
  { id: 'text-sort', name: 'Sort Lines', category: 'text', description: 'Sort lines alphabetically' },
  { id: 'text-reverse', name: 'Reverse Text', category: 'text', description: 'Reverse text, lines, or words' },
  { id: 'remove-duplicates', name: 'Remove Duplicates', category: 'text', description: 'Remove duplicate lines' },
  { id: 'escape-unescape', name: 'Escape/Unescape', category: 'text', description: 'Escape or unescape text' },
  
  // Converters
  { id: 'number-base-converter', name: 'Number Base Converter', category: 'converters', description: 'Convert between number bases' },
  { id: 'color-converter', name: 'Color Converter', category: 'converters', description: 'Convert color formats' },
  { id: 'csv-to-json', name: 'CSV to JSON', category: 'converters', description: 'Convert CSV to JSON' },
  
  // Date & Time
  { id: 'timestamp-converter', name: 'Timestamp Converter', category: 'date', description: 'Convert timestamps to dates' },
  { id: 'date-calculator', name: 'Date Calculator', category: 'date', description: 'Calculate date differences' },
  { id: 'timezone-converter', name: 'Timezone Converter', category: 'date', description: 'Convert between timezones' },
  
  // Generators
  { id: 'uuid-generator', name: 'UUID Generator', category: 'generators', description: 'Generate UUIDs' },
  { id: 'password-generator', name: 'Password Generator', category: 'generators', description: 'Generate secure passwords' },
  
  // Validators
  { id: 'email-validator', name: 'Email Validator', category: 'validators', description: 'Validate email addresses' },
  { id: 'phone-validator', name: 'Phone Validator', category: 'validators', description: 'Validate phone numbers' },
  { id: 'credit-card-validator', name: 'Credit Card Validator', category: 'validators', description: 'Validate credit cards' },
  
  // Code Tools
  { id: 'code-minifier', name: 'Code Minifier', category: 'code', description: 'Minify JS/CSS/HTML' },
  { id: 'code-beautifier', name: 'Code Beautifier', category: 'code', description: 'Beautify JS/CSS/HTML' },
  { id: 'jwt-decoder', name: 'JWT Decoder', category: 'code', description: 'Decode JWT tokens' },
  { id: 'query-string-parser', name: 'Query String Parser', category: 'code', description: 'Parse or build query strings' },
]

const categories = [
  { id: 'sql', name: 'SQL Formatter' },
  { id: 'json', name: 'JSON Tools' },
  { id: 'xml', name: 'XML Tools' },
  { id: 'yaml', name: 'YAML Tools' },
  { id: 'encoding', name: 'Encoding' },
  { id: 'hashing', name: 'Hashing' },
  { id: 'regex', name: 'Regex' },
  { id: 'text', name: 'Text Utilities' },
  { id: 'converters', name: 'Converters' },
  { id: 'date', name: 'Date & Time' },
  { id: 'generators', name: 'Generators' },
  { id: 'validators', name: 'Validators' },
  { id: 'code', name: 'Code Tools' },
]

export default function Sidebar({ activeTool, onToolChange, isOpen, onToggle }: SidebarProps) {
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="absolute left-0 top-0 z-50 p-3 bg-black border-r border-white/10 hover:bg-white/5 transition-all"
        title="Show sidebar"
      >
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    )
  }

  return (
    <div className="w-64 bg-black border-r border-white/10 flex flex-col transition-all">
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">DevHelper</h1>
          <p className="text-xs text-white/60 mt-0.5">Dev & Scripting Utilities</p>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 hover:bg-white/5 rounded transition-colors"
          title="Hide sidebar"
        >
          <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-3">
        {categories.map((category) => {
          const categoryTools = tools.filter(t => t.category === category.id)
          return (
            <div key={category.id} className="mb-5">
              <h2 className="text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2 px-2">
                {category.name}
              </h2>
              <div className="space-y-0.5">
                {categoryTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => onToolChange(tool.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-sm transition-all ${
                      activeTool === tool.id
                        ? 'bg-white text-black font-medium'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
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


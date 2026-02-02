export type ToolType =
  // SQL
  | 'sql-formatter'
  // JSON
  | 'json-formatter'
  | 'json-minifier'
  | 'json-validator'
  | 'json-diff'
  | 'json-to-yaml'
  // XML
  | 'xml-formatter'
  | 'xml-minifier'
  | 'xml-validator'
  | 'xpath-tester'
  | 'xml-to-json'
  // YAML
  | 'yaml-formatter'
  | 'yaml-validator'
  | 'yaml-to-json'
  // Encoding
  | 'base64-encode'
  | 'base64-decode'
  | 'url-encode'
  | 'url-decode'
  // Hashing
  | 'hash-md5'
  | 'hash-sha1'
  | 'hash-sha256'
  // Regex
  | 'regex-tester'
  // Text Utilities
  | 'case-converter'
  | 'text-counter'
  | 'text-diff'
  | 'text-sort'
  | 'text-reverse'
  | 'remove-duplicates'
  | 'escape-unescape'
  // Converters
  | 'json-to-xml'
  | 'csv-to-json'
  | 'number-base-converter'
  | 'color-converter'
  // Date & Time
  | 'timestamp-converter'
  | 'date-calculator'
  | 'timezone-converter'
  // Generators
  | 'uuid-generator'
  | 'password-generator'
  // Validators
  | 'email-validator'
  | 'phone-validator'
  | 'credit-card-validator'
  // Code Tools
  | 'code-minifier'
  | 'code-beautifier'
  | 'jwt-decoder'
  | 'query-string-parser'

export interface Tool {
  id: ToolType
  name: string
  category: 'sql' | 'json' | 'xml' | 'yaml' | 'encoding' | 'hashing' | 'regex' | 'text' | 'converters' | 'date' | 'generators' | 'validators' | 'code'
  description: string
}


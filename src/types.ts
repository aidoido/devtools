export type ToolType =
  | 'json-formatter'
  | 'json-minifier'
  | 'json-validator'
  | 'json-diff'
  | 'xml-formatter'
  | 'xml-minifier'
  | 'xml-validator'
  | 'xpath-tester'
  | 'yaml-formatter'
  | 'yaml-validator'
  | 'yaml-to-json'
  | 'base64-encode'
  | 'base64-decode'
  | 'url-encode'
  | 'url-decode'
  | 'hash-md5'
  | 'hash-sha1'
  | 'hash-sha256'
  | 'regex-tester'
  | 'sql-formatter'

export interface Tool {
  id: ToolType
  name: string
  category: 'json' | 'xml' | 'yaml' | 'encoding' | 'hashing' | 'regex' | 'sql'
  description: string
}


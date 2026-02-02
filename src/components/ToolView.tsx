import React from 'react'
import { ToolType } from '../types'
import JSONFormatter from './tools/JSONFormatter'
import JSONMinifier from './tools/JSONMinifier'
import JSONValidator from './tools/JSONValidator'
import JSONDiff from './tools/JSONDiff'
import XMLFormatter from './tools/XMLFormatter'
import XMLMinifier from './tools/XMLMinifier'
import XMLValidator from './tools/XMLValidator'
import XPathTester from './tools/XPathTester'
import YAMLFormatter from './tools/YAMLFormatter'
import YAMLValidator from './tools/YAMLValidator'
import YAMLToJSON from './tools/YAMLToJSON'
import Base64Encode from './tools/Base64Encode'
import Base64Decode from './tools/Base64Decode'
import URLEncode from './tools/URLEncode'
import URLDecode from './tools/URLDecode'
import HashMD5 from './tools/HashMD5'
import HashSHA1 from './tools/HashSHA1'
import HashSHA256 from './tools/HashSHA256'
import RegexTester from './tools/RegexTester'
import SQLFormatter from './tools/SQLFormatter'

interface ToolViewProps {
  tool: ToolType
}

const toolComponents: Record<ToolType, React.ComponentType> = {
  'json-formatter': JSONFormatter,
  'json-minifier': JSONMinifier,
  'json-validator': JSONValidator,
  'json-diff': JSONDiff,
  'xml-formatter': XMLFormatter,
  'xml-minifier': XMLMinifier,
  'xml-validator': XMLValidator,
  'xpath-tester': XPathTester,
  'yaml-formatter': YAMLFormatter,
  'yaml-validator': YAMLValidator,
  'yaml-to-json': YAMLToJSON,
  'base64-encode': Base64Encode,
  'base64-decode': Base64Decode,
  'url-encode': URLEncode,
  'url-decode': URLDecode,
  'hash-md5': HashMD5,
  'hash-sha1': HashSHA1,
  'hash-sha256': HashSHA256,
  'regex-tester': RegexTester,
  'sql-formatter': SQLFormatter,
}

export default function ToolView({ tool }: ToolViewProps) {
  const Component = toolComponents[tool]
  return Component ? <Component /> : <div>Tool not found</div>
}


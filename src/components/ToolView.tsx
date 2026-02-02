import React from 'react'
import { ToolType } from '../types'
import JSONFormatter from './tools/JSONFormatter'
import JSONMinifier from './tools/JSONMinifier'
import JSONValidator from './tools/JSONValidator'
import JSONDiff from './tools/JSONDiff'
import JSONToXML from './tools/JSONToXML'
import JSONToYAML from './tools/JSONToYAML'
import XMLFormatter from './tools/XMLFormatter'
import XMLMinifier from './tools/XMLMinifier'
import XMLValidator from './tools/XMLValidator'
import XPathTester from './tools/XPathTester'
import XMLToJSON from './tools/XMLToJSON'
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
import SQLValidator from './tools/SQLValidator'
import SQLAnalyzer from './tools/SQLAnalyzer'
import SQLAdvancedAnalyzer from './tools/SQLAdvancedAnalyzer'
import CaseConverter from './tools/CaseConverter'
import TextCounter from './tools/TextCounter'
import TextDiff from './tools/TextDiff'
import TextSort from './tools/TextSort'
import TextReverse from './tools/TextReverse'
import RemoveDuplicates from './tools/RemoveDuplicates'
import EscapeUnescape from './tools/EscapeUnescape'
import NumberBaseConverter from './tools/NumberBaseConverter'
import ColorConverter from './tools/ColorConverter'
import CSVToJSON from './tools/CSVToJSON'
import TimestampConverter from './tools/TimestampConverter'
import DateCalculator from './tools/DateCalculator'
import TimezoneConverter from './tools/TimezoneConverter'
import UUIDGenerator from './tools/UUIDGenerator'
import PasswordGenerator from './tools/PasswordGenerator'
import EmailValidator from './tools/EmailValidator'
import PhoneValidator from './tools/PhoneValidator'
import CreditCardValidator from './tools/CreditCardValidator'
import CodeMinifier from './tools/CodeMinifier'
import CodeBeautifier from './tools/CodeBeautifier'
import JWTDecoder from './tools/JWTDecoder'
import QueryStringParser from './tools/QueryStringParser'

interface ToolViewProps {
  tool: ToolType
}

const toolComponents: Record<ToolType, React.ComponentType> = {
  'sql-formatter': SQLFormatter,
  'sql-validator': SQLValidator,
  'sql-analyzer': SQLAnalyzer,
  'sql-advanced-analyzer': SQLAdvancedAnalyzer,
  'json-formatter': JSONFormatter,
  'json-minifier': JSONMinifier,
  'json-validator': JSONValidator,
  'json-diff': JSONDiff,
  'json-to-xml': JSONToXML,
  'json-to-yaml': JSONToYAML,
  'xml-formatter': XMLFormatter,
  'xml-minifier': XMLMinifier,
  'xml-validator': XMLValidator,
  'xpath-tester': XPathTester,
  'xml-to-json': XMLToJSON,
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
  'case-converter': CaseConverter,
  'text-counter': TextCounter,
  'text-diff': TextDiff,
  'text-sort': TextSort,
  'text-reverse': TextReverse,
  'remove-duplicates': RemoveDuplicates,
  'escape-unescape': EscapeUnescape,
  'number-base-converter': NumberBaseConverter,
  'color-converter': ColorConverter,
  'csv-to-json': CSVToJSON,
  'timestamp-converter': TimestampConverter,
  'date-calculator': DateCalculator,
  'timezone-converter': TimezoneConverter,
  'uuid-generator': UUIDGenerator,
  'password-generator': PasswordGenerator,
  'email-validator': EmailValidator,
  'phone-validator': PhoneValidator,
  'credit-card-validator': CreditCardValidator,
  'code-minifier': CodeMinifier,
  'code-beautifier': CodeBeautifier,
  'jwt-decoder': JWTDecoder,
  'query-string-parser': QueryStringParser,
}

export default function ToolView({ tool }: ToolViewProps) {
  const Component = toolComponents[tool]
  return Component ? <Component /> : <div>Tool not found</div>
}


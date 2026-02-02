import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import ToolLayout from '../ToolLayout'

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? "0" + hex : hex
  }).join("")
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

export default function ColorConverter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    
    try {
      const inputLower = input.trim().toLowerCase()
      let rgb: { r: number; g: number; b: number } | null = null
      
      // Try to parse as HEX
      if (inputLower.startsWith('#') || /^[0-9a-f]{6}$/i.test(inputLower)) {
        const hex = inputLower.startsWith('#') ? inputLower : '#' + inputLower
        rgb = hexToRgb(hex)
      }
      // Try to parse as RGB
      else if (inputLower.startsWith('rgb')) {
        const match = inputLower.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
        if (match) {
          rgb = { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) }
        }
      }
      
      if (!rgb) {
        setOutput('Error: Invalid color format. Use HEX (#RRGGBB) or RGB(r, g, b)')
        return
      }
      
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
      
      const results = [
        `HEX: ${hex}`,
        `RGB: rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
        `HSL: hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      ].join('\n')
      
      setOutput(results)
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Conversion failed'}`)
    }
  }, [input])

  return (
    <ToolLayout
      title="Color Converter"
      description="Convert between HEX, RGB, and HSL color formats"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLanguage="plaintext"
      outputLanguage="plaintext"
      onCopy={() => {
        if (output && !output.startsWith('Error:')) {
          navigator.clipboard.writeText(output)
          toast.success('Copied to clipboard')
        }
      }}
    />
  )
}

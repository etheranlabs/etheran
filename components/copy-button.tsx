'use client'
import { useState } from 'react'

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      style={{
        fontFamily: 'var(--font-jetbrains), "Courier New", monospace',
        fontSize: '9px',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        background: 'none',
        border: '1px solid #ddddd8',
        padding: '4px 10px',
        cursor: 'pointer',
        color: copied ? '#111110' : '#aaaaaa',
        transition: 'color 0.15s',
      }}
    >
      {copied ? 'copied' : 'copy'}
    </button>
  )
}

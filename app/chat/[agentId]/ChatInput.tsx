'use client'

import { useState, KeyboardEvent } from 'react'

interface Props {
  onSend: (content: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: Props) {
  const [input, setInput] = useState('')

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setInput('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-default bg-bg-secondary/80 backdrop-blur-xl p-4">
      <div className="max-w-4xl mx-auto flex gap-3 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息..."
          disabled={disabled}
          rows={1}
          className="flex-1 bg-bg-tertiary border border-default rounded-xl px-4 py-3 text-text-primary text-sm resize-none focus:outline-none focus:border-accent-primary transition-colors disabled:opacity-50"
          style={{ minHeight: '44px', maxHeight: '120px' }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement
            target.style.height = 'auto'
            target.style.height = Math.min(target.scrollHeight, 120) + 'px'
          }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="px-5 py-3 rounded-xl bg-accent-gradient text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-opacity cursor-pointer"
        >
          发送
        </button>
      </div>
    </div>
  )
}

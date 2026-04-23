'use client'

import type { Message } from '../../types/chat'

interface Props {
  message: Message
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-accent-gradient text-white rounded-br-sm'
            : 'bg-bg-secondary border border-default text-text-primary rounded-bl-sm'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <span className={`text-xs mt-1 block ${isUser ? 'text-white/60' : 'text-text-muted'}`}>
          {new Date(message.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

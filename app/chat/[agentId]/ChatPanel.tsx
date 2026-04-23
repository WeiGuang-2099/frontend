'use client'

import { useEffect, useRef } from 'react'
import type { Message } from '../../types/chat'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'

interface Props {
  messages: Message[]
  streamingContent: string
  isStreaming: boolean
  agentName: string
  onSend: (content: string) => void
}

export function ChatPanel({ messages, streamingContent, isStreaming, agentName, onSend }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-default bg-bg-secondary/80 backdrop-blur-xl">
        <h2 className="text-lg font-medium text-text-primary gradient-text">{agentName}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 && !streamingContent ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-text-muted text-sm">开始与 {agentName} 对话吧</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {streamingContent && (
              <div className="flex justify-start mb-4">
                <div className="max-w-[75%] px-4 py-3 rounded-2xl bg-bg-secondary border border-default text-text-primary rounded-bl-sm">
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {streamingContent}
                    <span className="inline-block w-0.5 h-4 bg-accent-primary animate-pulse ml-0.5 align-middle" />
                  </p>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={onSend} disabled={isStreaming} />
    </div>
  )
}

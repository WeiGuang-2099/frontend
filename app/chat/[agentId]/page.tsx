'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { chatService } from '../../services/chatService'
import { agentService } from '../../services/agentService'
import { authService } from '../../services/authService'
import type { AgentResponse } from '../../types/agent'
import type { Conversation, Message } from '../../types/chat'
import { ConversationList } from './ConversationList'
import { ChatPanel } from './ChatPanel'
import { ConfirmDialog } from '../../components/ConfirmDialog'

export default function ChatPage() {
  const router = useRouter()
  const params = useParams()
  const agentId = Number(params.agentId)

  const [agent, setAgent] = useState<AgentResponse | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [streamingContent, setStreamingContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<Conversation | null>(null)

  // Track abort function for active stream
  const abortStreamRef = useRef<(() => void) | null>(null)

  // Abort stream on unmount
  useEffect(() => {
    return () => {
      abortStreamRef.current?.()
      abortStreamRef.current = null
    }
  }, [])

  // Auth check + load agent
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
      if (!token) { router.replace('/login'); return }
      try {
        await authService.getMe()
      } catch {
        router.replace('/login')
        return
      }
      try {
        const data = await agentService.getAgent(agentId)
        setAgent(data)
      } catch {
        alert('Agent not found')
        router.replace('/')
      }
    }
    init()
  }, [agentId, router])

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const data = await chatService.getConversations(agentId)
      setConversations(data)
    } catch (err) {
      console.error('Failed to load conversations:', err)
    }
  }, [agentId])

  useEffect(() => {
    if (agent) loadConversations()
  }, [agent, loadConversations])

  // Load messages when switching conversation
  useEffect(() => {
    if (!activeConvId) { setMessages([]); return }
    chatService.getMessages(activeConvId).then(setMessages).catch((err) => {
      console.error('Failed to load messages:', err)
      setMessages([])
    })
  }, [activeConvId])

  // Create new conversation
  const handleNewConversation = async () => {
    try {
      const conv = await chatService.createConversation({ agent_id: agentId })
      setConversations((prev) => [conv, ...prev])
      setActiveConvId(conv.id)
    } catch {
      alert('Failed to create conversation')
    }
  }

  // Delete conversation
  const handleDeleteConversation = async () => {
    if (!deleteConfirm) return
    try {
      await chatService.deleteConversation(deleteConfirm.id)
      setConversations((prev) => prev.filter((c) => c.id !== deleteConfirm.id))
      if (activeConvId === deleteConfirm.id) setActiveConvId(null)
    } catch {
      alert('Failed to delete')
    } finally {
      setDeleteConfirm(null)
    }
  }

  // Send message
  const handleSend = async (content: string) => {
    if (!activeConvId) {
      // Auto-create conversation on first message (no setTimeout)
      try {
        const conv = await chatService.createConversation({
          agent_id: agentId,
          title: content.slice(0, 20) + (content.length > 20 ? '...' : ''),
        })
        setConversations((prev) => [conv, ...prev])
        setActiveConvId(conv.id)
        // Start streaming immediately -- conversation is already persisted by create endpoint
        doStream(conv.id, content)
      } catch {
        alert('Failed to start conversation')
      }
      return
    }
    doStream(activeConvId, content)
  }

  const doStream = (convId: number, content: string) => {
    // Abort any previous stream
    abortStreamRef.current?.()

    // Add optimistic user message with negative ID to avoid collision
    const optimisticMsg: Message = {
      id: -Date.now(),
      conversation_id: convId,
      role: 'user',
      content,
      tokens_used: null,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimisticMsg])
    setStreamingContent('')
    setIsStreaming(true)

    const abort = chatService.streamChat(
      convId,
      content,
      (token) => setStreamingContent((prev) => prev + token),
      () => {
        setIsStreaming(false)
        abortStreamRef.current = null
        // Reload messages to get persisted IDs
        chatService.getMessages(convId).then((msgs) => {
          setMessages(msgs)
          setStreamingContent('')
        }).catch(console.error)
        loadConversations()
      },
      (error) => {
        setIsStreaming(false)
        setStreamingContent('')
        abortStreamRef.current = null
        alert(`Stream error: ${error}`)
      },
    )
    abortStreamRef.current = abort
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary text-text-secondary">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="grid-bg" />

      {/* Top nav */}
      <nav className="sticky top-0 z-[100] backdrop-blur-xl bg-bg-secondary/80 border-b border-default">
        <div className="px-6 py-3 flex items-center gap-4">
          <Link href="/" className="text-xl font-semibold gradient-text no-underline">
            Cosmray
          </Link>
          <span className="text-text-muted">/</span>
          <span className="text-text-secondary text-sm">{agent.name}</span>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <ConversationList
          conversations={conversations}
          activeId={activeConvId}
          onSelect={(conv) => setActiveConvId(conv.id)}
          onNew={handleNewConversation}
          onDelete={(conv) => setDeleteConfirm(conv)}
        />
        <ChatPanel
          messages={messages}
          streamingContent={streamingContent}
          isStreaming={isStreaming}
          agentName={agent.name}
          onSend={handleSend}
        />
      </div>

      {/* Delete confirmation */}
      {deleteConfirm && (
        <ConfirmDialog
          isOpen={true}
          title="删除对话"
          message="确定要删除这个对话吗？"
          type="danger"
          onConfirm={handleDeleteConversation}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  )
}

export interface Conversation {
  id: number
  agent_id: number
  user_id: number
  title: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Message {
  id: number
  conversation_id: number
  role: 'user' | 'assistant' | 'system'
  content: string
  tokens_used: number | null
  created_at: string
}

export interface ConversationCreate {
  agent_id: number
  title?: string
}

export interface ChatRequest {
  content: string
}

export interface SSEMessageEvent {
  token: string
}

export interface SSEDoneEvent {
  status: string
}

export interface SSEErrorEvent {
  error: string
}

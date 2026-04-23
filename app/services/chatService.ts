import type { Conversation, Message, ConversationCreate } from '../types/chat'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000'

function getAuthHeaders(): HeadersInit {
  const token =
    (typeof window !== 'undefined' && localStorage.getItem('access_token')) ||
    (typeof window !== 'undefined' && sessionStorage.getItem('access_token')) ||
    ''
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export const chatService = {
  async createConversation(data: ConversationCreate): Promise<Conversation> {
    const response = await fetch(`${API_BASE}/api/v1/chat/conversations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    const json = await response.json()
    return json.data
  },

  async getConversations(agentId?: number, skip = 0, limit = 50): Promise<Conversation[]> {
    const response = await fetch(`${API_BASE}/api/v1/chat/conversations/list`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ agent_id: agentId, skip, limit }),
    })
    const json = await response.json()
    return json.data
  },

  async getMessages(conversationId: number): Promise<Message[]> {
    const response = await fetch(`${API_BASE}/api/v1/chat/conversations/${conversationId}/messages`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    const json = await response.json()
    return json.data
  },

  async deleteConversation(conversationId: number): Promise<boolean> {
    const response = await fetch(`${API_BASE}/api/v1/chat/conversations/delete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ conversation_id: conversationId }),
    })
    const json = await response.json()
    return json.data
  },

  streamChat(
    conversationId: number,
    content: string,
    onToken: (token: string) => void,
    onDone: () => void,
    onError: (error: string) => void,
  ): () => void {
    const token =
      localStorage.getItem('access_token') ||
      sessionStorage.getItem('access_token') ||
      ''

    const controller = new AbortController()

    fetch(`${API_BASE}/api/v1/chat/conversations/${conversationId}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          onError(`HTTP ${response.status}`)
          return
        }
        const reader = response.body?.getReader()
        if (!reader) {
          onError('No response body')
          return
        }

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(line.slice(6))
                if (parsed.token) {
                  onToken(parsed.token)
                } else if (parsed.status === 'complete') {
                  onDone()
                } else if (parsed.error) {
                  onError(parsed.error)
                }
              } catch {
                // skip malformed data
              }
            }
          }
        }
        onDone()
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          onError(err.message)
        }
      })

    return () => controller.abort()
  },
}

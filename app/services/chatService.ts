import type { Conversation, Message, ConversationCreate } from '../types/chat'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000'

function getToken(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token') || ''
}

function getAuthHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    throw new Error(`HTTP ${response.status}: ${errorBody || response.statusText}`)
  }
  const json = await response.json()
  return json.data
}

export const chatService = {
  async createConversation(data: ConversationCreate): Promise<Conversation> {
    const response = await fetch(`${API_BASE}/api/v1/chat/conversations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<Conversation>(response)
  },

  async getConversations(agentId?: number, skip = 0, limit = 50): Promise<Conversation[]> {
    const response = await fetch(`${API_BASE}/api/v1/chat/conversations/list`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ agent_id: agentId, skip, limit }),
    })
    return handleResponse<Conversation[]>(response)
  },

  async getMessages(conversationId: number): Promise<Message[]> {
    const response = await fetch(`${API_BASE}/api/v1/chat/conversations/${conversationId}/messages`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    return handleResponse<Message[]>(response)
  },

  async deleteConversation(conversationId: number): Promise<boolean> {
    const response = await fetch(`${API_BASE}/api/v1/chat/conversations/delete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ conversation_id: conversationId }),
    })
    return handleResponse<boolean>(response)
  },

  streamChat(
    conversationId: number,
    content: string,
    onToken: (token: string) => void,
    onDone: () => void,
    onError: (error: string) => void,
  ): () => void {
    const token = getToken()
    const controller = new AbortController()
    let doneCalled = false

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
                  if (!doneCalled) { doneCalled = true; onDone() }
                } else if (parsed.error) {
                  onError(parsed.error)
                }
              } catch {
                // skip malformed data
              }
            }
          }
        }
        // Only call onDone if the server didn't send explicit complete event
        if (!doneCalled) { doneCalled = true; onDone() }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          onError(err.message)
        }
      })

    return () => controller.abort()
  },
}

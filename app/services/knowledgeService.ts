import type { KnowledgeDocument, GraphData, GraphNode, UploadResult } from '../types/knowledge'

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

export const knowledgeService = {
  async uploadDocument(agentId: number, file: File): Promise<UploadResult> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE}/api/v1/knowledge/upload?agent_id=${agentId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    })
    return handleResponse<UploadResult>(response)
  },

  async getDocuments(agentId: number, skip = 0, limit = 50): Promise<KnowledgeDocument[]> {
    const response = await fetch(`${API_BASE}/api/v1/knowledge/documents/list`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ agent_id: agentId, skip, limit }),
    })
    return handleResponse<KnowledgeDocument[]>(response)
  },

  async deleteDocument(documentId: number): Promise<boolean> {
    const response = await fetch(`${API_BASE}/api/v1/knowledge/documents/delete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ document_id: documentId }),
    })
    return handleResponse<boolean>(response)
  },

  async getGraph(agentId: number): Promise<GraphData> {
    const response = await fetch(`${API_BASE}/api/v1/knowledge/graph/${agentId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    return handleResponse<GraphData>(response)
  },

  async searchEntities(agentId: number, query: string): Promise<GraphNode[]> {
    const response = await fetch(`${API_BASE}/api/v1/knowledge/graph/search`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ agent_id: agentId, query }),
    })
    return handleResponse<GraphNode[]>(response)
  },
}

export interface KnowledgeDocument {
  id: number
  agent_id: number
  user_id: number
  filename: string
  file_size: number
  status: 'processing' | 'completed' | 'failed'
  entity_count: number
  created_at: string
}

export interface GraphNode {
  id: string
  name: string
  type: string
  description: string | null
}

export interface GraphEdge {
  source: string
  target: string
  relation: string
  description: string | null
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface UploadResult {
  id: number
  filename: string
  status: string
  entity_count: number
}

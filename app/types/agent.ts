export interface AgentBase {
  name: string
  short_description?: string | null
  description?: string | null
  avatar_url?: string | null
  voice_id?: string | null
  voice_settings?: Record<string, unknown> | null
  appearance_settings?: Record<string, unknown> | null
  agent_type?: string | null
  skills?: string[] | null
  conversation_style?: string | null
  personality?: string | null
  temperature?: number | null
  max_tokens?: number | null
  system_prompt?: string | null
  permission?: string | null
}

export interface AgentCreate extends AgentBase {}

export interface AgentUpdate {
  name?: string
  short_description?: string | null
  description?: string | null
  avatar_url?: string | null
  voice_id?: string | null
  voice_settings?: Record<string, unknown> | null
  appearance_settings?: Record<string, unknown> | null
  agent_type?: string | null
  skills?: string[] | null
  conversation_style?: string | null
  personality?: string | null
  temperature?: number | null
  max_tokens?: number | null
  system_prompt?: string | null
  permission?: string | null
  is_active?: boolean
}

export interface AgentResponse extends AgentBase {
  id: number
  user_id: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AgentListRequest {
  skip?: number
  limit?: number
}

export interface AgentListResponse {
  agents: AgentResponse[]
  total: number
}

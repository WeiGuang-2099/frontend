export interface UserInfo {
  id: number
  username: string
  email: string
  full_name: string | null
  is_active: boolean
  is_superuser: boolean
  created_at: string
  updated_at: string
}

// 前端使用的统计数据类型（驼峰命名）
export interface UserStats {
  agentCount: number
  conversationCount: number
  trainingCount: number
}

export interface UserProfile extends UserInfo {
  stats: UserStats
}

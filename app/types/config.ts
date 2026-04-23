// 配置项响应（用于下拉选择）
export interface ConfigItemResponse {
  value: string
  label: string
}

// 用户统计数据（后端返回格式）
export interface UserStatsResponse {
  agent_count: number
  conversation_count: number
  training_count: number
}

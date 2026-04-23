import type { ConfigItemResponse, UserStatsResponse } from '../types/config'

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

export const configService = {
  // 获取数字人类型列表
  async getAgentTypes(): Promise<ConfigItemResponse[]> {
    const response = await fetch(`${API_BASE}/api/v1/agents/config/agent-types`, {
      method: 'POST',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('获取数字人类型列表失败')
    }

    return response.json()
  },

  // 获取预设技能列表
  async getSkills(): Promise<ConfigItemResponse[]> {
    const response = await fetch(`${API_BASE}/api/v1/agents/config/skills`, {
      method: 'POST',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('获取技能列表失败')
    }

    return response.json()
  },

  // 获取用户统计数据
  async getUserStats(): Promise<UserStatsResponse> {
    const response = await fetch(`${API_BASE}/api/v1/users/stats`, {
      method: 'POST',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('获取用户统计数据失败')
    }

    return response.json()
  },
}

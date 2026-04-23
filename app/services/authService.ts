import type { UserInfo } from '../types/user'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000'

export type { UserInfo }

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

export const authService = {
  // 获取当前登录用户信息
  async getMe(): Promise<UserInfo> {
    const response = await fetch(`${API_BASE}/api/v1/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      let errorDetail = '获取用户信息失败'
      try {
        const errorData = await response.text()
        const parsed = JSON.parse(errorData)
        errorDetail = parsed.detail || parsed.message || errorDetail
      } catch (parseError) {
        // 如果解析失败，使用原始响应信息
        errorDetail = `获取用户信息失败: ${response.status} ${response.statusText}`
      }
      throw new Error(`${errorDetail} (状态码: ${response.status})`)
    }

    return response.json()
  },
}

import type { AgentCreate, AgentUpdate, AgentResponse } from '../types/agent'

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

export const agentService = {
  // 获取智能体列表
  async getAgents(skip = 0, limit = 100): Promise<AgentResponse[]> {
    // 确保 API_BASE 有值
    if (!API_BASE) {
      throw new Error('API_BASE 未配置，请检查环境变量 NEXT_PUBLIC_API_BASE_URL')
    }

    try {
      const url = new URL(`${API_BASE}/api/v1/agents/list`)
      url.searchParams.set('skip', String(skip))
      url.searchParams.set('limit', String(limit))

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        let errorDetail = '获取智能体列表失败'
        try {
          const errorData = await response.text()
          const parsed = JSON.parse(errorData)
          errorDetail = parsed.detail || parsed.message || errorDetail
        } catch (parseError) {
          // 如果解析失败，使用原始响应信息
          errorDetail = `获取智能体列表失败: ${response.status} ${response.statusText}`
        }
        throw new Error(`${errorDetail} (状态码: ${response.status})`)
      }

      return response.json()
    } catch (error) {
      // 捕获 URL 构建错误或网络错误
      if (error instanceof TypeError && error.message.includes('Invalid URL')) {
        throw new Error(`API 地址格式错误: ${API_BASE}`)
      }
      throw error
    }
  },

  // 获取单个智能体详情
  async getAgent(agentId: number): Promise<AgentResponse> {
    const response = await fetch(`${API_BASE}/api/v1/agents/get/${agentId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('获取智能体详情失败')
    }

    return response.json()
  },

  // 创建智能体
  async createAgent(data: AgentCreate): Promise<AgentResponse> {
    const response = await fetch(`${API_BASE}/api/v1/agents`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      let errorDetail = '创建智能体失败'
      try {
        const error = await response.json()
        errorDetail = error.detail || error.message || errorDetail
      } catch (parseError) {
        errorDetail = `创建智能体失败: ${response.status} ${response.statusText}`
      }
      throw new Error(`${errorDetail} (状态码: ${response.status})`)
    }

    return response.json()
  },

  // 更新智能体
  async updateAgent(agentId: number, data: AgentUpdate): Promise<AgentResponse> {
    const response = await fetch(`${API_BASE}/api/v1/agents/update/${agentId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      let errorDetail = '更新智能体失败'
      try {
        const error = await response.json()
        errorDetail = error.detail || error.message || errorDetail
      } catch (parseError) {
        errorDetail = `更新智能体失败: ${response.status} ${response.statusText}`
      }
      throw new Error(`${errorDetail} (状态码: ${response.status})`)
    }

    return response.json()
  },

  // 删除智能体
  async deleteAgent(agentId: number): Promise<void> {
    const response = await fetch(`${API_BASE}/api/v1/agents/delete/${agentId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      let errorDetail = '删除智能体失败'
      try {
        const error = await response.json()
        errorDetail = error.detail || error.message || errorDetail
      } catch (parseError) {
        errorDetail = `删除智能体失败: ${response.status} ${response.statusText}`
      }
      throw new Error(`${errorDetail} (状态码: ${response.status})`)
    }
  },

  // AI智能助手
  async aiAssist(data: {
    field?: string
    context?: string
    message: string
    current_values?: Record<string, string>
  }): Promise<{
    suggestions: string[]
    response: string
  }> {
    // 根据字段类型映射到后端支持的 action
    // 后端支持的 action: suggest_names, generate_description, suggest_skills, optimize_description
    const actionMap: Record<string, string> = {
      name: 'suggest_names',           // 名称 → suggest_names
      domain: 'suggest_names',          // 领域 → suggest_names (领域也可以看作名称/分类)
      purpose: 'generate_description', // 目的 → generate_description
      description: 'generate_description', // 描述 → generate_description
    }

    const action = data.field ? actionMap[data.field] || 'suggest_names' : 'suggest_names'

    // 构建符合后端新统一接口格式的请求体
    const requestBody = {
      action: action,
      description: data.message,
    }

    const response = await fetch(`${API_BASE}/api/v1/agents/ai/assist`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      let errorDetail = 'AI助手请求失败'
      try {
        const error = await response.json()
        // 处理错误详情可能是对象的情况
        if (typeof error.detail === 'string') {
          errorDetail = error.detail
        } else if (typeof error.message === 'string') {
          errorDetail = error.message
        } else if (error.detail && typeof error.detail === 'object') {
          // 如果是对象，尝试序列化或提取关键信息
          if (Array.isArray(error.detail)) {
            errorDetail = error.detail.map((item: any) =>
              typeof item === 'string' ? item : JSON.stringify(item)
            ).join(', ')
          } else {
            errorDetail = JSON.stringify(error.detail)
          }
        }
      } catch (parseError) {
        errorDetail = `AI助手请求失败: ${response.status} ${response.statusText}`
      }
      throw new Error(`${errorDetail} (状态码: ${response.status})`)
    }

    // 后端返回格式:
    // - suggest_names: { action: string, result: Array<{name: string, reason: string}> }
    // - generate_description: { action: string, result: string }
    const backendResponse = await response.json()

    // 转换为前端期望的格式
    const suggestions: string[] = []
    let responseText = ''

    if (backendResponse.result) {
      if (typeof backendResponse.result === 'string') {
        // generate_description 返回的是字符串
        responseText = backendResponse.result
      } else if (Array.isArray(backendResponse.result)) {
        // suggest_names 返回的是数组
        // 从 result 数组中提取 name 作为建议
        suggestions.push(...backendResponse.result.map((item: any) => {
          if (typeof item === 'string') {
            return item
          } else if (item && typeof item === 'object' && item.name) {
            return item.name
          }
          return String(item)
        }))

        // 从 result 中提取 reason 作为 AI 回复，或生成默认回复
        const reasons = backendResponse.result
          .map((item: any) => item?.reason)
          .filter((reason: any) => reason && typeof reason === 'string')

        if (reasons.length > 0) {
          responseText = reasons.join('\n\n')
        } else if (suggestions.length > 0) {
          responseText = `我为您提供了 ${suggestions.length} 个建议，请选择适合的选项。`
        } else {
          responseText = '已为您生成建议，请查看下方的选项。'
        }
      }
    }

    // 确保至少有一个回复
    if (!responseText) {
      responseText = '已为您处理请求。'
    }

    return {
      suggestions,
      response: responseText,
    }
  },
}

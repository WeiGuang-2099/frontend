'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { agentService } from '../services/agentService'
import { authService } from '../services/authService'
import { configService } from '../services/configService'
import type { AgentResponse } from '../types/agent'
import type { UserInfo } from '../types/user'
import { AgentFormModal } from '../components/AgentFormModal'

// 前端使用的统计数据类型
interface UserStats {
  agentCount: number
  conversationCount: number
  trainingCount: number
}

type TabType = 'digital-humans' | 'training' | 'conversations'

export default function ProfilePage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [agents, setAgents] = useState<AgentResponse[]>([])
  const [isLoadingAgents, setIsLoadingAgents] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('digital-humans')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAgent, setEditingAgent] = useState<AgentResponse | null>(null)

  // 用户统计数据
  const [stats, setStats] = useState<UserStats>({
    agentCount: 0,
    conversationCount: 0,
    trainingCount: 0,
  })

  const loadAgents = async () => {
    setIsLoadingAgents(true)
    try {
      const data = await agentService.getAgents()
      const agentList = Array.isArray(data) ? data : []
      setAgents(agentList)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      console.error('加载智能体失败:', errorMessage)
    } finally {
      setIsLoadingAgents(false)
    }
  }

  const loadUserStats = async () => {
    try {
      const statsData = await configService.getUserStats()
      setStats({
        agentCount: statsData.agent_count,
        conversationCount: statsData.conversation_count,
        trainingCount: statsData.training_count,
      })
    } catch (error) {
      console.error('加载用户统计失败:', error)
    }
  }

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      try {
        const localToken = localStorage.getItem('access_token')
        const sessionToken = sessionStorage.getItem('access_token')
        const hasToken = Boolean(localToken || sessionToken)

        if (!hasToken) {
          router.replace('/login')
          return
        }

        // 获取用户信息
        try {
          const userInfo = await authService.getMe()
          setUser(userInfo)
        } catch (error) {
          console.error('获取用户信息失败:', error)
          setUser({
            id: 0,
            username: '用户',
            email: '',
            full_name: null,
            is_active: true,
            is_superuser: false,
            created_at: '',
            updated_at: '',
          })
        }

        setIsChecking(false)
        await Promise.all([loadAgents(), loadUserStats()])
      } catch (err) {
        router.replace('/login')
      }
    }

    checkAuthAndLoad()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const onLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      document.cookie = 'access_token=; Path=/; Max-Age=0; SameSite=Lax'
      try {
        localStorage.removeItem('access_token')
        localStorage.removeItem('token_type')
        sessionStorage.removeItem('access_token')
        sessionStorage.removeItem('token_type')
      } catch (error) {
        console.error('清除存储失败:', error)
      }
      router.replace('/login')
      router.refresh()
    }
  }

  const handleTabSwitch = (tab: TabType) => {
    setActiveTab(tab)
  }

  const handleCreateAgent = (e?: React.MouseEvent) => {
    if (e) e.preventDefault()
    // 跳转到创建页面
    router.push('/create-agent')
  }

  const handleEditAgent = (agent: AgentResponse, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingAgent(agent)
    setShowEditModal(true)
  }

  const handleDeleteAgent = async (agent: AgentResponse, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`确定要删除数字人"${agent.name}"吗？`)) return

    try {
      await agentService.deleteAgent(agent.id)
      alert('删除成功')
      loadAgents()
    } catch (error) {
      alert('删除失败，请稍后重试')
    }
  }

  const handleAgentChat = (agent: AgentResponse) => {
    alert(`数字人"${agent.name}"对话功能开发中，敬请期待！`)
  }

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 格式化日期 MM/DD
  const formatDateShort = (dateString?: string) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${month}/${day}`
    } catch {
      return '-'
    }
  }

  // 格式化日期 YYYY/MM/DD
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}/${month}/${day}`
    } catch {
      return '-'
    }
  }

  // 格式化日期时间 YYYY/MM/DD HH:mm
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hour = String(date.getHours()).padStart(2, '0')
      const minute = String(date.getMinutes()).padStart(2, '0')
      return `${year}/${month}/${day} ${hour}:${minute}`
    } catch {
      return '-'
    }
  }

  // 获取用户头像首字母
  const getAvatarLetter = () => {
    if (user?.full_name) return user.full_name.charAt(0).toUpperCase()
    if (user?.username) return user.username.charAt(0).toUpperCase()
    return 'U'
  }

  // 格式化用户ID显示
  const formatUserId = (id?: number) => {
    if (!id) return '-'
    return `user_${id}`
  }

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary text-text-secondary">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="grid-bg"></div>

      {/* 导航栏 */}
      <nav className="sticky top-0 z-[100] backdrop-blur-xl bg-bg-secondary/80 border-b border-default">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-semibold no-underline gradient-text">
            Cosmray
          </Link>

          <ul className="hidden lg:flex gap-8 list-none">
            <li>
              <Link href="/" className="block py-2 text-text-secondary no-underline transition-colors duration-300 hover:text-accent-primary">
                首页
              </Link>
            </li>
            <li>
              <Link href="/library" className="block py-2 text-text-secondary no-underline transition-colors duration-300 hover:text-accent-primary">
                资料库
              </Link>
            </li>
            <li className="relative">
              <Link href="/profile" className="block py-2 text-accent-primary no-underline transition-colors duration-300 hover:text-accent-primary">
                个人中心
              </Link>
              <span className="active-indicator"></span>
            </li>
          </ul>

          <div className="hidden lg:flex items-center gap-4">
            <span className="text-text-secondary">欢迎, {user?.full_name || user?.username || '用户'}</span>
            <button
              className="px-4 py-2 rounded-lg text-text-primary bg-transparent border border-default cursor-pointer transition-all duration-300 hover:border-accent-primary hover:shadow-glow-sm"
              onClick={onLogout}
            >
              退出
            </button>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="relative z-10 max-w-[1200px] mx-auto px-6 py-8 pb-24">
        {/* 顶部两栏布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 mb-8">
          {/* 左侧：用户资料卡片 */}
          <div className="bg-bg-tertiary border border-default rounded-2xl p-8 backdrop-blur-xl shadow-custom-lg transition-all duration-300 text-center relative overflow-hidden hover:-translate-y-1 hover:shadow-custom-xl hover:shadow-glow-sm hover:border-hover">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <div className="avatar-ring"></div>
              <div className="w-full h-full rounded-full bg-accent-gradient flex items-center justify-center text-[40px] font-semibold text-bg-primary shadow-glow-md relative z-[1]">
                {getAvatarLetter()}
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-text-primary mb-2">
              {user?.full_name || user?.username || '用户'}
            </h2>
            <p className="text-sm text-text-muted mb-6">
              ID: {formatUserId(user?.id)}
            </p>

            <div className="grid grid-cols-3 gap-4">
              <div
                className="text-center p-4 bg-bg-tertiary/80 rounded-2xl border border-default cursor-pointer transition-all duration-300 relative overflow-hidden hover:bg-bg-tertiary/90 hover:border-accent-primary hover:-translate-y-0.5 before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-accent-gradient before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
                onClick={() => handleTabSwitch('digital-humans')}
              >
                <div className="text-3xl font-bold text-accent-primary mb-1">
                  {stats.agentCount}
                </div>
                <div className="text-xs text-text-secondary">数字人</div>
              </div>
              <div
                className="text-center p-4 bg-bg-tertiary/80 rounded-2xl border border-default cursor-pointer transition-all duration-300 relative overflow-hidden hover:bg-bg-tertiary/90 hover:border-accent-primary hover:-translate-y-0.5 before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-accent-gradient before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
                onClick={() => handleTabSwitch('conversations')}
              >
                <div className="text-3xl font-bold text-accent-primary mb-1">
                  {stats.conversationCount}
                </div>
                <div className="text-xs text-text-secondary">总对话数</div>
              </div>
              <div
                className="text-center p-4 bg-bg-tertiary/80 rounded-2xl border border-default cursor-pointer transition-all duration-300 relative overflow-hidden hover:bg-bg-tertiary/90 hover:border-accent-primary hover:-translate-y-0.5 before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-accent-gradient before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
                onClick={() => handleTabSwitch('training')}
              >
                <div className="text-3xl font-bold text-accent-primary mb-1">
                  {stats.trainingCount}
                </div>
                <div className="text-xs text-text-secondary">训练次数</div>
              </div>
            </div>
          </div>

          {/* 右侧：个人信息 */}
          <div className="bg-bg-tertiary border border-default rounded-2xl p-8 backdrop-blur-xl shadow-custom-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-custom-xl hover:shadow-glow-sm hover:border-hover">
            <h3 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
              <span className="title-indicator"></span>
              个人信息
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex justify-between items-center p-4 bg-accent-primary/5 border border-default rounded-lg transition-all duration-300 hover:bg-accent-primary/10 hover:border-accent-primary">
                <span className="text-sm text-text-secondary">用户名</span>
                <span className="text-sm font-medium text-text-primary">{user?.username || '-'}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-accent-primary/5 border border-default rounded-lg transition-all duration-300 hover:bg-accent-primary/10 hover:border-accent-primary">
                <span className="text-sm text-text-secondary">用户ID</span>
                <span className="text-sm font-medium text-text-primary">{formatUserId(user?.id)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-accent-primary/5 border border-default rounded-lg transition-all duration-300 hover:bg-accent-primary/10 hover:border-accent-primary">
                <span className="text-sm text-text-secondary">注册时间</span>
                <span className="text-sm font-medium text-text-primary">{formatDate(user?.created_at)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-accent-primary/5 border border-default rounded-lg transition-all duration-300 hover:bg-accent-primary/10 hover:border-accent-primary">
                <span className="text-sm text-text-secondary">邮箱</span>
                <span className="text-sm font-medium text-text-primary">{user?.email || '-'}</span>
              </div>
              <div className="col-span-1 lg:col-span-2 flex justify-between items-center p-4 bg-accent-primary/5 border border-default rounded-lg transition-all duration-300 hover:bg-accent-primary/10 hover:border-accent-primary">
                <span className="text-sm text-text-secondary">最后登录</span>
                <span className="text-sm font-medium text-text-primary">{formatDateTime(user?.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 标签按钮 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <button
            className={`relative overflow-hidden font-medium px-6 py-4 rounded-lg border transition-all duration-300 text-base ${
              activeTab === 'training'
                ? 'bg-accent-gradient border-transparent text-bg-primary shadow-custom-lg shadow-glow-md'
                : 'border-default bg-transparent text-text-primary hover:border-accent-primary hover:shadow-glow-sm hover:-translate-y-0.5'
            }`}
            onClick={() => handleTabSwitch('training')}
          >
            <span>🎯 训练</span>
          </button>
          <button
            className={`relative overflow-hidden font-medium px-6 py-4 rounded-lg border transition-all duration-300 text-base ${
              activeTab === 'digital-humans'
                ? 'bg-accent-gradient border-transparent text-bg-primary shadow-custom-lg shadow-glow-md'
                : 'border-default bg-transparent text-text-primary hover:border-accent-primary hover:shadow-glow-sm hover:-translate-y-0.5'
            }`}
            onClick={() => handleTabSwitch('digital-humans')}
          >
            <span>🤖 我的数字人</span>
          </button>
          <button
            className={`relative overflow-hidden font-medium px-6 py-4 rounded-lg border transition-all duration-300 text-base ${
              activeTab === 'conversations'
                ? 'bg-accent-gradient border-transparent text-bg-primary shadow-custom-lg shadow-glow-md'
                : 'border-default bg-transparent text-text-primary hover:border-accent-primary hover:shadow-glow-sm hover:-translate-y-0.5'
            }`}
            onClick={() => handleTabSwitch('conversations')}
          >
            <span>💬 会话</span>
          </button>
        </div>

        {/* 内容区域 */}
        <div className="bg-bg-tertiary border border-default rounded-2xl p-8 backdrop-blur-xl shadow-custom-lg transition-all duration-300 min-h-[400px] hover:-translate-y-1 hover:shadow-custom-xl hover:shadow-glow-sm hover:border-hover">
          {/* 我的数字人 */}
          {activeTab === 'digital-humans' && (
            <div className="block">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-text-primary flex items-center gap-2 mb-1">
                    <span className="title-indicator"></span>
                    我的数字人
                  </h3>
                  <p className="text-sm text-text-muted">共 {filteredAgents.length} 个数字人</p>
                </div>
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-accent-gradient text-bg-primary border-none rounded-lg font-medium text-sm cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-custom-lg hover:shadow-glow-md"
                  onClick={handleCreateAgent}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  创建新数字人
                </button>
              </div>

              <div className="relative mb-6">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  className="w-full px-4 py-3 pl-12 rounded-xl bg-bg-secondary border border-default text-text-primary text-base outline-none transition-all duration-300 placeholder:text-text-muted focus:border-accent-primary focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
                  placeholder="搜索我的数字人..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {isLoadingAgents ? (
                <div className="text-center py-16">
                  <p className="text-text-muted">加载中...</p>
                </div>
              ) : filteredAgents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAgents.map((agent) => (
                    <div key={agent.id} className="bg-gray-700/50 border border-default rounded-xl p-4 transition-all duration-300 hover:border-hover hover:bg-gray-700/70">
                      <div>
                        <h4 className="text-lg font-medium text-white mb-1">{agent.name}</h4>
                        <p className="text-sm text-text-secondary mb-2 line-clamp-2">
                          {agent.description || '暂无描述'}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-text-muted">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            {formatDateShort(agent.created_at)}
                          </span>
                          <span className="px-2 py-0.5 bg-bg-secondary rounded text-xs">
                            {agent.is_active ? '通用' : '未激活'}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-3 mt-3 border-t border-default">
                        <button
                          className="flex items-center gap-1 text-accent-primary text-sm bg-none border-none cursor-pointer transition-colors duration-300 hover:text-blue-300"
                          onClick={() => handleAgentChat(agent)}
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                          对话
                        </button>
                        <div className="flex gap-2">
                          <button
                            className="p-2 text-text-muted bg-none border-none cursor-pointer transition-colors duration-300 hover:text-amber-500"
                            onClick={(e) => handleEditAgent(agent, e)}
                            title="编辑"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button
                            className="p-2 text-text-muted bg-none border-none cursor-pointer transition-colors duration-300 hover:text-red-500"
                            onClick={(e) => handleDeleteAgent(agent, e)}
                            title="删除"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4 opacity-30">🤖</div>
                  <p className="text-text-muted mb-6">还没有数字人</p>
                  <button
                    className="inline-flex items-center gap-2 px-6 py-3 bg-accent-gradient text-bg-primary border-none rounded-lg font-medium cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-custom-lg hover:shadow-glow-md"
                    onClick={handleCreateAgent}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    创建数字人
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 训练记录 */}
          {activeTab === 'training' && (
            <div className="block">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                  <span className="title-indicator"></span>
                  我的训练
                </h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-accent-gradient text-bg-primary border-none rounded-lg font-medium text-sm cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-custom-lg hover:shadow-glow-md">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  新建训练
                </button>
              </div>
              <div className="text-center py-16">
                <div className="text-6xl mb-4 opacity-30">🎯</div>
                <p className="text-text-muted mb-6">还没有训练记录</p>
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-accent-gradient text-bg-primary border-none rounded-lg font-medium cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-custom-lg hover:shadow-glow-md">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  开始训练
                </button>
              </div>
            </div>
          )}

          {/* 会话记录 */}
          {activeTab === 'conversations' && (
            <div className="block">
              <h3 className="text-xl font-semibold text-text-primary flex items-center gap-2 mb-6">
                <span className="title-indicator"></span>
                会话记录
              </h3>
              <div className="text-center py-16">
                <div className="text-6xl mb-4 opacity-30">💬</div>
                <p className="text-text-muted mb-2">还没有会话记录</p>
                <p className="text-sm text-text-muted">开始与数字人对话后，会话记录将显示在这里</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 底部导航（移动端） */}
      <nav className="block lg:hidden fixed bottom-0 left-0 right-0 w-full z-[100] backdrop-blur-xl bg-bg-secondary/95 border-t border-default shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="flex justify-around items-center px-4 py-2">
          <Link href="/" className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-300 no-underline text-text-secondary">
            <svg className="w-6 h-6" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span className="text-xs">首页</span>
          </Link>
          <Link href="/library" className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-300 no-underline text-text-secondary">
            <svg className="w-6 h-6" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 8v13H3V8"></path>
              <path d="M1 3h22v5H1z"></path>
              <path d="M10 12h4"></path>
            </svg>
            <span className="text-xs">资料库</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-300 no-underline text-accent-primary">
            <svg className="w-6 h-6" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span className="text-xs">我的</span>
          </Link>
          <a href="#" className="w-12 h-12 rounded-full bg-accent-gradient flex items-center justify-center text-bg-primary no-underline shadow-custom-lg transition-transform duration-300 hover:scale-110" onClick={handleCreateAgent}>
            <svg className="w-7 h-7" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </a>
        </div>
      </nav>

      {/* 创建数字人弹窗 */}
      {showCreateModal && (
        <AgentFormModal
          mode="create"
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            loadAgents()
          }}
        />
      )}

      {/* 编辑数字人弹窗 */}
      {showEditModal && editingAgent && (
        <AgentFormModal
          mode="edit"
          agent={editingAgent}
          onClose={() => {
            setShowEditModal(false)
            setEditingAgent(null)
          }}
          onSuccess={() => {
            setShowEditModal(false)
            setEditingAgent(null)
            loadAgents()
          }}
        />
      )}

    </div>
  )
}

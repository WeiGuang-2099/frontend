'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { agentService } from './services/agentService'
import { authService } from './services/authService'
import type { AgentResponse } from './types/agent'
import { AgentFormModal } from './components/AgentFormModal'
import { ConfirmDialog } from './components/ConfirmDialog'

export default function HomeClient() {
  const router = useRouter()
  const [userName, setUserName] = useState<string>('')
  const [isChecking, setIsChecking] = useState(true)
  const [agents, setAgents] = useState<AgentResponse[]>([])
  const [isLoadingAgents, setIsLoadingAgents] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAgent, setEditingAgent] = useState<AgentResponse | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; agent: AgentResponse | null }>({ show: false, agent: null })

  const loadAgents = async () => {
    setIsLoadingAgents(true)
    try {
      const data = await agentService.getAgents()
      setAgents(Array.isArray(data) ? data : [])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      alert(`加载智能体失败: ${errorMessage}\n\n请检查：\n1. 后端服务是否运行\n2. 网络连接是否正常`)
    } finally {
      setIsLoadingAgents(false)
    }
  }

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      try {
        const localToken = localStorage.getItem('access_token')
        const sessionToken = sessionStorage.getItem('access_token')
        const hasToken = Boolean(localToken || sessionToken)

        if (!hasToken) {
          setIsChecking(false)
          router.replace('/login')
          return
        }

        // 获取用户信息
        try {
          const user = await authService.getMe()
          setUserName(user.username || user.email)
        } catch (error) {
          // Token 无效或过期，清除并重定向到登录页
          console.error('获取用户信息失败，请重新登录:', error)
          localStorage.removeItem('access_token')
          sessionStorage.removeItem('access_token')
          setIsChecking(false)
          router.replace('/login')
          return
        }

        setIsChecking(false)
        await loadAgents()
      } catch (err) {
        setIsChecking(false)
        router.replace('/login')
      }
    }

    checkAuthAndLoad()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const onLogout = () => {
    setShowLogoutConfirm(true)
  }

  const handleLogoutConfirm = () => {
    // clear cookie (best effort)
    document.cookie = 'access_token=; Path=/; Max-Age=0; SameSite=Lax'

    try {
      localStorage.removeItem('access_token')
      localStorage.removeItem('token_type')
      sessionStorage.removeItem('access_token')
      sessionStorage.removeItem('token_type')
    } catch {
      // ignore
    }

    router.replace('/login')
    router.refresh()
  }

  const handleAgentClick = (agent: AgentResponse) => {
    alert(`数字人"${agent.name}"对话功能开发中，敬请期待！`)
  }

  const handleCreateAgent = (e?: { preventDefault: () => void }) => {
    if (e) e.preventDefault()
    // 跳转到创建页面
    router.push('/create-agent')
  }

  const handleEditAgent = (agent: AgentResponse, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingAgent(agent)
    setShowEditModal(true)
  }

  const handleDeleteAgent = (agent: AgentResponse, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteConfirm({ show: true, agent })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.agent) return

    try {
      await agentService.deleteAgent(deleteConfirm.agent.id)
      setDeleteConfirm({ show: false, agent: null })
      loadAgents()
    } catch (error) {
      alert('删除失败，请稍后重试')
    }
  }

  const handleSearch = (e: { currentTarget: { value: string } }) => {
    setSearchTerm(e.currentTarget.value)
  }

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        <div className="w-full px-6 py-3 flex justify-between items-center relative">
          <Link href="/" className="text-xl font-semibold no-underline gradient-text">
            Cosmray
          </Link>

          <ul className="hidden lg:flex gap-8 list-none absolute left-1/2 -translate-x-1/2">
            <li className="relative">
              <Link href="/" className="block py-2 text-accent-primary no-underline transition-colors duration-300 hover:text-accent-primary">
                首页
              </Link>
              <span className="nav-underline"></span>
            </li>
            <li>
              <Link href="/library" className="block py-2 text-text-secondary no-underline transition-colors duration-300 hover:text-accent-primary">
                资料库
              </Link>
            </li>
            <li>
              <Link href="/profile" className="block py-2 text-text-secondary no-underline transition-colors duration-300 hover:text-accent-primary">
                个人中心
              </Link>
            </li>
          </ul>

          <div className="hidden lg:flex items-center gap-4">
            <span className="text-text-secondary">欢迎, {userName || '用户'}</span>
            <button
              className="px-4 py-2 rounded-lg text-text-primary bg-transparent border border-default cursor-pointer transition-all duration-300 text-sm hover:border-accent-primary hover:shadow-glow-sm"
              onClick={onLogout}
            >
              退出
            </button>
          </div>

          <button className="flex lg:hidden items-center justify-center bg-transparent border-none text-text-primary p-2 cursor-pointer">
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="py-4 pb-8 lg:py-2 lg:pb-8">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-12">
          {/* Hero区域 */}
          <section className="text-center py-4 pb-8 mb-4 lg:py-8 lg:mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 gradient-text">
              探索AI数字人的无限可能
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-text-secondary mb-6">
              创建属于您的专属数字人，开启智能对话新体验
            </p>
            <button
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-base transition-all duration-300 border-none cursor-pointer shadow-custom-md btn-gradient hover:-translate-y-0.5"
              onClick={handleCreateAgent}
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>创建数字人</span>
            </button>
          </section>

          {/* 搜索区域 */}
          <section className="max-w-3xl mx-auto mb-8">
            <div className="relative">
              <svg
                className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                className="w-full py-4 px-4 pl-14 rounded-2xl text-text-primary bg-bg-tertiary border border-default transition-all duration-300 text-base placeholder:text-text-muted outline-none focus:border-accent-primary focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)] focus:shadow-glow-sm"
                placeholder="搜索数字人、功能或话题..."
                onInput={handleSearch}
                value={searchTerm}
              />
            </div>
          </section>

          {/* 智能体列表 */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-text-primary">热门数字人</h2>

            {isLoadingAgents ? (
              <div className="text-center py-12 text-text-secondary">加载中...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {filteredAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="w-full rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer bg-bg-tertiary border border-default hover:-translate-y-1 hover:shadow-custom-xl hover:shadow-glow-sm hover:border-hover"
                    onClick={() => handleAgentClick(agent)}
                  >
                    <div className="p-5 relative">
                      <div className="absolute top-3 right-3 flex gap-2">
                        {agent.permission === 'view_only' ? (
                          <span className="px-2 py-1 rounded-full text-xs flex items-center gap-1 bg-white/10 border border-default text-text-secondary">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            仅查看
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs flex items-center gap-1 bg-accent-primary/20 border border-accent-primary text-accent-primary">
                            我的
                          </span>
                        )}
                        {!agent.is_active && (
                          <span className="px-2 py-1 rounded-full text-xs flex items-center gap-1 bg-warning/20 border border-warning/60 text-warning">
                            未激活
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-text-primary pr-20">
                        {agent.name}
                      </h3>
                      <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                        {agent.description || '暂无描述'}
                      </p>
                      <div className="flex gap-3 pt-3 border-t border-default">
                        <span className="px-2 py-1 bg-bg-primary rounded text-xs text-text-secondary">
                          {agent.agent_type || 'agent'}
                        </span>
                        <div className="flex-1 text-xs text-text-secondary flex items-center">
                          技能: {agent.skills || 'AI对话、智能助手'}
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="p-1.5 rounded bg-bg-secondary border border-default text-text-secondary cursor-pointer transition-all duration-200 flex items-center justify-center hover:bg-bg-primary hover:border-accent-primary hover:text-accent-primary"
                            onClick={(e) => handleEditAgent(agent, e)}
                            title="编辑"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button
                            className="p-1.5 rounded bg-bg-secondary border border-default text-text-secondary cursor-pointer transition-all duration-200 flex items-center justify-center hover:bg-bg-primary hover:border-red-500 hover:text-red-500"
                            onClick={(e) => handleDeleteAgent(agent, e)}
                            title="删除"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 创建新卡片 */}
                <div
                  className="w-full rounded-2xl min-h-[120px] border-2 border-dashed border-default bg-bg-tertiary/50 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer hover:border-accent-primary hover:bg-bg-tertiary/70 hover:-translate-y-1 hover:shadow-custom-xl hover:shadow-glow-sm"
                  onClick={handleCreateAgent}
                >
                  <div className="text-[30px] text-accent-primary mb-2">＋</div>
                  <div className="text-sm text-text-secondary">创建新数字人</div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* 底部导航（移动端） */}
      <nav className="block lg:hidden fixed bottom-0 left-0 right-0 w-full z-[100] backdrop-blur-xl bg-bg-secondary/95 border-t border-default shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="w-full px-4 py-2">
          <div className="flex justify-around items-center">
            <Link
              href="/"
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-300 no-underline text-accent-primary"
            >
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span className="text-xs">首页</span>
            </Link>

            <Link
              href="/library"
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-300 no-underline text-text-secondary"
            >
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              <span className="text-xs">资料库</span>
            </Link>

            <Link
              href="/profile"
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-300 no-underline text-text-secondary"
            >
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span className="text-xs">我的</span>
            </Link>

            <a
              href="#"
              className="w-12 h-12 rounded-full bg-accent-gradient flex items-center justify-center text-bg-primary text-2xl shadow-custom-lg transition-transform duration-300 no-underline hover:scale-110"
              onClick={handleCreateAgent}
            >
              <svg
                className="w-7 h-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </a>
          </div>
        </div>
      </nav>

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

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="退出登录"
        message="您确定要退出登录吗？退出后需要重新登录才能使用系统功能。"
        confirmText="确认退出"
        cancelText="取消"
        type="warning"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.show}
        title="删除智能体"
        message={`确定要删除智能体"${deleteConfirm.agent?.name}"吗？此操作不可恢复。`}
        confirmText="删除"
        cancelText="取消"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ show: false, agent: null })}
      />
    </div>
  )
}

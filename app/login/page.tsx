'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type LoginResponse = {
  access_token: string
  token_type: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const resp = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: email.trim(),
          password,
        }),
      })

      if (!resp.ok) {
        let detail = '登录失败，请检查账号和密码'
        try {
          const data = await resp.json()
          if (typeof data?.detail === 'string') detail = data.detail
        } catch (parseError) {
          // 如果解析失败，使用原始响应信息
          detail = `登录失败: ${resp.status} ${resp.statusText}`
        }
        setError(detail)
        return
      }

      const data = (await resp.json()) as LoginResponse

      // 1) write storage token
      const storage = rememberMe ? localStorage : sessionStorage
      storage.setItem('access_token', data.access_token)
      storage.setItem('token_type', data.token_type)

      // 2) write cookie for middleware auth
      const maxAge = rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60 // 7 days or 1 day

      const isLocalhost =
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

      const cookieParts = [
        `access_token=${encodeURIComponent(data.access_token)}`,
        'Path=/',
        `Max-Age=${maxAge}`,
        'SameSite=Lax',
      ]

      // https 环境再加 Secure；本地 http 不加，否则 cookie 不生效
      if (!isLocalhost && window.location.protocol === 'https:') {
        cookieParts.push('Secure')
      }

      document.cookie = cookieParts.join('; ')

      // 3) navigate
      router.replace('/')
      router.refresh()
    } catch {
      setError('网络错误，请确认后端已启动，并允许跨域访问')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-bg-primary">
      <div className="bg-effect-1 animate-float" />
      <div className="bg-effect-2 animate-float-reverse" />

      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0, 217, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 217, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      <div className="w-full max-w-[480px] p-8 z-10">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-2 gradient-text leading-tight pb-1">Cosmray</h1>
          <p className="text-text-secondary">欢迎回来</p>
        </div>

        <div
          className="relative rounded-[20px] p-10 backdrop-blur-[20px] bg-bg-tertiary"
          style={{
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 25px rgba(0, 217, 255, 0.2)',
          }}
        >
          <div
            className="absolute -inset-[2px] rounded-[20px] pointer-events-none opacity-50"
            style={{
              background: 'linear-gradient(135deg, #00D9FF 0%, #7B68EE 100%)',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              padding: '2px',
            }}
          />

          <div className="relative">
            <h2 className="text-[1.75rem] font-semibold text-center mb-8 text-text-primary">
              登录账户
            </h2>

            {error && (
              <div
                className="mb-6 p-4 rounded-[10px] text-sm"
                style={{
                  backgroundColor: 'rgba(238, 90, 111, 0.1)',
                  border: '1px solid rgba(238, 90, 111, 0.2)',
                  color: '#ff6b6b',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-text-secondary">邮箱</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱地址"
                  type="text"
                  required
                  className="w-full px-4 py-[0.875rem] rounded-[10px] text-base outline-none transition-all bg-bg-secondary text-text-primary"
                  style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#00D9FF'
                    e.currentTarget.classList.add('input-focus')
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                    e.currentTarget.classList.remove('input-focus')
                  }}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-text-secondary">密码</label>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full px-4 py-[0.875rem] pr-12 rounded-[10px] text-base outline-none transition-all bg-bg-secondary text-text-primary"
                    style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#00D9FF'
                      e.currentTarget.classList.add('input-focus')
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      e.currentTarget.classList.remove('input-focus')
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-text-muted"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {showPassword ? (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </>
                      ) : (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-[18px] h-[18px] rounded accent-accent-primary"
                  />
                  <span className="text-sm text-text-secondary">记住我</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-accent-primary"
                  onClick={() => alert('忘记密码功能暂未开放，请联系管理员！')}
                >
                  忘记密码？
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-[10px] font-semibold text-lg transition-all btn-gradient mb-8 hover:-translate-y-0.5 hover:shadow-glow-md disabled:opacity-70"
              >
                {isLoading ? '登录中...' : '登录'}
              </button>
            </form>

            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-border-default" />
                <span className="text-sm text-text-muted">其他登录方式</span>
                <div className="flex-1 h-px bg-border-default" />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  className="py-[0.875rem] rounded-[10px] flex items-center justify-center text-xl transition-all text-text-primary hover:border-accent-primary hover:-translate-y-0.5"
                  style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
                  onClick={() => alert('Google登录功能暂未开放，敬请期待！')}
                  title="Google登录"
                >
                  🔍
                </button>
                <button
                  type="button"
                  className="py-[0.875rem] rounded-[10px] flex items-center justify-center text-xl transition-all text-text-primary hover:border-accent-primary hover:-translate-y-0.5"
                  style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
                  onClick={() => alert('邮箱登录功能暂未开放，敬请期待！')}
                  title="邮箱登录"
                >
                  📧
                </button>
              </div>
            </div>

            <p className="text-center text-sm text-text-secondary">
              还没有账户？
              <Link href="/register" className="text-accent-primary font-medium ml-1">
                立即注册
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type ErrorBody = {
  detail?: string
  message?: string
}

type UserResponse = {
  id?: string | number
  email?: string
  username?: string
  full_name?: string
  [key: string]: unknown
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000'

export default function RegisterPage() {
  const router = useRouter()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreement, setAgreement] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!username || username.length < 3 || username.length > 50) {
      setError('用户名长度需要在 3-50 个字符之间')
      return
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('请输入有效的邮箱地址')
      return
    }

    if (!password || password.length < 6) {
      setError('密码长度至少需要6位')
      return
    }

    if (password.length > 100) {
      setError('密码长度不能超过100位')
      return
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    if (!agreement) {
      setError('请同意用户协议和隐私政策')
      return
    }

    setIsLoading(true)

    try {
      const resp = await fetch(`${API_BASE}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          username: username.trim(),
          password,
        }),
      })

      if (!resp.ok) {
        let detail = '注册失败，请检查输入信息'
        try {
          const data = (await resp.json()) as ErrorBody
          if (typeof data?.detail === 'string') detail = data.detail
          else if (typeof data?.message === 'string') detail = data.message
        } catch (parseError) {
          // 如果解析失败，使用原始响应信息
          detail = `注册失败: ${resp.status} ${resp.statusText}`
        }
        setError(detail)
        return
      }

      const userData = (await resp.json()) as UserResponse
      void userData

      router.replace('/login')
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
          <h1 className="text-5xl font-bold mb-2 gradient-text leading-tight pb-1">
            Cosmray
          </h1>
          <p className="text-text-secondary">创建您的账户</p>
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
              用户注册
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
                <label className="block text-sm font-medium mb-2 text-text-secondary">
                  用户名 *
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名（3-50个字符）"
                  type="text"
                  required
                  minLength={3}
                  maxLength={50}
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
                <label className="block text-sm font-medium mb-2 text-text-secondary">
                  邮箱 * <span className="text-xs text-text-muted">（用于登录）</span>
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱地址"
                  type="email"
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
                <label className="block text-sm font-medium mb-2 text-text-secondary">
                  密码 *
                </label>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请设置密码（至少6位）"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
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

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-text-secondary">
                  确认密码 *
                </label>
                <div className="relative">
                  <input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="请再次输入密码"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
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
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-text-muted"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {showConfirmPassword ? (
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

              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreement}
                    onChange={(e) => setAgreement(e.target.checked)}
                    required
                    className="w-[18px] h-[18px] rounded accent-accent-primary"
                  />
                  <span className="text-sm text-text-secondary">
                    我已阅读并同意用户协议和隐私政策
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-[10px] font-semibold text-lg transition-all btn-gradient mb-6 hover:-translate-y-0.5 hover:shadow-glow-md disabled:opacity-70"
              >
                {isLoading ? '注册中...' : '注册账户'}
              </button>
            </form>

            <p className="text-center text-sm text-text-secondary">
              已有账户？{' '}
              <Link href="/login" className="text-accent-primary font-medium ml-1">
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

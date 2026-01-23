'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !password) {
      setErrorMessage('请填写邮箱和密码');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrorMessage('请输入有效的邮箱地址');
      return;
    }

    setIsLoading(true);

    // 模拟登录请求
    setTimeout(() => {
      setSuccessMessage('登录成功！正在跳转...');
      setTimeout(() => {
        alert('演示模式：登录成功后将跳转到首页');
        setIsLoading(false);
      }, 1500);
    }, 1000);
  };

  const handleSocialLogin = (provider: string) => {
    alert(`${provider}功能暂未开放，敬请期待！`);
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    alert('忘记密码功能暂未开放，请联系管理员！');
  };

  return (
    <>
      <div className="page-container">
        <div className="grid-bg"></div>
        <div className="bg-effect-1"></div>
        <div className="bg-effect-2"></div>

        <div className="content-wrapper">
          <div className="header">
            <h1 className="logo">Cosmray</h1>
            <p className="subtitle">很高兴再次见到你！👋</p>
            <p className="description">请登录以继续使用</p>
          </div>

          <div className="card">
            <div className="card-border"></div>
            <h2 className="card-title">登录账户</h2>
            <p className="card-subtitle">输入你的账户信息以登录</p>

            {errorMessage && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="alert alert-success">
                <span className="alert-icon">✅</span>
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">邮箱地址</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="请输入邮箱地址"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">密码</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    placeholder="请输入密码"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {!showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="form-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span>记住我</span>
                </label>
                <a href="#" className="forgot-link" onClick={handleForgotPassword}>
                  忘记密码？
                </a>
              </div>

              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    <span>正在登录...</span>
                  </>
                ) : (
                  '登录'
                )}
              </button>
            </form>

            <div className="divider">
              <div className="divider-line"></div>
              <span className="divider-text">其他登录方式</span>
              <div className="divider-line"></div>
            </div>

            <div className="social-buttons">
              <button className="btn-social" onClick={() => handleSocialLogin('Google登录')} title="Google登录">
                🔍
              </button>
              <button className="btn-social" onClick={() => handleSocialLogin('邮箱登录')} title="邮箱登录">
                📧
              </button>
            </div>

            <p className="footer-text">
              还没有账户？
              <Link href="/register" className="footer-link">
                立即注册
              </Link>
              <span className="footer-hint"> - 只需30秒</span>
            </p>

            <div className="help-section">
              <a href="#" onClick={handleForgotPassword} className="help-link">需要帮助？</a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        :root {
          --bg-primary: #0A1628;
          --bg-secondary: #1A1A2E;
          --bg-tertiary: #16213E;
          --accent-primary: #00D9FF;
          --accent-secondary: #7B68EE;
          --text-primary: #F5F5F5;
          --text-secondary: #B8BCC8;
          --text-muted: #6C7293;
          --success: #00F5A0;
          --error: #EE5A6F;
          --border-default: rgba(255, 255, 255, 0.1);
          --shadow-xl: 0 20px 25px rgba(0, 217, 255, 0.2);
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(30px, -30px) scale(1.1);
          }
        }

        @keyframes float-reverse {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-30px, 30px) scale(1.1);
          }
        }

        .page-container {
          min-height: 100vh;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background-color: var(--bg-primary);
        }

        .grid-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(0, 217, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 217, 255, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        .bg-effect-1 {
          position: fixed;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          top: -300px;
          right: -300px;
          background: radial-gradient(circle, rgba(0, 217, 255, 0.1) 0%, transparent 70%);
          animation: float 20s ease-in-out infinite;
        }

        .bg-effect-2 {
          position: fixed;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          bottom: -200px;
          left: -200px;
          background: radial-gradient(circle, rgba(123, 104, 238, 0.1) 0%, transparent 70%);
          animation: float-reverse 15s ease-in-out infinite;
        }

        .content-wrapper {
          width: 100%;
          max-width: 480px;
          padding: 0 32px;
          z-index: 10;
        }

        .header {
          text-align: center;
          margin-bottom: 48px;
        }

        .logo {
          font-size: 48px;
          font-weight: 700;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #00D9FF 0%, #7B68EE 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subtitle {
          color: var(--text-secondary);
          font-size: 18px;
          margin-bottom: 4px;
        }

        .description {
          color: var(--text-muted);
          font-size: 14px;
        }

        .card {
          position: relative;
          border-radius: 20px;
          padding: 40px;
          backdrop-filter: blur(20px);
          background: var(--bg-tertiary);
          border: 1px solid var(--border-default);
          box-shadow: var(--shadow-xl);
        }

        .card-border {
          position: absolute;
          inset: -2px;
          border-radius: 20px;
          opacity: 0.5;
          pointer-events: none;
          background: linear-gradient(135deg, #00D9FF 0%, #7B68EE 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          padding: 2px;
        }

        .card-title {
          font-size: 28px;
          font-weight: 600;
          text-align: center;
          margin-bottom: 8px;
          color: var(--text-primary);
        }

        .card-subtitle {
          text-align: center;
          color: var(--text-muted);
          font-size: 14px;
          margin-bottom: 32px;
        }

        .alert {
          margin-bottom: 24px;
          padding: 16px;
          border-radius: 10px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .alert-icon {
          font-size: 16px;
          flex-shrink: 0;
        }

        .alert-error {
          background: rgba(238, 90, 111, 0.1);
          border: 1px solid rgba(238, 90, 111, 0.2);
          color: #ff6b6b;
        }

        .alert-success {
          background: rgba(0, 245, 160, 0.1);
          border: 1px solid rgba(0, 245, 160, 0.2);
          color: var(--success);
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }

        .form-input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 10px;
          font-size: 16px;
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-default);
          transition: all 0.3s;
          outline: none;
        }

        .form-input::placeholder {
          color: var(--text-muted);
        }

        .form-input:focus {
          border-color: var(--accent-primary);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 3px rgba(0, 217, 255, 0.1), 0 0 10px rgba(0, 217, 255, 0.3);
        }

        .form-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .password-wrapper {
          position: relative;
        }

        .password-wrapper .form-input {
          padding-right: 48px;
        }

        .password-toggle {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: color 0.3s;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .password-toggle:hover {
          color: var(--text-secondary);
        }

        .password-toggle svg {
          width: 20px;
          height: 20px;
        }

        .form-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .checkbox-label input {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          accent-color: var(--accent-primary);
          cursor: pointer;
        }

        .checkbox-label span {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .forgot-link {
          font-size: 14px;
          color: var(--accent-primary);
          text-decoration: none;
          transition: opacity 0.3s;
        }

        .forgot-link:hover {
          opacity: 0.8;
          text-decoration: underline;
        }

        .btn-primary {
          width: 100%;
          padding: 16px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 18px;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          margin-bottom: 32px;
          background: linear-gradient(135deg, #00D9FF 0%, #7B68EE 100%);
          color: #FFFFFF;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 217, 255, 0.1);
        }

        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }

        .btn-primary:hover::before {
          left: 100%;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: var(--border-default);
        }

        .divider-text {
          font-size: 14px;
          color: var(--text-muted);
        }

        .social-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }

        .btn-social {
          padding: 14px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          background: transparent;
          border: 1px solid var(--border-default);
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-social:hover {
          border-color: var(--accent-primary);
          background: rgba(0, 217, 255, 0.05);
          transform: translateY(-2px);
        }

        .footer-text {
          text-align: center;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .footer-link {
          color: var(--accent-primary);
          font-weight: 500;
          text-decoration: none;
          margin-left: 4px;
        }

        .footer-link:hover {
          text-decoration: underline;
        }

        .footer-hint {
          color: var(--text-muted);
          font-size: 12px;
        }

        .help-section {
          margin-top: 16px;
          text-align: center;
        }

        .help-link {
          color: var(--accent-primary);
          font-size: 13px;
          text-decoration: none;
          transition: opacity 0.3s;
        }

        .help-link:hover {
          opacity: 0.8;
          text-decoration: underline;
        }
      `}</style>
    </>
  );
}

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
            <p className="subtitle">欢迎回来</p>
          </div>

          <div className="card">
            <div className="card-border"></div>
            <h2 className="card-title">登录账户</h2>

            {errorMessage && (
              <div className="alert alert-error">{errorMessage}</div>
            )}
            {successMessage && (
              <div className="alert alert-success">{successMessage}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">邮箱</label>
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
                {isLoading ? '登录中...' : '登录'}
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
              还没有账户？<Link href="/register" className="footer-link">立即注册</Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`

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
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          color: #B8BCC8;
        }

        .card {
          position: relative;
          border-radius: 20px;
          padding: 40px;
          backdrop-filter: blur(20px);
          background: #16213E;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 25px rgba(0, 217, 255, 0.2);
        }

        .card-border {
          position: absolute;
          inset: -2px;
          border-radius: 20px;
          opacity: 0.6;
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
          margin-bottom: 32px;
          color: #F5F5F5;
        }

        .alert {
          margin-bottom: 24px;
          padding: 16px;
          border-radius: 10px;
          font-size: 14px;
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
          color: #B8BCC8;
          margin-bottom: 8px;
        }

        .form-input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 10px;
          font-size: 16px;
          color: #F5F5F5;
          background: #1A1A2E;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s;
          outline: none;
        }

        .form-input::placeholder {
          color: #6C7293;
        }

        .form-input:focus {
          border-color: #00D9FF;
          background: rgba(26, 26, 46, 0.8);
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
          color: #6C7293;
          cursor: pointer;
          transition: color 0.3s;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .password-toggle:hover {
          color: #B8BCC8;
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
          accent-color: #00D9FF;
          cursor: pointer;
        }

        .checkbox-label span {
          font-size: 14px;
          color: #B8BCC8;
        }

        .forgot-link {
          font-size: 14px;
          color: #00D9FF;
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

        .divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
        }

        .divider-text {
          font-size: 14px;
          color: #6C7293;
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
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #F5F5F5;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-social:hover {
          border-color: #00D9FF;
          background: rgba(0, 217, 255, 0.05);
          transform: translateY(-2px);
        }

        .footer-text {
          text-align: center;
          font-size: 14px;
          color: #B8BCC8;
        }

        .footer-link {
          color: #00D9FF;
          font-weight: 500;
          text-decoration: none;
          margin-left: 4px;
        }

        .footer-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreement: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // 清除该字段的错误
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    let isValid = true;

    if (!formData.username) {
      errors.username = '请输入用户名';
      isValid = false;
    } else if (formData.username.length < 3 || formData.username.length > 50) {
      errors.username = '用户名长度需要在 3-50 个字符之间';
      isValid = false;
    }

    if (!formData.email) {
      errors.email = '请输入邮箱地址';
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = '请输入有效的邮箱地址';
      isValid = false;
    }

    if (!formData.password) {
      errors.password = '请设置密码';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = '密码长度至少需要6位';
      isValid = false;
    } else if (formData.password.length > 100) {
      errors.password = '密码长度不能超过100位';
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致';
      isValid = false;
    }

    if (!formData.agreement) {
      errors.agreement = '请同意用户协议';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // 模拟注册请求
    setTimeout(() => {
      setSuccessMessage('注册成功！正在跳转到登录页面...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }, 1000);
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
            <p className="subtitle">欢迎加入我们！🎉</p>
            <p className="description">创建你的账户，开启精彩旅程</p>
          </div>

          <div className="card">
            <div className="card-border"></div>
            <h2 className="card-title">用户注册</h2>
            <p className="card-subtitle">填写以下信息创建账户，仅需30秒</p>

            {errorMessage && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="alert alert-success">
                <span className="alert-icon">🎉</span>
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">
                  用户名 * 
                  <span className="label-hint">这将是你的显示名称</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="请输入用户名（3-50个字符）"
                  required
                  disabled={isLoading}
                />
                {fieldErrors.username && (
                  <div className="field-error">{fieldErrors.username}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  邮箱地址 * 
                  <span className="label-hint">用于登录和找回密码</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="请输入邮箱地址"
                  required
                  disabled={isLoading}
                />
                {fieldErrors.email && (
                  <div className="field-error">{fieldErrors.email}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  密码 * 
                  <span className="label-hint">至少6个字符</span>
                </label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="请设置密码（至少6位）"
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
                {fieldErrors.password && (
                  <div className="field-error">{fieldErrors.password}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">确认密码 *</label>
                <div className="password-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="请再次输入密码"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {!showConfirmPassword ? (
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
                {fieldErrors.confirmPassword && (
                  <div className="field-error">{fieldErrors.confirmPassword}</div>
                )}
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="agreement"
                    checked={formData.agreement}
                    onChange={handleChange}
                    required
                  />
                  <span>我已阅读并同意用户协议和隐私政策</span>
                </label>
                {fieldErrors.agreement && (
                  <div className="field-error">{fieldErrors.agreement}</div>
                )}
              </div>

              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    <span>正在创建账户...</span>
                  </>
                ) : (
                  '创建账户'
                )}
              </button>
            </form>

            <div className="register-benefits">
              <p className="benefits-title">注册即可享受：</p>
              <ul className="benefits-list">
                <li>✨ 个性化用户体验</li>
                <li>🔒 安全的数据保护</li>
                <li>🚀 更多功能和服务</li>
              </ul>
            </div>

            <p className="footer-text">
              已有账户？
              <Link href="/login" className="footer-link">
                立即登录
              </Link>
            </p>

            <p className="privacy-note">
              注册即表示你同意我们的
              <a href="#" className="privacy-link">服务条款</a>
              和
              <a href="#" className="privacy-link">隐私政策</a>
            </p>
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
          padding: 32px 0;
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
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }

        .label-hint {
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 400;
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

        .field-error {
          color: var(--error);
          font-size: 12px;
          margin-top: 4px;
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

        .btn-primary {
          width: 100%;
          padding: 16px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 18px;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          margin-bottom: 24px;
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

        .register-benefits {
          margin-top: 24px;
          margin-bottom: 24px;
          padding: 20px;
          background: rgba(0, 217, 255, 0.05);
          border: 1px solid var(--border-default);
          border-radius: 10px;
        }

        .benefits-title {
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 12px;
        }

        .benefits-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .benefits-list li {
          color: var(--text-secondary);
          font-size: 13px;
          padding: 6px 0;
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

        .privacy-note {
          text-align: center;
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 16px;
        }

        .privacy-link {
          color: var(--accent-primary);
          text-decoration: none;
          margin: 0 2px;
        }

        .privacy-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </>
  );
}

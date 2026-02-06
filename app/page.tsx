'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  return (
    <>
      <div className="page-container">
        <div className="grid-bg"></div>
        <div className="bg-effect-1"></div>
        <div className="bg-effect-2"></div>

        <div className="content-wrapper">
          <div className="header">
            <h1 className="logo">Cosmray</h1>
            <p className="subtitle">
              {isAuthenticated ? `你好，${user?.username}！👋` : '你好！欢迎回来 👋'}
            </p>
            <p className="description">开始你的数字之旅</p>
          </div>

          <div className="card">
            <div className="card-border"></div>
            <h2 className="card-title">开始使用</h2>
            <p className="card-description">选择下方操作继续</p>

            <div className="button-group">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="btn-primary">
                    <span className="btn-icon">📊</span>
                    <span className="btn-content">
                      <span className="btn-text">进入仪表盘</span>
                      <span className="btn-hint">查看您的个人中心</span>
                    </span>
                  </Link>
                  <button 
                    onClick={() => {
                      if (confirm('确定要退出登录吗？')) {
                        router.push('/login');
                      }
                    }}
                    className="btn-secondary"
                  >
                    <span className="btn-icon">🚪</span>
                    <span className="btn-content">
                      <span className="btn-text">退出登录</span>
                      <span className="btn-hint">登出当前账户</span>
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-primary">
                    <span className="btn-icon">🔐</span>
                    <span className="btn-content">
                      <span className="btn-text">登录账户</span>
                      <span className="btn-hint">已有账户？点击这里登录</span>
                    </span>
                  </Link>
                  <Link href="/register" className="btn-secondary">
                    <span className="btn-icon">✨</span>
                    <span className="btn-content">
                      <span className="btn-text">注册新账户</span>
                      <span className="btn-hint">首次使用？创建一个新账户</span>
                    </span>
                  </Link>
                </>
              )}
            </div>

            <div className="help-section">
              <p className="help-text">遇到问题？</p>
              <a href="#" className="help-link">查看帮助文档</a>
              <span className="divider-dot">•</span>
              <a href="#" className="help-link">联系客服</a>
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

        .card-description {
          text-align: center;
          color: var(--text-muted);
          font-size: 14px;
          margin-bottom: 32px;
        }

        .button-group {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 32px;
        }

        .btn-primary {
          width: 100%;
          padding: 20px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 18px;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          background: linear-gradient(135deg, #00D9FF 0%, #7B68EE 100%);
          color: #FFFFFF;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 217, 255, 0.1);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .btn-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .btn-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          flex: 1;
        }

        .btn-text {
          font-size: 18px;
          font-weight: 600;
        }

        .btn-hint {
          font-size: 12px;
          opacity: 0.8;
          font-weight: 400;
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

        .btn-secondary {
          width: 100%;
          padding: 20px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.3s;
          background: transparent;
          color: var(--accent-primary);
          border: 1px solid var(--border-default);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .btn-secondary:hover {
          border-color: var(--accent-primary);
          background: rgba(0, 217, 255, 0.05);
          transform: translateY(-2px);
        }

        .help-section {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid var(--border-default);
          text-align: center;
        }

        .help-text {
          color: var(--text-secondary);
          font-size: 14px;
          margin-bottom: 12px;
        }

        .help-link {
          color: var(--accent-primary);
          font-size: 14px;
          text-decoration: none;
          transition: opacity 0.3s;
        }

        .help-link:hover {
          opacity: 0.8;
          text-decoration: underline;
        }

        .divider-dot {
          color: var(--text-muted);
          margin: 0 8px;
        }

        .info-box {
          background: rgba(0, 217, 255, 0.05);
          border: 1px solid var(--border-default);
          border-radius: 10px;
          padding: 20px;
          text-align: center;
        }

        .info-text {
          color: var(--text-secondary);
          font-size: 14px;
          margin-bottom: 8px;
        }

        .info-subtext {
          color: var(--text-muted);
          font-size: 12px;
        }
      `}</style>
    </>
  );
}

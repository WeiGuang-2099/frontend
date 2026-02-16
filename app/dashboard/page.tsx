'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    // 如果未登录，重定向到登录页
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // 加载中状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-[#c9d1d9] text-xl">加载中...</div>
      </div>
    );
  }

  // 未登录状态
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#c9d1d9]">
      {/* 顶部导航栏 */}
      <nav className="bg-[#161B22] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-[#00D9FF]">Cosmray Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm">
                欢迎, <span className="text-[#00D9FF] font-medium">{user?.username}</span>
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-[#EE5A6F] text-white rounded-lg hover:bg-[#EE5A6F]/90 transition-colors"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[#161B22] rounded-lg border border-white/10 p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-white">用户信息</h2>
          <div className="space-y-3">
            <div className="flex">
              <span className="w-24 text-[#8b949e]">用户ID:</span>
              <span className="text-white">{user?.id}</span>
            </div>
            <div className="flex">
              <span className="w-24 text-[#8b949e]">用户名:</span>
              <span className="text-white">{user?.username}</span>
            </div>
            <div className="flex">
              <span className="w-24 text-[#8b949e]">邮箱:</span>
              <span className="text-white">{user?.email}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 统计卡片 */}
          <div className="bg-[#161B22] rounded-lg border border-white/10 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[#8b949e] text-sm">项目总数</h3>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-3xl font-bold text-white">12</p>
            <p className="text-xs text-[#00D9FF] mt-1">+2 本月新增</p>
          </div>

          <div className="bg-[#161B22] rounded-lg border border-white/10 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[#8b949e] text-sm">任务完成</h3>
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-3xl font-bold text-white">48</p>
            <p className="text-xs text-[#00D9FF] mt-1">+15 本周完成</p>
          </div>

          <div className="bg-[#161B22] rounded-lg border border-white/10 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[#8b949e] text-sm">团队成员</h3>
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-3xl font-bold text-white">8</p>
            <p className="text-xs text-[#00D9FF] mt-1">活跃用户</p>
          </div>
        </div>

        {/* 欢迎消息 */}
        <div className="mt-6 bg-[#161B22] rounded-lg border border-[#00D9FF]/30 p-6">
          <div className="flex items-start gap-4">
            <span className="text-3xl">🎉</span>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                登录成功！欢迎来到仪表盘
              </h3>
              <p className="text-[#8b949e]">
                这是一个受保护的页面，只有登录用户才能访问。您的认证信息通过 JWT Token 进行管理。
              </p>
              <div className="mt-4 p-4 bg-[#0D1117] rounded border border-white/10">
                <p className="text-sm text-[#8b949e] mb-2">🔐 技术实现：</p>
                <ul className="text-sm text-[#c9d1d9] space-y-1 list-disc list-inside">
                  <li>使用 JWT Token 进行身份认证</li>
                  <li>Token 存储在 localStorage 中</li>
                  <li>请求自动携带 Authorization Header</li>
                  <li>Token 过期自动跳转到登录页</li>
                  <li>使用 React Context 管理全局认证状态</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

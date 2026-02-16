'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '../components/AuthLayout';
import FormInput from '../components/FormInput';
import PasswordInput from '../components/PasswordInput';
import Alert from '../components/Alert';
import Button from '../components/Button';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // 表单验证
    if (!username || !password) {
      setErrorMessage('请填写用户名和密码');
      return;
    }

    if (username.length < 3) {
      setErrorMessage('用户名至少需要3个字符');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('密码至少需要6个字符');
      return;
    }

    setIsLoading(true);

    try {
      // 调用登录 API
      await login(username, password);
      
      setSuccessMessage('登录成功！正在跳转...');
      
      // 登录成功后跳转到首页
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (error: any) {
      setErrorMessage(error.message || '登录失败，请检查用户名和密码');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    alert(`${provider}功能暂未开放，敬请期待！`);
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    alert('忘记密码功能暂未开放，请联系管理员！');
  };

  return (
    <AuthLayout title="登录账户" subtitle="欢迎回来">
      {errorMessage && <Alert type="error">{errorMessage}</Alert>}
      {successMessage && <Alert type="success">{successMessage}</Alert>}

      <form onSubmit={handleSubmit}>
        <FormInput
          type="text"
          label="用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="请输入用户名"
          required
          disabled={isLoading}
        />

        <PasswordInput
          label="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="请输入密码"
          required
          disabled={isLoading}
        />

        <div className="flex items-center justify-between mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-[18px] h-[18px] rounded accent-[#00D9FF] cursor-pointer"
            />
            <span className="text-sm text-[#c9d1d9]">记住我</span>
          </label>
          <a
            href="#"
            onClick={handleForgotPassword}
            className="text-sm text-[#00D9FF] no-underline transition-opacity hover:opacity-80 hover:underline"
          >
            忘记密码？
          </a>
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? '登录中...' : '登录'}
        </Button>
      </form>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-[1px] bg-white/10" />
        <span className="text-sm text-[#8b949e]">其他登录方式</span>
        <div className="flex-1 h-[1px] bg-white/10" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Button
          variant="social"
          onClick={() => handleSocialLogin('Google登录')}
          title="Google登录"
        >
          🔍
        </Button>
        <Button
          variant="social"
          onClick={() => handleSocialLogin('邮箱登录')}
          title="邮箱登录"
        >
          📧
        </Button>
      </div>

      <p className="text-center text-sm text-[#c9d1d9]">
        还没有账户？
        <Link href="/register" className="text-[#00D9FF] font-medium no-underline ml-1 hover:underline">
          立即注册
        </Link>
      </p>
    </AuthLayout>
  );
}

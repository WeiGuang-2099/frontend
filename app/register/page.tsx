'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthLayout from '../components/AuthLayout';
import FormInput from '../components/FormInput';
import PasswordInput from '../components/PasswordInput';
import Alert from '../components/Alert';
import Button from '../components/Button';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreement: false
  });
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
    <AuthLayout title="用户注册" subtitle="创建您的账户">
      {errorMessage && <Alert type="error">{errorMessage}</Alert>}
      {successMessage && <Alert type="success">{successMessage}</Alert>}

      <form onSubmit={handleSubmit}>
        <FormInput
          type="text"
          name="username"
          label="用户名 *"
          value={formData.username}
          onChange={handleChange}
          placeholder="请输入用户名（3-50个字符）"
          error={fieldErrors.username}
          required
          disabled={isLoading}
        />

        <FormInput
          type="email"
          name="email"
          label="邮箱 *"
          hint="（用于登录）"
          value={formData.email}
          onChange={handleChange}
          placeholder="请输入邮箱地址"
          error={fieldErrors.email}
          required
          disabled={isLoading}
        />

        <PasswordInput
          name="password"
          label="密码 *"
          value={formData.password}
          onChange={handleChange}
          placeholder="请设置密码（至少6位）"
          error={fieldErrors.password}
          required
          disabled={isLoading}
        />

        <PasswordInput
          name="confirmPassword"
          label="确认密码 *"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="请再次输入密码"
          error={fieldErrors.confirmPassword}
          required
          disabled={isLoading}
        />

        <div className="mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="agreement"
              checked={formData.agreement}
              onChange={handleChange}
              required
              className="w-[18px] h-[18px] rounded accent-[#00D9FF] cursor-pointer"
            />
            <span className="text-sm text-[#c9d1d9]">
              我已阅读并同意用户协议和隐私政策
            </span>
          </label>
          {fieldErrors.agreement && (
            <div className="text-[#EE5A6F] text-xs mt-1">{fieldErrors.agreement}</div>
          )}
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? '注册中...' : '注册账户'}
        </Button>
      </form>

      <p className="text-center text-sm text-[#c9d1d9]">
        已有账户？
        <Link href="/login" className="text-[#00D9FF] font-medium no-underline ml-1 hover:underline">
          立即登录
        </Link>
      </p>
    </AuthLayout>
  );
}

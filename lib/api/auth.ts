/**
 * 认证相关的 API 接口
 */
import apiClient from './client';

// 用户接口类型定义
export interface User {
  id: number;
  username: string;
  email: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

/**
 * 用户登录
 */
export const login = async (credentials: LoginRequest): Promise<TokenResponse> => {
  const response = await apiClient.post<TokenResponse>('/auth/login', credentials);
  return response.data;
};

/**
 * 用户注册
 */
export const register = async (userData: RegisterRequest): Promise<TokenResponse> => {
  const response = await apiClient.post<TokenResponse>('/auth/register', userData);
  return response.data;
};

/**
 * 获取当前用户信息
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
};

/**
 * 用户登出
 */
export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};

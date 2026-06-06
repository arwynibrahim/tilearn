import apiClient from './client';
import type { AuthTokens, LoginDto, RegisterDto, User } from '@/types';

export const authApi = {
  login: async (dto: LoginDto): Promise<AuthTokens & { user: User }> => {
    const { data } = await apiClient.post('/auth/login', dto);
    return data;
  },

  register: async (dto: RegisterDto): Promise<AuthTokens & { user: User }> => {
    const { data } = await apiClient.post('/auth/register', dto);
    return data;
  },

  profile: async (): Promise<User> => {
    const { data } = await apiClient.get('/auth/profile');
    return data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await apiClient.post('/auth/reset-password', { token, password });
  },

  refresh: async (refreshToken: string): Promise<AuthTokens> => {
    const { data } = await apiClient.post(
      '/auth/refresh',
      {},
      { headers: { Authorization: `Bearer ${refreshToken}` } }
    );
    return data;
  },

  googleAuthUrl: () =>
    `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/v1/auth/google`,

  linkedinAuthUrl: () =>
    `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/v1/auth/linkedin`,
};

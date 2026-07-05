import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { setCookie, deleteCookie } from '@/lib/utils';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach access token from localStorage
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auto-refresh on 401
apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${refreshToken}` },
          });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          setCookie('accessToken', data.accessToken, COOKIE_MAX_AGE);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return apiClient(original);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          deleteCookie('accessToken');
          window.location.href = '/login';
        }
      } else {
        if (typeof window !== 'undefined') window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Extract a human-readable message from an Axios error.
 * NestJS returns `{ message: string | string[], statusCode }`.
 */
export function getApiErrorMessage(error: unknown, fallback = 'Une erreur est survenue.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message.join(' · ') : data.message;
    }
    if (error.code === 'ERR_NETWORK') {
      return 'Impossible de joindre le serveur. Vérifiez que l’API est démarrée.';
    }
  }
  return fallback;
}

export default apiClient;

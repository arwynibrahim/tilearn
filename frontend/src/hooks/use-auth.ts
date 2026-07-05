'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/auth.store';
import type { LoginDto, RegisterDto } from '@/types';
import { getDashboardHref } from '@/types';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: (dto: LoginDto) => authApi.login(dto),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      router.push(getDashboardHref(data.user));
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (dto: RegisterDto) => authApi.register(dto),
    onSuccess: () => {
      router.push('/login?registered=1');
    },
  });
}

export function useProfile() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const user = await authApi.profile();
      setUser(user);
      return user;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const qc = useQueryClient();

  return () => {
    logout();
    qc.clear();
    router.push('/');
  };
}

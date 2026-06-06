import apiClient from './client';
import type { PaginatedResponse, User } from '@/types';

export const usersApi = {
  list: async (page = 1, limit = 20): Promise<PaginatedResponse<User>> => {
    const { data } = await apiClient.get('/users', { params: { page, limit } });
    return data;
  },

  get: async (id: string): Promise<User> => {
    const { data } = await apiClient.get(`/users/${id}`);
    return data;
  },

  update: async (id: string, payload: Partial<User>): Promise<User> => {
    const { data } = await apiClient.patch(`/users/${id}`, payload);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};

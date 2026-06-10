import apiClient from './client';
import type { GroupedPermissions, UserWithPermissions } from '@/types';

export const rolesApi = {
  permissions: {
    listAll: async (): Promise<GroupedPermissions> => {
      const { data } = await apiClient.get('/roles/permissions');
      return data;
    },
  },

  sync: async (): Promise<{ message: string }> => {
    const { data } = await apiClient.post('/roles/sync');
    return data;
  },

  user: {
    get: async (userId: string): Promise<UserWithPermissions> => {
      const { data } = await apiClient.get(`/roles/user/${userId}`);
      return data;
    },
    getMe: async (): Promise<UserWithPermissions> => {
      const { data } = await apiClient.get('/roles/me');
      return data;
    },
  },
};
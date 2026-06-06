import apiClient from './client';
import type { Course, Domain, PaginatedResponse } from '@/types';

export const catalogueApi = {
  domains: {
    list: async (): Promise<Domain[]> => {
      const { data } = await apiClient.get('/domains');
      return data;
    },
    get: async (id: string): Promise<Domain> => {
      const { data } = await apiClient.get(`/domains/${id}`);
      return data;
    },
  },

  courses: {
    list: async (params?: {
      domainId?: string;
      level?: string;
      page?: number;
      limit?: number;
    }): Promise<PaginatedResponse<Course>> => {
      const { data } = await apiClient.get('/courses', { params });
      return data;
    },
    get: async (slug: string): Promise<Course> => {
      const { data } = await apiClient.get(`/courses/${slug}`);
      return data;
    },
  },
};

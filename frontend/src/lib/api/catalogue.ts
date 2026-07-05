import apiClient from './client';
import type {
  Course,
  CreateCourseDto,
  CreateDomainDto,
  CreateModuleDto,
  Domain,
  Module,
  PaginatedResponse,
  UpdateCourseDto,
} from '@/types';

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
    create: async (dto: CreateDomainDto): Promise<Domain> => {
      const { data } = await apiClient.post('/domains', dto);
      return data;
    },
  },

  courses: {
    // Backend returns { courses, total, page, limit, totalPages } - normalize to { data, ... }
    list: async (params?: {
      domainId?: string;
      level?: string;
      page?: number;
      limit?: number;
    }): Promise<PaginatedResponse<Course>> => {
      const { data } = await apiClient.get('/courses', { params });
      return {
        data: data.courses ?? [],
        total: data.total ?? 0,
        page: data.page ?? 1,
        limit: data.limit ?? 20,
        totalPages: data.totalPages,
      };
    },
    // Admin endpoint: scoped by org membership (super admin = all, org admin = their org)
    adminList: async (): Promise<Course[]> => {
      const { data } = await apiClient.get('/admin/courses');
      return data;
    },
    get: async (slug: string): Promise<Course> => {
      const { data } = await apiClient.get(`/courses/${slug}`);
      return data;
    },
    create: async (dto: CreateCourseDto): Promise<Course> => {
      const { data } = await apiClient.post('/courses', dto);
      return data;
    },
    update: async (id: string, dto: UpdateCourseDto): Promise<Course> => {
      const { data } = await apiClient.patch(`/courses/${id}`, dto);
      return data;
    },
    remove: async (id: string): Promise<void> => {
      await apiClient.delete(`/courses/${id}`);
    },
  },

  modules: {
    listByCourse: async (courseId: string): Promise<Module[]> => {
      const { data } = await apiClient.get(`/courses/${courseId}/modules`);
      return data;
    },
    create: async (dto: CreateModuleDto): Promise<Module> => {
      const { data } = await apiClient.post('/modules', dto);
      return data;
    },
    update: async (id: string, dto: Partial<CreateModuleDto>): Promise<Module> => {
      const { data } = await apiClient.patch(`/modules/${id}`, dto);
      return data;
    },
  },
};

import apiClient from './client';
import type {
  CreateLicenseDto,
  CreateLearningPathDto,
  CreateOrganizationDto,
  UpdateOrganizationDto,
  LearningPath,
  License,
  Organization,
} from '@/types';

export const b2bApi = {
  organizations: {
    list: async (): Promise<Organization[]> => {
      const { data } = await apiClient.get('/b2b/organizations');
      return data;
    },
    get: async (id: string): Promise<Organization> => {
      const { data } = await apiClient.get(`/b2b/organizations/${id}`);
      return data;
    },
    create: async (payload: CreateOrganizationDto): Promise<Organization> => {
      const { data } = await apiClient.post('/b2b/organizations', payload);
      return data;
    },
    update: async (id: string, payload: UpdateOrganizationDto): Promise<Organization> => {
      const { data } = await apiClient.patch(`/b2b/organizations/${id}`, payload);
      return data;
    },
    remove: async (id: string): Promise<void> => {
      await apiClient.delete(`/b2b/organizations/${id}`);
    },
  },

  licenses: {
    listByOrg: async (orgId: string): Promise<License[]> => {
      const { data } = await apiClient.get(`/b2b/organizations/${orgId}/licenses`);
      return data;
    },
    create: async (payload: CreateLicenseDto): Promise<License> => {
      const { data } = await apiClient.post('/b2b/licenses', payload);
      return data;
    },
    assign: async (licenseId: string, userId: string): Promise<void> => {
      await apiClient.post(`/b2b/licenses/${licenseId}/assign/${userId}`);
    },
    revoke: async (assignmentId: string): Promise<void> => {
      await apiClient.post(`/b2b/licenses/revoke/${assignmentId}`);
    },
  },

  learningPaths: {
    listByOrg: async (orgId: string): Promise<LearningPath[]> => {
      const { data } = await apiClient.get(`/b2b/organizations/${orgId}/learning-paths`);
      return data;
    },
    create: async (payload: CreateLearningPathDto): Promise<LearningPath> => {
      const { data } = await apiClient.post('/b2b/learning-paths', payload);
      return data;
    },
  },
};

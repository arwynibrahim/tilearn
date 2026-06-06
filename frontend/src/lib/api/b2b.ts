import apiClient from './client';
import type { License, Organization, PaginatedResponse } from '@/types';

export const b2bApi = {
  organizations: {
    list: async (): Promise<Organization[]> => {
      const { data } = await apiClient.get('/b2b/organizations');
      return data;
    },
    create: async (payload: Partial<Organization>): Promise<Organization> => {
      const { data } = await apiClient.post('/b2b/organizations', payload);
      return data;
    },
  },

  licenses: {
    listByOrg: async (orgId: string): Promise<License[]> => {
      const { data } = await apiClient.get(`/b2b/organizations/${orgId}/licenses`);
      return data;
    },
    create: async (payload: {
      organizationId: string;
      plan: string;
      seats: number;
      expiresAt: string;
    }): Promise<License> => {
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
};

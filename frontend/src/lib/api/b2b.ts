import apiClient from './client';
import type { CreateLicenseDto, CreateOrganizationDto, License, Organization } from '@/types';

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
};

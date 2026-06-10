import apiClient from './client';
import type { ChargingStation, CreateVRHeadsetDto, HeadsetStatus, VRHeadset } from '@/types';

// Headsets are scoped to an organization on the backend (no global list endpoint).
export const mdmApi = {
  headsets: {
    listByOrg: async (orgId: string): Promise<VRHeadset[]> => {
      const { data } = await apiClient.get(`/mdm/organizations/${orgId}/headsets`);
      return data;
    },
    create: async (dto: CreateVRHeadsetDto): Promise<VRHeadset> => {
      const { data } = await apiClient.post('/mdm/headsets', dto);
      return data;
    },
    updateStatus: async (
      id: string,
      status: HeadsetStatus,
      batteryLevel?: number
    ): Promise<VRHeadset> => {
      const { data } = await apiClient.patch(`/mdm/headsets/${id}/status`, { status, batteryLevel });
      return data;
    },
    assign: async (id: string, userId: string): Promise<void> => {
      await apiClient.post(`/mdm/headsets/${id}/assign/${userId}`);
    },
  },

  chargingStations: {
    listByOrg: async (orgId: string): Promise<ChargingStation[]> => {
      const { data } = await apiClient.get(`/mdm/organizations/${orgId}/charging-stations`);
      return data;
    },
    create: async (dto: { organizationId: string; name: string; location?: string; capacity?: number }): Promise<ChargingStation> => {
      const { data } = await apiClient.post('/mdm/charging-stations', dto);
      return data;
    },
  },
};

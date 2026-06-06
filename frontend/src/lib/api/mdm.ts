import apiClient from './client';
import type { VRHeadset } from '@/types';

export const mdmApi = {
  headsets: {
    list: async (): Promise<VRHeadset[]> => {
      const { data } = await apiClient.get('/mdm/headsets');
      return data;
    },
    get: async (id: string): Promise<VRHeadset> => {
      const { data } = await apiClient.get(`/mdm/headsets/${id}`);
      return data;
    },
    update: async (id: string, payload: Partial<VRHeadset>): Promise<VRHeadset> => {
      const { data } = await apiClient.patch(`/mdm/headsets/${id}`, payload);
      return data;
    },
  },
};

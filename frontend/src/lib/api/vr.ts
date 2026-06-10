import apiClient from './client';
import type { VRScene, CreateVRSceneDto } from '@/types';

export const vrApi = {
  scenes: {
    create: async (dto: CreateVRSceneDto): Promise<VRScene> => {
      const { data } = await apiClient.post('/vr/scenes', dto);
      return data;
    },
    getByModule: async (moduleId: string): Promise<VRScene> => {
      const { data } = await apiClient.get(`/vr/modules/${moduleId}/scene`);
      return data;
    },
    get: async (id: string): Promise<VRScene> => {
      const { data } = await apiClient.get(`/vr/scenes/${id}`);
      return data;
    },
    update: async (id: string, dto: Partial<CreateVRSceneDto>): Promise<VRScene> => {
      const { data } = await apiClient.patch(`/vr/scenes/${id}`, dto);
      return data;
    },
  },
};
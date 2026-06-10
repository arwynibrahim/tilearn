import apiClient from './client';
import type {
  Payment,
  Subscription,
  CreatePaymentDto,
  InitiatePayinDto,
  LigdiCashInitResponse,
  PaginatedResponse,
} from '@/types';

export interface LigdiCashConfirmResponse {
  success: boolean;
  data?: {
    status: 'completed' | 'pending' | 'notcompleted';
    transaction_id?: string;
    operator_id?: string;
    operator_name?: string;
    customer?: string;
    amount?: number;
    devise?: string;
    description?: string;
  };
  reason?: string;
}

export const paymentApi = {
  payments: {
    create: async (dto: CreatePaymentDto): Promise<Payment> => {
      const { data } = await apiClient.post('/payments', dto);
      return data;
    },
    listMine: async (): Promise<Payment[]> => {
      const { data } = await apiClient.get('/payments/mine');
      return data;
    },
    listAll: async (page = 1, limit = 20): Promise<PaginatedResponse<Payment>> => {
      const { data } = await apiClient.get('/admin/payments', { params: { page, limit } });
      return {
        data: data.payments ?? [],
        total: data.total ?? 0,
        page: data.page ?? page,
        limit: data.limit ?? limit,
        totalPages: data.totalPages,
      };
    },
    initiateLigdiCash: async (dto: InitiatePayinDto): Promise<LigdiCashInitResponse> => {
      const { data } = await apiClient.post('/payments/ligdicash/initiate', dto);
      return data;
    },
    confirmLigdiCash: async (token: string): Promise<LigdiCashConfirmResponse> => {
      const { data } = await apiClient.get('/payments/ligdicash/confirm', { params: { token } });
      return data;
    },
  },

  subscriptions: {
    listMine: async (): Promise<Subscription[]> => {
      const { data } = await apiClient.get('/subscriptions/mine');
      return data;
    },
    create: async (plan: string): Promise<Subscription> => {
      const { data } = await apiClient.post('/subscriptions', { plan });
      return data;
    },
  },
};
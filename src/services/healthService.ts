import api from '@/api/client';
import type { ApiEnvelope } from '@/types/api';

export interface HealthStatus {
  status: string;
  timestamp: string;
  uptime?: number;
}

export const healthService = {
  check: async (signal?: AbortSignal) => {
    const response = await api.get<ApiEnvelope<HealthStatus>>('/health', { signal });
    return response.data.data;
  },
};

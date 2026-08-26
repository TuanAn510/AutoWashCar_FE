import type { AxiosRequestConfig } from 'axios';

import { apiClient } from '@/api/client';
import type { ApiEnvelope } from '@/types/api';

export type ApiRequestConfig = Omit<AxiosRequestConfig, 'url' | 'method' | 'data'>;

export const apiRequest = {
  async get<T>(url: string, config?: ApiRequestConfig): Promise<T> {
    const response = await apiClient.get<ApiEnvelope<T>>(url, config);
    return response.data.data;
  },
  async post<T, TBody = void>(url: string, body?: TBody, config?: ApiRequestConfig): Promise<T> {
    const response = await apiClient.post<ApiEnvelope<T>>(url, body, config);
    return response.data.data;
  },
  async patch<T, TBody = void>(url: string, body?: TBody, config?: ApiRequestConfig): Promise<T> {
    const response = await apiClient.patch<ApiEnvelope<T>>(url, body, config);
    return response.data.data;
  },
  async delete<T>(url: string, config?: ApiRequestConfig): Promise<T> {
    const response = await apiClient.delete<ApiEnvelope<T>>(url, config);
    return response.data.data;
  },
};

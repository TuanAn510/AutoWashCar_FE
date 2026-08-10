import axios, { type InternalAxiosRequestConfig } from 'axios';

import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/store/useAuthStore';
import type { ApiEnvelope } from '@/types/api';
import { toApiError } from '@/api/errors';

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

const AUTH_ENDPOINTS = ['/auth/signin', '/auth/signup', '/auth/refresh-token'];

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 20_000,
});

let refreshPromise: Promise<string> | null = null;

const isAuthEndpoint = (url?: string) => AUTH_ENDPOINTS.some((path) => url?.includes(path));

const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = apiClient
      .post<ApiEnvelope<{ accessToken: string }>>('/auth/refresh-token')
      .then(({ data }) => {
        const accessToken = data.data.accessToken;
        useAuthStore.getState().setAccessToken(accessToken);
        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

apiClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) config.headers.set('Authorization', `Bearer ${accessToken}`);
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(toApiError(error));

    const request = error.config as InternalAxiosRequestConfig | undefined;
    const shouldRefresh =
      error.response?.status === 401 && request && !request._retry && !isAuthEndpoint(request.url);

    if (!shouldRefresh) return Promise.reject(toApiError(error));

    request._retry = true;
    try {
      const currentAccessToken = useAuthStore.getState().accessToken;
      const requestAccessToken = request.headers.get('Authorization');
      if (currentAccessToken && requestAccessToken !== `Bearer ${currentAccessToken}`) {
        request.headers.set('Authorization', `Bearer ${currentAccessToken}`);
        return await apiClient(request);
      }

      const accessToken = await refreshAccessToken();
      request.headers.set('Authorization', `Bearer ${accessToken}`);
      return await apiClient(request);
    } catch (refreshError) {
      useAuthStore.getState().clearState();
      queryClient.clear();
      return Promise.reject(toApiError(refreshError));
    }
  }
);

export default apiClient;

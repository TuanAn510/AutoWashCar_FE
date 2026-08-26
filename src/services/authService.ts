import api from '@/api/client';
import type { AuthSession } from '@/types/auth';
import type { ApiEnvelope } from '@/types/api';
import type { User } from '@/types/user';

export const authService = {
  signin: async (phone: string, password: string) => {
    const response = await api.post<ApiEnvelope<AuthSession>>('/auth/signin', {
      phone,
      password,
    });
    return response.data.data;
  },

  signup: async (phone: string, password: string, firstName: string, lastName: string) => {
    const response = await api.post<ApiEnvelope<AuthSession>>('/auth/signup', {
      phone: phone.trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });
    return response.data.data;
  },

  signout: async () => {
    await api.post('/auth/signout');
  },

  fetchMe: async (signal?: AbortSignal) => {
    const response = await api.get<ApiEnvelope<User>>('/auth/me', { signal });
    return response.data.data;
  },

  refresh: async () => {
    const response =
      await api.post<ApiEnvelope<Pick<AuthSession, 'accessToken'>>>('/auth/refresh-token');
    return response.data.data;
  },
};

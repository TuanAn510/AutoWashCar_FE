import api from '@/api/client';
import type { ApiEnvelope, PaginatedEnvelope, PaginationParams } from '@/types/api';
import type { User } from '@/types/user';
import type { UpdateProfileRequest } from '@/types/user';

export interface UpdateUserByAdminPayload {
  displayName?: string;
  phone?: string;
  role?: 'admin' | 'staff' | 'customer';
  isActive?: boolean;
}

export interface StaffWorkload {
  _id: string;
  displayName: string;
  phone: string;
  avatarUrl?: string;
  isActive?: boolean;
  todayCount: number;
  weekCount: number;
  activeCount: number;
  completedCount: number;
}

export const userService = {
  updateProfile: async (data: UpdateProfileRequest) => {
    const body =
      data.file instanceof File
        ? Object.entries(data).reduce((formData, [key, value]) => {
            if (typeof value !== 'undefined') {
              formData.append(key, value);
            }

            return formData;
          }, new FormData())
        : data;

    const response = await api.patch<ApiEnvelope<User>>('/users/me', body);
    return response.data.data;
  },

  listCustomers: async (params?: PaginationParams, signal?: AbortSignal) => {
    const response = await api.get<PaginatedEnvelope<User>>('/users', {
      params,
      signal,
    });

    return {
      customers: response.data.data,
      pagination: response.data.pagination,
      total: response.data.pagination?.total ?? response.data.data.length,
    };
  },

  listStaffs: async (params?: PaginationParams, signal?: AbortSignal) => {
    const response = await api.get<PaginatedEnvelope<User>>('/users/staffs', {
      params,
      signal,
    });

    return {
      staffs: response.data.data,
      pagination: response.data.pagination,
      total: response.data.pagination?.total ?? response.data.data.length,
    };
  },

  getStaffWorkload: async (signal?: AbortSignal) => {
    const response = await api.get<ApiEnvelope<StaffWorkload[]>>('/users/staffs/workload', {
      signal,
    });
    return response.data.data;
  },

  getDetail: async (userId: string, signal?: AbortSignal) => {
    const response = await api.get<ApiEnvelope<User>>(`/users/${userId}`, { signal });
    return response.data.data;
  },

  updateByAdmin: async (userId: string, payload: UpdateUserByAdminPayload) => {
    const response = await api.patch<ApiEnvelope<User>>(`/users/${userId}`, payload);
    return response.data.data;
  },
};

export const customersApi = {
  list: userService.listCustomers,
  getDetail: userService.getDetail,
  updateByAdmin: userService.updateByAdmin,
};

export const staffsApi = {
  list: userService.listStaffs,
  workload: userService.getStaffWorkload,
};

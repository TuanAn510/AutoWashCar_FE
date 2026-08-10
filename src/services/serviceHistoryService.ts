import api from '@/api/client';
import type { ApiEnvelope, PaginatedEnvelope, PaginationParams } from '@/types/api';
import type {
  PaginatedResult,
  ServiceHistoryItem,
  ServiceHistoryListParams,
  UpdateServiceHistoryPayload,
} from '@/types/serviceHistory';

const normalizePaginatedData = (
  response: PaginatedEnvelope<ServiceHistoryItem>
): PaginatedResult<ServiceHistoryItem> => ({
  items: response.data,
  pagination: response.pagination,
  total: response.pagination?.total ?? response.data.length,
});

export const adminServiceHistoryApi = {
  async getServiceHistories(
    params?: ServiceHistoryListParams,
    signal?: AbortSignal
  ): Promise<PaginatedResult<ServiceHistoryItem>> {
    const response = await api.get<PaginatedEnvelope<ServiceHistoryItem>>('/service-histories', {
      params,
      signal,
    });

    return {
      items: response.data.data,
      pagination: response.data.pagination,
      total: response.data.pagination?.total ?? response.data.data.length,
    };
  },

  async getServiceHistoryDetail(serviceHistoryId: string, signal?: AbortSignal) {
    const response = await api.get<ApiEnvelope<ServiceHistoryItem>>(
      `/service-histories/${serviceHistoryId}`,
      { signal }
    );

    return response.data.data;
  },

  async updateServiceHistory(serviceHistoryId: string, payload: UpdateServiceHistoryPayload) {
    const response = await api.patch<ApiEnvelope<ServiceHistoryItem>>(
      `/service-histories/${serviceHistoryId}`,
      payload
    );

    return response.data.data;
  },

  async deleteServiceHistory(serviceHistoryId: string) {
    await api.delete<ApiEnvelope<null>>(`/service-histories/${serviceHistoryId}`);
  },
};

export const customerServiceHistoryApi = {
  async getMyServiceHistories(params?: PaginationParams, signal?: AbortSignal) {
    const response = await api.get<PaginatedEnvelope<ServiceHistoryItem>>('/service-histories/my', {
      params,
      signal,
    });

    return normalizePaginatedData(response.data);
  },

  async getMyVehicleServiceHistories(
    vehicleId: string,
    params?: PaginationParams,
    signal?: AbortSignal
  ) {
    const response = await api.get<PaginatedEnvelope<ServiceHistoryItem>>(
      `/service-histories/my/vehicles/${vehicleId}`,
      {
        params,
        signal,
      }
    );

    return normalizePaginatedData(response.data);
  },

  async getMyServiceHistoryDetail(serviceHistoryId: string, signal?: AbortSignal) {
    const response = await api.get<ApiEnvelope<ServiceHistoryItem>>(
      `/service-histories/my/${serviceHistoryId}`,
      { signal }
    );

    return response.data.data;
  },
};

export const staffServiceHistoryApi = {
  async getMyServiceHistories(
    params?: PaginationParams,
    signal?: AbortSignal
  ): Promise<PaginatedResult<ServiceHistoryItem>> {
    const response = await api.get<PaginatedEnvelope<ServiceHistoryItem>>(
      '/service-histories/staff/my',
      {
        params,
        signal,
      }
    );

    return {
      items: response.data.data,
      pagination: response.data.pagination,
      total: response.data.pagination?.total ?? response.data.data.length,
    };
  },
};

export const serviceHistoryService = customerServiceHistoryApi;

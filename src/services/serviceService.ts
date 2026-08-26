import api from '@/api/client';
import type { ApiEnvelope, PaginatedEnvelope, PaginatedResult } from '@/types/api';
import type {
  CreateServicePayload,
  Service,
  ServiceListParams,
  UpdateServicePayload,
} from '@/types/service';

const SERVICE_PAGE_SIZE = 100;

const fetchServicePage = (params: ServiceListParams, signal?: AbortSignal) =>
  api.get<PaginatedEnvelope<Service>>('/services', { params, signal });

const normalizePayload = (payload: CreateServicePayload): CreateServicePayload => ({
  ...payload,
  name: payload.name.trim(),
  description: payload.description?.trim() || undefined,
});

const normalizeUpdatePayload = (payload: UpdateServicePayload): UpdateServicePayload => ({
  ...payload,
  ...(typeof payload.name === 'string' ? { name: payload.name.trim() } : {}),
  ...(typeof payload.description === 'string' ? { description: payload.description.trim() } : {}),
});

export const serviceApi = {
  async getServices(
    params?: ServiceListParams,
    signal?: AbortSignal
  ): Promise<PaginatedResult<Service>> {
    const response = await fetchServicePage(params ?? {}, signal);

    return {
      items: response.data.data,
      pagination: response.data.pagination,
      total: response.data.pagination?.total ?? response.data.data.length,
    };
  },

  async getAllServices(signal?: AbortSignal) {
    const firstPage = await fetchServicePage({ page: 1, limit: SERVICE_PAGE_SIZE }, signal);
    const totalPages = firstPage.data.pagination?.totalPages ?? 1;

    if (totalPages <= 1) {
      return firstPage.data.data;
    }

    const remainingPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) =>
        fetchServicePage({ page: index + 2, limit: SERVICE_PAGE_SIZE }, signal)
      )
    );

    return [firstPage, ...remainingPages].flatMap((response) => response.data.data);
  },

  async getActiveServices(params?: Omit<ServiceListParams, 'isActive'>, signal?: AbortSignal) {
    const response = await api.get<PaginatedEnvelope<Service>>('/services/active', {
      params,
      signal,
    });

    return response.data.data;
  },

  async createService(payload: CreateServicePayload) {
    const response = await api.post<ApiEnvelope<Service>>('/services', normalizePayload(payload));
    return response.data.data;
  },

  async updateService(serviceId: string, payload: UpdateServicePayload) {
    const response = await api.patch<ApiEnvelope<Service>>(
      `/services/${serviceId}`,
      normalizeUpdatePayload(payload)
    );
    return response.data.data;
  },
};

export const serviceService = serviceApi;

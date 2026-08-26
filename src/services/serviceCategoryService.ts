import api from '@/api/client';
import type {
  ApiEnvelope,
  PaginatedEnvelope,
  PaginatedResult,
  PaginationParams,
} from '@/types/api';
import type {
  CreateServiceCategoryPayload,
  ServiceCategory,
  ServiceCategoryListParams,
  UpdateServiceCategoryPayload,
} from '@/types/serviceCategory';

const normalizePayload = (payload: CreateServiceCategoryPayload): CreateServiceCategoryPayload => ({
  name: payload.name.trim(),
  description: payload.description?.trim() || undefined,
});

const CATEGORY_PAGE_SIZE = 100;

const fetchServiceCategoryPage = (params: ServiceCategoryListParams, signal?: AbortSignal) =>
  api.get<PaginatedEnvelope<ServiceCategory>>('/service-categories', { params, signal });

const fetchActiveServiceCategoryPage = (params: PaginationParams, signal?: AbortSignal) =>
  api.get<PaginatedEnvelope<ServiceCategory>>('/service-categories/active', { params, signal });

const fetchAllPages = async (
  fetchPage: (params: PaginationParams) => Promise<{ data: PaginatedEnvelope<ServiceCategory> }>
) => {
  const firstPage = await fetchPage({ page: 1, limit: CATEGORY_PAGE_SIZE });
  const totalPages = firstPage.data.pagination?.totalPages ?? 1;

  if (totalPages <= 1) {
    return firstPage.data.data;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      fetchPage({ page: index + 2, limit: CATEGORY_PAGE_SIZE })
    )
  );

  return [firstPage, ...remainingPages].flatMap((response) => response.data.data);
};

export const serviceCategoryApi = {
  async getServiceCategories(
    params?: ServiceCategoryListParams,
    signal?: AbortSignal
  ): Promise<PaginatedResult<ServiceCategory>> {
    const response = await fetchServiceCategoryPage(params ?? {}, signal);

    return {
      items: response.data.data,
      pagination: response.data.pagination,
      total: response.data.pagination?.total ?? response.data.data.length,
    };
  },

  async getAllServiceCategories(signal?: AbortSignal) {
    return fetchAllPages((params) => fetchServiceCategoryPage(params, signal));
  },

  async getActiveServiceCategories(params?: PaginationParams, signal?: AbortSignal) {
    const response = await fetchActiveServiceCategoryPage(params ?? {}, signal);

    return response.data.data;
  },

  async getAllActiveServiceCategories(signal?: AbortSignal) {
    return fetchAllPages((params) => fetchActiveServiceCategoryPage(params, signal));
  },

  async createServiceCategory(payload: CreateServiceCategoryPayload) {
    const response = await api.post<ApiEnvelope<ServiceCategory>>(
      '/service-categories',
      normalizePayload(payload)
    );

    return response.data.data;
  },

  async updateServiceCategory(categoryId: string, payload: UpdateServiceCategoryPayload) {
    const response = await api.patch<ApiEnvelope<ServiceCategory>>(
      `/service-categories/${categoryId}`,
      {
        ...payload,
        ...(typeof payload.name === 'string' ? { name: payload.name.trim() } : {}),
        ...(typeof payload.description === 'string'
          ? { description: payload.description.trim() }
          : {}),
      }
    );

    return response.data.data;
  },
};

export const serviceCategoryService = serviceCategoryApi;

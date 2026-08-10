import api from '@/api/client';
import type {
  ApiEnvelope,
  PaginatedEnvelope,
  PaginatedResult,
  PaginationParams,
} from '@/types/api';
import type { User } from '@/types/user';

export type PromotionType = 'percentage' | 'fixed_amount' | 'bonus_points' | 'free_service';
export type PromotionFormType = Exclude<PromotionType, 'bonus_points'>;
export type PromotionTargetType = 'all' | 'membership_tier' | 'service';

export interface PromotionRef {
  _id: string;
  name?: string;
  displayName?: string;
  phone?: string;
  role?: string;
  slug?: string;
  price?: number;
}

export interface Promotion {
  _id: string;
  title: string;
  description?: string | null;
  code: string;
  type: PromotionType;
  discountValue?: number | null;
  bonusPoints?: number | null;
  targetType: PromotionTargetType;
  membershipTierId?: PromotionRef | string | null;
  serviceId?: PromotionRef | string | null;
  startDate: string;
  endDate: string;
  usageLimit?: number | null;
  usedCount?: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number | null;
  isActive: boolean;
  createdBy?: User | PromotionRef | string | null;
  updatedBy?: User | PromotionRef | string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PromotionPayload {
  title: string;
  description?: string;
  code: string;
  type: PromotionFormType;
  discountValue?: number | null;
  targetType?: PromotionTargetType;
  membershipTierId?: string | null;
  serviceId?: string | null;
  startDate: string;
  endDate: string;
  usageLimit?: number | null;
  minOrderAmount?: number;
  maxDiscountAmount?: number | null;
  isActive?: boolean;
}

export interface PromotionListParams extends PaginationParams {
  isActive?: boolean;
}

const normalizePayload = (payload: PromotionPayload): PromotionPayload => ({
  ...payload,
  title: payload.title.trim(),
  description: payload.description?.trim() || undefined,
  code: payload.code.trim().toUpperCase(),
  targetType: payload.targetType ?? 'all',
});

export const promotionApi = {
  async listActive(signal?: AbortSignal) {
    const response = await api.get<PaginatedEnvelope<Promotion>>('/promotions/active', {
      params: { limit: 100 },
      signal,
    });
    return response.data.data ?? [];
  },

  async list(
    params?: PromotionListParams,
    signal?: AbortSignal
  ): Promise<PaginatedResult<Promotion>> {
    const response = await api.get<PaginatedEnvelope<Promotion>>('/promotions', { params, signal });

    return {
      items: response.data.data ?? [],
      pagination: response.data.pagination,
      total: response.data.pagination?.total ?? response.data.data?.length ?? 0,
    };
  },

  async create(payload: PromotionPayload) {
    const response = await api.post<ApiEnvelope<Promotion>>(
      '/promotions',
      normalizePayload(payload)
    );
    return response.data.data;
  },

  async update(promotionId: string, payload: PromotionPayload) {
    const response = await api.patch<ApiEnvelope<Promotion>>(
      `/promotions/${promotionId}`,
      normalizePayload(payload)
    );
    return response.data.data;
  },

  async updateStatus(promotionId: string, isActive: boolean) {
    const response = await api.patch<ApiEnvelope<Promotion>>(`/promotions/${promotionId}/status`, {
      isActive,
    });
    return response.data.data;
  },

  async remove(promotionId: string) {
    const response = await api.delete<ApiEnvelope<Promotion>>(`/promotions/${promotionId}`);
    return response.data.data;
  },
};

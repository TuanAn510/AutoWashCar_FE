import api from '@/api/client';
import type { ApiEnvelope, PaginatedEnvelope, PaginationMeta, PaginationParams } from '@/types/api';
import type {
  CustomerWithLoyalty,
  LoyaltyAccount,
  LoyaltyTransaction,
  MembershipTier,
  MembershipTierPayload,
  Reward,
  RewardPayload,
  RewardRedemption,
} from '@/features/shared/loyalty/types/loyalty.types';

const unwrapList = <T>(response: { data: ApiEnvelope<T[]> | PaginatedEnvelope<T> }) =>
  response.data.data ?? [];

export const loyaltyApi = {
  async getCustomers(
    params: PaginationParams & { search?: string; membershipTierId?: string } = {},
    signal?: AbortSignal
  ) {
    const response = await api.get<PaginatedEnvelope<CustomerWithLoyalty>>('/loyalty/customers', {
      params,
      signal,
    });

    return {
      customers: response.data.data ?? [],
      pagination: response.data.pagination,
      total: response.data.pagination?.total ?? response.data.data?.length ?? 0,
    } satisfies {
      customers: CustomerWithLoyalty[];
      pagination?: PaginationMeta;
      total: number;
    };
  },

  async getMyAccount(signal?: AbortSignal) {
    const response = await api.get<ApiEnvelope<LoyaltyAccount>>('/loyalty/me', { signal });
    return response.data.data;
  },

  async getMyTransactions(signal?: AbortSignal) {
    const response = await api.get<
      ApiEnvelope<LoyaltyTransaction[]> | PaginatedEnvelope<LoyaltyTransaction>
    >('/loyalty/me/transactions', { params: { limit: 100 }, signal });
    return unwrapList<LoyaltyTransaction>(response);
  },

  async getCustomerAccount(customerId: string, signal?: AbortSignal) {
    const response = await api.get<ApiEnvelope<LoyaltyAccount>>(
      `/loyalty/customers/${customerId}`,
      { signal }
    );
    return response.data.data;
  },

  async getCustomerTransactions(customerId: string, signal?: AbortSignal) {
    const response = await api.get<
      ApiEnvelope<LoyaltyTransaction[]> | PaginatedEnvelope<LoyaltyTransaction>
    >(`/loyalty/customers/${customerId}/transactions`, { params: { limit: 100 }, signal });
    return unwrapList<LoyaltyTransaction>(response);
  },
};

export const membershipTierApi = {
  async list(signal?: AbortSignal) {
    const response = await api.get<
      ApiEnvelope<MembershipTier[]> | PaginatedEnvelope<MembershipTier>
    >('/membership-tiers', { signal });
    return unwrapList<MembershipTier>(response);
  },

  async create(payload: MembershipTierPayload) {
    const response = await api.post<ApiEnvelope<MembershipTier>>('/membership-tiers', payload);
    return response.data.data;
  },

  async update(membershipTierId: string, payload: MembershipTierPayload) {
    const response = await api.patch<ApiEnvelope<MembershipTier>>(
      `/membership-tiers/${membershipTierId}`,
      payload
    );
    return response.data.data;
  },

  async remove(membershipTierId: string) {
    const response = await api.delete<ApiEnvelope<MembershipTier>>(
      `/membership-tiers/${membershipTierId}`
    );
    return response.data.data;
  },
};

export const rewardApi = {
  async list(params: { sortBy?: string; sortOrder?: 'asc' | 'desc' } = {}, signal?: AbortSignal) {
    const response = await api.get<ApiEnvelope<Reward[]> | PaginatedEnvelope<Reward>>('/rewards', {
      params: { limit: 100, ...params },
      signal,
    });
    return unwrapList<Reward>(response);
  },

  async create(payload: RewardPayload) {
    const response = await api.post<ApiEnvelope<Reward>>('/rewards', payload);
    return response.data.data;
  },

  async update(rewardId: string, payload: RewardPayload) {
    const response = await api.patch<ApiEnvelope<Reward>>(`/rewards/${rewardId}`, payload);
    return response.data.data;
  },

  async remove(rewardId: string) {
    const response = await api.delete<ApiEnvelope<Reward>>(`/rewards/${rewardId}`);
    return response.data.data;
  },

  async redeem(rewardId: string) {
    const response = await api.post<ApiEnvelope<{ redemption: RewardRedemption }>>(
      `/rewards/${rewardId}/redeem`
    );
    return response.data.data.redemption;
  },

  async getMyRedemptions(signal?: AbortSignal) {
    const response = await api.get<
      ApiEnvelope<RewardRedemption[]> | PaginatedEnvelope<RewardRedemption>
    >('/rewards/me/redemptions', { params: { limit: 100 }, signal });
    return unwrapList<RewardRedemption>(response);
  },

  async markRedemptionUsed(rewardRedemptionId: string) {
    const response = await api.patch<ApiEnvelope<RewardRedemption>>(
      `/rewards/redemptions/${rewardRedemptionId}/use`
    );
    return response.data.data;
  },
};

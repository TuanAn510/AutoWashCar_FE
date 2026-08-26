import { queryKeys } from '@/constants/queryKeys';

export const loyaltyKeys = {
  me: queryKeys.loyalty.me(),
  myTransactions: queryKeys.loyalty.myTransactions(),
  customers: (params?: {
    search?: string;
    membershipTierId?: string;
    page?: number;
    limit?: number;
  }) => queryKeys.loyalty.customers(params),
  customer: queryKeys.loyalty.customer,
  customerTransactions: queryKeys.loyalty.customerTransactions,
  customerRedemptions: queryKeys.loyalty.customerRedemptions,
};

export const membershipTierKeys = {
  all: queryKeys.membershipTiers.all,
  detail: (membershipTierId: string) => ['membership-tiers', membershipTierId] as const,
};

export const rewardKeys = {
  all: queryKeys.rewards.all,
  detail: (rewardId: string) => ['rewards', rewardId] as const,
  myRedemptions: queryKeys.rewards.myRedemptions(),
};

export type RewardDiscountType = 'percentage' | 'fixed_amount';
export type RewardRedemptionStatus = 'available' | 'used' | 'expired' | 'cancelled';
export type LoyaltyTransactionType = 'earn' | 'redeem' | 'adjust' | 'expire';
export type LoyaltyTransactionStatus = 'pending' | 'posted' | 'reversed';

export interface MembershipTier {
  _id: string;
  name: string;
  minTotalEarnedPoints: number;
  discountPercent?: number | null;
  description?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoyaltyCustomer {
  _id: string;
  displayName?: string;
  phone?: string;
  avatarUrl?: string | null;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerWithLoyalty {
  customer: LoyaltyCustomer;
  loyaltyAccount: LoyaltyAccount | null;
}

export interface LoyaltyAccount {
  _id: string;
  customerId?: string | LoyaltyCustomer;
  currentPoints: number;
  totalEarnedPoints: number;
  totalRedeemedPoints: number;
  totalExpiredPoints: number;
  currentQuarterEarnedPoints: number;
  loyaltyPeriodKey?: string | null;
  nextQuarterResetAt?: string | null;
  membershipTierId?: string | MembershipTier | null;
  lastPointEarnedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoyaltyTransaction {
  _id: string;
  type: LoyaltyTransactionType;
  status?: LoyaltyTransactionStatus;
  points: number;
  remainingPoints?: number | null;
  description?: string | null;
  serviceHistoryId?: unknown;
  rewardRedemptionId?: unknown;
  createdBy?: string | LoyaltyCustomer | null;
  expiresAt?: string | null;
  createdAt?: string;
}

export interface Reward {
  _id: string;
  name: string;
  description?: string | null;
  requiredPoints: number;
  discountType: RewardDiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number | null;
  quantity?: number | null;
  redeemedCount?: number;
  hasRedeemed?: boolean;
  isActive?: boolean;
  expiredAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface RewardRedemption {
  _id: string;
  code?: string;
  rewardId?: Reward | string | null;
  customerId?: string | LoyaltyCustomer;
  pointsUsed: number;
  status: RewardRedemptionStatus;
  redeemedAt?: string;
  usedAt?: string | null;
  usedBy?: LoyaltyCustomer | null;
  createdAt?: string;
}

export interface MembershipTierPayload {
  name: string;
  minTotalEarnedPoints: number;
  discountPercent: number;
  description?: string;
  isActive?: boolean;
}

export interface RewardPayload {
  name: string;
  description?: string;
  requiredPoints: number;
  discountType: 'fixed_amount';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number | null;
  quantity?: number | null;
  expiredAt?: string | null;
  isActive?: boolean;
}

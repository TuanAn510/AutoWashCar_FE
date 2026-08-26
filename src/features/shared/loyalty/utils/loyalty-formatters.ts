import type {
  LoyaltyTransactionType,
  LoyaltyTransactionStatus,
  Reward,
  RewardDiscountType,
  RewardRedemptionStatus,
} from '@/features/shared/loyalty/types/loyalty.types';

const numberFormatter = new Intl.NumberFormat('vi-VN');

export const formatPoints = (value?: number | null) => `${numberFormatter.format(value ?? 0)} điểm`;

export const transactionTypeLabels: Record<LoyaltyTransactionType, string> = {
  earn: 'Tích điểm',
  redeem: 'Đổi thưởng',
  adjust: 'Điều chỉnh',
  expire: 'Hết hạn',
};

export const transactionStatusLabels: Record<LoyaltyTransactionStatus, string> = {
  pending: 'Chờ hoàn thành',
  posted: 'Đã ghi nhận',
  reversed: 'Đã hoàn tác',
};

export const redemptionStatusLabels: Record<RewardRedemptionStatus, string> = {
  available: 'Chưa sử dụng',
  used: 'Đã sử dụng',
  expired: 'Hết hạn',
  cancelled: 'Đã hủy',
};

export const discountTypeLabels: Record<RewardDiscountType, string> = {
  percentage: 'Giảm theo phần trăm',
  fixed_amount: 'Giảm số tiền',
};

export const formatRewardDiscount = (reward: Reward) => {
  if (reward.discountType === 'percentage') {
    return `${numberFormatter.format(reward.discountValue)}%`;
  }

  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    reward.discountValue
  );
};

export const getRewardRemainingQuantity = (reward: Reward) => {
  if (reward.quantity === null || typeof reward.quantity === 'undefined') {
    return null;
  }

  return Math.max(0, reward.quantity - (reward.redeemedCount ?? 0));
};

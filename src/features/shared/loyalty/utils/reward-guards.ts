import type { Reward } from '@/features/shared/loyalty/types/loyalty.types';
import { getRewardRemainingQuantity } from '@/features/shared/loyalty/utils/loyalty-formatters';

export const isRewardExpired = (reward: Reward) => {
  if (!reward.expiredAt) return false;
  return new Date(reward.expiredAt).getTime() <= Date.now();
};

export const isRewardOutOfStock = (reward: Reward) => {
  const remaining = getRewardRemainingQuantity(reward);
  return remaining !== null && remaining <= 0;
};

export const canRedeemReward = (reward: Reward, currentPoints: number) =>
  reward.isActive !== false &&
  !reward.hasRedeemed &&
  !isRewardExpired(reward) &&
  !isRewardOutOfStock(reward) &&
  currentPoints >= reward.requiredPoints;

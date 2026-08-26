import type { LoyaltyAccount, MembershipTier } from '@/features/shared/loyalty/types/loyalty.types';

export const getAccountTier = (account?: LoyaltyAccount | null) => {
  const tier = account?.membershipTierId;
  return typeof tier === 'object' && tier ? tier : null;
};

export const calculateTierProgress = (
  quarterEarnedPoints: number,
  tiers: MembershipTier[],
  currentTier?: MembershipTier | null
) => {
  const activeTiers = tiers
    .filter((tier) => tier.isActive !== false)
    .sort((a, b) => a.minTotalEarnedPoints - b.minTotalEarnedPoints);

  if (!activeTiers.length) {
    return {
      currentTier: currentTier ?? null,
      nextTier: null,
      progressPercent: 0,
      pointsToNextTier: 0,
      isMaxTier: false,
    };
  }

  const current =
    currentTier ??
    [...activeTiers].reverse().find((tier) => quarterEarnedPoints >= tier.minTotalEarnedPoints) ??
    activeTiers[0];

  const currentThreshold = current.minTotalEarnedPoints;
  const nextTier = activeTiers.find((tier) => tier.minTotalEarnedPoints > currentThreshold);

  if (!nextTier) {
    return {
      currentTier: current,
      nextTier: null,
      progressPercent: 100,
      pointsToNextTier: 0,
      isMaxTier: true,
    };
  }

  const progressPercent =
    ((quarterEarnedPoints - currentThreshold) /
      Math.max(nextTier.minTotalEarnedPoints - currentThreshold, 1)) *
    100;

  return {
    currentTier: current,
    nextTier,
    progressPercent: Math.max(0, Math.min(100, progressPercent)),
    pointsToNextTier: Math.max(0, nextTier.minTotalEarnedPoints - quarterEarnedPoints),
    isMaxTier: false,
  };
};

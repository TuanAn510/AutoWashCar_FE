import type { MembershipTier } from '@/features/shared/loyalty/types/loyalty.types';

export const membershipTierTones = ['bronze', 'silver', 'gold', 'emerald', 'violet'] as const;

export type MembershipTierTone = (typeof membershipTierTones)[number] | 'neutral';

export function getMembershipTierTone(
  tier?: MembershipTier | null,
  tiers: MembershipTier[] = []
): MembershipTierTone {
  if (!tier) return 'neutral';

  const sortedThresholds = [...new Set([...tiers, tier].map((item) => item.minTotalEarnedPoints))]
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  const rank = sortedThresholds.indexOf(tier.minTotalEarnedPoints);

  return membershipTierTones[Math.min(Math.max(rank, 0), membershipTierTones.length - 1)];
}

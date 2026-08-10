import { describe, expect, it } from 'vitest';

import type { MembershipTier } from '@/features/shared/loyalty/types/loyalty.types';
import { getMembershipTierTone } from '@/features/shared/loyalty/utils/membership-tier-tone';

const tier = (name: string, points: number): MembershipTier => ({
  _id: name,
  name,
  minTotalEarnedPoints: points,
});

describe('getMembershipTierTone', () => {
  it('uses point order instead of tier name or input order', () => {
    const starter = tier('Tên tùy chỉnh A', 0);
    const middle = tier('Tên tùy chỉnh B', 500);
    const top = tier('Tên tùy chỉnh C', 1000);
    const tiers = [top, starter, middle];

    expect(getMembershipTierTone(starter, tiers)).toBe('bronze');
    expect(getMembershipTierTone(middle, tiers)).toBe('silver');
    expect(getMembershipTierTone(top, tiers)).toBe('gold');
  });

  it('uses the highest tone for the fifth and any later ranks', () => {
    const tiers = Array.from({ length: 7 }, (_, index) => tier(`Hạng ${index}`, index * 100));

    expect(getMembershipTierTone(tiers[3], tiers)).toBe('emerald');
    expect(getMembershipTierTone(tiers[4], tiers)).toBe('violet');
    expect(getMembershipTierTone(tiers[6], tiers)).toBe('violet');
  });

  it('returns neutral when no tier is available', () => {
    expect(getMembershipTierTone(null, [])).toBe('neutral');
    expect(getMembershipTierTone(undefined, [])).toBe('neutral');
  });
});

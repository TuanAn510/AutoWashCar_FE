import { describe, expect, it } from 'vitest';

import {
  calculateBaseServiceRewardPoints,
  calculateServiceRewardPoints,
  formatServiceRewardMultiplier,
  SERVICE_REWARD_MULTIPLIER_OPTIONS,
} from '@/lib/service-reward-points';

describe('service reward points', () => {
  it('awards one base point for each complete 10,000 VND', () => {
    expect(calculateBaseServiceRewardPoints(9_999)).toBe(0);
    expect(calculateBaseServiceRewardPoints(10_000)).toBe(1);
    expect(calculateBaseServiceRewardPoints(19_999)).toBe(1);
    expect(calculateBaseServiceRewardPoints(850_000)).toBe(85);
  });

  it('applies the service multiplier after calculating base points', () => {
    expect(calculateServiceRewardPoints(850_000, 1)).toBe(85);
    expect(calculateServiceRewardPoints(850_000, 2)).toBe(170);
    expect(formatServiceRewardMultiplier(2)).toBe('×2');
  });

  it('offers only whole-number multipliers to administrators', () => {
    expect(SERVICE_REWARD_MULTIPLIER_OPTIONS).toEqual([1, 2, 3, 4, 5]);
  });
});

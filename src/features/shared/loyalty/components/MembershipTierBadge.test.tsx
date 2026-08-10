// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { MembershipTierBadge } from '@/features/shared/loyalty/components/MembershipTierBadge';
import type { MembershipTier } from '@/features/shared/loyalty/types/loyalty.types';

afterEach(cleanup);

const tiers: MembershipTier[] = [
  { _id: 'starter', name: 'Khởi đầu', minTotalEarnedPoints: 0 },
  { _id: 'premium', name: 'Cao cấp', minTotalEarnedPoints: 1000 },
];

describe('MembershipTierBadge', () => {
  it('renders the tier, its tone, icon and custom class', () => {
    const { container } = render(
      <MembershipTierBadge tier={tiers[1]} tiers={tiers} className="rounded-full" />
    );
    const badge = screen.getByText('Cao cấp');

    expect(badge.className).toContain('bg-slate-100');
    expect(badge.className).toContain('rounded-full');
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('renders the neutral fallback and can hide the icon', () => {
    const { container } = render(<MembershipTierBadge tier={null} showIcon={false} />);
    const badge = screen.getByText('Chưa có hạng');

    expect(badge.className).toContain('bg-slate-50');
    expect(container.querySelector('svg')).toBeNull();
  });
});

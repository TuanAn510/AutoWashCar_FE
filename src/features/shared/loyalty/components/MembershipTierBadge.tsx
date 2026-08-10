import { Trophy } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import type { MembershipTier } from '@/features/shared/loyalty/types/loyalty.types';
import {
  getMembershipTierTone,
  type MembershipTierTone,
} from '@/features/shared/loyalty/utils/membership-tier-tone';
import { cn } from '@/lib/utils';

const toneClassNames: Record<MembershipTierTone, string> = {
  neutral: 'border-slate-200 bg-slate-50 text-slate-700',
  bronze: 'border-orange-200 bg-orange-50 text-orange-800',
  silver: 'border-slate-300 bg-slate-100 text-slate-700',
  gold: 'border-amber-300 bg-amber-50 text-amber-800',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  violet: 'border-violet-200 bg-violet-50 text-violet-700',
};

export function MembershipTierBadge({
  tier,
  tiers = [],
  showIcon = true,
  className,
}: {
  tier?: MembershipTier | null;
  tiers?: MembershipTier[];
  showIcon?: boolean;
  className?: string;
}) {
  const tone = getMembershipTierTone(tier, tiers);

  return (
    <Badge className={cn('font-semibold', toneClassNames[tone], className)}>
      {showIcon ? <Trophy aria-hidden="true" /> : null}
      {tier?.name ?? 'Chưa có hạng'}
    </Badge>
  );
}

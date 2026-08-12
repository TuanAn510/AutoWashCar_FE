import { CheckCircle2, CircleDollarSign, Clock3, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AppointmentPaymentStatus } from '@/types/appointment';

const paymentStatusLabels: Record<AppointmentPaymentStatus, string> = {
  unpaid: 'Chưa thanh toán',
  paid: 'Đã thanh toán',
  cancelled: 'Đã hủy thanh toán',
  pending: 'Đang xử lý',
};

const statusVariant: Record<
  AppointmentPaymentStatus,
  React.ComponentProps<typeof Badge>['variant']
> = {
  unpaid: 'neutral',
  paid: 'success',
  cancelled: 'neutral',
  pending: 'warning',
};

const statusIcons = {
  unpaid: CircleDollarSign,
  paid: CheckCircle2,
  cancelled: XCircle,
  pending: Clock3,
} satisfies Record<AppointmentPaymentStatus, React.ComponentType<{ className?: string }>>;

export function PaymentStatusBadge({
  status,
  className,
}: {
  status: AppointmentPaymentStatus;
  className?: string;
}) {
  const Icon = statusIcons[status];

  return (
    <Badge variant={statusVariant[status]} className={cn('rounded-full px-3 py-1', className)}>
      <Icon className="size-3.5" />
      {paymentStatusLabels[status]}
    </Badge>
  );
}

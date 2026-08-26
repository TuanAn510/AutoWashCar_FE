import { CheckCircle2, CircleDollarSign, Clock3, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AppointmentPaymentStatus } from '@/types/appointment';

const paymentStatusLabels: Record<AppointmentPaymentStatus, string> = {
  unpaid: 'Chưa thanh toán',
  paid: 'Đã thanh toán',
  cancelled: 'Chưa thanh toán',
  pending: 'Chờ thanh toán',
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
  refundRequired = false,
}: {
  status: AppointmentPaymentStatus;
  className?: string;
  refundRequired?: boolean;
}) {
  const Icon = refundRequired ? Clock3 : statusIcons[status];
  const label = refundRequired ? 'Chờ hoàn tiền' : paymentStatusLabels[status];
  const variant = refundRequired ? 'warning' : statusVariant[status];

  return (
    <Badge variant={variant} className={cn('rounded-full px-3 py-1', className)}>
      <Icon className="size-3.5" />
      {label}
    </Badge>
  );
}

import { Badge } from '@/components/ui/badge';

import type { AppointmentStatus } from '@/types/appointment';

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  in_queue: 'Đã check-in',
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  in_progress: 'Đang thực hiện',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

const badgeVariant: Record<AppointmentStatus, React.ComponentProps<typeof Badge>['variant']> = {
  in_queue: 'secondary',
  pending: 'warning',
  confirmed: 'info',
  in_progress: 'secondary',
  completed: 'success',
  cancelled: 'danger',
};

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <Badge variant={badgeVariant[status]} className="rounded-full px-2.5 py-1 font-semibold">
      {appointmentStatusLabels[status]}
    </Badge>
  );
}

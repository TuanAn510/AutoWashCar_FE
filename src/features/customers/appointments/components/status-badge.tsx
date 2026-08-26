import { Badge } from '@/components/ui/badge';

import { type AppointmentStatus, appointmentStatusLabels } from '../data/mock-appointments';

const badgeVariant: Record<AppointmentStatus, React.ComponentProps<typeof Badge>['variant']> = {
  scheduled: 'info',
  'checked-in': 'info',
  'in-progress': 'warning',
  completed: 'success',
  cancelled: 'danger',
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <Badge variant={badgeVariant[status]} className="rounded-full px-2.5 py-1 font-semibold">
      {appointmentStatusLabels[status]}
    </Badge>
  );
}

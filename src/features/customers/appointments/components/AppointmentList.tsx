import type { AppointmentItem } from '@/types/appointment';
import { AppointmentCard } from '@/features/customers/appointments/components/AppointmentCard';

export function AppointmentList({
  appointments,
  onViewDetail,
  onCancel,
  onPay,
}: {
  appointments: AppointmentItem[];
  onViewDetail: (appointment: AppointmentItem) => void;
  onCancel: (appointment: AppointmentItem) => void;
  onPay: (appointment: AppointmentItem) => void;
}) {
  return (
    <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment._id}
          appointment={appointment}
          onViewDetail={onViewDetail}
          onCancel={onCancel}
          onPay={onPay}
        />
      ))}
    </div>
  );
}

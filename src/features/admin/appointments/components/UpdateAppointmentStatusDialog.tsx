import { Button } from '@/components/ui/button';
import { getAllowedAdminAppointmentStatuses } from '@/features/admin/appointments/constants/appointmentStatus';
import {
  AppointmentStatusBadge,
  appointmentStatusLabels,
} from '@/features/customers/appointments/components/AppointmentStatusBadge';
import type { AppointmentItem, AppointmentStatus } from '@/types/appointment';
import { CustomerModalShell } from '@/features/customers/components/CustomerModalShell';

export function UpdateAppointmentStatusDialog({
  appointment,
  open,
  nextStatus,
  isSubmitting,
  onOpenChange,
  onNextStatusChange,
  onConfirm,
}: {
  appointment: AppointmentItem | null;
  open: boolean;
  nextStatus: AppointmentStatus | '';
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onNextStatusChange: (value: AppointmentStatus | '') => void;
  onConfirm: () => Promise<void> | void;
}) {
  if (!appointment) {
    return null;
  }

  const allowedStatuses = getAllowedAdminAppointmentStatuses(appointment.status);

  return (
    <CustomerModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="Cập nhật trạng thái lịch hẹn"
      description="Admin có thể cập nhật trạng thái theo đúng luồng xử lý của hệ thống."
      contentClassName="max-w-[720px]"
      bodyClassName="grid gap-4"
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button type="button" onClick={onConfirm} disabled={isSubmitting || !nextStatus}>
            {isSubmitting
              ? 'Đang cập nhật...'
              : nextStatus === 'completed'
                ? 'Hoàn thành & thanh toán'
                : 'Cập nhật'}
          </Button>
        </>
      }
    >
      <div className="rounded-2xl bg-slate-50 p-4">
        <p className="font-semibold text-slate-950">{appointment.customerId.displayName}</p>
        <p className="mt-1 text-sm text-slate-500">{appointment.vehicleId.licensePlate}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Trạng thái hiện tại
          </p>
          <div className="mt-3">
            <AppointmentStatusBadge status={appointment.status} />
          </div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Trạng thái mới
          </p>
          <select
            className="mt-3 h-11 w-full rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-primary/40"
            value={nextStatus}
            onChange={(event) => onNextStatusChange(event.target.value as AppointmentStatus | '')}
            disabled={!allowedStatuses.length || isSubmitting}
          >
            <option value="">Chọn trạng thái mới</option>
            {allowedStatuses.map((status) => (
              <option key={status} value={status}>
                {appointmentStatusLabels[status]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </CustomerModalShell>
  );
}

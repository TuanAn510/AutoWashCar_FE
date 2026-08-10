import { Button } from '@/components/ui/button';
import { AppointmentStatusBadge } from '@/features/customers/appointments/components/AppointmentStatusBadge';
import type { AppointmentItem, AppointmentStatus } from '@/types/appointment';
import { CustomerModalShell } from '@/features/customers/components/CustomerModalShell';
import {
  getAllowedStaffAppointmentStatuses,
  STAFF_APPOINTMENT_STATUS_OPTION_LABELS,
} from '@/features/staff/appointments/constants/appointmentStatus';

const dialogCopy = {
  title: '\u0043\u1eadp nh\u1eadt tr\u1ea1ng th\u00e1i l\u1ecbch h\u1eb9n',
  description:
    '\u0043h\u1ec9 hi\u1ec3n th\u1ecb c\u00e1c tr\u1ea1ng th\u00e1i h\u1ee3p l\u1ec7 theo lu\u1ed3ng x\u1eed l\u00fd d\u00e0nh cho nh\u00e2n vi\u00ean.',
  close: '\u0110\u00f3ng',
  submitting: '\u0110ang c\u1eadp nh\u1eadt...',
  submit: '\u0043\u1eadp nh\u1eadt',
  completeAndPay: 'Hoàn thành & thanh toán',
  currentStatus: 'Tr\u1ea1ng th\u00e1i hi\u1ec7n t\u1ea1i',
  nextStatus: 'Tr\u1ea1ng th\u00e1i m\u1edbi',
  placeholder: 'Ch\u1ecdn tr\u1ea1ng th\u00e1i m\u1edbi',
  noMoreTransitions:
    'L\u1ecbch h\u1eb9n n\u00e0y kh\u00f4ng c\u00f2n tr\u1ea1ng th\u00e1i n\u00e0o nh\u00e2n vi\u00ean c\u00f3 th\u1ec3 c\u1eadp nh\u1eadt.',
} as const;

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

  const allowedStatuses = getAllowedStaffAppointmentStatuses(appointment.status);

  return (
    <CustomerModalShell
      open={open}
      onOpenChange={onOpenChange}
      title={dialogCopy.title}
      description={dialogCopy.description}
      contentClassName="max-w-[720px]"
      bodyClassName="grid gap-4"
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {dialogCopy.close}
          </Button>
          <Button type="button" onClick={onConfirm} disabled={isSubmitting || !nextStatus}>
            {isSubmitting
              ? dialogCopy.submitting
              : nextStatus === 'completed'
                ? dialogCopy.completeAndPay
                : dialogCopy.submit}
          </Button>
        </>
      }
    >
      <div className="rounded-2xl bg-slate-50 p-4">
        <p className="font-semibold text-slate-950">{appointment.customerId.displayName}</p>
        <p className="mt-1 text-sm text-slate-500">
          {appointment.vehicleId.brand} {appointment.vehicleId.model} -{' '}
          {appointment.vehicleId.licensePlate}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            {dialogCopy.currentStatus}
          </p>
          <div className="mt-3">
            <AppointmentStatusBadge status={appointment.status} />
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            {dialogCopy.nextStatus}
          </p>
          <select
            className="mt-3 h-11 w-full rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-primary/40"
            value={nextStatus}
            onChange={(event) => onNextStatusChange(event.target.value as AppointmentStatus | '')}
            disabled={!allowedStatuses.length || isSubmitting}
          >
            <option value="">{dialogCopy.placeholder}</option>
            {allowedStatuses.map((status) => (
              <option key={status} value={status}>
                {STAFF_APPOINTMENT_STATUS_OPTION_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!allowedStatuses.length ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
          {dialogCopy.noMoreTransitions}
        </div>
      ) : null}
    </CustomerModalShell>
  );
}

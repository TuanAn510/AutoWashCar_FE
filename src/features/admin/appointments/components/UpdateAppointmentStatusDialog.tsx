import { useId, useState } from 'react';

import { Button } from '@/components/ui/button';
import { getAllowedAdminAppointmentStatuses } from '@/features/admin/appointments/constants/appointmentStatus';
import {
  AppointmentStatusBadge,
  appointmentStatusLabels,
} from '@/features/customers/appointments/components/AppointmentStatusBadge';
import type { AppointmentItem, AppointmentStatus } from '@/types/appointment';
import { CustomerModalShell } from '@/features/customers/components/CustomerModalShell';

const dialogCopy = {
  title: 'C\u1eadp nh\u1eadt tr\u1ea1ng th\u00e1i l\u1ecbch h\u1eb9n',
  description:
    'Admin c\u00f3 th\u1ec3 c\u1eadp nh\u1eadt tr\u1ea1ng th\u00e1i theo \u0111\u00fang lu\u1ed3ng x\u1eed l\u00fd c\u1ee7a h\u1ec7 th\u1ed1ng.',
  close: '\u0110\u00f3ng',
  submitting: '\u0110ang c\u1eadp nh\u1eadt...',
  submit: 'C\u1eadp nh\u1eadt',
  completeAndPay: 'Ho\u00e0n th\u00e0nh & thanh to\u00e1n',
  currentStatus: 'Tr\u1ea1ng th\u00e1i hi\u1ec7n t\u1ea1i',
  nextStatus: 'Tr\u1ea1ng th\u00e1i m\u1edbi',
  placeholder: 'Ch\u1ecdn tr\u1ea1ng th\u00e1i m\u1edbi',
  evidenceLabel: '\u1ea2nh x\u00e1c nh\u1eadn',
  checkInHint: 'Ch\u1ee5p \u1ea3nh xe t\u1ea1i th\u1eddi \u0111i\u1ec3m check-in.',
  completedHint:
    'Ch\u1ee5p \u1ea3nh k\u1ebft qu\u1ea3 sau khi ho\u00e0n th\u00e0nh d\u1ecbch v\u1ee5.',
} as const;

const requiresEvidence = (status: AppointmentStatus | '') =>
  status === 'in_queue' || status === 'completed';

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
  onConfirm: (evidenceImage?: File | null) => Promise<void> | void;
}) {
  const evidenceInputId = useId();
  const [evidenceImage, setEvidenceImage] = useState<File | null>(null);

  if (!appointment) {
    return null;
  }

  const allowedStatuses = getAllowedAdminAppointmentStatuses(appointment.status);
  const evidenceRequired = requiresEvidence(nextStatus);
  const submitDisabled = isSubmitting || !nextStatus || (evidenceRequired && !evidenceImage);

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
          <Button type="button" onClick={() => onConfirm(evidenceImage)} disabled={submitDisabled}>
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
        <p className="mt-1 text-sm text-slate-500">{appointment.vehicleId.licensePlate}</p>
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
                {appointmentStatusLabels[status]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {evidenceRequired ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <label
            htmlFor={evidenceInputId}
            className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400"
          >
            {dialogCopy.evidenceLabel} <span className="text-rose-500">*</span>
          </label>
          <input
            id={evidenceInputId}
            type="file"
            accept="image/*"
            className="mt-3 block w-full rounded-xl border border-input bg-white px-3 py-2 text-sm"
            disabled={isSubmitting}
            onChange={(event) => setEvidenceImage(event.target.files?.[0] ?? null)}
          />
          <p className="mt-2 text-xs text-slate-500">
            {nextStatus === 'in_queue' ? dialogCopy.checkInHint : dialogCopy.completedHint}
          </p>
        </div>
      ) : null}
    </CustomerModalShell>
  );
}

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import type { AppointmentItem } from '@/types/appointment';
import { CustomerModalShell } from '@/features/customers/components/CustomerModalShell';
import { formatLicensePlateDisplay } from '@/features/customers/vehicles/utils/license-plate';

export function CancelAppointmentDialog({
  appointment,
  open,
  isSubmitting,
  onOpenChange,
  onConfirm,
}: {
  appointment: AppointmentItem | null;
  open: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (cancelReason?: string) => Promise<void> | void;
}) {
  const [cancelReason, setCancelReason] = useState('');

  if (!appointment) {
    return null;
  }

  const trimmedReason = cancelReason.trim();
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setCancelReason('');
    }
    onOpenChange(nextOpen);
  };

  return (
    <CustomerModalShell
      open={open}
      onOpenChange={handleOpenChange}
      title="Hủy lịch hẹn này?"
      description="Lịch hẹn sẽ được chuyển sang trạng thái đã hủy. Vui lòng nhập lý do để tiếp tục."
      contentClassName="max-w-[720px]"
      bodyClassName="grid gap-4"
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Đóng
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => onConfirm(trimmedReason)}
            disabled={isSubmitting || !trimmedReason}
          >
            {isSubmitting ? 'Đang hủy...' : 'Hủy lịch hẹn'}
          </Button>
        </>
      }
    >
      <div className="rounded-lg bg-slate-50 p-4">
        <p className="font-semibold text-slate-950">{appointment.customerId.displayName}</p>
        <p className="mt-1 text-sm text-slate-500">
          {appointment.vehicleId.brand} {appointment.vehicleId.model} -{' '}
          {formatLicensePlateDisplay(appointment.vehicleId.licensePlate)}
        </p>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-900">Lý do hủy</span>
        <textarea
          className="min-h-28 rounded-md border border-input bg-white px-3 py-2 text-sm outline-none focus:border-primary/40"
          placeholder="Ví dụ: Khách yêu cầu hủy lịch."
          value={cancelReason}
          onChange={(event) => setCancelReason(event.target.value)}
          disabled={isSubmitting}
        />
        {!trimmedReason ? (
          <span className="text-xs text-rose-600">Vui lòng nhập lý do hủy lịch.</span>
        ) : null}
      </label>
    </CustomerModalShell>
  );
}

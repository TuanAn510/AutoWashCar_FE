import { useState } from 'react';

import { Button } from '@/components/ui/button';
import type { AppointmentItem } from '@/types/appointment';
import { CustomerModalShell } from '@/features/customers/components/CustomerModalShell';

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

  const serviceNames = appointment.services.map((service) => service.nameSnapshot).join(', ');

  return (
    <CustomerModalShell
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setCancelReason('');
        }
        onOpenChange(nextOpen);
      }}
      title="Hủy lịch hẹn"
      description="Bạn có chắc muốn hủy lịch hẹn này không?"
      contentClassName="max-w-[720px]"
      bodyClassName="grid gap-4"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-44"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Giữ lịch
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="w-full sm:w-44"
            onClick={() => onConfirm(cancelReason)}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang hủy...' : 'Hủy lịch hẹn'}
          </Button>
        </>
      }
    >
      <div className="rounded-xl border border-[#e5edf6] bg-slate-50 p-4">
        <p className="font-black text-[#15243a]">{serviceNames}</p>
        <p className="mt-1 text-sm text-[#64748b]">Xe {appointment.vehicleId.licensePlate}</p>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-black text-[#15243a]">Lý do hủy lịch (không bắt buộc)</span>
        <textarea
          className="min-h-28 rounded-md border border-[#d8e2ef] bg-white px-3 py-2 text-sm outline-none focus:border-[#0b67c2]"
          placeholder="Ví dụ: Tôi cần đổi sang khung giờ khác."
          value={cancelReason}
          onChange={(event) => setCancelReason(event.target.value)}
          disabled={isSubmitting}
        />
      </label>
    </CustomerModalShell>
  );
}

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import type { AppointmentItem } from '@/types/appointment';
import { CustomerModalShell } from '@/features/customers/components/CustomerModalShell';

interface RescheduleAppointmentDialogProps {
  appointment: AppointmentItem | null;
  open: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (scheduledAt: string) => Promise<void> | void;
}

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toTimeInputValue = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export function RescheduleAppointmentDialog({
  appointment,
  open,
  isSubmitting,
  onOpenChange,
  onConfirm,
}: RescheduleAppointmentDialogProps) {
  if (!appointment) {
    return null;
  }

  return (
    <RescheduleAppointmentDialogContent
      key={`${appointment._id}-${open}`}
      appointment={appointment}
      open={open}
      isSubmitting={isSubmitting}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
    />
  );
}

function RescheduleAppointmentDialogContent({
  appointment,
  open,
  isSubmitting,
  onOpenChange,
  onConfirm,
}: RescheduleAppointmentDialogProps & { appointment: AppointmentItem }) {
  const currentDate = new Date(appointment.scheduledAt);
  const [scheduledDate, setScheduledDate] = useState(() => toDateInputValue(currentDate));
  const [scheduledTime, setScheduledTime] = useState(() => toTimeInputValue(currentDate));

  const nextDateTime =
    scheduledDate && scheduledTime ? new Date(`${scheduledDate}T${scheduledTime}`) : null;
  const isInvalidDateTime =
    !nextDateTime ||
    Number.isNaN(nextDateTime.getTime()) ||
    nextDateTime < new Date(Date.now() + 30 * 60 * 1000);

  return (
    <CustomerModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="Đổi lịch hẹn"
      description="Chọn thời gian mới phù hợp cho lịch hẹn này."
      contentClassName="max-w-[720px]"
      bodyClassName="grid gap-4"
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button
            type="button"
            onClick={() => onConfirm(`${scheduledDate}T${scheduledTime}:00`)}
            disabled={isSubmitting || isInvalidDateTime}
          >
            {isSubmitting ? 'Đang đổi lịch...' : 'Cập nhật lịch'}
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
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-900">Ngày hẹn mới</span>
          <DatePicker
            className="h-11 rounded-xl"
            value={scheduledDate}
            onChange={setScheduledDate}
            disabled={isSubmitting}
            disabledDates={{ before: new Date() }}
            placeholder="Chọn ngày hẹn mới"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-900">Giờ hẹn mới</span>
          <input
            type="time"
            className="h-11 rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-primary/40"
            value={scheduledTime}
            onChange={(event) => setScheduledTime(event.target.value)}
            disabled={isSubmitting}
          />
        </label>
      </div>

      {isInvalidDateTime ? (
        <p className="text-sm text-rose-600">Thời gian hẹn mới phải cách hiện tại ít nhất 30 phút.</p>
      ) : null}
    </CustomerModalShell>
  );
}

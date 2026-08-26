import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { CustomerModalShell } from '@/features/customers/components/CustomerModalShell';
import { formatLicensePlateDisplay } from '@/features/customers/vehicles/utils/license-plate';
import { adminAppointmentsApi } from '@/services/appointmentService';
import type { AppointmentItem, BookingAvailabilitySlot } from '@/types/appointment';

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

const unavailableReasonLabel: Record<string, string> = {
  PAST: 'Đã qua',
  LEAD_TIME: 'Cần đặt trước 30 phút',
  CAPACITY_FULL: 'Hết vị trí rửa',
  VEHICLE_OVERLAP: 'Trùng lịch của xe',
  NO_STAFF: 'Chưa có nhân viên',
};

const timePart = (dateTime: string) => dateTime.slice(11, 16);

const slotLabel = (slot: BookingAvailabilitySlot) => {
  const interval = `${timePart(slot.startAt)} - ${timePart(slot.endAt)}`;
  return slot.available
    ? interval
    : `${interval} - ${unavailableReasonLabel[slot.reason ?? ''] ?? slot.reason ?? 'Không khả dụng'}`;
};

export function RescheduleAppointmentDialog({
  appointment,
  open,
  isSubmitting,
  onOpenChange,
  onConfirm,
}: RescheduleAppointmentDialogProps) {
  if (!appointment) return null;

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
  const [minimumDate] = useState(() => new Date());
  const [slots, setSlots] = useState<BookingAvailabilitySlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !scheduledDate) {
      setSlots([]);
      return;
    }
    const controller = new AbortController();
    setIsLoadingSlots(true);
    setAvailabilityError(null);
    adminAppointmentsApi
      .getRescheduleAvailability(appointment._id, scheduledDate, controller.signal)
      .then((availability) => setSlots(availability.slots))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setSlots([]);
          setAvailabilityError(error instanceof Error ? error.message : 'Không thể tải khung giờ.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingSlots(false);
      });
    return () => controller.abort();
  }, [appointment._id, open, scheduledDate]);

  const selectedSlot = slots.find((slot) => timePart(slot.startAt) === scheduledTime);

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
            disabled={isSubmitting || isLoadingSlots || !selectedSlot?.available}
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
          {formatLicensePlateDisplay(appointment.vehicleId.licensePlate)}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-900">Ngày hẹn mới</span>
          <DatePicker
            className="h-11 rounded-xl"
            value={scheduledDate}
            onChange={(value) => {
              setScheduledDate(value);
              setScheduledTime('');
            }}
            disabled={isSubmitting}
            disabledDates={{ before: minimumDate }}
            placeholder="Chọn ngày hẹn mới"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-900">Giờ hẹn mới</span>
          <select
            aria-label="Giờ hẹn mới"
            className="h-11 rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-primary/40"
            value={scheduledTime}
            onChange={(event) => setScheduledTime(event.target.value)}
            disabled={isSubmitting || isLoadingSlots || !scheduledDate}
          >
            <option value="">{isLoadingSlots ? 'Đang tải khung giờ...' : 'Chọn khung giờ'}</option>
            {slots.map((slot) => (
              <option key={slot.startAt} value={timePart(slot.startAt)} disabled={!slot.available}>
                {slotLabel(slot)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {availabilityError ? <p className="text-sm text-rose-600">{availabilityError}</p> : null}
    </CustomerModalShell>
  );
}

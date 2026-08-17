import { CalendarClock, Clock3, Eye, NotebookPen, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AppointmentStatusBadge } from '@/features/customers/appointments/components/AppointmentStatusBadge';
import {
  canCustomerCancelAppointment,
  formatAppointmentServicesTitle,
  formatAppointmentVehicleLine,
} from '@/features/customers/appointments/utils/appointmentDisplay';
import { PaymentStatusBadge } from '@/components/shared/PaymentStatusBadge';
import { formatDateTime, formatPrice, formatTime } from '@/lib/utils';
import type { AppointmentItem } from '@/types/appointment';

const getAppointmentPriceDisplay = (appointment: AppointmentItem) => {
  const discountedPrice = appointment.finalAmount ?? appointment.totalPrice;
  const originalPrice =
    appointment.subtotalPrice ??
    appointment.services.reduce((total, service) => total + service.priceSnapshot, 0);

  return {
    discountedPrice,
    originalPrice,
    hasDiscount: originalPrice > discountedPrice,
  };
};

export function AppointmentCard({
  appointment,
  onViewDetail,
  onCancel,
}: {
  appointment: AppointmentItem;
  onViewDetail: (appointment: AppointmentItem) => void;
  onCancel: (appointment: AppointmentItem) => void;
}) {
  const canCancel = canCustomerCancelAppointment(appointment.status, appointment.paymentStatus);
  const note = appointment.note?.trim();
  const { discountedPrice, hasDiscount, originalPrice } = getAppointmentPriceDisplay(appointment);
  const createdAt = appointment.createdAt ? `Đặt lúc: ${formatDateTime(appointment.createdAt)}` : null;

  return (
    <Card
      size="sm"
      className="h-full min-w-0 gap-0 rounded-xl border border-[#e5edf6] bg-white py-0 shadow-[0_18px_44px_rgba(15,23,42,0.08)] transition-shadow hover:shadow-[0_24px_54px_rgba(15,23,42,0.12)]"
    >
      <CardHeader className="gap-3 border-b border-slate-100 px-4 py-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <CardTitle className="line-clamp-2 text-base font-black text-[#15243a]">
              {formatAppointmentServicesTitle(appointment.services)}
            </CardTitle>
            <p className="mt-1 truncate text-sm text-[#64748b]">
              {formatAppointmentVehicleLine(appointment)}
            </p>
            {createdAt ? (
              <span className="mt-1 inline-block rounded-full bg-[#fff3e6] px-2 py-0.5 text-xs font-semibold text-[#ff7a1a]">
                {createdAt}
              </span>
            ) : null}
          </div>
          <AppointmentStatusBadge status={appointment.status} />
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 px-4 py-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <InfoPill
            icon={CalendarClock}
            label="Thời gian hẹn"
            value={formatDateTime(appointment.scheduledAt, { weekday: 'short' })}
          />
          <InfoPill
            icon={Clock3}
            label="Thời lượng"
            value={formatTime(appointment.totalEstimatedDuration)}
          />
        </div>

        {note ? (
          <div className="flex min-w-0 gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-[#64748b]">
            <NotebookPen className="mt-0.5 size-4 shrink-0 text-slate-400" />
            <p className="line-clamp-2 leading-5">{note}</p>
          </div>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-[#64748b]">
            {appointment.services.length} dịch vụ
          </span>
          <PaymentStatusBadge status={appointment.paymentStatus} />
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#64748b]">
            Tổng thanh toán
          </p>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            {hasDiscount ? (
              <span className="text-sm font-semibold text-red-500 line-through decoration-red-400 decoration-2">
                {formatPrice(originalPrice)}
              </span>
            ) : null}
            <span className="text-lg font-black text-emerald-600">
              {formatPrice(discountedPrice)}
            </span>
          </div>
        </div>

        <div className="flex w-full gap-2 sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 rounded-md border-[#d8e2ef] font-semibold sm:flex-none"
            onClick={() => onViewDetail(appointment)}
          >
            <Eye className="size-4" />
            Chi tiết
          </Button>
          {canCancel ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 rounded-md border-rose-200 font-semibold text-rose-700 hover:bg-rose-50 hover:text-rose-800 sm:flex-none"
              onClick={() => onCancel(appointment)}
            >
              <XCircle className="size-4" />
              Hủy lịch
            </Button>
          ) : null}
        </div>
      </CardFooter>
    </Card>
  );
}

function InfoPill({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-lg bg-slate-50 px-3 py-2.5">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#64748b]">
        <Icon className="size-3.5 shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-1 truncate text-sm font-black text-[#15243a]" title={value}>
        {value}
      </p>
    </div>
  );
}

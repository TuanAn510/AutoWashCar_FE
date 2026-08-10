import { CarFront, Clock3, CreditCard, NotebookPen, UserRound } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AppointmentStatusBadge } from '@/features/customers/appointments/components/AppointmentStatusBadge';
import { AppointmentTimeMilestones } from '@/features/customers/appointments/components/AppointmentTimeMilestones';
import { PaymentStatusBadge } from '@/components/shared/PaymentStatusBadge';
import type { AppointmentItem } from '@/types/appointment';
import { CustomerModalShell } from '@/features/customers/components/CustomerModalShell';
import { formatPrice, formatTime } from '@/lib/utils';

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

export function AppointmentDetailDialog({
  appointment,
  open,
  onOpenChange,
}: {
  appointment: AppointmentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!appointment) {
    return null;
  }

  return (
    <CustomerModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="Chi tiết lịch hẹn của bạn"
      description="Xem lại thời gian hẹn, dịch vụ đã chọn và thông tin xe."
      headerAside={<AppointmentStatusBadge status={appointment.status} />}
      contentClassName="max-w-[1120px] sm:max-w-[1120px]"
      bodyClassName="grid gap-6"
      footer={
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-36"
          onClick={() => onOpenChange(false)}
        >
          Đóng
        </Button>
      }
    >
      <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-slate-950">
          {appointment.services.map((service) => service.nameSnapshot).join(', ')}
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Lịch hẹn được tạo cho xe {appointment.vehicleId.licensePlate}.
        </p>
      </section>

      <AppointmentTimeMilestones appointment={appointment} />

      <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <DetailItem
            icon={Clock3}
            label="Thời lượng dự kiến"
            value={formatTime(appointment.totalEstimatedDuration)}
          />
          <DetailItem
            icon={CarFront}
            label="Xe của bạn"
            value={`${appointment.vehicleId.brand} ${appointment.vehicleId.model}`}
          />
          <DetailItem icon={UserRound} label="Biển số" value={appointment.vehicleId.licensePlate} />
          <DetailItem
            icon={CreditCard}
            label="Tổng thanh toán"
            value={<PriceDisplay appointment={appointment} />}
          />
          <div className="min-w-0 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
              <CreditCard className="size-4" />
              Trạng thái thanh toán
            </div>
            <PaymentStatusBadge className="mt-2" status={appointment.paymentStatus} />
            <p className="mt-2 text-xs text-slate-500">
              {appointment.paymentMethod === 'cash' ? 'Tiền mặt tại gara' : 'Chưa chọn phương thức'}
            </p>
          </div>
          {appointment.promotionDiscountSnapshot?.discountAmount ? (
            <DetailItem
              icon={CreditCard}
              label={`Khuyến mãi (${appointment.promotionDiscountSnapshot.code})`}
              value={`-${formatPrice(appointment.promotionDiscountSnapshot.discountAmount)}`}
            />
          ) : null}
          {appointment.rewardDiscountSnapshot?.discountAmount ? (
            <DetailItem
              icon={CreditCard}
              label={`Phần thưởng (${appointment.rewardDiscountSnapshot.name})`}
              value={`-${formatPrice(appointment.rewardDiscountSnapshot.discountAmount)}`}
            />
          ) : null}
          <DetailItem
            icon={UserRound}
            label="Nhân viên phụ trách"
            value={appointment.assignedStaffId?.displayName || 'Sẽ được xác nhận sau'}
          />
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <NotebookPen className="size-4" />
          Ghi chú của bạn
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {appointment.note?.trim() || 'Bạn chưa để lại ghi chú cho lịch hẹn này.'}
        </p>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-white p-4 sm:p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
          Dịch vụ đã chọn
        </h3>
        <div className="mt-4 space-y-3">
          {appointment.services.map((service) => (
            <div
              key={service.serviceId}
              className="flex flex-col gap-2 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-slate-900">{service.nameSnapshot}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatTime(service.estimatedDurationSnapshot)}
                </p>
              </div>
              <p className="text-sm font-semibold text-slate-900">
                {formatPrice(service.priceSnapshot)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </CustomerModalShell>
  );
}

function PriceDisplay({ appointment }: { appointment: AppointmentItem }) {
  const { discountedPrice, hasDiscount, originalPrice } = getAppointmentPriceDisplay(appointment);

  return (
    <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      {hasDiscount ? (
        <span className="text-xs font-semibold text-red-500 line-through decoration-red-400 decoration-2">
          {formatPrice(originalPrice)}
        </span>
      ) : null}
      <span className="text-sm font-bold text-emerald-600">{formatPrice(discountedPrice)}</span>
    </span>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
        <Icon className="size-4" />
        {label}
      </div>
      <div className="mt-2 break-words text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

import { CarFront, Clock3, CreditCard, NotebookPen, Phone, UserRound } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AppointmentStatusBadge } from '@/features/customers/appointments/components/AppointmentStatusBadge';
import { AppointmentTimeMilestones } from '@/features/customers/appointments/components/AppointmentTimeMilestones';
import type { AppointmentItem } from '@/types/appointment';
import { CustomerModalShell } from '@/features/customers/components/CustomerModalShell';
import { formatPrice, formatTime } from '@/lib/utils';

const paymentStatusLabels: Record<AppointmentItem['paymentStatus'], string> = {
  unpaid: 'Chưa thanh toán',
  paid: 'Đã thanh toán',
  cancelled: 'Đã hủy thanh toán',
  pending: 'Đang xử lý',
};

const paymentMethodLabels: Record<NonNullable<AppointmentItem['paymentMethod']>, string> = {
  cash: 'Thanh toán tại gara',
  vnpay: 'VNPay',
  momo: 'Momo',
};

export function AdminAppointmentDetailDialog({
  appointment,
  open,
  onOpenChange,
  onConfirmPayment,
}: {
  appointment: AppointmentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmPayment?: (appointment: AppointmentItem) => void;
}) {
  if (!appointment) {
    return null;
  }

  return (
    <CustomerModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="Chi tiết lịch hẹn"
      description="Theo dõi toàn bộ thông tin khách hàng, xe, dịch vụ và tiến độ xử lý."
      headerAside={<AppointmentStatusBadge status={appointment.status} />}
      contentClassName="!max-w-[1040px]"
      bodyClassName="grid gap-6"
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          {onConfirmPayment &&
          appointment.status === 'completed' &&
          appointment.paymentStatus !== 'paid' ? (
            <Button type="button" onClick={() => onConfirmPayment(appointment)}>
              Xác nhận thanh toán
            </Button>
          ) : null}
        </>
      }
    >
      <section className="grid gap-4 md:grid-cols-2">
        <DetailTile
          icon={UserRound}
          label="Khách hàng"
          value={appointment.customerId.displayName}
          subValue={appointment.customerId.phone}
        />
        <DetailTile
          icon={Phone}
          label="Liên hệ"
          value={appointment.assignedStaffId?.phone || 'Chưa phân công'}
          subValue={appointment.assignedStaffId?.displayName}
        />
        <DetailTile
          icon={CarFront}
          label="Xe"
          value={`${appointment.vehicleId.brand} ${appointment.vehicleId.model}`}
          subValue={appointment.vehicleId.licensePlate}
        />
      </section>

      <AppointmentTimeMilestones appointment={appointment} />

      <section className="rounded-2xl border border-slate-200 p-5">
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

      <section className="grid gap-4 md:grid-cols-2">
        <DetailTile
          icon={Clock3}
          label="Tổng thời lượng"
          value={formatTime(appointment.totalEstimatedDuration)}
        />
        <DetailTile
          icon={CreditCard}
          label="Tạm tính"
          value={formatPrice(appointment.totalPrice)}
        />
        <DetailTile
          icon={CreditCard}
          label="Thanh toán"
          value={paymentStatusLabels[appointment.paymentStatus]}
        />
        <DetailTile
          icon={CreditCard}
          label="Hình thức"
          value={
            appointment.paymentMethod
              ? paymentMethodLabels[appointment.paymentMethod]
              : 'Chưa ghi nhận'
          }
        />
      </section>

      <section className="rounded-2xl bg-slate-50 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <NotebookPen className="size-4" />
          Ghi chú
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          {appointment.note?.trim() || 'Khách hàng chưa để lại ghi chú cho lịch hẹn này.'}
        </p>
        {appointment.cancelReason ? (
          <p className="mt-3 text-sm leading-6 text-rose-700">
            Lý do hủy: {appointment.cancelReason}
          </p>
        ) : null}
      </section>
    </CustomerModalShell>
  );
}

function DetailTile({
  icon: Icon,
  label,
  value,
  subValue,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
        <Icon className="size-4" />
        {label}
      </div>
      <p className="mt-2 break-words text-sm font-semibold text-slate-900">{value}</p>
      {subValue ? <p className="mt-1 text-sm text-slate-500">{subValue}</p> : null}
    </div>
  );
}

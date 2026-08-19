import { CarFront, Clock3, CreditCard, NotebookPen, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { AppointmentEvidenceImages } from '@/features/customers/appointments/components/AppointmentEvidenceImages';
import { AppointmentStatusBadge } from '@/features/customers/appointments/components/AppointmentStatusBadge';
import { AppointmentTimeMilestones } from '@/features/customers/appointments/components/AppointmentTimeMilestones';
import {
  CUSTOMER_REFUND_REQUIRED_MESSAGE,
  isCustomerRefundRequired,
} from '@/features/customers/appointments/utils/appointmentDisplay';
import { PaymentStatusBadge } from '@/components/shared/PaymentStatusBadge';
import type { AppointmentItem } from '@/types/appointment';
import { CustomerModalShell } from '@/features/customers/components/CustomerModalShell';
import { formatLicensePlateDisplay } from '@/features/customers/vehicles/utils/license-plate';
import { formatPrice, formatTime } from '@/lib/utils';

const paymentMethodLabel: Record<string, string> = {
  cash: 'Tiền mặt tại gara',
  vnpay: 'VNPay',
  momo: 'Momo',
};

function getPaymentMethodLabel(method: string) {
  return paymentMethodLabel[method] || 'Chưa chọn phương thức';
}

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
  const navigate = useNavigate();

  if (!appointment) {
    return null;
  }

  const canPay = appointment.paymentStatus === 'unpaid' || appointment.paymentStatus === 'pending';
  const assignedStaffs = appointment.assignedStaffIds?.length
    ? appointment.assignedStaffIds
    : appointment.assignedStaffId
      ? [appointment.assignedStaffId]
      : [];
  const assignedStaffNames = assignedStaffs.map((staff) => staff.displayName).join(', ');
  const licensePlate = formatLicensePlateDisplay(appointment.vehicleId.licensePlate);
  const requiresRefund = isCustomerRefundRequired(appointment);

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
        <div className="flex w-full gap-2 sm:w-auto">
          {canPay ? (
            <Button
              type="button"
              className="w-full rounded-md shadow-[0_12px_26px_rgba(11,103,194,0.24)] sm:w-auto"
              onClick={() => {
                onOpenChange(false);
                navigate(`/customer/payment/${appointment._id}`);
              }}
            >
              <CreditCard className="size-4" />
              Thanh toán
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-md sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>
        </div>
      }
    >
      <section className="rounded-xl border border-[#e5edf6] bg-slate-50 p-4 sm:p-5">
        <h3 className="text-lg font-black text-[#15243a]">
          {appointment.services.map((service) => service.nameSnapshot).join(', ')}
        </h3>
        <p className="mt-2 text-sm text-[#64748b]">
          Lịch hẹn được tạo cho xe {licensePlate}.
        </p>
      </section>

      <AppointmentTimeMilestones appointment={appointment} />

      <AppointmentEvidenceImages appointment={appointment} />

      {requiresRefund ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-800">
          {CUSTOMER_REFUND_REQUIRED_MESSAGE}
        </p>
      ) : null}

      <section className="rounded-xl border border-[#e5edf6] bg-slate-50 p-4 sm:p-5">
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
          <DetailItem icon={UserRound} label="Biển số" value={licensePlate} />
          <DetailItem
            icon={CreditCard}
            label="Tổng thanh toán"
            value={<PriceDisplay appointment={appointment} />}
          />
          <div className="min-w-0 rounded-lg bg-white p-4 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#64748b]">
              <CreditCard className="size-4" />
              Trạng thái thanh toán
            </div>
            <PaymentStatusBadge
              className="mt-2"
              status={appointment.paymentStatus}
              refundRequired={requiresRefund}
            />
            <p className="mt-2 text-xs text-[#64748b]">
              {getPaymentMethodLabel(appointment.paymentMethod)}
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
            value={assignedStaffNames || 'Sẽ được xác nhận sau'}
          />
        </div>
      </section>

      <section className="rounded-xl border border-[#e5edf6] bg-white p-4 sm:p-5">
        <div className="flex items-center gap-2 text-sm font-black text-[#15243a]">
          <NotebookPen className="size-4" />
          Ghi chú của bạn
        </div>
        <p className="mt-3 text-sm leading-6 text-[#64748b]">
          {appointment.note?.trim() || 'Bạn chưa để lại ghi chú cho lịch hẹn này.'}
        </p>
      </section>

      <section className="rounded-xl border border-[#e5edf6] bg-white p-4 sm:p-5">
        <h3 className="text-sm font-black uppercase tracking-[0.12em] text-[#0b67c2]">
          Dịch vụ đã chọn
        </h3>
        <div className="mt-4 space-y-3">
          {appointment.services.map((service) => (
            <div
              key={service.serviceId}
              className="flex flex-col gap-2 rounded-lg bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
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
    <div className="min-w-0 rounded-lg bg-white p-4 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#64748b]">
        <Icon className="size-4" />
        {label}
      </div>
      <div className="mt-2 break-words text-sm font-black text-[#15243a]">{value}</div>
    </div>
  );
}

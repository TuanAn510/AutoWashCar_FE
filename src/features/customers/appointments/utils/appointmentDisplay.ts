import type {
  AppointmentItem,
  AppointmentPaymentStatus,
  AppointmentServiceSnapshot,
  AppointmentStatus,
} from '@/types/appointment';
import { formatLicensePlateDisplay } from '@/features/customers/vehicles/utils/license-plate';

export const CUSTOMER_REFUND_REQUIRED_MESSAGE =
  'Lịch hẹn đã bị hủy do cửa hàng chưa xác nhận đúng hạn. Khoản thanh toán của bạn đang chờ được xử lý hoàn tiền.';

export const isAppointmentRefundRequired = (
  appointment: Pick<AppointmentItem, 'status' | 'refundRequired'>
) => appointment.status === 'cancelled' && appointment.refundRequired === true;

export const isCustomerRefundRequired = (
  appointment: Pick<AppointmentItem, 'status' | 'cancelReason' | 'refundRequired'>
) => isAppointmentRefundRequired(appointment) && appointment.cancelReason === 'store_not_confirmed';

export const canCustomerCancelAppointment = (
  status: AppointmentStatus | string,
  paymentStatus: AppointmentPaymentStatus | string,
  scheduledAt: string,
  now = Date.now()
) =>
  status === 'pending' &&
  paymentStatus !== 'paid' &&
  now < new Date(scheduledAt).getTime() - 30 * 60 * 1000;

export const canCustomerPayAppointment = (
  status: AppointmentStatus | string,
  paymentStatus: AppointmentPaymentStatus | string
) => !['pending', 'cancelled'].includes(status) && paymentStatus !== 'paid';

export const getAppointmentNote = (note?: string | null) =>
  note?.trim() ? note.trim() : 'Không có ghi chú';

export const formatAppointmentServicesTitle = (services: AppointmentServiceSnapshot[]) => {
  if (!services?.length) return 'Dịch vụ chưa xác định';

  const visible = services
    .slice(0, 2)
    .map((service) => service.nameSnapshot)
    .join(', ');
  const remaining = services.length - 2;

  return remaining > 0 ? `${visible} +${remaining} dịch vụ` : visible;
};

export const formatAppointmentVehicleLine = (appointment: AppointmentItem) =>
  `${appointment.vehicleId.brand} ${appointment.vehicleId.model} · ${formatLicensePlateDisplay(appointment.vehicleId.licensePlate)}`;

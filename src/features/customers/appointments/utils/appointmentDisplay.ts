import type {
  AppointmentItem,
  AppointmentPaymentStatus,
  AppointmentServiceSnapshot,
  AppointmentStatus,
} from '@/types/appointment';
import { formatLicensePlateDisplay } from '@/features/customers/vehicles/utils/license-plate';

export const canCustomerCancelAppointment = (
  status: AppointmentStatus | string,
  paymentStatus: AppointmentPaymentStatus | string,
  scheduledAt: string,
  now = Date.now()
) =>
  status === 'pending' &&
  paymentStatus !== 'paid' &&
  now < new Date(scheduledAt).getTime() - 30 * 60 * 1000;

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

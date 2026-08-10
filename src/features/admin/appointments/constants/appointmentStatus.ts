import type { AppointmentStatus } from '@/types/appointment';

export const ADMIN_APPOINTMENT_STATUS_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> =
  {
    pending: ['confirmed', 'in_progress', 'completed'],
    confirmed: ['pending', 'in_progress', 'completed'],
    in_progress: ['pending', 'confirmed', 'completed'],
    completed: [],
    cancelled: [],
  };

export const getAllowedAdminAppointmentStatuses = (status: AppointmentStatus) =>
  ADMIN_APPOINTMENT_STATUS_TRANSITIONS[status];

export const appointmentTimelineStatusLabels: Record<
  Exclude<AppointmentStatus, 'cancelled'>,
  string
> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  in_progress: 'Đang thực hiện',
  completed: 'Hoàn thành',
};

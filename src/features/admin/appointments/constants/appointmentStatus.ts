import type { AppointmentStatus } from '@/types/appointment';

export const ADMIN_APPOINTMENT_STATUS_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> =
  {
    pending: ['confirmed'],
    confirmed: ['in_queue'],
    in_queue: ['in_progress'],
    in_progress: ['completed'],
    completed: [],
    cancelled: [],
  };

export const getAllowedAdminAppointmentStatuses = (status: AppointmentStatus) =>
  ADMIN_APPOINTMENT_STATUS_TRANSITIONS[status];

export const appointmentTimelineStatusLabels: Record<
  Exclude<AppointmentStatus, 'cancelled'>,
  string
> = {
  in_queue: 'Đã check-in',
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  in_progress: 'Đang thực hiện',
  completed: 'Hoàn thành',
};

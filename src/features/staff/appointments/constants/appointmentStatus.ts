import type { AppointmentStatus } from '@/types/appointment';

export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const satisfies Record<string, AppointmentStatus>;

export const STAFF_APPOINTMENT_STATUS_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> =
  {
    [APPOINTMENT_STATUS.PENDING]: [APPOINTMENT_STATUS.CONFIRMED],
    [APPOINTMENT_STATUS.CONFIRMED]: [APPOINTMENT_STATUS.IN_PROGRESS],
    [APPOINTMENT_STATUS.IN_PROGRESS]: [APPOINTMENT_STATUS.COMPLETED],
    [APPOINTMENT_STATUS.COMPLETED]: [],
    [APPOINTMENT_STATUS.CANCELLED]: [],
  };

export const STAFF_APPOINTMENT_STATUS_OPTION_LABELS: Record<AppointmentStatus, string> = {
  [APPOINTMENT_STATUS.PENDING]: 'Ch\u1edd x\u00e1c nh\u1eadn',
  [APPOINTMENT_STATUS.CONFIRMED]: '\u0110\u00e3 x\u00e1c nh\u1eadn',
  [APPOINTMENT_STATUS.IN_PROGRESS]: '\u0110ang th\u1ef1c hi\u1ec7n',
  [APPOINTMENT_STATUS.COMPLETED]: 'Ho\u00e0n th\u00e0nh',
  [APPOINTMENT_STATUS.CANCELLED]: '\u0110\u00e3 h\u1ee7y',
};

export const getAllowedStaffAppointmentStatuses = (status: AppointmentStatus) =>
  STAFF_APPOINTMENT_STATUS_TRANSITIONS[status];

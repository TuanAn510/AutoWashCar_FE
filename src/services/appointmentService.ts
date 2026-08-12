import api from '@/api/client';
import type { ApiEnvelope, PaginatedEnvelope, PaginationParams } from '@/types/api';
import type {
  AdminAppointmentFilters,
  AppointmentItem,
  AppointmentStatusSummary,
  AssignStaffPayload,
  CancelAppointmentByAdminPayload,
  CancelAppointmentPayload,
  CreateAppointmentPayload,
  RescheduleAppointmentPayload,
  UpdateAppointmentPaymentStatusPayload,
  UpdateAppointmentStatusPayload,
} from '@/types/appointment';

export const appointmentApi = {
  async getMyAppointments(params?: PaginationParams, signal?: AbortSignal) {
    const response = await api.get<PaginatedEnvelope<AppointmentItem, AppointmentStatusSummary>>(
      '/appointments/my',
      {
        params,
        signal,
      }
    );

    return {
      appointments: response.data.data,
      pagination: response.data.pagination,
      summary: response.data.summary,
    };
  },

  async createAppointment(payload: CreateAppointmentPayload) {
    const response = await api.post<ApiEnvelope<AppointmentItem>>('/appointments', {
      vehicleId: payload.vehicleId,
      services: payload.services,
      scheduledAt: payload.scheduledAt,
      note: payload.note?.trim() || undefined,
      promotionId: payload.promotionId,
      rewardRedemptionId: payload.rewardRedemptionId,
    });

    return response.data.data;
  },

  async cancelMyAppointment({ appointmentId, cancelReason }: CancelAppointmentPayload) {
    const response = await api.patch<ApiEnvelope<AppointmentItem>>(
      `/appointments/my/${appointmentId}/cancel`,
      {
        cancelReason: cancelReason?.trim() || undefined,
      }
    );

    return response.data.data;
  },

  async getBookingAvailability(date: string, signal?: AbortSignal) {
    const response = await api.get<ApiEnvelope<Array<{ time: string; available: boolean }>>>(
      '/bookings/availability',
      { params: { date }, signal }
    );
    return response.data.data;
  },
};

export const adminAppointmentsApi = {
  async getAppointments(filters?: AdminAppointmentFilters, signal?: AbortSignal) {
    const response = await api.get<PaginatedEnvelope<AppointmentItem, AppointmentStatusSummary>>(
      '/appointments',
      {
        params: {
          ...filters,
        },
        signal,
      }
    );

    return {
      appointments: response.data.data,
      pagination: response.data.pagination,
      total: response.data.pagination?.total ?? response.data.data.length,
      summary: response.data.summary,
    };
  },

  async getAppointmentDetail(appointmentId: string, signal?: AbortSignal) {
    const response = await api.get<ApiEnvelope<AppointmentItem>>(`/appointments/${appointmentId}`, {
      signal,
    });
    return response.data.data;
  },

  async updateAppointmentStatus(appointmentId: string, payload: UpdateAppointmentStatusPayload) {
    const response = await api.patch<ApiEnvelope<AppointmentItem>>(
      `/appointments/${appointmentId}/status`,
      payload
    );
    return response.data.data;
  },

  async updatePaymentStatus(appointmentId: string, payload: UpdateAppointmentPaymentStatusPayload) {
    const response = await api.patch<ApiEnvelope<AppointmentItem>>(
      `/appointments/${appointmentId}/payment-status`,
      payload
    );
    return response.data.data;
  },

  async assignStaffToAppointment(appointmentId: string, payload: AssignStaffPayload) {
    const response = await api.patch<ApiEnvelope<AppointmentItem>>(
      `/appointments/${appointmentId}/assign-staff`,
      payload
    );
    return response.data.data;
  },

  async rescheduleAppointment(appointmentId: string, payload: RescheduleAppointmentPayload) {
    const response = await api.patch<ApiEnvelope<AppointmentItem>>(
      `/appointments/${appointmentId}/reschedule`,
      payload
    );
    return response.data.data;
  },

  async cancelAppointmentByAdmin(appointmentId: string, payload?: CancelAppointmentByAdminPayload) {
    const response = await api.patch<ApiEnvelope<AppointmentItem>>(
      `/appointments/${appointmentId}/cancel`,
      {
        cancelReason: payload?.cancelReason?.trim() || undefined,
      }
    );
    return response.data.data;
  },

  async getTodayBookings(signal?: AbortSignal) {
    const response = await api.get<ApiEnvelope<AppointmentItem[]>>('/admin/bookings/today', {
      signal,
    });
    return response.data.data;
  },

  async getPriorityQueue(signal?: AbortSignal) {
    const response = await api.get<ApiEnvelope<AppointmentItem[]>>(
      '/admin/bookings/priority-queue',
      {
        signal,
      }
    );
    return response.data.data;
  },
};

export const staffAppointmentsApi = {
  async getMyStaffAppointments(params?: AdminAppointmentFilters, signal?: AbortSignal) {
    const response = await api.get<PaginatedEnvelope<AppointmentItem, AppointmentStatusSummary>>(
      '/appointments/staff/my',
      {
        params,
        signal,
      }
    );

    return {
      appointments: response.data.data,
      pagination: response.data.pagination,
      total: response.data.pagination?.total ?? response.data.data.length,
      summary: response.data.summary,
    };
  },

  async updateAppointmentStatus(appointmentId: string, payload: UpdateAppointmentStatusPayload) {
    const response = await api.patch<ApiEnvelope<AppointmentItem>>(
      `/appointments/${appointmentId}/status`,
      payload
    );

    return response.data.data;
  },

  async confirmPayment(appointmentId: string, payload: UpdateAppointmentPaymentStatusPayload) {
    const response = await api.patch<ApiEnvelope<AppointmentItem>>(
      `/appointments/${appointmentId}/payment-status`,
      payload
    );
    return response.data.data;
  },
};

export const appointmentService = appointmentApi;

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getApiErrorMessage } from '@/api/errors';
import { queryKeys } from '@/constants/queryKeys';
import { adminAppointmentsApi } from '@/services/appointmentService';
import type {
  AssignStaffPayload,
  CancelAppointmentByAdminPayload,
  RescheduleAppointmentPayload,
  UpdateAppointmentStatusPayload,
  UpdateAppointmentPaymentStatusPayload,
} from '@/types/appointment';

const getErrorMessage = getApiErrorMessage;

const invalidateAdminAppointments = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.users.staffs.workload() }),
    queryClient.invalidateQueries({ queryKey: queryKeys.payments.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.appointments.mine() }),
    queryClient.invalidateQueries({ queryKey: queryKeys.appointments.staff.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.serviceHistories.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.loyalty.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.reports.all }),
  ]);
};

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      payload,
    }: {
      appointmentId: string;
      payload: UpdateAppointmentStatusPayload;
    }) => adminAppointmentsApi.updateAppointmentStatus(appointmentId, payload),
    onSuccess: async () => {
      await invalidateAdminAppointments(queryClient);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['booking-availability'] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.serviceHistories.admin.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.serviceHistories.staff() }),
      ]);
      toast.success('Đã cập nhật trạng thái');
    },
    onError: (error) => {
      toast.error(
        getErrorMessage(error, 'Không thể cập nhật trạng thái lịch hẹn. Vui lòng thử lại.')
      );
    },
  });
}

export function useConfirmAppointmentPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      appointmentId,
      payload,
    }: {
      appointmentId: string;
      payload: UpdateAppointmentPaymentStatusPayload;
    }) => adminAppointmentsApi.updatePaymentStatus(appointmentId, payload),
    onSuccess: async () => {
      await invalidateAdminAppointments(queryClient);
      toast.success('Đã xác nhận thanh toán thành công.');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Không thể xác nhận thanh toán.')),
  });
}

export function useAssignStaffToAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      payload,
    }: {
      appointmentId: string;
      payload: AssignStaffPayload;
    }) => adminAppointmentsApi.assignStaffToAppointment(appointmentId, payload),
    onSuccess: async () => {
      await invalidateAdminAppointments(queryClient);
      toast.success('Phân công nhân viên thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể phân công nhân viên. Vui lòng thử lại.'));
    },
  });
}

export function useRescheduleAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      payload,
    }: {
      appointmentId: string;
      payload: RescheduleAppointmentPayload;
    }) => adminAppointmentsApi.rescheduleAppointment(appointmentId, payload),
    onSuccess: async () => {
      await invalidateAdminAppointments(queryClient);
      await queryClient.invalidateQueries({ queryKey: ['booking-availability'] });
      toast.success('Đổi lịch hẹn thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể đổi lịch hẹn. Vui lòng thử lại.'));
    },
  });
}

export function useCancelAppointmentByAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      payload,
    }: {
      appointmentId: string;
      payload?: CancelAppointmentByAdminPayload;
    }) => adminAppointmentsApi.cancelAppointmentByAdmin(appointmentId, payload),
    onSuccess: async () => {
      await invalidateAdminAppointments(queryClient);
      await queryClient.invalidateQueries({ queryKey: ['booking-availability'] });
      toast.success('Hủy lịch hẹn thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể hủy lịch hẹn. Vui lòng thử lại.'));
    },
  });
}

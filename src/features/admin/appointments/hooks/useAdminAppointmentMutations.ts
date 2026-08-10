import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { adminAppointmentsApi } from '@/services/appointmentService';
import type {
  AssignStaffPayload,
  CancelAppointmentByAdminPayload,
  RescheduleAppointmentPayload,
  UpdateAppointmentStatusPayload,
  UpdateAppointmentPaymentStatusPayload,
} from '@/types/appointment';
import { adminAppointmentsQueryKey } from '@/features/admin/appointments/hooks/useAppointments';

const getErrorMessage = getApiErrorMessage;

const invalidateAdminAppointments = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: adminAppointmentsQueryKey }),
    queryClient.invalidateQueries({ queryKey: queryKeys.appointments.admin.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.users.staffs.workload() }),
    queryClient.invalidateQueries({ queryKey: queryKeys.payments.all }),
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
      toast.success('Hủy lịch hẹn thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể hủy lịch hẹn. Vui lòng thử lại.'));
    },
  });
}
import { getApiErrorMessage } from '@/api/errors';
import { queryKeys } from '@/constants/queryKeys';

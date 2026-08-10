import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { staffAppointmentsApi } from '@/services/appointmentService';
import type {
  UpdateAppointmentPaymentStatusPayload,
  UpdateAppointmentStatusPayload,
} from '@/types/appointment';
import { staffAppointmentsQueryKey } from '@/features/staff/appointments/hooks/useMyStaffAppointments';

const getErrorMessage = getApiErrorMessage;

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      payload,
    }: {
      appointmentId: string;
      payload: UpdateAppointmentStatusPayload;
    }) => staffAppointmentsApi.updateAppointmentStatus(appointmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffAppointmentsQueryKey });
      toast.success('Cập nhật trạng thái lịch hẹn thành công.');
    },
    onError: (error) => {
      toast.error(
        getErrorMessage(error, 'Không thể cập nhật trạng thái lịch hẹn. Vui lòng thử lại.')
      );
    },
  });
}

export function useConfirmStaffAppointmentPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      appointmentId,
      payload,
    }: {
      appointmentId: string;
      payload: UpdateAppointmentPaymentStatusPayload;
    }) => staffAppointmentsApi.confirmPayment(appointmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffAppointmentsQueryKey });
      toast.success('Đã xác nhận thanh toán thành công.');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Không thể xác nhận thanh toán.')),
  });
}

import { getApiErrorMessage } from '@/api/errors';

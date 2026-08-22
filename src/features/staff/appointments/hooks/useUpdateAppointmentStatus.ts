import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getApiErrorMessage } from '@/api/errors';
import { queryKeys } from '@/constants/queryKeys';
import { staffAppointmentsApi } from '@/services/appointmentService';
import type {
  UpdateAppointmentPaymentStatusPayload,
  UpdateAppointmentStatusPayload,
} from '@/types/appointment';

const getErrorMessage = getApiErrorMessage;

const invalidateStaffOperations = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.serviceHistories.staff() }),
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
    }) => staffAppointmentsApi.updateAppointmentStatus(appointmentId, payload),
    onSuccess: async () => {
      await invalidateStaffOperations(queryClient);
      toast.success('Cap nhat trang thai lich hen thanh cong.');
    },
    onError: (error) => {
      toast.error(
        getErrorMessage(error, 'Khong the cap nhat trang thai lich hen. Vui long thu lai.')
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
    onSuccess: async () => {
      await invalidateStaffOperations(queryClient);
      toast.success('Da xac nhan thanh toan thanh cong.');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Khong the xac nhan thanh toan.')),
  });
}

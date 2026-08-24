import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getApiErrorMessage } from '@/api/errors';
import { queryKeys } from '@/constants/queryKeys';
import { staffAppointmentsApi } from '@/services/appointmentService';
import type {
  UpdateAppointmentPaymentStatusPayload,
  UpdateAppointmentStatusPayload,
} from '@/types/appointment';
import { staffAppointmentsQueryKey } from '@/features/staff/appointments/hooks/useMyStaffAppointments';

const getErrorMessage = getApiErrorMessage;

const invalidateStaffOperations = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: staffAppointmentsQueryKey }),
    queryClient.invalidateQueries({ queryKey: queryKeys.serviceHistories.staff() }),
    queryClient.invalidateQueries({ queryKey: queryKeys.appointments.admin.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.appointments.mine() }),
    queryClient.invalidateQueries({ queryKey: queryKeys.payments.all }),
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

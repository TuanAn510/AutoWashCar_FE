import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { appointmentApi } from '@/services/appointmentService';
import type { CreateAppointmentPayload } from '@/types/appointment';
import { myAppointmentsQueryKey } from '@/features/customers/appointments/hooks/useMyAppointments';
import { rewardKeys } from '@/features/shared/loyalty/constants/query-keys';

const getErrorMessage = getApiErrorMessage;

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAppointmentPayload) => appointmentApi.createAppointment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myAppointmentsQueryKey });
      queryClient.invalidateQueries({ queryKey: rewardKeys.myRedemptions });
      queryClient.invalidateQueries({ queryKey: queryKeys.promotions.active() });
      toast.success('Đặt lịch thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể đặt lịch. Vui lòng thử lại.'));
    },
  });
}
import { getApiErrorMessage } from '@/api/errors';
import { queryKeys } from '@/constants/queryKeys';

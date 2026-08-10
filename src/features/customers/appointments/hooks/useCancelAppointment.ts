import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { appointmentApi } from '@/services/appointmentService';
import type { CancelAppointmentPayload } from '@/types/appointment';
import { myAppointmentsQueryKey } from '@/features/customers/appointments/hooks/useMyAppointments';

const getErrorMessage = getApiErrorMessage;

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CancelAppointmentPayload) => appointmentApi.cancelMyAppointment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myAppointmentsQueryKey });
      toast.success('Hủy lịch hẹn thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể hủy lịch hẹn. Vui lòng thử lại.'));
    },
  });
}
import { getApiErrorMessage } from '@/api/errors';

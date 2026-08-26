import { useQuery } from '@tanstack/react-query';

import { liveAppointmentQueryOptions } from '@/constants/appointment-query-options';
import { queryKeys } from '@/constants/queryKeys';
import { adminAppointmentsApi } from '@/services/appointmentService';

export function useAppointmentDetail(appointmentId?: string | null) {
  return useQuery({
    queryKey: queryKeys.appointments.admin.detail(appointmentId ?? ''),
    queryFn: ({ signal }) =>
      adminAppointmentsApi.getAppointmentDetail(appointmentId as string, signal),
    enabled: Boolean(appointmentId),
    ...liveAppointmentQueryOptions,
  });
}

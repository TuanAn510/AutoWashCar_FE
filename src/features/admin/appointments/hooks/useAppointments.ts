import { useQuery } from '@tanstack/react-query';

import { liveAppointmentQueryOptions } from '@/constants/appointment-query-options';
import { queryKeys } from '@/constants/queryKeys';
import { adminAppointmentsApi } from '@/services/appointmentService';
import type { AdminAppointmentFilters } from '@/types/appointment';

export const adminAppointmentsQueryKey = queryKeys.appointments.admin.all;

export function useAppointments(filters?: AdminAppointmentFilters, enabled = true) {
  return useQuery({
    queryKey: queryKeys.appointments.admin.list(filters),
    queryFn: ({ signal }) => adminAppointmentsApi.getAppointments(filters, signal),
    enabled,
    ...liveAppointmentQueryOptions,
  });
}

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { staffAppointmentsApi } from '@/services/appointmentService';
import type { AdminAppointmentFilters } from '@/types/appointment';

export const staffAppointmentsQueryKey = queryKeys.appointments.staff.all;

export function useMyStaffAppointments(params?: AdminAppointmentFilters) {
  return useQuery({
    queryKey: queryKeys.appointments.staff.mine(params),
    queryFn: ({ signal }) => staffAppointmentsApi.getMyStaffAppointments(params, signal),
  });
}

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { appointmentApi } from '@/services/appointmentService';
import type { PaginationParams } from '@/types/api';

export const myAppointmentsQueryKey = queryKeys.appointments.mine();

export function useMyAppointments(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.appointments.mine(params),
    queryFn: ({ signal }) => appointmentApi.getMyAppointments(params, signal),
  });
}

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { adminAppointmentsApi } from '@/services/appointmentService';

export const adminPaymentsQueryKey = queryKeys.payments.admin();

export function useAdminPayments() {
  return useQuery({
    queryKey: adminPaymentsQueryKey,
    queryFn: ({ signal }) =>
      adminAppointmentsApi.getAppointments({ limit: 1000 }, signal).then((res) => res.appointments),
    refetchInterval: 15_000,
  });
}

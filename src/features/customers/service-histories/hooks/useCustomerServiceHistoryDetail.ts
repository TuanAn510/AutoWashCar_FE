import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { customerServiceHistoryApi } from '@/services/serviceHistoryService';

export function useCustomerServiceHistoryDetail(serviceHistoryId: string | null) {
  return useQuery({
    queryKey: queryKeys.serviceHistories.customer.detail(serviceHistoryId ?? ''),
    queryFn: ({ signal }) =>
      customerServiceHistoryApi.getMyServiceHistoryDetail(serviceHistoryId as string, signal),
    enabled: Boolean(serviceHistoryId),
    staleTime: 0,
  });
}

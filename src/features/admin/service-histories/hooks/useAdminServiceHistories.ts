import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { adminServiceHistoryApi } from '@/services/serviceHistoryService';
import type { ServiceHistoryListParams } from '@/types/serviceHistory';

export const adminServiceHistoriesQueryKey = queryKeys.serviceHistories.admin.all;

export function useAdminServiceHistories(filters?: ServiceHistoryListParams) {
  return useQuery({
    queryKey: queryKeys.serviceHistories.admin.list(filters),
    queryFn: ({ signal }) => adminServiceHistoryApi.getServiceHistories(filters, signal),
    refetchOnMount: 'always',
    refetchInterval: 5_000,
  });
}

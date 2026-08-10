import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { adminServiceHistoryApi } from '@/services/serviceHistoryService';

export function useAdminServiceHistoryDetail(serviceHistoryId: string | null) {
  return useQuery({
    queryKey: queryKeys.serviceHistories.admin.detail(serviceHistoryId ?? ''),
    queryFn: ({ signal }) =>
      adminServiceHistoryApi.getServiceHistoryDetail(serviceHistoryId as string, signal),
    enabled: Boolean(serviceHistoryId),
    staleTime: 0,
  });
}

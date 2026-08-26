import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { staffServiceHistoryApi } from '@/services/serviceHistoryService';

export const staffServiceHistoriesQueryKey = queryKeys.serviceHistories.staff();

export function useMyStaffServiceHistories() {
  return useQuery({
    queryKey: staffServiceHistoriesQueryKey,
    queryFn: ({ signal }) => staffServiceHistoryApi.getMyServiceHistories(undefined, signal),
    refetchInterval: 5_000,
    refetchIntervalInBackground: true,
  });
}

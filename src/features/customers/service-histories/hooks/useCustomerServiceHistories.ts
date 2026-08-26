import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { customerServiceHistoryApi } from '@/services/serviceHistoryService';
import type { PaginationParams } from '@/types/api';

export const customerServiceHistoriesQueryKey = queryKeys.serviceHistories.customer.all;

export function useCustomerServiceHistories(vehicleId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.serviceHistories.customer.list(vehicleId || 'my', params),
    queryFn: ({ signal }) =>
      vehicleId
        ? customerServiceHistoryApi.getMyVehicleServiceHistories(vehicleId, params, signal)
        : customerServiceHistoryApi.getMyServiceHistories(params, signal),
    refetchOnMount: 'always',
    refetchInterval: 5_000,
  });
}

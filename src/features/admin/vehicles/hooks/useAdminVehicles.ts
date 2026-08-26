import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { vehiclesApi } from '@/services/vehicleService';
import type { PaginationParams } from '@/types/api';

export function useAdminVehicles(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.vehicles.admin.list(params),
    queryFn: ({ signal }) => vehiclesApi.listAll(params, signal),
    refetchOnMount: 'always',
  });
}

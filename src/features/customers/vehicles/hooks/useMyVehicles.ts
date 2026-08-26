import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { vehiclesApi } from '@/services/vehicleService';

export function useMyVehicles(includeInactive = false) {
  return useQuery({
    queryKey: [...queryKeys.vehicles.mine(), { includeInactive }],
    queryFn: ({ signal }) => vehiclesApi.getMyVehicles(undefined, signal, includeInactive),
    refetchOnMount: 'always',
  });
}

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { vehiclesApi } from '@/services/vehicleService';

export function useMyVehicles() {
  return useQuery({
    queryKey: queryKeys.vehicles.mine(),
    queryFn: ({ signal }) => vehiclesApi.getMyVehicles(undefined, signal),
  });
}

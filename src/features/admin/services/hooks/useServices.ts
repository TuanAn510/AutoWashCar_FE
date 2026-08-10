import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { serviceApi } from '@/services/serviceService';
import type { ServiceListParams } from '@/types/service';

export const serviceQueryKeys = {
  all: queryKeys.services.all,
  system: queryKeys.services.allItems(),
};

export function useServices(params?: ServiceListParams) {
  return useQuery({
    queryKey: queryKeys.services.list(params),
    queryFn: ({ signal }) => serviceApi.getServices(params, signal),
  });
}

export function useAllServices() {
  return useQuery({
    queryKey: serviceQueryKeys.system,
    queryFn: ({ signal }) => serviceApi.getAllServices(signal),
  });
}

export function useActiveServices(
  params?: Omit<ServiceListParams, 'isActive'>,
  options: { enabled?: boolean } = {}
) {
  return useQuery({
    queryKey: queryKeys.services.active(params),
    queryFn: ({ signal }) => serviceApi.getActiveServices(params, signal),
    enabled: options.enabled,
  });
}

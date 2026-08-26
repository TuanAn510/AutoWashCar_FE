import { useQuery } from '@tanstack/react-query';

import { dynamicCatalogQueryOptions } from '@/constants/dynamic-query-options';
import { queryKeys } from '@/constants/queryKeys';
import { serviceApi } from '@/services/serviceService';
import type { ServiceListParams } from '@/types/service';

export const serviceQueryKeys = {
  all: queryKeys.services.all,
  system: queryKeys.services.allItems(),
};

export function useServices(params?: ServiceListParams) {
  return useQuery({
    ...dynamicCatalogQueryOptions,
    queryKey: queryKeys.services.list(params),
    queryFn: ({ signal }) => serviceApi.getServices(params, signal),
  });
}

export function useAllServices() {
  return useQuery({
    ...dynamicCatalogQueryOptions,
    queryKey: serviceQueryKeys.system,
    queryFn: ({ signal }) => serviceApi.getAllServices(signal),
  });
}

export function useActiveServices(
  params?: Omit<ServiceListParams, 'isActive'>,
  options: { enabled?: boolean } = {}
) {
  return useQuery({
    ...dynamicCatalogQueryOptions,
    queryKey: queryKeys.services.active(params),
    queryFn: ({ signal }) => serviceApi.getActiveServices(params, signal),
    enabled: options.enabled,
  });
}

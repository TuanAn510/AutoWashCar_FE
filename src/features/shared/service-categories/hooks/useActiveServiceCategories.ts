import { useQuery } from '@tanstack/react-query';

import { dynamicCatalogQueryOptions } from '@/constants/dynamic-query-options';
import { queryKeys } from '@/constants/queryKeys';
import { serviceCategoryApi } from '@/services/serviceCategoryService';
import type { ServiceCategoryListParams } from '@/types/serviceCategory';

export const serviceCategoryQueryKeys = {
  all: queryKeys.serviceCategories.all,
  active: queryKeys.serviceCategories.active(),
  system: queryKeys.serviceCategories.allItems(),
};

export function useActiveServiceCategories(options: { enabled?: boolean } = {}) {
  return useQuery({
    ...dynamicCatalogQueryOptions,
    queryKey: serviceCategoryQueryKeys.active,
    queryFn: ({ signal }) => serviceCategoryApi.getAllActiveServiceCategories(signal),
    enabled: options.enabled,
  });
}

export function useServiceCategories(params?: ServiceCategoryListParams) {
  return useQuery({
    ...dynamicCatalogQueryOptions,
    queryKey: queryKeys.serviceCategories.list(params),
    queryFn: ({ signal }) => serviceCategoryApi.getServiceCategories(params, signal),
  });
}

export function useAllServiceCategories() {
  return useQuery({
    ...dynamicCatalogQueryOptions,
    queryKey: serviceCategoryQueryKeys.system,
    queryFn: ({ signal }) => serviceCategoryApi.getAllServiceCategories(signal),
  });
}

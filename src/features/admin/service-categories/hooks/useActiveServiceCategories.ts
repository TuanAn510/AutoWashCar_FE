import { useQuery } from '@tanstack/react-query';

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
    queryKey: serviceCategoryQueryKeys.active,
    queryFn: ({ signal }) => serviceCategoryApi.getAllActiveServiceCategories(signal),
    enabled: options.enabled,
  });
}

export function useServiceCategories(params?: ServiceCategoryListParams) {
  return useQuery({
    queryKey: queryKeys.serviceCategories.list(params),
    queryFn: ({ signal }) => serviceCategoryApi.getServiceCategories(params, signal),
  });
}

export function useAllServiceCategories() {
  return useQuery({
    queryKey: serviceCategoryQueryKeys.system,
    queryFn: ({ signal }) => serviceCategoryApi.getAllServiceCategories(signal),
  });
}

export const DYNAMIC_CATALOG_REFETCH_INTERVAL = 15_000;

export const dynamicCatalogQueryOptions = {
  staleTime: 0,
  refetchInterval: DYNAMIC_CATALOG_REFETCH_INTERVAL,
  refetchIntervalInBackground: false,
  refetchOnMount: 'always',
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
} as const;

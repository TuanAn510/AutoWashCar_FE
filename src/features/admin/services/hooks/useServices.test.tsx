// @vitest-environment jsdom

import type { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  DYNAMIC_CATALOG_REFETCH_INTERVAL,
  dynamicCatalogQueryOptions,
} from '@/constants/dynamic-query-options';
import { serviceQueryKeys, useAllServices } from '@/features/admin/services/hooks/useServices';
import { serviceApi } from '@/services/serviceService';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useAllServices dynamic synchronization', () => {
  it('keeps database-backed data fresh while the management screen is active', async () => {
    vi.spyOn(serviceApi, 'getAllServices').mockResolvedValue([]);
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { unmount } = renderHook(() => useAllServices(), { wrapper });

    await waitFor(() => {
      expect(serviceApi.getAllServices).toHaveBeenCalledTimes(1);
    });

    const query = client.getQueryCache().find({ queryKey: serviceQueryKeys.system });
    const options = query?.options as unknown as typeof dynamicCatalogQueryOptions;
    expect(options.staleTime).toBe(0);
    expect(options.refetchInterval).toBe(DYNAMIC_CATALOG_REFETCH_INTERVAL);
    expect(options.refetchIntervalInBackground).toBe(false);
    expect(options.refetchOnMount).toBe('always');
    expect(options.refetchOnWindowFocus).toBe(true);
    expect(options.refetchOnReconnect).toBe(true);

    unmount();
    client.clear();
  });
});

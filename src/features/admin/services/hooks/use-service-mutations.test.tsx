// @vitest-environment jsdom
import type { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';

import { ApiError } from '@/api/errors';
import {
  useCreateServiceMutation,
  useUpdateServiceMutation,
} from '@/features/admin/services/hooks/use-service-mutations';
import { serviceQueryKeys } from '@/features/admin/services/hooks/useServices';
import { serviceApi } from '@/services/serviceService';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const conflictMessage =
  'Dịch vụ đã được thay đổi bởi một phiên làm việc khác. Danh sách đã được cập nhật; vui lòng mở lại và thử lại.';

const renderUpdateServiceHook = () => {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  return { client, ...renderHook(() => useUpdateServiceMutation(), { wrapper }) };
};

const renderCreateServiceHook = () => {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  return { client, ...renderHook(() => useCreateServiceMutation(), { wrapper }) };
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe('useUpdateServiceMutation', () => {
  it('refreshes database-backed service queries after a stale update conflict', async () => {
    vi.spyOn(serviceApi, 'updateService').mockRejectedValue(
      new ApiError({
        message: 'Service data has changed',
        status: 409,
        code: 'SERVICE_UPDATE_CONFLICT',
      })
    );
    const { client, result } = renderUpdateServiceHook();
    const invalidateQueries = vi.spyOn(client, 'invalidateQueries');

    await act(async () => {
      await result.current
        .mutateAsync({ serviceId: '10', payload: { name: 'Updated', version: 2 } })
        .catch(() => undefined);
    });

    await waitFor(() => {
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: serviceQueryKeys.all });
      expect(toast.error).toHaveBeenCalledWith(conflictMessage);
    });
  });

  it('invalidates every service query after a successful database update', async () => {
    vi.spyOn(serviceApi, 'updateService').mockResolvedValue({ _id: '10', version: 3 } as never);
    const { client, result } = renderUpdateServiceHook();
    const invalidateQueries = vi.spyOn(client, 'invalidateQueries');

    await act(async () => {
      await result.current.mutateAsync({
        serviceId: '10',
        payload: { name: 'Updated', version: 2 },
      });
    });

    await waitFor(() => {
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: serviceQueryKeys.all });
      expect(toast.success).toHaveBeenCalledWith('Cập nhật dịch vụ thành công.');
    });
  });
});

describe('useCreateServiceMutation', () => {
  it('invalidates dynamic service data immediately after creation', async () => {
    vi.spyOn(serviceApi, 'createService').mockResolvedValue({ _id: '11' } as never);
    const { client, result } = renderCreateServiceHook();
    const invalidateQueries = vi.spyOn(client, 'invalidateQueries');

    await act(async () => {
      await result.current.mutateAsync({
        name: 'Dịch vụ mới',
        categoryId: '1',
        price: 250_000,
        estimatedDuration: 45,
        rewardMultiplier: 1,
      });
    });

    await waitFor(() => {
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: serviceQueryKeys.all });
      expect(toast.success).toHaveBeenCalledWith('Tạo dịch vụ thành công.');
    });
  });
});

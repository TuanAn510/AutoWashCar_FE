// @vitest-environment jsdom
import type { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';

import { ApiError } from '@/api/errors';
import { queryKeys } from '@/constants/queryKeys';
import { useDeleteVehicle } from '@/features/customers/vehicles/hooks/useVehicleMutations';
import { vehiclesApi } from '@/services/vehicleService';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const blockedMessage =
  'Không thể xóa xe vì xe đang có lịch hẹn chờ xác nhận hoặc đang được thực hiện.';

const renderDeleteVehicleHook = () => {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  return { client, ...renderHook(() => useDeleteVehicle(), { wrapper }) };
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe('useDeleteVehicle', () => {
  it('shows the blocked-deletion message for the backend error code', async () => {
    vi.spyOn(vehiclesApi, 'deleteVehicle').mockRejectedValue(
      new ApiError({
        message: 'Backend conflict message',
        status: 409,
        code: 'VEHICLE_ACTIVE_APPOINTMENT',
      })
    );
    const { result } = renderDeleteVehicleHook();

    await act(async () => {
      await result.current.mutateAsync('vehicle-1').catch(() => undefined);
    });

    expect(toast.error).toHaveBeenCalledWith(blockedMessage);
  });

  it('uses HTTP 409 as a backward-compatible fallback', async () => {
    vi.spyOn(vehiclesApi, 'deleteVehicle').mockRejectedValue(
      new ApiError({ message: 'Conflict', status: 409 })
    );
    const { result } = renderDeleteVehicleHook();

    await act(async () => {
      await result.current.mutateAsync('vehicle-1').catch(() => undefined);
    });

    expect(toast.error).toHaveBeenCalledWith(blockedMessage);
  });

  it('keeps the backend message for unrelated failures', async () => {
    vi.spyOn(vehiclesApi, 'deleteVehicle').mockRejectedValue(
      new ApiError({ message: 'Không tìm thấy xe', status: 404, kind: 'not_found' })
    );
    const { result } = renderDeleteVehicleHook();

    await act(async () => {
      await result.current.mutateAsync('vehicle-1').catch(() => undefined);
    });

    expect(toast.error).toHaveBeenCalledWith('Không tìm thấy xe');
  });

  it('invalidates vehicle queries and reports success after deletion', async () => {
    vi.spyOn(vehiclesApi, 'deleteVehicle').mockResolvedValue({ _id: 'vehicle-1' } as never);
    const { client, result } = renderDeleteVehicleHook();
    const invalidateQueries = vi.spyOn(client, 'invalidateQueries');

    await act(async () => {
      await result.current.mutateAsync('vehicle-1');
    });

    await waitFor(() => {
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.vehicles.all });
      expect(toast.success).toHaveBeenCalledWith('Xóa xe thành công.');
    });
  });
});

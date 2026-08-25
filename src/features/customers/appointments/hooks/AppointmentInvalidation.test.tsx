// @vitest-environment jsdom
import type { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { queryKeys } from '@/constants/queryKeys';
import { useCreateAppointment } from '@/features/customers/appointments/hooks/useCreateAppointment';
import { useCancelAppointment } from '@/features/customers/appointments/hooks/useCancelAppointment';
import { appointmentApi } from '@/services/appointmentService';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const setup = <T,>(hook: () => T) => {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidate = vi.spyOn(client, 'invalidateQueries');
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { ...renderHook(hook, { wrapper }), invalidate };
};

describe('customer appointment cache refresh', () => {
  it('refreshes appointments and availability after create', async () => {
    vi.spyOn(appointmentApi, 'createAppointment').mockResolvedValue({} as never);
    const { result, invalidate } = setup(useCreateAppointment);
    await act(async () => { await result.current.mutateAsync({} as never); });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.appointments.all });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['booking-availability'] });
  });

  it('refreshes appointments, availability, and reports after cancel', async () => {
    vi.spyOn(appointmentApi, 'cancelMyAppointment').mockResolvedValue({} as never);
    const { result, invalidate } = setup(useCancelAppointment);
    await act(async () => { await result.current.mutateAsync({} as never); });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.appointments.all });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['booking-availability'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.reports.all });
  });
});

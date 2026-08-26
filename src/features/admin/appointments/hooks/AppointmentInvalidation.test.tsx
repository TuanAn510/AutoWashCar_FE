// @vitest-environment jsdom
import type { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { queryKeys } from '@/constants/queryKeys';
import {
  useAssignStaffToAppointment,
  useRescheduleAppointment,
  useUpdateAppointmentStatus,
} from '@/features/admin/appointments/hooks/useAdminAppointmentMutations';
import { adminAppointmentsApi } from '@/services/appointmentService';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const setup = <T,>(hook: () => T) => {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidate = vi.spyOn(client, 'invalidateQueries');
  const wrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return { ...renderHook(hook, { wrapper }), invalidate };
};

describe('admin appointment cache refresh', () => {
  it.each([
    ['assign', useAssignStaffToAppointment, 'assignStaffToAppointment'],
    ['status', useUpdateAppointmentStatus, 'updateAppointmentStatus'],
    ['reschedule', useRescheduleAppointment, 'rescheduleAppointment'],
  ] as const)('refreshes operational caches after %s', async (_name, hook, apiMethod) => {
    vi.spyOn(adminAppointmentsApi, apiMethod).mockResolvedValue({} as never);
    const { result, invalidate } = setup(hook as typeof useUpdateAppointmentStatus);
    await act(async () => { await result.current.mutateAsync({ appointmentId: '1', payload: {} } as never); });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.appointments.admin.all });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.users.staffs.workload() });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.reports.all });
  });
});

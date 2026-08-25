// @vitest-environment jsdom
import type { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { queryKeys } from '@/constants/queryKeys';
import { useUpdateAppointmentStatus } from '@/features/staff/appointments/hooks/useUpdateAppointmentStatus';
import { staffAppointmentsApi } from '@/services/appointmentService';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe('staff appointment cache refresh', () => {
  it('refreshes appointments, workload, reports, histories, and availability', async () => {
    vi.spyOn(staffAppointmentsApi, 'updateAppointmentStatus').mockResolvedValue({} as never);
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    const wrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    const { result } = renderHook(useUpdateAppointmentStatus, { wrapper });
    await act(async () => { await result.current.mutateAsync({ appointmentId: '1', payload: {} } as never); });
    for (const queryKey of [queryKeys.appointments.all, queryKeys.users.staffs.workload(), queryKeys.reports.all, queryKeys.serviceHistories.admin.all, queryKeys.serviceHistories.staff(), ['booking-availability']]) {
      expect(invalidate).toHaveBeenCalledWith({ queryKey });
    }
  });
});

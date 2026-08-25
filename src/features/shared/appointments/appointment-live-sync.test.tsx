// @vitest-environment jsdom

import type { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  APPOINTMENT_SYNC_INTERVAL,
  liveAppointmentQueryOptions,
} from '@/constants/appointment-query-options';
import { queryKeys } from '@/constants/queryKeys';
import { useAppointmentDetail } from '@/features/admin/appointments/hooks/useAppointmentDetail';
import { useAppointments } from '@/features/admin/appointments/hooks/useAppointments';
import { useMyAppointments } from '@/features/customers/appointments/hooks/useMyAppointments';
import { useMyStaffAppointments } from '@/features/staff/appointments/hooks/useMyStaffAppointments';
import {
  adminAppointmentsApi,
  appointmentApi,
  staffAppointmentsApi,
} from '@/services/appointmentService';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('appointment live synchronization', () => {
  it('uses the same safe active-tab refresh policy for every role and appointment detail', async () => {
    vi.spyOn(appointmentApi, 'getMyAppointments').mockResolvedValue({
      appointments: [],
      pagination: undefined,
      summary: undefined,
    });
    vi.spyOn(adminAppointmentsApi, 'getAppointments').mockResolvedValue({
      appointments: [],
      pagination: undefined,
      total: 0,
      summary: undefined,
    });
    vi.spyOn(staffAppointmentsApi, 'getMyStaffAppointments').mockResolvedValue({
      appointments: [],
      pagination: undefined,
      total: 0,
      summary: undefined,
    });

    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { unmount } = renderHook(
      () => ({
        customer: useMyAppointments(),
        admin: useAppointments(),
        staff: useMyStaffAppointments(),
        detail: useAppointmentDetail(),
      }),
      { wrapper }
    );

    await waitFor(() => {
      expect(appointmentApi.getMyAppointments).toHaveBeenCalledTimes(1);
      expect(adminAppointmentsApi.getAppointments).toHaveBeenCalledTimes(1);
      expect(staffAppointmentsApi.getMyStaffAppointments).toHaveBeenCalledTimes(1);
    });

    const liveQueryKeys = [
      queryKeys.appointments.mine(),
      queryKeys.appointments.admin.list(),
      queryKeys.appointments.staff.mine(),
      queryKeys.appointments.admin.detail(''),
    ];

    for (const queryKey of liveQueryKeys) {
      const query = client.getQueryCache().find({ queryKey });
      const options = query?.options as unknown as typeof liveAppointmentQueryOptions;

      expect(options.staleTime).toBe(0);
      expect(options.refetchInterval).toBe(APPOINTMENT_SYNC_INTERVAL);
      expect(options.refetchIntervalInBackground).toBe(false);
      expect(options.refetchOnMount).toBe('always');
      expect(options.refetchOnWindowFocus).toBe(true);
      expect(options.refetchOnReconnect).toBe(true);
    }

    unmount();
    client.clear();
  });
});

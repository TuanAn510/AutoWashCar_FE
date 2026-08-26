// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, expectTypeOf, it } from 'vitest';

import { AppointmentStatusBadge } from '@/features/customers/appointments/components/AppointmentStatusBadge';
import { AppointmentStatusTimeline } from '@/features/admin/appointments/components/AppointmentStatusTimeline';
import { getAllowedAdminAppointmentStatuses } from '@/features/admin/appointments/constants/appointmentStatus';
import { getAllowedStaffAppointmentStatuses } from '@/features/staff/appointments/constants/appointmentStatus';
import { adminAppointmentsApi } from '@/services/appointmentService';
import type { AppointmentStatus, PriorityQueueItem } from '@/types/appointment';

afterEach(cleanup);

describe('appointment status lifecycle', () => {
  it('supports the first-class in-queue label and timeline', () => {
    const status: AppointmentStatus = 'in_queue';
    render(
      <>
        <AppointmentStatusBadge status={status} />
        <AppointmentStatusTimeline status={status} onStatusSelect={() => undefined} />
      </>
    );

    expect(screen.getAllByText('Đã check-in').length).toBeGreaterThan(0);
  });

  it('offers only the strict backend lifecycle transitions', () => {
    expect(getAllowedAdminAppointmentStatuses('pending')).toEqual(['confirmed']);
    expect(getAllowedAdminAppointmentStatuses('confirmed')).toEqual(['in_queue']);
    expect(getAllowedAdminAppointmentStatuses('in_queue')).toEqual(['in_progress']);
    expect(getAllowedAdminAppointmentStatuses('in_progress')).toEqual(['completed']);
    expect(getAllowedStaffAppointmentStatuses('confirmed')).toEqual(['in_queue']);
    expect(getAllowedStaffAppointmentStatuses('in_queue')).toEqual(['in_progress']);
    expect(getAllowedStaffAppointmentStatuses('in_progress')).toEqual(['completed']);
  });

  it('types the priority queue response separately from appointment items', () => {
    expectTypeOf(adminAppointmentsApi.getPriorityQueue).returns.toEqualTypeOf<
      Promise<PriorityQueueItem[]>
    >();
  });
});

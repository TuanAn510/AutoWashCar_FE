// @vitest-environment jsdom
import type { PropsWithChildren, ReactNode } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { RescheduleAppointmentDialog } from '@/features/admin/appointments/components/RescheduleAppointmentDialog';
import { adminAppointmentsApi } from '@/services/appointmentService';
import type { AppointmentItem, BookingAvailability } from '@/types/appointment';

vi.mock('@/features/customers/components/CustomerModalShell', () => ({
  CustomerModalShell: ({ children, footer }: PropsWithChildren<{ footer?: ReactNode }>) => (
    <div>
      {children}
      <footer>{footer}</footer>
    </div>
  ),
}));

vi.mock('@/components/ui/date-picker', () => ({
  DatePicker: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <input
      aria-label="Ngày hẹn mới"
      type="date"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

vi.mock('@/services/appointmentService', () => ({
  adminAppointmentsApi: {
    getRescheduleAvailability: vi.fn(),
  },
}));

const appointment: AppointmentItem = {
  _id: 'appointment-1',
  customerId: { _id: 'customer-1', displayName: 'Customer', phone: '0900000000' },
  vehicleId: {
    _id: 'vehicle-1',
    brand: 'Toyota',
    model: 'Camry',
    licensePlate: '30A-12345',
    year: 2024,
  },
  assignedStaffId: null,
  cancelledBy: null,
  services: [],
  scheduledAt: '2099-08-13T09:00:00',
  status: 'pending',
  totalEstimatedDuration: 45,
  totalPrice: 100000,
  paymentMethod: 'cash',
  paymentStatus: 'unpaid',
};

const availability: BookingAvailability = {
  date: '2099-08-13',
  bookingWindowDays: null,
  slots: [
    {
      startAt: '2099-08-13T09:00:00',
      endAt: '2099-08-13T09:45:00',
      available: true,
      reason: null,
    },
    {
      startAt: '2099-08-13T09:05:00',
      endAt: '2099-08-13T09:50:00',
      available: false,
      reason: 'CAPACITY_FULL',
    },
    {
      startAt: '2099-08-13T09:10:00',
      endAt: '2099-08-13T09:55:00',
      available: false,
      reason: 'NO_STAFF',
    },
    {
      startAt: '2099-08-13T08:00:00',
      endAt: '2099-08-13T08:45:00',
      available: false,
      reason: 'PAST',
    },
    {
      startAt: '2099-08-13T08:05:00',
      endAt: '2099-08-13T08:50:00',
      available: false,
      reason: 'LEAD_TIME',
    },
  ],
  vehicleAvailabilityReason: null,
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('RescheduleAppointmentDialog', () => {
  it('loads backend intervals and submits a timezone-free selected slot', async () => {
    vi.mocked(adminAppointmentsApi.getRescheduleAvailability).mockResolvedValue(availability);
    const onConfirm = vi.fn();
    const { container } = render(
      <RescheduleAppointmentDialog
        appointment={appointment}
        open
        isSubmitting={false}
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
      />
    );

    expect(await screen.findByRole('option', { name: '09:00 - 09:45' })).toBeTruthy();
    expect(container.querySelector('input[type="time"]')).toBeNull();
    expect(adminAppointmentsApi.getRescheduleAvailability).toHaveBeenCalledWith(
      'appointment-1',
      '2099-08-13',
      expect.any(AbortSignal)
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cập nhật lịch' }));

    expect(onConfirm).toHaveBeenCalledWith('2099-08-13T09:00:00');
    expect(onConfirm.mock.calls[0][0]).not.toContain('Z');
  });

  it('keeps unavailable slots visible and disabled with backend reasons', async () => {
    vi.mocked(adminAppointmentsApi.getRescheduleAvailability).mockResolvedValue(availability);
    render(
      <RescheduleAppointmentDialog
        appointment={appointment}
        open
        isSubmitting={false}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    const full = await screen.findByRole('option', { name: '09:05 - 09:50 - Hết vị trí rửa' });
    const noStaff = screen.getByRole('option', { name: '09:10 - 09:55 - Chưa có nhân viên' });
    const past = screen.getByRole('option', { name: '08:00 - 08:45 - Đã qua' });
    const leadTime = screen.getByRole('option', {
      name: '08:05 - 08:50 - Cần đặt trước 30 phút',
    });
    expect((full as HTMLOptionElement).disabled).toBe(true);
    expect((noStaff as HTMLOptionElement).disabled).toBe(true);
    expect((past as HTMLOptionElement).disabled).toBe(true);
    expect((leadTime as HTMLOptionElement).disabled).toBe(true);
  });

  it('clears the selected time and refetches when the date changes', async () => {
    vi.mocked(adminAppointmentsApi.getRescheduleAvailability).mockResolvedValue(availability);
    render(
      <RescheduleAppointmentDialog
        appointment={appointment}
        open
        isSubmitting={false}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    await screen.findByRole('option', { name: '09:00 - 09:45' });

    fireEvent.change(screen.getByLabelText('Ngày hẹn mới'), { target: { value: '2099-08-14' } });

    await waitFor(() =>
      expect(adminAppointmentsApi.getRescheduleAvailability).toHaveBeenLastCalledWith(
        'appointment-1',
        '2099-08-14',
        expect.any(AbortSignal)
      )
    );
    expect((screen.getByLabelText('Giờ hẹn mới') as HTMLSelectElement).value).toBe('');
    expect((screen.getByRole('button', { name: 'Cập nhật lịch' }) as HTMLButtonElement).disabled)
      .toBe(true);
  });
});

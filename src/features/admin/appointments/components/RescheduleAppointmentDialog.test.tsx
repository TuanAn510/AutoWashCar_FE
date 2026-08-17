// @vitest-environment jsdom
import type { PropsWithChildren, ReactNode } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { RescheduleAppointmentDialog } from '@/features/admin/appointments/components/RescheduleAppointmentDialog';
import type { AppointmentItem } from '@/types/appointment';

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
  status: 'confirmed',
  totalEstimatedDuration: 30,
  totalPrice: 100000,
  paymentMethod: 'cash',
  paymentStatus: 'unpaid',
};

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('RescheduleAppointmentDialog', () => {
  it('submits a timezone-free local datetime', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2099-08-13T08:00:00'));
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

    fireEvent.change(container.querySelector('input[type="time"]')!, {
      target: { value: '14:30' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cập nhật lịch' }));

    expect(onConfirm).toHaveBeenCalledWith('2099-08-13T14:30:00');
    expect(onConfirm.mock.calls[0][0]).not.toContain('Z');
  });

  it('disables confirmation for a time less than 30 minutes ahead', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2099-08-13T08:00:00'));
    const { container } = render(
      <RescheduleAppointmentDialog
        appointment={appointment}
        open
        isSubmitting={false}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    fireEvent.change(container.querySelector('input[type="time"]')!, {
      target: { value: '08:29' },
    });

    expect(
      (screen.getByRole('button', { name: 'Cập nhật lịch' }) as HTMLButtonElement).disabled
    ).toBe(true);
    expect(screen.getByText('Thời gian hẹn mới phải cách hiện tại ít nhất 30 phút.')).toBeTruthy();
  });
});

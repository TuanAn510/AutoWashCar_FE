// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AppointmentCard } from '@/features/customers/appointments/components/AppointmentCard';
import type { AppointmentItem, AppointmentPaymentStatus, AppointmentStatus } from '@/types/appointment';

const appointment = (
  status: AppointmentStatus,
  paymentStatus: AppointmentPaymentStatus
): AppointmentItem => ({
  _id: `${status}-${paymentStatus}`,
  customerId: { _id: 'customer-1', displayName: 'Customer', phone: '0900000000' },
  vehicleId: {
    _id: 'vehicle-1',
    brand: 'Toyota',
    model: 'Camry',
    licensePlate: '50A12345',
    year: 2024,
  },
  assignedStaffId: null,
  cancelledBy: null,
  services: [],
  scheduledAt: '2099-08-20T09:00:00',
  status,
  totalEstimatedDuration: 30,
  totalPrice: 100000,
  paymentMethod: 'cash',
  paymentStatus,
});

afterEach(cleanup);

describe('customer appointment card actions', () => {
  it.each(['unpaid', 'pending', 'cancelled'] as AppointmentPaymentStatus[])(
    'shows payment directly for completed %s appointments',
    (paymentStatus) => {
      render(
        <AppointmentCard
          appointment={appointment('completed', paymentStatus)}
          onViewDetail={vi.fn()}
          onCancel={vi.fn()}
          onPay={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: 'Thanh toán' })).toBeTruthy();
      expect(screen.queryByRole('button', { name: 'Hủy lịch' })).toBeNull();
    }
  );

  it('hides payment after a completed appointment is paid', () => {
    render(
      <AppointmentCard
        appointment={appointment('completed', 'paid')}
        onViewDetail={vi.fn()}
        onCancel={vi.fn()}
        onPay={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: 'Thanh toán' })).toBeNull();
  });

  it.each(['confirmed', 'in_queue', 'in_progress', 'cancelled'] as AppointmentStatus[])(
    'shows detail only for %s appointments',
    (status) => {
      render(
        <AppointmentCard
          appointment={appointment(status, 'unpaid')}
          onViewDetail={vi.fn()}
          onCancel={vi.fn()}
          onPay={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: 'Chi tiết' })).toBeTruthy();
      expect(screen.queryByRole('button', { name: 'Thanh toán' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Hủy lịch' })).toBeNull();
    }
  );

  it('shows cancellation but not payment for pending appointments', () => {
    render(
      <AppointmentCard
        appointment={appointment('pending', 'unpaid')}
        onViewDetail={vi.fn()}
        onCancel={vi.fn()}
        onPay={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Hủy lịch' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Thanh toán' })).toBeNull();
  });
});

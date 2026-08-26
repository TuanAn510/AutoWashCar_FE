// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { StaffAppointmentList } from '@/features/staff/appointments/components/StaffAppointmentList';
import type { AppointmentItem, AppointmentPaymentStatus } from '@/types/appointment';

const appointment = (paymentStatus: AppointmentPaymentStatus): AppointmentItem => ({
  _id: `appointment-${paymentStatus}`,
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
  status: 'confirmed',
  totalEstimatedDuration: 30,
  totalPrice: 100000,
  paymentMethod: paymentStatus === 'paid' ? 'vnpay' : 'cash',
  paymentStatus,
});

afterEach(cleanup);

describe('StaffAppointmentList payment labels', () => {
  it('shows paid and unpaid groups per payment status', () => {
    render(
      <StaffAppointmentList
        appointments={[appointment('paid'), appointment('pending'), appointment('unpaid')]}
        onViewDetail={vi.fn()}
        onOpenStatusDialog={vi.fn()}
        onQuickUpdate={vi.fn()}
      />
    );

    expect(screen.getByText('Đã thanh toán')).toBeTruthy();
    expect(screen.getAllByText('Chưa thanh toán')).toHaveLength(2);
  });
});

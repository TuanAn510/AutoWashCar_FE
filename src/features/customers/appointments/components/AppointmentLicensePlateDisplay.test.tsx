// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AppointmentCard } from '@/features/customers/appointments/components/AppointmentCard';
import { AppointmentDetailDialog } from '@/features/customers/appointments/components/AppointmentDetailDialog';
import type { AppointmentItem } from '@/types/appointment';

const appointment: AppointmentItem = {
  _id: 'appointment-1',
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
  services: [
    {
      serviceId: 'service-1',
      nameSnapshot: 'Basic Wash',
      priceSnapshot: 100000,
      estimatedDurationSnapshot: 30,
    },
  ],
  scheduledAt: '2099-08-20T09:00:00',
  status: 'pending',
  totalEstimatedDuration: 30,
  totalPrice: 100000,
  paymentMethod: 'cash',
  paymentStatus: 'unpaid',
  createdAt: '2099-08-19T09:00:00',
};

afterEach(cleanup);

describe('customer appointment license plate display', () => {
  it('formats the appointment card plate with the canonical formatter', () => {
    render(<AppointmentCard appointment={appointment} onViewDetail={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByText(/50A-12345/)).toBeTruthy();
    expect(screen.queryByText(/50A12345/)).toBeNull();
  });

  it('formats every appointment detail plate display with the same formatter', () => {
    render(
      <MemoryRouter>
        <AppointmentDetailDialog appointment={appointment} open onOpenChange={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getAllByText(/50A-12345/)).toHaveLength(2);
    expect(screen.queryByText(/50A12345/)).toBeNull();
  });

  it('shows the joined service summary with price once and removes the duplicate service section', () => {
    render(
      <MemoryRouter>
        <AppointmentDetailDialog appointment={appointment} open onOpenChange={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Basic Wash')).toHaveLength(1);
    expect(screen.getAllByText(/100[.,]000/).length).toBeGreaterThan(0);
    expect(screen.queryByText('Dịch vụ đã chọn')).toBeNull();
  });

  it('shows the same pending-refund state in appointment card and detail', () => {
    const refundAppointment: AppointmentItem = {
      ...appointment,
      status: 'cancelled',
      paymentStatus: 'paid',
      cancelReason: 'store_not_confirmed',
      refundRequired: true,
    };
    const { unmount } = render(
      <AppointmentCard appointment={refundAppointment} onViewDetail={vi.fn()} onCancel={vi.fn()} />
    );

    expect(screen.getByText('Chờ hoàn tiền')).toBeTruthy();
    expect(
      screen.getByText(
        'Lịch hẹn đã bị hủy do cửa hàng chưa xác nhận đúng hạn. Khoản thanh toán của bạn đang chờ được xử lý hoàn tiền.'
      )
    ).toBeTruthy();
    expect(screen.queryByText('Đã thanh toán')).toBeNull();
    expect(screen.queryByText(/Đã hoàn tiền|Hoàn tiền thành công/)).toBeNull();

    unmount();
    render(
      <MemoryRouter>
        <AppointmentDetailDialog appointment={refundAppointment} open onOpenChange={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText('Chờ hoàn tiền')).toBeTruthy();
    expect(
      screen.getByText(
        'Lịch hẹn đã bị hủy do cửa hàng chưa xác nhận đúng hạn. Khoản thanh toán của bạn đang chờ được xử lý hoàn tiền.'
      )
    ).toBeTruthy();
    expect(screen.queryByText('Đã thanh toán')).toBeNull();
  });

  it('preserves normal paid and unpaid payment labels', () => {
    const { rerender } = render(
      <AppointmentCard
        appointment={{ ...appointment, paymentStatus: 'paid' }}
        onViewDetail={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText('Đã thanh toán')).toBeTruthy();
    expect(screen.queryByText('Chờ hoàn tiền')).toBeNull();

    rerender(
      <AppointmentCard
        appointment={{ ...appointment, paymentStatus: 'unpaid' }}
        onViewDetail={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText('Chưa thanh toán')).toBeTruthy();
    expect(screen.queryByText('Chờ hoàn tiền')).toBeNull();
  });
});

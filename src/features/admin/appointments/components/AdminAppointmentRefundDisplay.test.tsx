// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AdminAppointmentsTable } from '@/features/admin/appointments/components/AdminAppointmentsTable';
import { AdminAppointmentDetailDialog } from '@/features/admin/appointments/components/AppointmentDetailDialog';
import type { AppointmentItem } from '@/types/appointment';

vi.mock('@/features/admin/appointments/components/AdminAppointmentActionsMenu', () => ({
  AdminAppointmentActionsMenu: () => null,
}));

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
  status: 'cancelled',
  totalEstimatedDuration: 30,
  totalPrice: 100000,
  paymentMethod: 'vnpay',
  paymentStatus: 'paid',
  cancelReason: 'store_not_confirmed',
  refundRequired: true,
};

const tableProps = {
  onViewDetail: vi.fn(),
  onAssignStaff: vi.fn(),
  onUpdateStatus: vi.fn(),
  onConfirmPayment: vi.fn(),
  onReschedule: vi.fn(),
  onCancel: vi.fn(),
};

afterEach(cleanup);

describe('admin appointment refund-required display', () => {
  it('shows lifecycle and refund-obligation badges together in the list', () => {
    render(<AdminAppointmentsTable appointments={[appointment]} {...tableProps} />);

    expect(screen.getByText('Đã hủy')).toBeTruthy();
    expect(screen.getByText('Cần hoàn tiền')).toBeTruthy();
  });

  it('does not show a refund badge for normal cancelled or completed appointments', () => {
    const normalCancelled = { ...appointment, refundRequired: false };
    const completed = {
      ...appointment,
      _id: 'appointment-2',
      status: 'completed' as const,
      refundRequired: false,
    };
    render(<AdminAppointmentsTable appointments={[normalCancelled, completed]} {...tableProps} />);

    expect(screen.getByText('Đã hủy')).toBeTruthy();
    expect(screen.getByText('Hoàn thành')).toBeTruthy();
    expect(screen.queryByText('Cần hoàn tiền')).toBeNull();
  });

  it('shows the refund obligation consistently in admin detail', () => {
    render(<AdminAppointmentDetailDialog appointment={appointment} open onOpenChange={vi.fn()} />);

    expect(screen.getByText('Đã hủy')).toBeTruthy();
    expect(screen.getAllByText('Cần hoàn tiền')).toHaveLength(2);
    expect(screen.getByText('Lịch hẹn đã bị hủy do cửa hàng chưa xác nhận đúng hạn.')).toBeTruthy();
    expect(screen.getByText('Trạng thái hoàn tiền')).toBeTruthy();
    expect(screen.queryByText(/Đã hoàn tiền|Hoàn tiền thành công/)).toBeNull();
  });
});

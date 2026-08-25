// @vitest-environment jsdom
import type { PropsWithChildren } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AdminAppointmentActionsMenu } from '@/features/admin/appointments/components/AdminAppointmentActionsMenu';
import type { AppointmentItem, AppointmentStatus } from '@/types/appointment';

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: PropsWithChildren) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: PropsWithChildren) => <>{children}</>,
  DropdownMenuContent: ({ children }: PropsWithChildren) => <div>{children}</div>,
  DropdownMenuItem: ({ children }: PropsWithChildren) => <button>{children}</button>,
}));

const appointment = (status: AppointmentStatus): AppointmentItem => ({
  _id: `appointment-${status}`,
  customerId: { _id: 'customer-1', displayName: 'Customer', phone: '0900000000' },
  vehicleId: { _id: 'vehicle-1', brand: 'Toyota', model: 'Camry', licensePlate: '50A12345', year: 2024 },
  assignedStaffId: null,
  cancelledBy: null,
  services: [],
  scheduledAt: '2099-08-20T09:00:00',
  status,
  totalEstimatedDuration: 30,
  totalPrice: 100000,
  paymentMethod: 'cash',
  paymentStatus: 'unpaid',
});

const props = {
  onViewDetail: vi.fn(),
  onAssignStaff: vi.fn(),
  onUpdateStatus: vi.fn(),
  onConfirmPayment: vi.fn(),
  onReschedule: vi.fn(),
  onCancel: vi.fn(),
};

afterEach(cleanup);

describe('AdminAppointmentActionsMenu reschedule lifecycle', () => {
  it('shows detail, confirm, reschedule, and cancel for pending appointments', () => {
    render(<AdminAppointmentActionsMenu appointment={appointment('pending')} {...props} />);

    expect(screen.getByText('Xem chi tiết')).toBeTruthy();
    expect(screen.getByText('Xác nhận')).toBeTruthy();
    expect(screen.getByText('Đổi lịch')).toBeTruthy();
    expect(screen.getByText('Hủy')).toBeTruthy();
  });

  it.each(['confirmed', 'in_queue', 'in_progress', 'completed', 'cancelled'] as AppointmentStatus[])(
    'does not expose reschedule for %s appointments',
    (status) => {
      render(<AdminAppointmentActionsMenu appointment={appointment(status)} {...props} />);

      expect(screen.getByText('Xem chi tiết')).toBeTruthy();
      expect(screen.queryByText('Đổi lịch')).toBeNull();
    }
  );

  it.each(['confirmed', 'in_queue', 'in_progress'] as AppointmentStatus[])(
    'preserves assign and cancel for active %s appointments',
    (status) => {
      render(<AdminAppointmentActionsMenu appointment={appointment(status)} {...props} />);
      expect(screen.getAllByRole('button')).toHaveLength(4);
    }
  );

  it.each(['completed', 'cancelled'] as AppointmentStatus[])(
    'renders detail only for terminal %s appointments',
    (status) => {
      render(<AdminAppointmentActionsMenu appointment={appointment(status)} {...props} />);
      expect(screen.getAllByRole('button')).toHaveLength(2);
      expect(screen.queryByText(/Thanh toÃ¡n|HoÃ n tiá»n/)).toBeNull();
    }
  );
});

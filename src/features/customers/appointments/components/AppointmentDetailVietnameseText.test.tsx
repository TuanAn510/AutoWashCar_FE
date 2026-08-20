// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AdminAppointmentDetailDialog } from '@/features/admin/appointments/components/AppointmentDetailDialog';
import { AppointmentDetailDialog } from '@/features/customers/appointments/components/AppointmentDetailDialog';
import type { AppointmentItem } from '@/types/appointment';

const appointment: AppointmentItem = {
  _id: 'appointment-vietnamese-text',
  customerId: { _id: 'customer-1', displayName: 'Khách hàng', phone: '0900000000' },
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
      nameSnapshot: 'Rửa xe cơ bản',
      priceSnapshot: 100000,
      estimatedDurationSnapshot: 30,
    },
  ],
  createdAt: '2099-08-19T08:00:00',
  scheduledAt: '2099-08-20T09:00:00',
  checkInAt: null,
  completedAt: null,
  status: 'confirmed',
  totalEstimatedDuration: 30,
  totalPrice: 100000,
  paymentMethod: 'cash',
  paymentStatus: 'unpaid',
};

afterEach(cleanup);

function expectCorrectDetailText() {
  expect(screen.getByText('Các mốc thời gian')).toBeTruthy();
  expect(screen.getByText('Hình ảnh xác nhận')).toBeTruthy();
  expect(
    screen.getByText('Chưa có hình ảnh check-in hoặc hình ảnh hoàn thành cho lịch hẹn này.')
  ).toBeTruthy();
  expect(screen.getByText('Thời gian đặt lịch')).toBeTruthy();
  expect(screen.getByText('Thời gian hẹn')).toBeTruthy();
  expect(screen.getByText('Chưa check-in')).toBeTruthy();
  expect(document.body.textContent).not.toMatch(/\\u(?:00|01|1e)/i);
}

describe('appointment detail Vietnamese text', () => {
  it('renders proper Vietnamese text in admin appointment detail', () => {
    render(<AdminAppointmentDetailDialog appointment={appointment} open onOpenChange={vi.fn()} />);

    expectCorrectDetailText();
  });

  it('renders proper Vietnamese text in customer appointment detail', () => {
    render(
      <MemoryRouter>
        <AppointmentDetailDialog appointment={appointment} open onOpenChange={vi.fn()} />
      </MemoryRouter>
    );

    expectCorrectDetailText();
  });
});

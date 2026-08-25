// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { AlertPanel, OperationalAlertsSection } from '@/features/admin/reports/components/AdvancedReportSections';
import type { OperationalAlertReport } from '@/services/reportService';

const report: OperationalAlertReport = {
  total: 2,
  summary: { UNASSIGNED: 1, REFUND_REQUIRED: 1 },
  alerts: [
    { type: 'UNASSIGNED', severity: 'HIGH', bookingId: '17',
      message: 'Lịch hẹn trong 24 giờ tới chưa được phân công nhân viên.', occurredAt: null,
      customerName: 'Trần Thị Bình', vehicleName: 'Ford Ranger', licensePlate: '11X68686',
      scheduledAt: '2026-08-25T13:40:00' },
    { type: 'REFUND_REQUIRED', severity: 'HIGH', bookingId: '9',
      message: 'Lịch hẹn đã bị hủy và khoản thanh toán cần được xử lý hoàn tiền.', occurredAt: null,
      customerName: 'Nguyễn Văn A', vehicleName: 'Toyota Camry', licensePlate: '50A12345',
      scheduledAt: '2026-08-20T09:30:00' },
  ],
};

afterEach(cleanup);

describe('booking operational alerts', () => {
  it('shows structured UNASSIGNED and REFUND_REQUIRED identity without redundant details', () => {
    render(<AlertPanel report={report} />);
    for (const text of ['Chưa phân công', 'Trần Thị Bình',
      'Cần hoàn tiền', 'Nguyễn Văn A']) {
      expect(screen.getByText(text)).toBeTruthy();
    }
    expect(screen.getByText(/Ford Ranger/)).toBeTruthy();
    expect(screen.getByText(/Toyota Camry/)).toBeTruthy();
    expect(screen.getByText(/11X-68686/)).toBeTruthy();
    expect(screen.getByText(/50A-12345/)).toBeTruthy();
    expect(screen.getByText(/13:40/)).toBeTruthy();
    expect(screen.getByText(/09:30/)).toBeTruthy();
    expect(screen.queryByText(/Booking #/)).toBeNull();
    expect(screen.queryByText('Lịch hẹn trong 24 giờ tới chưa được phân công nhân viên.')).toBeNull();
    expect(screen.queryByText('Lịch hẹn đã bị hủy và khoản thanh toán cần được xử lý hoàn tiền.')).toBeNull();
    expect(screen.queryByText('Booking trong 24 gio toi chua duoc phan cong')).toBeNull();
    expect(screen.queryByText('Booking da huy can xu ly hoan tien')).toBeNull();
    expect(screen.queryByText(/Đã hoàn tiền|Hoàn tiền thành công/)).toBeNull();
  });

  it('handles incomplete legacy identity without invalid values', () => {
    render(<AlertPanel report={{ total: 1, summary: {}, alerts: [{
      type: 'LONG_RUNNING', severity: 'MEDIUM', bookingId: '2', message: '', occurredAt: null,
      customerName: null, vehicleName: null, licensePlate: null, scheduledAt: 'invalid',
    }] }} />);
    expect(screen.getByText('Chưa có thông tin khách hàng')).toBeTruthy();
    expect(screen.getByText('Chưa có thông tin xe')).toBeTruthy();
    expect(screen.queryByText(/Invalid Date|undefined|null|NaN/)).toBeNull();
  });

  it('reacts to visibility changes without reloading', () => {
    const view = render(<OperationalAlertsSection report={report} visible />);
    expect(screen.getByText('Cảnh báo vận hành')).toBeTruthy();
    view.rerender(<OperationalAlertsSection report={report} visible={false} />);
    expect(screen.queryByText('Cảnh báo vận hành')).toBeNull();
    view.rerender(<OperationalAlertsSection report={report} visible />);
    expect(screen.getByText('Cảnh báo vận hành')).toBeTruthy();
  });
});

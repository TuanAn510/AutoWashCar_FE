// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { AdvancedReportSections } from '@/features/admin/reports/components/AdvancedReportSections';
import type { ReportsStatistics } from '@/services/reportService';

const reports = {
  staffPerformance: { staff: [] },
  serviceTimes: {
    measuredWaitingBookings: 4,
    measuredServiceBookings: 3,
    averageWaitingMinutes: 8,
    averageServiceMinutes: 42,
    onTimeBookings: 3,
    onTimeRate: 75,
    groupedByMonth: [],
  },
  promotionEffectiveness: {
    bookingsWithPromotion: 2,
    bookingsWithoutPromotion: 1,
    totalDiscount: 50_000,
    promotionRevenue: 600_000,
    revenueWithoutPromotion: 250_000,
    averageOrderWithPromotion: 300_000,
    averageOrderWithoutPromotion: 250_000,
    promotions: [],
  },
  customerRetention: {
    customersWithCompletedBookings: 0,
    oneTimeCustomers: 0,
    returningCustomers: 0,
    loyalCustomers: 0,
    atRiskCustomers: 0,
    inactiveCustomers: 0,
    retentionRate: 0,
    segments: [],
    topCustomers: [],
  },
} as unknown as ReportsStatistics;

afterEach(cleanup);

describe('advanced report sections', () => {
  it('omits operational alerts and renders Vietnamese report labels', () => {
    render(<AdvancedReportSections reports={reports} periodLabel="Toàn thời gian" />);

    expect(screen.queryByText('Cảnh báo vận hành')).toBeNull();
    expect(screen.queryByText(/cảnh báo cần xử lý/i)).toBeNull();
    expect(screen.queryByText(/^AOV/)).toBeNull();
    expect(screen.getByText('Giá trị đơn hàng trung bình')).toBeTruthy();
    expect(screen.getByText('Thời gian thực hiện dịch vụ')).toBeTruthy();
    expect(screen.getByText('Lịch hẹn được đo thời gian')).toBeTruthy();
    expect(screen.getByText(/300\.000/)).toBeTruthy();
  });
});

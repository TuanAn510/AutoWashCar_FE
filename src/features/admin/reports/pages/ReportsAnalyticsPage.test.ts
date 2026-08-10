import { describe, expect, it } from 'vitest';

import { queryKeys } from '@/constants/queryKeys';
import {
  buildRevenueBuckets,
  getPreviousMonth,
  getPreviousRange,
  getReportSelectionLabel,
} from '@/features/admin/reports/report-months';

describe('monthly reports', () => {
  it('uses a distinct query key for each applied month boundary', () => {
    const june = queryKeys.reports.statistics({
      startMonth: '2026-06',
      endMonth: '2026-06',
      limit: 8,
    });
    const juneToJuly = queryKeys.reports.statistics({
      startMonth: '2026-06',
      endMonth: '2026-07',
      limit: 8,
    });

    expect(june).not.toEqual(juneToJuly);
  });

  it('calculates the preceding range using calendar months', () => {
    expect(getPreviousRange({ startMonth: '2026-06', endMonth: '2026-07' })).toEqual({
      startMonth: '2026-04',
      endMonth: '2026-05',
    });
    expect(getPreviousRange({ startMonth: '2025-11', endMonth: '2026-01' })).toEqual({
      startMonth: '2025-08',
      endMonth: '2025-10',
    });
  });

  it('keeps zero-value gaps in all-time monthly chart data', () => {
    expect(
      buildRevenueBuckets({
        data: [
          { period: '2026-06', revenue: 100, completedServicesCount: 1 },
          { period: '2026-08', revenue: 50, completedServicesCount: 2 },
        ],
      })
    ).toEqual([
      {
        key: '2026-06',
        label: 'Tháng 6, 2026',
        showLabel: true,
        period: '2026-06',
        revenue: 100,
        completedServicesCount: 1,
      },
      {
        key: '2026-07',
        label: 'Tháng 7, 2026',
        showLabel: true,
        period: '2026-07',
        revenue: 0,
        completedServicesCount: 0,
      },
      {
        key: '2026-08',
        label: 'Tháng 8, 2026',
        showLabel: true,
        period: '2026-08',
        revenue: 50,
        completedServicesCount: 2,
      },
    ]);
  });

  it('builds every day for a selected month, including zero-value days', () => {
    const buckets = buildRevenueBuckets({
      month: '2026-02',
      data: [{ period: '2026-02-14', revenue: 200, completedServicesCount: 1 }],
    });

    expect(buckets).toHaveLength(28);
    expect(buckets[0]).toMatchObject({ period: '2026-02-01', label: '1', revenue: 0 });
    expect(buckets[13]).toMatchObject({ period: '2026-02-14', label: '14', revenue: 200 });
    expect(buckets[27]).toMatchObject({ period: '2026-02-28', label: '28', revenue: 0 });
  });

  it('labels all-time and month selections and resolves the comparison month', () => {
    expect(getReportSelectionLabel({ mode: 'all-time' })).toBe('Toàn thời gian');
    expect(getReportSelectionLabel({ mode: 'month', month: '2026-07' })).toBe('Tháng 7, 2026');
    expect(getPreviousMonth('2026-01')).toBe('2025-12');
  });
});

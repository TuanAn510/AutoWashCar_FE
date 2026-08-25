import { describe, expect, it } from 'vitest';

import { doesDateRangeContainToday, doesReportSelectionContainToday } from '@/features/admin/reports/report-months';

const now = new Date('2026-08-25T12:00:00+07:00');

describe('current operational-alert period', () => {
  it.each([
    ['2026-08-25', '2026-08-25'], ['2026-08-25', '2026-08-31'],
    ['2026-08-01', '2026-08-25'], ['2026-08-19', '2026-08-25'],
    ['2026-08-20', '2026-08-30'],
  ])('shows when %s through %s contains today', (fromDate, toDate) => {
    expect(doesDateRangeContainToday(fromDate, toDate, now)).toBe(true);
  });

  it.each([
    ['2026-07-01', '2026-07-31'], ['2026-06-01', '2026-06-15'],
    ['2026-09-01', '2026-09-30'],
  ])('hides when %s through %s excludes today', (fromDate, toDate) => {
    expect(doesDateRangeContainToday(fromDate, toDate, now)).toBe(false);
  });

  it('maps report selection to current-period visibility', () => {
    expect(doesReportSelectionContainToday({ mode: 'all-time' }, now)).toBe(true);
    expect(doesReportSelectionContainToday({ mode: 'month', month: '2026-08' }, now)).toBe(true);
    expect(doesReportSelectionContainToday({ mode: 'month', month: '2026-07' }, now)).toBe(false);
    expect(doesReportSelectionContainToday({ mode: 'month', month: '2026-09' }, now)).toBe(false);
  });
});

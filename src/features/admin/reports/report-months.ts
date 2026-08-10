import type { RevenueReportItem } from '@/services/reportService';

const REPORT_TIMEZONE = 'Asia/Ho_Chi_Minh';

export type MonthRange = {
  startMonth: string;
  endMonth: string;
};

export type ChartRevenueItem = RevenueReportItem & {
  key: string;
  label: string;
  showLabel: boolean;
};

export type ReportTimeSelection = { mode: 'all-time' } | { mode: 'month'; month: string };

export const getCurrentMonth = () => {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: REPORT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  return `${year}-${month}`;
};

export const getDefaultRange = (): MonthRange => {
  const currentMonth = getCurrentMonth();
  return { startMonth: currentMonth, endMonth: currentMonth };
};

const monthToIndex = (month: string) => {
  const [year, monthNumber] = month.split('-').map(Number);
  return year * 12 + monthNumber - 1;
};

const indexToMonth = (index: number) => {
  const year = Math.floor(index / 12);
  const month = (index % 12) + 1;
  return `${year}-${String(month).padStart(2, '0')}`;
};

export function getPreviousRange(range: MonthRange): MonthRange {
  const startIndex = monthToIndex(range.startMonth);
  const duration = monthToIndex(range.endMonth) - startIndex + 1;
  const previousEndIndex = startIndex - 1;
  return {
    startMonth: indexToMonth(previousEndIndex - duration + 1),
    endMonth: indexToMonth(previousEndIndex),
  };
}

export const formatMonthLabel = (month: string) => {
  const [year, monthNumber] = month.split('-');
  return `Tháng ${Number(monthNumber)}, ${year}`;
};

export const getPreviousMonth = (month: string) => indexToMonth(monthToIndex(month) - 1);

export const getReportSelectionLabel = (selection: ReportTimeSelection) =>
  selection.mode === 'all-time' ? 'Toàn thời gian' : formatMonthLabel(selection.month);

const buildMonthlyBuckets = (data: RevenueReportItem[]): ChartRevenueItem[] => {
  if (!data.length) return [];
  const byPeriod = new Map(data.map((item) => [item.period, item]));
  const periods = data.map((item) => item.period).sort();
  const firstMonth = periods[0];
  const lastMonth = periods[periods.length - 1];

  const result: ChartRevenueItem[] = [];
  for (let index = monthToIndex(firstMonth); index <= monthToIndex(lastMonth); index += 1) {
    const period = indexToMonth(index);
    const item = byPeriod.get(period) ?? { period, revenue: 0, completedServicesCount: 0 };
    result.push({ ...item, key: period, label: formatMonthLabel(period), showLabel: true });
  }
  return result;
};

const buildDailyBuckets = (data: RevenueReportItem[], month: string): ChartRevenueItem[] => {
  const [year, monthNumber] = month.split('-').map(Number);
  const numberOfDays = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const byPeriod = new Map(data.map((item) => [item.period, item]));

  return Array.from({ length: numberOfDays }, (_, index) => {
    const day = index + 1;
    const period = `${month}-${String(day).padStart(2, '0')}`;
    const item = byPeriod.get(period) ?? { period, revenue: 0, completedServicesCount: 0 };
    return {
      ...item,
      key: period,
      label: String(day),
      showLabel: day === 1 || day === numberOfDays || day % 5 === 0,
    };
  });
};

export function buildRevenueBuckets({
  data,
  month,
}: {
  data: RevenueReportItem[];
  month?: string;
}): ChartRevenueItem[] {
  return month ? buildDailyBuckets(data, month) : buildMonthlyBuckets(data);
}

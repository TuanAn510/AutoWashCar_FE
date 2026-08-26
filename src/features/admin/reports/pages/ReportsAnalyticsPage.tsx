import { useMemo, useState } from 'react';
import {
  BadgeCheck,
  BarChart3,
  CalendarDays,
  Car,
  DollarSign,
  Gift,
  Loader2,
  RotateCcw,
  TicketPercent,
  Users,
  Wrench,
} from 'lucide-react';

import { StatCard, type StatCardTrend } from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import { TimeFilter, type TimeFilterValue } from '@/features/admin/reports/components/TimeFilter';
import {
  AdvancedReportSections,
  ReportExportActions,
} from '@/features/admin/reports/components/AdvancedReportSections';
import { useReports } from '@/features/admin/reports/hooks/useReports';
import {
  buildRevenueBuckets,
  getCurrentMonth,
  getPreviousMonth,
  getReportSelectionLabel,
  type ChartRevenueItem,
} from '@/features/admin/reports/report-months';
import { getErrorMessage } from '@/features/shared/loyalty/utils/error-message';
import { formatCurrencyVi, formatNumberVi } from '@/lib/utils';
import type { ReportPeriod, RevenueReportItem, ServiceReportItem } from '@/services/reportService';

const REPORT_LIMIT = 8;
const TOP_RANKING_LIMIT = 5;
const CHART_HEIGHT = 264;
const BAR_MAX_WIDTH = 56;

type ChangeState =
  | { status: 'unavailable'; label: string }
  | { status: 'available'; value: number; trend: StatCardTrend };

const promotionTypeLabels: Record<string, string> = {
  percentage: 'Giảm theo phần trăm',
  fixed_amount: 'Giảm số tiền cố định',
  free_service: 'Tặng dịch vụ',
  bonus_points: 'Tặng điểm',
};

const sumRevenue = (items: RevenueReportItem[] = []) =>
  items.reduce((total, item) => total + item.revenue, 0);

const sumCompletedServices = (items: RevenueReportItem[] = []) =>
  items.reduce((total, item) => total + item.completedServicesCount, 0);

function buildChangeState(current: number, previous: number, comparisonLabel: string): ChangeState {
  if (!previous) return { status: 'unavailable', label: `Chưa có dữ liệu ${comparisonLabel}` };

  const value = ((current - previous) / previous) * 100;
  const rounded = Number(value.toFixed(1));
  const direction: StatCardTrend['direction'] =
    rounded > 0 ? 'up' : rounded < 0 ? 'down' : 'neutral';

  return {
    status: 'available',
    value: rounded,
    trend: {
      value: `${rounded > 0 ? '+' : ''}${formatNumberVi(rounded)}%`,
      label: `so với ${comparisonLabel}`,
      direction,
    },
  };
}

function SummaryCard({
  label,
  value,
  icon,
  trend,
}: {
  label: string;
  value: string;
  icon: typeof DollarSign;
  trend?: StatCardTrend;
}) {
  return <StatCard title={label} value={value} icon={icon} trend={trend} />;
}

function EmptyState({ message, suggestion }: { message: string; suggestion?: string }) {
  return (
    <div className="grid place-items-center rounded-lg border border-dashed border-slate-300 bg-gradient-to-b from-slate-50 to-white px-4 py-8 text-center text-sm text-slate-500">
      <span className="mb-3 grid size-11 place-items-center rounded-full bg-blue-50 text-blue-500">
        <BarChart3 className="size-5" />
      </span>
      <p className="font-medium text-slate-700">{message}</p>
      {suggestion ? <p className="mt-1 max-w-sm text-xs text-slate-500">{suggestion}</p> : null}
    </div>
  );
}

function PeriodContext({ label }: { label: string }) {
  return (
    <span className="mt-1 inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
      Đang hiển thị: {label}
    </span>
  );
}

function TrendBadge({ change }: { change: ChangeState }) {
  if (change.status === 'unavailable') {
    return (
      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
        {change.label}
      </span>
    );
  }

  const tone =
    change.trend.direction === 'up'
      ? 'bg-emerald-50 text-emerald-700'
      : change.trend.direction === 'down'
        ? 'bg-rose-50 text-rose-700'
        : 'bg-slate-100 text-slate-600';

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {change.trend.value} {change.trend.label}
    </span>
  );
}

function RevenueBarChart({
  data,
  completedAppointments,
  period,
}: {
  data: ChartRevenueItem[];
  completedAppointments: number;
  period: ReportPeriod;
}) {
  const maxRevenue = Math.max(...data.map((item) => item.revenue), 1);
  const totalRevenue = sumRevenue(data);
  const averageRevenue = data.length ? totalRevenue / data.length : 0;
  const bestPeriod = data.reduce<ChartRevenueItem | null>(
    (best, item) => (!best || item.revenue > best.revenue ? item : best),
    null
  );
  const yAxisTicks = [1, 0.75, 0.5, 0.25, 0];
  const averageLabel =
    period === 'monthly' || period === 'yearly' ? 'Trung bình theo tháng' : 'Trung bình theo ngày';
  const chartWidth = data.length >= 30 ? `max(100%, ${data.length * 60}px)` : '100%';

  return (
    <div className="mt-5">
      <div className="mb-3 flex flex-wrap gap-3 text-xs font-medium text-slate-500">
        <span className="inline-flex items-center gap-2">
          <span className="size-2 rounded-full bg-blue-600" />
          Doanh thu
        </span>
      </div>

      <div className="w-full overflow-x-auto pb-2">
        <div
          className="relative w-full rounded-lg border border-slate-100 bg-slate-50 px-5 pb-8 pt-7"
          style={{ height: CHART_HEIGHT, minWidth: '100%', width: chartWidth }}
        >
          <div className="pointer-events-none absolute left-[104px] right-5 top-8 space-y-[38px]">
            {[0, 1, 2, 3].map((line) => (
              <div key={line} className="border-t border-dashed border-slate-200" />
            ))}
          </div>
          <div className="pointer-events-none absolute bottom-12 left-4 top-7 flex flex-col justify-between text-xs font-medium text-slate-400">
            {yAxisTicks.map((tick) => (
              <span key={tick}>{formatCurrencyVi(maxRevenue * tick)}</span>
            ))}
          </div>

          <div className="absolute bottom-12 left-[104px] right-5 top-10 flex items-end justify-around gap-4">
            {data.map((item) => {
              const height = item.revenue > 0 ? Math.max(10, (item.revenue / maxRevenue) * 145) : 0;
              const width = data.length <= 2 ? BAR_MAX_WIDTH : Math.min(BAR_MAX_WIDTH, 44);

              return (
                <div
                  key={item.key}
                  className="group relative flex h-full min-w-16 flex-1 flex-col items-center justify-end"
                >
                  <div
                    className="rounded-t-[4px] bg-blue-600 transition group-hover:bg-blue-700"
                    style={{ height, width }}
                  />
                  <div className="pointer-events-none absolute left-1/2 top-0 z-10 hidden w-64 -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-3 text-left text-xs shadow-lg group-hover:block">
                    <p className="font-semibold text-slate-950">{item.label}</p>
                    <p className="mt-1 text-slate-600">
                      Doanh thu: {formatCurrencyVi(item.revenue)}
                    </p>
                    <p className="mt-1 text-slate-600">
                      Lịch hoàn thành trong kỳ: {formatNumberVi(completedAppointments)}
                    </p>
                    <p className="mt-1 text-slate-600">
                      Dịch vụ hoàn thành: {formatNumberVi(item.completedServicesCount)}
                    </p>
                  </div>
                  <span className="mt-3 h-4 max-w-20 truncate text-xs font-medium text-slate-500">
                    {item.showLabel ? item.label : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">Tổng doanh thu</p>
          <p className="mt-1 text-base font-semibold text-slate-950">
            {formatCurrencyVi(totalRevenue)}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">{averageLabel}</p>
          <p className="mt-1 text-base font-semibold text-slate-950">
            {formatCurrencyVi(averageRevenue)}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">Doanh thu cao nhất</p>
          <p className="mt-1 text-base font-semibold text-slate-950">
            {bestPeriod ? formatCurrencyVi(bestPeriod.revenue) : formatCurrencyVi(0)}
          </p>
          <p className="mt-1 truncate text-xs text-slate-500">
            {bestPeriod?.label ?? 'Chưa có dữ liệu'}
          </p>
        </div>
      </div>
    </div>
  );
}

function AppointmentStatusChart({
  pending,
  completed,
  cancelled,
  periodLabel,
}: {
  pending: number;
  completed: number;
  cancelled: number;
  periodLabel: string;
}) {
  const total = pending + completed + cancelled;

  if (!total)
    return (
      <EmptyState
        message={`Không có lịch hẹn trong ${periodLabel.toLowerCase()}.`}
        suggestion="Hãy chọn một tháng khác hoặc chuyển sang Toàn thời gian."
      />
    );

  const segments = [
    { label: 'Hoàn thành', value: completed, color: '#10b981' },
    { label: 'Đang chờ', value: pending, color: '#f59e0b' },
    { label: 'Đã hủy', value: cancelled, color: '#ef4444' },
  ];
  let cursor = 0;
  const gradient = segments
    .map((segment) => {
      const start = cursor;
      const percent = (segment.value / total) * 100;
      cursor += percent;
      return `${segment.color} ${start}% ${cursor}%`;
    })
    .join(', ');
  const completionRate = total ? (completed / total) * 100 : 0;

  return (
    <div className="mt-5 grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
      <div
        className="mx-auto grid size-44 place-items-center rounded-full"
        style={{ background: `conic-gradient(${gradient})` }}
      >
        <div className="grid size-28 place-items-center rounded-full bg-white text-center shadow-sm">
          <div>
            <p className="text-2xl font-bold text-slate-950">{formatNumberVi(total)}</p>
            <p className="text-xs text-slate-500">tổng lịch hẹn</p>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="rounded-lg bg-emerald-50 p-3 text-sm">
          <span className="text-emerald-700">Tỷ lệ hoàn thành</span>
          <strong className="ml-2 text-emerald-800">
            {formatNumberVi(Number(completionRate.toFixed(1)))}%
          </strong>
        </div>
        {segments.map((segment) => (
          <div key={segment.label} className="rounded-lg bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="inline-flex items-center gap-2 font-medium text-slate-600">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                {segment.label}
              </span>
              <strong>{formatNumberVi(segment.value)}</strong>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-200">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(segment.value / total) * 100}%`,
                  backgroundColor: segment.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const getServiceRankName = (service: ServiceReportItem) =>
  service.serviceName || 'D\u1ecbch v\u1ee5 ch\u01b0a c\u00f3 t\u00ean';

function sortServicesByRank(services: ServiceReportItem[]) {
  return [...services].sort((first, second) => {
    const usageDelta = second.usageCount - first.usageCount;

    if (usageDelta !== 0) return usageDelta;

    const revenueDelta = second.revenue - first.revenue;

    if (revenueDelta !== 0) return revenueDelta;

    return getServiceRankName(first).localeCompare(getServiceRankName(second), 'vi');
  });
}

function ServiceRankList({
  title,
  services,
  periodLabel,
}: {
  title: string;
  services: ServiceReportItem[];
  periodLabel: string;
}) {
  const rankedServices = sortServicesByRank(services).slice(0, TOP_RANKING_LIMIT);

  return (
    <section className="rounded-lg border border-border/80 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-normal text-slate-950">{title}</h2>
          <PeriodContext label={periodLabel} />
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {rankedServices.length ? (
          rankedServices.map((service, index) => (
            <div
              key={`${title}-${service.serviceId}`}
              className="grid gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-sm font-bold text-slate-700 ring-1 ring-slate-200">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">
                    {getServiceRankName(service)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {'Th\u1ee9 h\u1ea1ng theo s\u1ed1 l\u01b0\u1ee3t \u0111\u1eb7t'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:w-[220px]">
                <div className="rounded-md bg-white px-3 py-2 ring-1 ring-slate-100">
                  <p className="text-[11px] font-medium uppercase text-slate-400">
                    {'L\u01b0\u1ee3t \u0111\u1eb7t'}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">
                    {formatNumberVi(service.usageCount)}
                  </p>
                </div>
                <div className="rounded-md bg-white px-3 py-2 ring-1 ring-slate-100">
                  <p className="text-[11px] font-medium uppercase text-slate-400">Doanh thu</p>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-950">
                    {formatCurrencyVi(service.revenue)}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            message={`Không có dịch vụ nào được đặt trong ${periodLabel.toLowerCase()}.`}
            suggestion="Hãy chọn một tháng khác hoặc chuyển sang Toàn thời gian."
          />
        )}
      </div>
    </section>
  );
}

export default function ReportsAnalyticsPage() {
  const currentMonth = getCurrentMonth();
  const [timeSelection, setTimeSelection] = useState<TimeFilterValue>({ mode: 'all-time' });
  const isMonthMode = timeSelection.mode === 'month';
  const selectedMonth = isMonthMode ? timeSelection.month : undefined;
  const period: ReportPeriod = isMonthMode ? 'daily' : 'monthly';
  const periodLabel = getReportSelectionLabel(timeSelection);
  const comparisonMonth = selectedMonth ? getPreviousMonth(selectedMonth) : undefined;
  const comparisonLabel = comparisonMonth
    ? getReportSelectionLabel({ mode: 'month', month: comparisonMonth })
    : '';
  const reportParams = useMemo(
    () => ({
      ...(selectedMonth ? { startMonth: selectedMonth, endMonth: selectedMonth } : {}),
      period,
      limit: REPORT_LIMIT,
    }),
    [period, selectedMonth]
  );

  const reportsQuery = useReports(reportParams);
  const previousReportsQuery = useReports(
    {
      ...(comparisonMonth ? { startMonth: comparisonMonth, endMonth: comparisonMonth } : {}),
      period: 'daily',
      limit: REPORT_LIMIT,
    },
    { enabled: isMonthMode }
  );

  const reports = reportsQuery.data;
  const previousReports = previousReportsQuery.data;
  const revenueChartData = useMemo(
    () =>
      reports
        ? buildRevenueBuckets({
            data: reports.revenue.data,
            month: selectedMonth,
          })
        : [],
    [reports, selectedMonth]
  );
  const hasRevenueData = revenueChartData.some((item) => item.revenue > 0);
  const currentRevenue = sumRevenue(reports?.revenue.data);
  const previousRevenue = sumRevenue(previousReports?.revenue.data);
  const currentCompletedServices = sumCompletedServices(reports?.revenue.data);
  const previousCompletedServices = sumCompletedServices(previousReports?.revenue.data);
  const revenueChange = isMonthMode
    ? buildChangeState(currentRevenue, previousRevenue, comparisonLabel)
    : null;
  const appointmentChange = isMonthMode
    ? buildChangeState(
        reports?.appointments.totalAppointments ?? 0,
        previousReports?.appointments.totalAppointments ?? 0,
        comparisonLabel
      )
    : null;
  const serviceChange = isMonthMode
    ? buildChangeState(currentCompletedServices, previousCompletedServices, comparisonLabel)
    : null;

  return (
    <main className="min-h-[calc(100vh-81px)] bg-[#f8fafc] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1540px] space-y-5">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
              Báo cáo & Thống kê
            </h1>
            <p className="mt-2 max-w-3xl text-base text-slate-500">
              Dữ liệu tổng hợp từ lịch hẹn, lịch sử dịch vụ, khách hàng, tích điểm, khuyến mãi và
              xe.
            </p>
          </div>
          <ReportExportActions params={reportParams} />
        </section>

        <TimeFilter
          currentMonth={currentMonth}
          isFetching={reportsQuery.isFetching && !reportsQuery.isLoading}
          label={periodLabel}
          value={timeSelection}
          onChange={setTimeSelection}
        />

        {reportsQuery.isLoading ? (
          <section className="rounded-lg border border-border/80 bg-white px-6 py-20 text-center text-slate-500">
            <Loader2 className="mx-auto mb-3 size-7 animate-spin text-slate-400" />
            Đang tải báo cáo...
          </section>
        ) : null}

        {reportsQuery.isError ? (
          <section className="rounded-lg border border-rose-200 bg-rose-50 px-6 py-14 text-center">
            <h2 className="text-xl font-semibold text-rose-700">Không thể tải báo cáo</h2>
            <p className="mt-2 text-sm text-rose-600">
              {getErrorMessage(reportsQuery.error, 'Vui lòng thử lại sau.')}
            </p>
            <Button className="mt-5 rounded-md" onClick={() => reportsQuery.refetch()}>
              <RotateCcw className="size-4" />
              Thử lại
            </Button>
          </section>
        ) : null}

        {reports ? (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                icon={DollarSign}
                label="Tổng doanh thu"
                value={formatCurrencyVi(currentRevenue)}
                trend={revenueChange?.status === 'available' ? revenueChange.trend : undefined}
              />
              <SummaryCard
                icon={Users}
                label="Khách hàng"
                value={formatNumberVi(
                  isMonthMode ? reports.customers.newCustomersInRange : reports.customers.totalCustomers
                )}
              />
              <SummaryCard
                icon={CalendarDays}
                label="Lịch hẹn"
                value={formatNumberVi(reports.appointments.totalAppointments)}
                trend={
                  appointmentChange?.status === 'available' ? appointmentChange.trend : undefined
                }
              />
              <SummaryCard
                icon={BadgeCheck}
                label="Thành viên tích điểm"
                value={formatNumberVi(reports.loyalty.totalLoyaltyMembers)}
              />
              <SummaryCard
                icon={Wrench}
                label="Dịch vụ hoàn thành"
                value={formatNumberVi(currentCompletedServices)}
                trend={serviceChange?.status === 'available' ? serviceChange.trend : undefined}
              />
              <SummaryCard
                icon={Car}
                label="Xe"
                value={formatNumberVi(reports.vehicles.totalVehicles)}
              />
              <SummaryCard
                icon={TicketPercent}
                label="Lượt dùng khuyến mãi"
                value={formatNumberVi(reports.promotions.promotionUsageCount)}
              />
              <SummaryCard
                icon={Gift}
                label="Điểm đã đổi"
                value={formatNumberVi(reports.loyalty.pointsRedeemed)}
              />
            </section>

            <section className="grid gap-5 xl:grid-cols-[minmax(0,1.32fr)_minmax(320px,0.68fr)]">
              <div className="rounded-lg border border-border/80 bg-white p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold tracking-normal text-slate-950">
                      {isMonthMode ? 'Doanh thu theo ngày' : 'Xu hướng doanh thu theo tháng'}
                    </h2>
                    <PeriodContext label={periodLabel} />
                  </div>
                  {revenueChange ? <TrendBadge change={revenueChange} /> : null}
                </div>

                {!hasRevenueData ? (
                  <div className="mt-5">
                    <EmptyState
                      message={`Chưa có doanh thu trong ${periodLabel.toLowerCase()}.`}
                      suggestion="Các mốc thời gian vẫn được hiển thị với giá trị 0 để bạn dễ đối chiếu."
                    />
                  </div>
                ) : null}
                {revenueChartData.length ? (
                  <RevenueBarChart
                    completedAppointments={reports.appointments.completedAppointments}
                    data={revenueChartData}
                    period={period}
                  />
                ) : null}
              </div>

              <div className="rounded-lg border border-border/80 bg-white p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold tracking-normal text-slate-950">
                      Trạng thái lịch hẹn
                    </h2>
                    <PeriodContext label={periodLabel} />
                  </div>
                  {appointmentChange ? <TrendBadge change={appointmentChange} /> : null}
                </div>
                <AppointmentStatusChart
                  cancelled={reports.appointments.cancelledAppointments}
                  completed={reports.appointments.completedAppointments}
                  pending={reports.appointments.pendingAppointments}
                  periodLabel={periodLabel}
                />
              </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
              <ServiceRankList
                services={reports.services.mostBookedServices}
                title="Dịch vụ được đặt nhiều"
                periodLabel={periodLabel}
              />

              <div className="rounded-lg border border-border/80 bg-white p-5">
                <h2 className="text-lg font-semibold tracking-normal text-slate-950">
                  Hãng xe phổ biến
                </h2>
                <PeriodContext label={periodLabel} />
                <div className="mt-5 space-y-3">
                  {reports.vehicles.mostCommonVehicleBrands.length ? (
                    reports.vehicles.mostCommonVehicleBrands
                      .slice(0, TOP_RANKING_LIMIT)
                      .map((vehicle) => (
                        <div
                          key={vehicle.brand}
                          className="flex justify-between rounded-lg bg-slate-50 p-3"
                        >
                          <span className="text-sm text-slate-600">{vehicle.brand}</span>
                          <strong className="text-sm">{formatNumberVi(vehicle.total)}</strong>
                        </div>
                      ))
                  ) : (
                    <EmptyState
                      message={`Chưa có dữ liệu xe trong ${periodLabel.toLowerCase()}.`}
                      suggestion="Hãy chọn một tháng khác hoặc chuyển sang Toàn thời gian."
                    />
                  )}
                </div>
              </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
              <div className="rounded-lg border border-border/80 bg-white p-5">
                <h2 className="text-lg font-semibold tracking-normal text-slate-950">
                  Hạng thành viên
                </h2>
                <PeriodContext label={periodLabel} />
                <div className="mt-5 space-y-3">
                  {reports.loyalty.membershipTierDistribution.length ? (
                    reports.loyalty.membershipTierDistribution.map((tier) => (
                      <div
                        key={tier.tier}
                        className="flex justify-between rounded-lg bg-slate-50 p-3"
                      >
                        <span className="text-sm text-slate-600">{tier.tier}</span>
                        <strong className="text-sm">{formatNumberVi(tier.total)}</strong>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      message={`Chưa có dữ liệu hạng thành viên trong ${periodLabel.toLowerCase()}.`}
                      suggestion="Hãy chọn một tháng khác hoặc chuyển sang Toàn thời gian."
                    />
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-border/80 bg-white p-5">
                <h2 className="text-lg font-semibold tracking-normal text-slate-950">
                  Loại khuyến mãi
                </h2>
                <PeriodContext label={periodLabel} />
                <div className="mt-5 space-y-3">
                  {reports.promotions.distributionByType.length ? (
                    reports.promotions.distributionByType.map((promotion) => (
                      <div
                        key={promotion.type}
                        className="flex justify-between rounded-lg bg-slate-50 p-3"
                      >
                        <span className="text-sm text-slate-600">
                          {promotionTypeLabels[promotion.type] ?? promotion.type}
                        </span>
                        <strong className="text-sm">{formatNumberVi(promotion.total)}</strong>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      message={`Chưa có dữ liệu khuyến mãi trong ${periodLabel.toLowerCase()}.`}
                      suggestion="Hãy chọn một tháng khác hoặc chuyển sang Toàn thời gian."
                    />
                  )}
                </div>
              </div>
            </section>

            <AdvancedReportSections
              reports={reports}
              periodLabel={periodLabel}
            />
          </>
        ) : null}
      </div>
    </main>
  );
}

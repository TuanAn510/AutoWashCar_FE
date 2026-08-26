import { useState } from 'react';
import {
  Clock3,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Tags,
  UserRoundCheck,
  UsersRound,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { formatCurrencyVi, formatNumberVi } from '@/lib/utils';
import {
  reportApi,
  type DateRangeParams,
  type ReportsStatistics,
} from '@/services/reportService';

const segmentLabels: Record<string, string> = {
  one_time: 'Khách một lần',
  returning: 'Khách quay lại',
  loyal: 'Khách trung thành',
  at_risk: 'Có nguy cơ rời bỏ',
  inactive: 'Không hoạt động',
};

function SectionHeader({ icon: Icon, title, subtitle }: {
  icon: typeof Clock3;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700">
        <Icon className="size-5" />
      </span>
      <div>
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function Progress({ value, tone = 'bg-blue-600' }: { value: number; tone?: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function ReportExportActions({ params }: { params: DateRangeParams }) {
  const [downloading, setDownloading] = useState<'xlsx' | 'pdf' | null>(null);

  const download = async (format: 'xlsx' | 'pdf') => {
    try {
      setDownloading(format);
      const blob = await reportApi.exportAnalytics(format, params);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `bao-cao-admin.${format}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success(`Đã tải báo cáo ${format.toUpperCase()}`);
    } catch {
      toast.error('Không thể tải báo cáo. Vui lòng thử lại.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" disabled={downloading !== null} onClick={() => download('xlsx')}>
        {downloading === 'xlsx' ? <Loader2 className="size-4 animate-spin" /> : <FileSpreadsheet className="size-4" />}
        Xuất Excel
      </Button>
      <Button variant="outline" disabled={downloading !== null} onClick={() => download('pdf')}>
        {downloading === 'pdf' ? <Loader2 className="size-4 animate-spin" /> : <FileText className="size-4" />}
        Xuất PDF
      </Button>
    </div>
  );
}

export function AdvancedReportSections({ reports, periodLabel }: {
  reports: ReportsStatistics;
  periodLabel: string;
}) {
  const staff = reports.staffPerformance.staff;
  const maxCompleted = Math.max(1, ...staff.map((item) => item.completedBookings));

  return (
    <div className="space-y-5">
      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-lg border border-border/80 bg-white p-5">
          <SectionHeader icon={UserRoundCheck} title="Hiệu suất nhân viên" subtitle={`Kết quả trong ${periodLabel.toLowerCase()}.`} />
          <div className="mt-5 space-y-3">
            {staff.length ? staff.slice(0, 8).map((item) => (
              <div key={item.staffId} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{item.staffName}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatNumberVi(item.completedBookings)}/{formatNumberVi(item.assignedBookings)} lịch hẹn hoàn thành
                    </p>
                  </div>
                  <strong className="text-sm text-blue-700">{formatNumberVi(item.completionRate)}%</strong>
                </div>
                <div className="mt-3"><Progress value={(item.completedBookings / maxCompleted) * 100} /></div>
                <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-slate-500">
                  <span>Doanh thu quy đổi: {formatCurrencyVi(item.attributedRevenue)}</span>
                  <span>Trung bình {formatNumberVi(item.averageServiceMinutes)} phút</span>
                </div>
              </div>
            )) : <p className="rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-500">Chưa có dữ liệu nhân viên.</p>}
          </div>
        </div>

        <div className="rounded-lg border border-border/80 bg-white p-5">
          <SectionHeader icon={Clock3} title="Thời gian thực hiện dịch vụ" subtitle="Tiếp nhận xe đúng giờ khi không trễ quá 15 phút." />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Metric label="Chờ trung bình" value={`${formatNumberVi(reports.serviceTimes.averageWaitingMinutes)} phút`} />
            <Metric label="Phục vụ trung bình" value={`${formatNumberVi(reports.serviceTimes.averageServiceMinutes)} phút`} />
            <Metric label="Lịch hẹn được đo thời gian" value={formatNumberVi(reports.serviceTimes.measuredServiceBookings)} />
            <Metric label="Tỷ lệ đúng giờ" value={`${formatNumberVi(reports.serviceTimes.onTimeRate)}%`} />
          </div>
          <div className="mt-5 rounded-lg border border-slate-100 p-4">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-slate-600">Lịch hẹn tiếp nhận đúng giờ</span>
              <strong>{formatNumberVi(reports.serviceTimes.onTimeBookings)}/{formatNumberVi(reports.serviceTimes.measuredWaitingBookings)}</strong>
            </div>
            <Progress value={reports.serviceTimes.onTimeRate} tone="bg-emerald-500" />
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-lg border border-border/80 bg-white p-5">
          <SectionHeader icon={Tags} title="Hiệu quả khuyến mãi" subtitle="Đo doanh thu, giảm giá và giá trị đơn theo mã." />
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Metric label="Doanh thu có mã" value={formatCurrencyVi(reports.promotionEffectiveness.promotionRevenue)} />
            <Metric label="Tổng tiền giảm" value={formatCurrencyVi(reports.promotionEffectiveness.totalDiscount)} />
            <Metric label="Giá trị đơn hàng trung bình" value={formatCurrencyVi(reports.promotionEffectiveness.averageOrderWithPromotion)} />
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b text-xs uppercase text-slate-400"><tr><th className="py-3">Mã</th><th>Lượt dùng</th><th>Khách</th><th>Giảm giá</th><th className="text-right">Doanh thu</th></tr></thead>
              <tbody>{reports.promotionEffectiveness.promotions.slice(0, 8).map((item) => (
                <tr key={item.promotionId} className="border-b border-slate-100 last:border-0">
                  <td className="py-3"><p className="font-semibold text-slate-900">{item.code}</p><p className="text-xs text-slate-400">{item.title}</p></td>
                  <td>{formatNumberVi(item.usageCount)}</td><td>{formatNumberVi(item.uniqueCustomers)}</td><td>{formatCurrencyVi(item.totalDiscount)}</td><td className="text-right font-semibold">{formatCurrencyVi(item.revenue)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-border/80 bg-white p-5">
          <SectionHeader icon={UsersRound} title="Giữ chân & phân nhóm khách hàng" subtitle="Nhận diện khách quay lại và nhóm có nguy cơ rời bỏ." />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Metric label="Tỷ lệ quay lại" value={`${formatNumberVi(reports.customerRetention.retentionRate)}%`} />
            <Metric label="Khách trung thành" value={formatNumberVi(reports.customerRetention.loyalCustomers)} />
          </div>
          <div className="mt-5 space-y-3">
            {reports.customerRetention.segments.map((item) => {
              const total = Math.max(1, reports.customerRetention.customersWithCompletedBookings);
              return <div key={item.segment} className="rounded-lg bg-slate-50 p-3">
                <div className="mb-2 flex justify-between text-sm"><span className="text-slate-600">{segmentLabels[item.segment] ?? item.segment}</span><strong>{formatNumberVi(item.customers)}</strong></div>
                <Progress value={(item.customers / total) * 100} tone={item.segment === 'at_risk' || item.segment === 'inactive' ? 'bg-amber-500' : 'bg-blue-600'} />
              </div>;
            })}
          </div>
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-slate-900">Khách hàng chi tiêu cao</h3>
            <div className="mt-3 space-y-2">{reports.customerRetention.topCustomers.slice(0, 5).map((customer, index) => (
              <div key={customer.customerId} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3">
                <div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800">{index + 1}. {customer.customerName}</p><p className="text-xs text-slate-400">{formatNumberVi(customer.completedBookings)} lần sử dụng</p></div>
                <strong className="shrink-0 text-sm">{formatCurrencyVi(customer.totalSpent)}</strong>
              </div>
            ))}</div>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-2 text-xs text-slate-400"><Download className="size-3.5" /> Dữ liệu xuất file sử dụng cùng bộ lọc thời gian đang chọn.</div>
    </div>
  );
}

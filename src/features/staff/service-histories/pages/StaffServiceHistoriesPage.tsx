import { Activity, CalendarClock, CheckCircle2, WalletCards } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { EmptyStaffServiceHistoriesState } from '@/features/staff/service-histories/components/EmptyStaffServiceHistoriesState';
import { StaffServiceHistoryDetailDialog } from '@/features/staff/service-histories/components/StaffServiceHistoryDetailDialog';
import { StaffServiceHistoryFilters } from '@/features/staff/service-histories/components/StaffServiceHistoryFilters';
import { StaffServiceHistoryList } from '@/features/staff/service-histories/components/StaffServiceHistoryList';
import { useMyStaffServiceHistories } from '@/features/staff/service-histories/hooks/useMyStaffServiceHistories';
import type { AppointmentStatus } from '@/types/appointment';
import type { ServiceHistoryItem } from '@/types/serviceHistory';
import { formatServiceHistoryPrice } from '@/lib/utils';

const isSameLocalDate = (dateA: Date, dateB: Date) =>
  dateA.getFullYear() === dateB.getFullYear() &&
  dateA.getMonth() === dateB.getMonth() &&
  dateA.getDate() === dateB.getDate();

const isRevenueStatus = (status: AppointmentStatus) =>
  status === 'completed' || status === 'in_progress';

export default function StaffServiceHistoriesPage() {
  const [keyword, setKeyword] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [detailServiceHistory, setDetailServiceHistory] = useState<ServiceHistoryItem | null>(null);

  const serviceHistoriesQuery = useMyStaffServiceHistories();
  const serviceHistories = useMemo(() => {
    const items = serviceHistoriesQuery.data?.items ?? [];
    return [...items].sort(
      (a, b) => new Date(b.servicedAt).getTime() - new Date(a.servicedAt).getTime()
    );
  }, [serviceHistoriesQuery.data?.items]);

  const filteredServiceHistories = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    const selectedDate = dateFilter ? new Date(dateFilter) : null;

    return serviceHistories.filter((serviceHistory) => {
      if (selectedDate && !isSameLocalDate(new Date(serviceHistory.servicedAt), selectedDate)) {
        return false;
      }

      if (!normalizedKeyword) {
        return true;
      }

      const searchContent = [
        serviceHistory.customerId.displayName,
        serviceHistory.customerId.phone,
        serviceHistory.vehicleId.licensePlate,
        serviceHistory.vehicleId.brand,
        serviceHistory.vehicleId.model,
        serviceHistory.note,
        serviceHistory.appointmentId.status,
        ...serviceHistory.services.map((service) => service.nameSnapshot),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchContent.includes(normalizedKeyword);
    });
  }, [dateFilter, keyword, serviceHistories]);

  const summary = useMemo(
    () =>
      filteredServiceHistories.reduce(
        (acc, serviceHistory) => {
          const status = serviceHistory.appointmentId.status;
          if (status === 'completed') {
            acc.completed += 1;
          }
          if (status === 'in_progress') {
            acc.inProgress += 1;
          }
          if (isRevenueStatus(status)) {
            acc.revenue += serviceHistory.totalPrice;
          }
          return acc;
        },
        { completed: 0, inProgress: 0, revenue: 0 }
      ),
    [filteredServiceHistories]
  );

  return (
    <main className="min-h-[calc(100vh-73px)] min-w-0 overflow-x-hidden bg-[#f5f7fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-6">
        <section className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <CalendarClock className="size-4" />
              Lịch sử nhân viên
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Lịch sử và tiến độ dịch vụ
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
              Theo dõi các đơn đã thực hiện, đơn đang thực hiện và tổng giá trị công việc được phân
              công cho bạn.
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            icon={CheckCircle2}
            label="Đơn đã thực hiện"
            value={`${summary.completed}`}
            tone="emerald"
          />
          <SummaryCard
            icon={Activity}
            label="Đơn đang thực hiện"
            value={`${summary.inProgress}`}
            tone="blue"
          />
          <SummaryCard
            icon={WalletCards}
            label="Tổng tiền từ các đơn"
            value={formatServiceHistoryPrice(summary.revenue)}
            tone="slate"
          />
        </section>

        <StaffServiceHistoryFilters
          keyword={keyword}
          date={dateFilter}
          onKeywordChange={setKeyword}
          onDateChange={setDateFilter}
        />

        {serviceHistoriesQuery.isLoading ? (
          <section className="rounded-[28px] bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Đang tải dữ liệu nhân viên...</p>
          </section>
        ) : serviceHistoriesQuery.isError ? (
          <section className="rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-16 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-rose-700">Không thể tải dữ liệu nhân viên</h2>
            <p className="mt-2 text-sm text-rose-600">Vui lòng thử lại.</p>
            <Button
              className="mt-5 rounded-xl"
              variant="outline"
              onClick={() => serviceHistoriesQuery.refetch()}
            >
              Thử lại
            </Button>
          </section>
        ) : serviceHistories.length === 0 ? (
          <EmptyStaffServiceHistoriesState />
        ) : filteredServiceHistories.length === 0 ? (
          <section className="rounded-[28px] bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">
              Không tìm thấy dữ liệu phù hợp với bộ lọc hiện tại.
            </p>
          </section>
        ) : (
          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Bảng theo dõi công việc</h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredServiceHistories.length} đơn đang hiển thị.
              </p>
            </div>
            <StaffServiceHistoryList
              serviceHistories={filteredServiceHistories}
              onViewDetail={setDetailServiceHistory}
            />
          </section>
        )}
      </div>

      <StaffServiceHistoryDetailDialog
        serviceHistory={detailServiceHistory}
        open={!!detailServiceHistory}
        onOpenChange={(open) => {
          if (!open) {
            setDetailServiceHistory(null);
          }
        }}
      />
    </main>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: 'emerald' | 'blue' | 'slate';
}) {
  const toneClassName =
    tone === 'emerald'
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
      : tone === 'blue'
        ? 'bg-sky-50 text-sky-700 ring-sky-100'
        : 'bg-slate-100 text-slate-700 ring-slate-200';

  return (
    <article className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div
        className={`inline-flex size-10 items-center justify-center rounded-xl ring-1 ${toneClassName}`}
      >
        <Icon className="size-5" />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 break-words text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-500">Tự động cập nhật từ lịch hẹn được phân công.</p>
    </article>
  );
}

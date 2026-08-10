import { CalendarClock } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { EmptyStaffServiceHistoriesState } from '@/features/staff/service-histories/components/EmptyStaffServiceHistoriesState';
import { StaffServiceHistoryDetailDialog } from '@/features/staff/service-histories/components/StaffServiceHistoryDetailDialog';
import { StaffServiceHistoryFilters } from '@/features/staff/service-histories/components/StaffServiceHistoryFilters';
import { StaffServiceHistoryList } from '@/features/staff/service-histories/components/StaffServiceHistoryList';
import { useMyStaffServiceHistories } from '@/features/staff/service-histories/hooks/useMyStaffServiceHistories';
import type { ServiceHistoryItem } from '@/types/serviceHistory';
import {
  formatServiceHistoryDateOnly,
  formatServiceHistoryPrice,
  getMonthStartISOString,
} from '@/lib/utils';

const isSameLocalDate = (dateA: Date, dateB: Date) =>
  dateA.getFullYear() === dateB.getFullYear() &&
  dateA.getMonth() === dateB.getMonth() &&
  dateA.getDate() === dateB.getDate();

export default function StaffServiceHistoriesPage() {
  const [keyword, setKeyword] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [detailServiceHistory, setDetailServiceHistory] = useState<ServiceHistoryItem | null>(null);

  const serviceHistoriesQuery = useMyStaffServiceHistories();
  const serviceHistories = useMemo(
    () => serviceHistoriesQuery.data?.items ?? [],
    [serviceHistoriesQuery.data?.items]
  );

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
        ...serviceHistory.services.map((service) => service.nameSnapshot),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchContent.includes(normalizedKeyword);
    });
  }, [dateFilter, keyword, serviceHistories]);

  const summary = useMemo(() => {
    const monthStart = new Date(getMonthStartISOString());

    return filteredServiceHistories.reduce(
      (acc, serviceHistory) => {
        acc.total += 1;
        acc.revenue += serviceHistory.totalPrice;

        if (new Date(serviceHistory.servicedAt) >= monthStart) {
          acc.completedThisMonth += 1;
        }

        return acc;
      },
      { total: 0, completedThisMonth: 0, revenue: 0 }
    );
  }, [filteredServiceHistories]);

  return (
    <main className="min-h-[calc(100vh-73px)] min-w-0 overflow-x-hidden bg-[#f5f7fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-6">
        <section className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <CalendarClock className="size-4" />
              Staff Service Histories
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Lịch sử dịch vụ đã xử lý
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
              Xem lại các dịch vụ bạn đã hoàn thành cho khách hàng.
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard label="Tổng dịch vụ đã xử lý" value={`${summary.total}`} />
          <SummaryCard label="Hoàn thành trong tháng" value={`${summary.completedThisMonth}`} />
          <SummaryCard
            label="Tổng doanh thu xử lý"
            value={formatServiceHistoryPrice(summary.revenue)}
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
            <p className="text-sm text-slate-500">Đang tải lịch sử dịch vụ...</p>
          </section>
        ) : serviceHistoriesQuery.isError ? (
          <section className="rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-16 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-rose-700">Không thể tải lịch sử dịch vụ</h2>
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
              Không tìm thấy lịch sử dịch vụ phù hợp với bộ lọc hiện tại.
            </p>
          </section>
        ) : (
          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Bảng lịch sử dịch vụ</h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredServiceHistories.length} lịch sử dịch vụ đang hiển thị
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

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-3 break-words text-lg font-semibold text-slate-950">{value}</p>
      {label === 'Hoàn thành trong tháng' ? (
        <p className="mt-2 text-sm text-slate-500">
          Tính từ {formatServiceHistoryDateOnly(new Date().toISOString())}
        </p>
      ) : null}
    </article>
  );
}

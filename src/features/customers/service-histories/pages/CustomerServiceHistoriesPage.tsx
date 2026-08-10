import { CalendarClock } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { CustomerServiceHistoryDetailDialog } from '@/features/customers/service-histories/components/CustomerServiceHistoryDetailDialog';
import { CustomerServiceHistoryFilters } from '@/features/customers/service-histories/components/CustomerServiceHistoryFilters';
import { CustomerServiceHistoryList } from '@/features/customers/service-histories/components/CustomerServiceHistoryList';
import { EmptyCustomerServiceHistoriesState } from '@/features/customers/service-histories/components/EmptyCustomerServiceHistoriesState';
import { useCustomerServiceHistories } from '@/features/customers/service-histories/hooks/useCustomerServiceHistories';
import { useMyVehicles } from '@/features/customers/vehicles/hooks/useMyVehicles';
import type { ServiceHistoryItem } from '@/types/serviceHistory';
import { formatServiceHistoryPrice } from '@/lib/utils';

export default function CustomerServiceHistoriesPage() {
  const [keyword, setKeyword] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [detailServiceHistory, setDetailServiceHistory] = useState<ServiceHistoryItem | null>(null);

  const vehiclesQuery = useMyVehicles();
  const serviceHistoriesQuery = useCustomerServiceHistories(selectedVehicleId);

  const serviceHistories = useMemo(
    () => serviceHistoriesQuery.data?.items ?? [],
    [serviceHistoriesQuery.data?.items]
  );
  const vehicles = vehiclesQuery.data?.vehicles ?? [];

  const filteredServiceHistories = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) {
      return serviceHistories;
    }

    return serviceHistories.filter((serviceHistory) =>
      [
        serviceHistory.vehicleId.brand,
        serviceHistory.vehicleId.model,
        serviceHistory.vehicleId.licensePlate,
        serviceHistory.note,
        serviceHistory.handledBy?.displayName,
        ...serviceHistory.services.map((service) => service.nameSnapshot),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalizedKeyword)
    );
  }, [keyword, serviceHistories]);

  const summary = useMemo(() => {
    const totalSpent = filteredServiceHistories.reduce(
      (sum, serviceHistory) => sum + serviceHistory.totalPrice,
      0
    );
    const latestVehicle = filteredServiceHistories[0]?.vehicleId;

    return {
      totalServices: filteredServiceHistories.length,
      totalSpent,
      latestVehicle: latestVehicle
        ? `${latestVehicle.brand} ${latestVehicle.model} - ${latestVehicle.licensePlate}`
        : 'Chưa có dữ liệu',
    };
  }, [filteredServiceHistories]);

  return (
    <main className="min-h-[calc(100vh-73px)] min-w-0 overflow-x-hidden bg-[#f8fafc] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1240px] min-w-0 space-y-4">
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <CalendarClock className="size-4" />
              Customer Service Histories
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Lịch sử dịch vụ
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Xem lại các dịch vụ xe của bạn đã hoàn thành.
            </p>
          </div>
        </section>

        <CustomerServiceHistoryFilters
          keyword={keyword}
          selectedVehicleId={selectedVehicleId}
          vehicles={vehicles}
          onKeywordChange={setKeyword}
          onVehicleChange={setSelectedVehicleId}
        />

        <section className="grid gap-3 sm:grid-cols-3">
          <SummaryCard label="Tổng lịch sử dịch vụ" value={`${summary.totalServices}`} />
          <SummaryCard label="Tổng chi phí" value={formatServiceHistoryPrice(summary.totalSpent)} />
          <SummaryCard label="Xe gần nhất" value={summary.latestVehicle} />
        </section>

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
          <EmptyCustomerServiceHistoriesState />
        ) : filteredServiceHistories.length === 0 ? (
          <section className="rounded-[28px] bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">
              Không tìm thấy lịch sử dịch vụ phù hợp với bộ lọc hiện tại.
            </p>
          </section>
        ) : (
          <section className="space-y-3">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Danh sách lịch sử dịch vụ</h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredServiceHistories.length} lịch sử dịch vụ đang hiển thị
              </p>
            </div>

            <CustomerServiceHistoryList
              serviceHistories={filteredServiceHistories}
              onViewDetail={setDetailServiceHistory}
            />
          </section>
        )}
      </div>

      <CustomerServiceHistoryDetailDialog
        serviceHistoryId={detailServiceHistory?._id ?? null}
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
    <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-2 line-clamp-2 text-base font-semibold text-slate-950">{value}</p>
    </article>
  );
}

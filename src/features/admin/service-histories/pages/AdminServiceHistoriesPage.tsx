import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { AdminServiceHistoryDetailDialog } from '@/features/admin/service-histories/components/AdminServiceHistoryDetailDialog';
import { AdminServiceHistoryFilters } from '@/features/admin/service-histories/components/AdminServiceHistoryFilters';
import { AdminServiceHistorySummaryCards } from '@/features/admin/service-histories/components/AdminServiceHistorySummaryCards';
import { AdminServiceHistoriesTable } from '@/features/admin/service-histories/components/AdminServiceHistoriesTable';
import { DeleteServiceHistoryDialog } from '@/features/admin/service-histories/components/DeleteServiceHistoryDialog';
import { EmptyAdminServiceHistoriesState } from '@/features/admin/service-histories/components/EmptyAdminServiceHistoriesState';
import { UpdateServiceHistoryDialog } from '@/features/admin/service-histories/components/UpdateServiceHistoryDialog';
import { useAdminServiceHistories } from '@/features/admin/service-histories/hooks/useAdminServiceHistories';
import type { ServiceHistoryItem } from '@/types/serviceHistory';
import { getMonthStartISOString } from '@/lib/utils';

export default function AdminServiceHistoriesPage() {
  const [keyword, setKeyword] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [detailServiceHistory, setDetailServiceHistory] = useState<ServiceHistoryItem | null>(null);
  const [updateServiceHistory, setUpdateServiceHistory] = useState<ServiceHistoryItem | null>(null);
  const [deleteServiceHistory, setDeleteServiceHistory] = useState<ServiceHistoryItem | null>(null);

  const serviceHistoriesQuery = useAdminServiceHistories({
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  const serviceHistories = useMemo(
    () => serviceHistoriesQuery.data?.items ?? [],
    [serviceHistoriesQuery.data?.items]
  );

  const filteredServiceHistories = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) {
      return serviceHistories;
    }

    return serviceHistories.filter((serviceHistory) =>
      [
        serviceHistory.customerId.displayName,
        serviceHistory.customerId.phone,
        serviceHistory.handledBy?.displayName,
        serviceHistory.handledBy?.phone,
        serviceHistory.vehicleId.licensePlate,
        serviceHistory.vehicleId.brand,
        serviceHistory.vehicleId.model,
        serviceHistory.note,
        ...serviceHistory.services.map((service) => service.nameSnapshot),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalizedKeyword)
    );
  }, [keyword, serviceHistories]);

  const summary = useMemo(() => {
    const monthStart = new Date(getMonthStartISOString());
    const customers = new Set<string>();

    return filteredServiceHistories.reduce(
      (acc, serviceHistory) => {
        acc.total += 1;
        acc.revenue += serviceHistory.totalPrice;
        customers.add(serviceHistory.customerId._id);

        if (new Date(serviceHistory.servicedAt) >= monthStart) {
          acc.completedThisMonth += 1;
        }

        return acc;
      },
      { total: 0, completedThisMonth: 0, revenue: 0, customers }
    );
  }, [filteredServiceHistories]);

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden bg-[#f8fafc] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1540px] min-w-0 flex-col gap-7">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
              Quản lý lịch sử dịch vụ
            </h1>
            <p className="mt-2 max-w-2xl text-base text-slate-500">
              Theo dõi và quản lý các dịch vụ đã hoàn thành trong hệ thống.
            </p>
          </div>
        </section>

        <AdminServiceHistorySummaryCards
          total={summary.total}
          completedThisMonth={summary.completedThisMonth}
          revenue={summary.revenue}
          customers={summary.customers.size}
        />

        <AdminServiceHistoryFilters
          keyword={keyword}
          fromDate={fromDate}
          toDate={toDate}
          onKeywordChange={setKeyword}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
        />

        {serviceHistoriesQuery.isLoading ? (
          <section className="rounded-lg border border-border/80 bg-white px-6 py-16 text-center">
            <p className="text-sm text-slate-500">Đang tải lịch sử dịch vụ...</p>
          </section>
        ) : serviceHistoriesQuery.isError ? (
          <section className="rounded-lg border border-rose-200 bg-rose-50 px-6 py-16 text-center">
            <h2 className="text-xl font-semibold text-rose-700">Không thể tải lịch sử dịch vụ</h2>
            <p className="mt-2 text-sm text-rose-600">Vui lòng thử lại.</p>
            <Button
              className="mt-5 rounded-md"
              variant="outline"
              onClick={() => serviceHistoriesQuery.refetch()}
            >
              Thử lại
            </Button>
          </section>
        ) : serviceHistories.length === 0 ? (
          <EmptyAdminServiceHistoriesState />
        ) : filteredServiceHistories.length === 0 ? (
          <section className="rounded-lg border border-border/80 bg-white px-6 py-16 text-center">
            <p className="text-sm text-slate-500">
              Không tìm thấy lịch sử dịch vụ phù hợp với bộ lọc hiện tại.
            </p>
          </section>
        ) : (
          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Danh sách lịch sử dịch vụ</h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredServiceHistories.length} lịch sử dịch vụ đang hiển thị
              </p>
            </div>
            <AdminServiceHistoriesTable
              serviceHistories={filteredServiceHistories}
              onViewDetail={setDetailServiceHistory}
              onUpdate={setUpdateServiceHistory}
              onDelete={setDeleteServiceHistory}
            />
          </section>
        )}
      </div>

      <AdminServiceHistoryDetailDialog
        serviceHistoryId={detailServiceHistory?._id ?? null}
        open={!!detailServiceHistory}
        onOpenChange={(open) => {
          if (!open) {
            setDetailServiceHistory(null);
          }
        }}
      />

      <UpdateServiceHistoryDialog
        key={updateServiceHistory?._id ?? 'closed'}
        serviceHistory={updateServiceHistory}
        open={!!updateServiceHistory}
        onOpenChange={(open) => {
          if (!open) {
            setUpdateServiceHistory(null);
          }
        }}
      />

      <DeleteServiceHistoryDialog
        serviceHistory={deleteServiceHistory}
        open={!!deleteServiceHistory}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteServiceHistory(null);
          }
        }}
      />
    </main>
  );
}

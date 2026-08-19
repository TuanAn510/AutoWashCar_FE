import { CalendarClock, CalendarPlus2, Filter, RefreshCw, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { AppointmentDetailDialog } from '@/features/customers/appointments/components/AppointmentDetailDialog';
import { AppointmentList } from '@/features/customers/appointments/components/AppointmentList';
import { CancelAppointmentDialog } from '@/features/customers/appointments/components/CancelAppointmentDialog';
import { CreateAppointmentModal } from '@/features/customers/appointments/components/CreateAppointmentModal';
import { appointmentStatusLabels } from '@/features/customers/appointments/components/AppointmentStatusBadge';
import { CustomerEmptyState } from '@/features/customers/components/CustomerEmptyState';
import type { AppointmentItem, AppointmentStatus } from '@/types/appointment';
import { useCancelAppointment } from '@/features/customers/appointments/hooks/useCancelAppointment';
import { useCreateAppointment } from '@/features/customers/appointments/hooks/useCreateAppointment';
import { useMyAppointments } from '@/features/customers/appointments/hooks/useMyAppointments';
import { useCustomerAppointmentsStore } from '@/features/customers/appointments/store/useCustomerAppointmentsStore';
import { useMyVehicles } from '@/features/customers/vehicles/hooks/useMyVehicles';

const filters: Array<{ label: string; value: 'all' | 'upcoming' | AppointmentStatus }> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Sắp tới', value: 'upcoming' },
  { label: 'Chờ xác nhận', value: 'pending' },
  { label: 'Đã xác nhận', value: 'confirmed' },
  { label: 'Đã check-in', value: 'in_queue' },
  { label: 'Hoàn thành', value: 'completed' },
  { label: 'Đã hủy', value: 'cancelled' },
];

function isUpcomingAppointment(appointment: AppointmentItem) {
  return (
    new Date(appointment.scheduledAt).getTime() >= Date.now() &&
    appointment.status !== 'completed' &&
    appointment.status !== 'cancelled'
  );
}

export default function CustomerAppointmentsPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | AppointmentStatus>(() =>
    window.location.pathname.includes('service-histories') ? 'completed' : 'all'
  );
  const [keyword, setKeyword] = useState('');
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAllAppointments, setShowAllAppointments] = useState(false);

  const appointmentsQuery = useMyAppointments({ sortBy: 'createdAt', sortOrder });
  const vehiclesQuery = useMyVehicles();
  const createAppointmentMutation = useCreateAppointment();
  const cancelAppointmentMutation = useCancelAppointment();

  const isCreateModalOpen = useCustomerAppointmentsStore((state) => state.isCreateModalOpen);
  const openCreateModal = useCustomerAppointmentsStore((state) => state.openCreateModal);
  const closeCreateModal = useCustomerAppointmentsStore((state) => state.closeCreateModal);
  const detailAppointment = useCustomerAppointmentsStore((state) => state.detailAppointment);
  const openDetailDialog = useCustomerAppointmentsStore((state) => state.openDetailDialog);
  const closeDetailDialog = useCustomerAppointmentsStore((state) => state.closeDetailDialog);
  const cancelAppointment = useCustomerAppointmentsStore((state) => state.cancelAppointment);
  const openCancelDialog = useCustomerAppointmentsStore((state) => state.openCancelDialog);
  const closeCancelDialog = useCustomerAppointmentsStore((state) => state.closeCancelDialog);

  const appointments = useMemo(
    () => appointmentsQuery.data?.appointments ?? [],
    [appointmentsQuery.data?.appointments]
  );

  const filteredAppointments = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const matchesFilter =
        activeFilter === 'all'
          ? true
          : activeFilter === 'upcoming'
            ? isUpcomingAppointment(appointment)
            : appointment.status === activeFilter;

      if (!matchesFilter) return false;
      if (!normalizedKeyword) return true;

      const searchContent = [
        appointment.vehicleId.licensePlate,
        appointment.vehicleId.brand,
        appointment.vehicleId.model,
        appointment.note,
        appointmentStatusLabels[appointment.status],
        ...appointment.services.map((service) => service.nameSnapshot),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchContent.includes(normalizedKeyword);
    });
  }, [activeFilter, appointments, keyword]);

  const hasFilters = activeFilter !== 'all' || keyword.trim().length > 0;
  const isDefaultPrimaryView = !hasFilters;
  const defaultOrderedAppointments = useMemo(
    () =>
      appointments.slice().sort((left, right) => {
        const difference =
          new Date(left.createdAt ?? 0).getTime() - new Date(right.createdAt ?? 0).getTime();
        return sortOrder === 'asc' ? difference : -difference;
      }),
    [appointments, sortOrder]
  );
  const orderedAppointments = isDefaultPrimaryView
    ? defaultOrderedAppointments
    : filteredAppointments;
  const collapsedAppointments = orderedAppointments.slice(0, 6);
  const displayedAppointments = showAllAppointments
    ? orderedAppointments
    : collapsedAppointments;
  const hasAdditionalAppointments = orderedAppointments.length > 6;
  const clearFilters = () => {
    setActiveFilter('all');
    setKeyword('');
    setShowAllAppointments(false);
  };

  const handleOpenCreateModal = () => {
    const vehicles = vehiclesQuery.data?.vehicles ?? [];

    if (!vehiclesQuery.isLoading && !vehiclesQuery.isError && vehicles.length === 0) {
      toast.info('Vui lòng thêm xe trước khi đặt lịch.');
      navigate('/customer/vehicles?create=1');
      return;
    }

    openCreateModal();
  };

  return (
    <main className="min-h-[calc(100vh-73px)] overflow-x-hidden bg-[#f8fafc] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto min-w-0 max-w-[1240px] space-y-5">
        <section className="rounded-xl border border-[#e5edf6] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center border-l-[4px] border-[#ff7a1a] pl-3 text-xs font-black uppercase tracking-[0.2em] text-[#0b67c2]">
                <CalendarClock className="mr-2 size-4" />
                Đặt lịch
              </div>
              <h1 className="mt-3 text-4xl font-black leading-[1.15] tracking-tight text-[#15243a] sm:text-5xl">
                Lịch hẹn của tôi
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748b] sm:text-base">
                Theo dõi lịch hẹn dịch vụ, xem chi tiết và đặt lịch mới nhanh chóng.
              </p>
            </div>

            <Button
              className="h-[42px] w-full rounded-md px-5 shadow-[0_12px_26px_rgba(11,103,194,0.24)] sm:w-auto"
              disabled={vehiclesQuery.isLoading}
              onClick={handleOpenCreateModal}
            >
              <CalendarPlus2 className="size-4" />
              Đặt lịch mới
            </Button>
          </div>
        </section>

        <section className="rounded-xl border border-[#e5edf6] bg-white p-4 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="h-[46px] rounded-md border-[#d8e2ef] bg-white pl-10 text-sm shadow-none focus-visible:border-[#0b67c2] focus-visible:ring-0"
                placeholder="Tìm theo dịch vụ, biển số xe hoặc ghi chú..."
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value);
                  setShowAllAppointments(false);
                }}
              />
            </div>

            <div className="flex gap-2">
              <select
                className="h-[42px] rounded-md border border-[#d8e2ef] bg-white px-3 text-sm font-semibold text-[#64748b] outline-none focus:border-[#0b67c2]"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value as 'asc' | 'desc')}
              >
                <option value="desc">Mới nhất</option>
                <option value="asc">Cũ nhất</option>
              </select>
              <Button
                type="button"
                variant="outline"
                className="h-[42px] rounded-md border-[#d8e2ef] font-semibold"
                onClick={() => setFilterOpen((value) => !value)}
              >
                <Filter className="size-4" />
                Bộ lọc
              </Button>
              {hasFilters ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-[42px] rounded-md border-[#d8e2ef] font-semibold"
                  onClick={clearFilters}
                >
                  <X className="size-4" />
                  Xóa lọc
                </Button>
              ) : null}
            </div>
          </div>

          {isFilterOpen ? (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  className={cn(
                    'h-9 shrink-0 rounded-md px-3 text-sm font-black transition',
                    activeFilter === filter.value
                      ? 'bg-[#0b67c2] text-white shadow-[0_12px_26px_rgba(11,103,194,0.24)]'
                      : 'bg-slate-100 text-[#64748b] hover:bg-slate-200'
                  )}
                  onClick={() => {
                    setActiveFilter(filter.value);
                    setShowAllAppointments(false);
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          ) : null}
        </section>

        {appointmentsQuery.isLoading && (
          <section className="rounded-xl border border-[#e5edf6] bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
            <p className="text-sm text-[#64748b]">Đang tải lịch hẹn của bạn...</p>
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-48 rounded-xl" />
              ))}
            </div>
          </section>
        )}

        {appointmentsQuery.isError && (
          <section className="rounded-xl border border-[#e5edf6] bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
            <p className="text-sm text-[#64748b]">Không thể tải lịch hẹn. Vui lòng thử lại.</p>
            <Button
              variant="outline"
              className="mt-4 h-[42px] rounded-md border-[#d8e2ef]"
              onClick={() => appointmentsQuery.refetch()}
            >
              <RefreshCw className="size-4" />
              Thử lại
            </Button>
          </section>
        )}

        {!appointmentsQuery.isLoading &&
          !appointmentsQuery.isError &&
          appointments.length === 0 && (
            <CustomerEmptyState
              icon={<CalendarPlus2 />}
              title="Bạn chưa có lịch hẹn nào"
              description="Hãy đặt lịch đầu tiên để chăm sóc xe của bạn."
              primaryAction={
                <Button onClick={handleOpenCreateModal}>
                  <CalendarPlus2 className="size-4" />
                  Đặt lịch đầu tiên
                </Button>
              }
            />
          )}

        {!appointmentsQuery.isLoading &&
          !appointmentsQuery.isError &&
          appointments.length > 0 &&
          filteredAppointments.length === 0 && (
            <CustomerEmptyState
              icon={<Search />}
              title="Không tìm thấy lịch hẹn"
              description="Không có lịch hẹn nào phù hợp với từ khóa hoặc bộ lọc hiện tại."
              primaryAction={
                <Button variant="outline" onClick={clearFilters}>
                  Xóa bộ lọc
                </Button>
              }
            />
          )}

        {!appointmentsQuery.isLoading &&
          !appointmentsQuery.isError &&
          orderedAppointments.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-[#15243a]">Danh sách lịch hẹn của bạn</h2>
                  <p className="mt-1 text-sm text-[#64748b]">
                    {displayedAppointments.length} lịch hẹn đang hiển thị
                  </p>
                </div>
              </div>

              <AppointmentList
                appointments={displayedAppointments}
                onViewDetail={openDetailDialog}
                onCancel={openCancelDialog}
              />

              {hasAdditionalAppointments ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAllAppointments((current) => !current)}
                >
                  {showAllAppointments ? 'Thu gọn' : 'Xem thêm'}
                </Button>
              ) : null}
            </section>
          )}
      </div>

      <CreateAppointmentModal
        isOpen={isCreateModalOpen}
        isSubmitting={createAppointmentMutation.isPending}
        onOpenChange={(open) => {
          if (open) {
            handleOpenCreateModal();
            return;
          }

          closeCreateModal();
        }}
        onSubmit={(payload) => createAppointmentMutation.mutateAsync(payload).then(() => undefined)}
      />

      <AppointmentDetailDialog
        appointment={detailAppointment}
        open={!!detailAppointment}
        onOpenChange={(open) => {
          if (!open) closeDetailDialog();
        }}
      />

      <CancelAppointmentDialog
        key={cancelAppointment?._id ?? 'closed'}
        appointment={cancelAppointment}
        open={!!cancelAppointment}
        isSubmitting={cancelAppointmentMutation.isPending}
        onOpenChange={(open) => {
          if (!open) closeCancelDialog();
        }}
        onConfirm={async (cancelReason) => {
          if (!cancelAppointment) return;

          await cancelAppointmentMutation.mutateAsync({
            appointmentId: cancelAppointment._id,
            cancelReason,
          });
          closeCancelDialog();
        }}
      />
    </main>
  );
}

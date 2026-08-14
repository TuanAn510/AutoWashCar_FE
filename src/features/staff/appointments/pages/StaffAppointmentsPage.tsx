import { CalendarDays, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaginationControls } from '@/components/shared/PaginationControls';
import type {
  AdminAppointmentFilters as StaffAppointmentFilterParams,
  AppointmentItem,
  AppointmentStatus,
} from '@/types/appointment';
import { EmptyStaffAppointmentsState } from '@/features/staff/appointments/components/EmptyStaffAppointmentsState';
import { StaffAppointmentDetailDialog } from '@/features/staff/appointments/components/StaffAppointmentDetailDialog';
import { StaffAppointmentFilters } from '@/features/staff/appointments/components/StaffAppointmentFilters';
import { StaffAppointmentList } from '@/features/staff/appointments/components/StaffAppointmentList';
import { StaffAppointmentSummaryCards } from '@/features/staff/appointments/components/StaffAppointmentSummaryCards';
import { UpdateAppointmentStatusDialog } from '@/features/staff/appointments/components/UpdateAppointmentStatusDialog';
import { getAllowedStaffAppointmentStatuses } from '@/features/staff/appointments/constants/appointmentStatus';
import { useMyStaffAppointments } from '@/features/staff/appointments/hooks/useMyStaffAppointments';
import { useUpdateAppointmentStatus } from '@/features/staff/appointments/hooks/useUpdateAppointmentStatus';

const getLocalDateRange = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day) return {};

  const d = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return {
    dateFrom: `${d}T00:00:00`,
    dateTo: `${d}T23:59:59`,
  };
};

const getTodayRange = () => {
  const now = new Date();
  const d = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return {
    dateFrom: `${d}T00:00:00`,
    dateTo: `${d}T23:59:59`,
  };
};

const APPOINTMENTS_PER_PAGE = 10;

export default function StaffAppointmentsPage() {
  const [appointmentTab, setAppointmentTab] = useState<'today' | 'all'>(() =>
    window.location.pathname.includes('service-histories') ? 'all' : 'today'
  );
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AppointmentStatus>(() =>
    window.location.pathname.includes('service-histories') ? 'completed' : 'all'
  );
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [detailAppointment, setDetailAppointment] = useState<AppointmentItem | null>(null);
  const [statusAppointment, setStatusAppointment] = useState<AppointmentItem | null>(null);
  const [nextStatus, setNextStatus] = useState<AppointmentStatus | ''>('');

  const appointmentFilters = useMemo<StaffAppointmentFilterParams>(() => {
    const trimmedKeyword = keyword.trim();
    const selectedDateRange =
      appointmentTab === 'today'
        ? getTodayRange()
        : dateFilter
          ? getLocalDateRange(dateFilter)
          : {};

    return {
      ...(trimmedKeyword ? { search: trimmedKeyword } : {}),
      ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
      ...selectedDateRange,
      page,
      limit: APPOINTMENTS_PER_PAGE,
      sortOrder: 'desc',
    };
  }, [appointmentTab, dateFilter, keyword, page, statusFilter]);

  const staffAppointmentsQuery = useMyStaffAppointments(appointmentFilters);
  const updateStatusMutation = useUpdateAppointmentStatus();

  const appointments = useMemo(
    () => staffAppointmentsQuery.data?.appointments ?? [],
    [staffAppointmentsQuery.data?.appointments]
  );

  const { activeAppointments, completedAppointments } = useMemo(() => {
    const active = appointments.filter((a) => a.status !== 'completed' && a.status !== 'cancelled');
    const completed = appointments.filter(
      (a) => a.status === 'completed' || a.status === 'cancelled'
    );
    return { activeAppointments: active, completedAppointments: completed };
  }, [appointments]);

  const { unpaidCompleted, todayCompleted, yesterdayCompleted, olderCompleted } = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const unpaid: AppointmentItem[] = [];
    const today: AppointmentItem[] = [];
    const yesterday: AppointmentItem[] = [];
    const older: AppointmentItem[] = [];

    for (const a of completedAppointments) {
      // Completed but unpaid → separate section for easy payment confirmation
      if (a.status === 'completed' && a.paymentStatus !== 'paid') {
        unpaid.push(a);
        continue;
      }
      const date = a.completedAt ? new Date(a.completedAt) : null;
      if (!date) {
        older.push(a);
        continue;
      }
      const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      if (dateStart.getTime() === todayStart.getTime()) {
        today.push(a);
      } else if (dateStart.getTime() === yesterdayStart.getTime()) {
        yesterday.push(a);
      } else {
        older.push(a);
      }
    }

    return {
      unpaidCompleted: unpaid,
      todayCompleted: today,
      yesterdayCompleted: yesterday,
      olderCompleted: older,
    };
  }, [completedAppointments]);

  const summary = staffAppointmentsQuery.data?.summary ?? {
    total: 0,
    pending: 0,
    confirmed: 0,
    inQueue: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
  };

  const handleOpenStatusDialog = (appointment: AppointmentItem) => {
    const [defaultNextStatus] = getAllowedStaffAppointmentStatuses(appointment.status);
    setNextStatus(defaultNextStatus ?? '');
    setStatusAppointment(appointment);
  };

  const handleQuickUpdate = async (
    appointment: AppointmentItem,
    targetStatus: 'in_queue' | 'in_progress' | 'completed'
  ) => {
    await updateStatusMutation.mutateAsync({
      appointmentId: appointment._id,
      payload: { status: targetStatus },
    });
  };

  const handleConfirmStatusUpdate = async () => {
    if (!statusAppointment || !nextStatus) {
      return;
    }

    const appointmentBeingUpdated = statusAppointment;
    const statusBeingApplied = nextStatus;

    await updateStatusMutation.mutateAsync({
      appointmentId: appointmentBeingUpdated._id,
      payload: { status: statusBeingApplied },
    });
    setNextStatus('');
    setStatusAppointment(null);
  };

  return (
    <main className="min-h-[calc(100vh-73px)] min-w-0 overflow-x-hidden bg-[#f5f7fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-6">
        <section className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <CalendarDays className="size-4" />
                Staff Appointments
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                {appointmentTab === 'today' ? 'Lịch hẹn hôm nay' : 'Tất cả lịch hẹn'}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
                Theo dõi và cập nhật các lịch hẹn được phân công cho bạn.
              </p>
            </div>

            <Tabs
              value={appointmentTab}
              onValueChange={(value) => {
                setAppointmentTab(value as 'today' | 'all');
                setPage(1);
                setDateFilter('');
              }}
              className="max-w-full"
            >
              <TabsList className="grid w-full grid-cols-2 sm:w-auto">
                <TabsTrigger value="today">Hôm nay</TabsTrigger>
                <TabsTrigger value="all">Tất cả lịch hẹn</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </section>

        <StaffAppointmentSummaryCards
          scope={appointmentTab}
          totalCount={summary.total}
          pendingCount={summary.pending + summary.confirmed}
          inQueueCount={summary.inQueue}
          inProgressCount={summary.inProgress}
          completedCount={summary.completed}
        />

        <StaffAppointmentFilters
          key={appointmentTab}
          keyword={keyword}
          status={statusFilter}
          date={dateFilter}
          onKeywordChange={(value) => {
            setKeyword(value);
            setPage(1);
          }}
          onStatusChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
          onDateChange={(date) => {
            setDateFilter(date);
            setPage(1);
            if (date) setAppointmentTab('all');
          }}
        />
        {staffAppointmentsQuery.isLoading ? (
          <section className="rounded-[28px] bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-200">
            <Loader2 className="mx-auto size-8 animate-spin text-slate-400" />
            <p className="mt-4 text-sm text-slate-500">Đang tải lịch hẹn được phân công...</p>
          </section>
        ) : staffAppointmentsQuery.isError ? (
          <section className="rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-16 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-rose-700">
              Không thể tải danh sách lịch hẹn
            </h2>
            <p className="mt-2 text-sm text-rose-600">Vui lòng thử lại.</p>
            <Button className="mt-5 rounded-xl" onClick={() => staffAppointmentsQuery.refetch()}>
              Thử lại
            </Button>
          </section>
        ) : activeAppointments.length === 0 && completedAppointments.length === 0 ? (
          <EmptyStaffAppointmentsState />
        ) : (
          <section className="space-y-6">
            {activeAppointments.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-950">Lịch hẹn đang xử lý</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {activeAppointments.length} lịch hẹn đang chờ xử lý.
                  </p>
                </div>

                <StaffAppointmentList
                  appointments={activeAppointments}
                  onViewDetail={setDetailAppointment}
                  onOpenStatusDialog={handleOpenStatusDialog}
                  onQuickUpdate={handleQuickUpdate}
                />
              </div>
            ) : null}

            {unpaidCompleted.length > 0 ||
            todayCompleted.length > 0 ||
            yesterdayCompleted.length > 0 ||
            olderCompleted.length > 0 ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-500">Đã hoàn thành / Đã hủy</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {completedAppointments.length} lịch hẹn đã kết thúc.
                  </p>
                </div>

                {unpaidCompleted.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-rose-600">Chưa thanh toán</h3>
                    <p className="text-sm text-rose-500">
                      {unpaidCompleted.length} lịch hẹn đã hoàn thành nhưng chưa thanh toán.
                    </p>
                    <StaffAppointmentList
                      appointments={unpaidCompleted}
                      onViewDetail={setDetailAppointment}
                      onOpenStatusDialog={handleOpenStatusDialog}
                      onQuickUpdate={handleQuickUpdate}
                    />
                  </div>
                ) : null}

                {todayCompleted.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-emerald-700">Hôm nay</h3>
                    <StaffAppointmentList
                      appointments={todayCompleted}
                      onViewDetail={setDetailAppointment}
                      onOpenStatusDialog={handleOpenStatusDialog}
                      onQuickUpdate={handleQuickUpdate}
                    />
                  </div>
                ) : null}

                {yesterdayCompleted.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-amber-700">Hôm qua</h3>
                    <StaffAppointmentList
                      appointments={yesterdayCompleted}
                      onViewDetail={setDetailAppointment}
                      onOpenStatusDialog={handleOpenStatusDialog}
                      onQuickUpdate={handleQuickUpdate}
                    />
                  </div>
                ) : null}

                {olderCompleted.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-slate-400">Cũ hơn</h3>
                    <StaffAppointmentList
                      appointments={olderCompleted}
                      onViewDetail={setDetailAppointment}
                      onOpenStatusDialog={handleOpenStatusDialog}
                      onQuickUpdate={handleQuickUpdate}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}

            <PaginationControls
              pagination={staffAppointmentsQuery.data?.pagination}
              itemCount={appointments.length}
              onPageChange={setPage}
            />
          </section>
        )}
      </div>

      <StaffAppointmentDetailDialog
        appointment={detailAppointment}
        open={!!detailAppointment}
        onOpenChange={(open) => {
          if (!open) {
            setDetailAppointment(null);
          }
        }}
      />

      <UpdateAppointmentStatusDialog
        appointment={statusAppointment}
        open={!!statusAppointment}
        nextStatus={nextStatus}
        isSubmitting={updateStatusMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setNextStatus('');
            setStatusAppointment(null);
          }
        }}
        onNextStatusChange={setNextStatus}
        onConfirm={handleConfirmStatusUpdate}
      />
    </main>
  );
}

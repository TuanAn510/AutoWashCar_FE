import { ArrowUpDown, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaginationControls } from '@/components/shared/PaginationControls';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type {
  AdminAppointmentFilters as AdminAppointmentFilterParams,
  AppointmentAssignedStaff,
  AppointmentItem,
  AppointmentStatus,
} from '@/types/appointment';
import { AdminAppointmentSummaryCards } from '@/features/admin/appointments/components/AdminAppointmentSummaryCards';
import { AdminAppointmentFilters } from '@/features/admin/appointments/components/AdminAppointmentFilters';
import {
  AdminAppointmentsTable,
  type DateSort,
} from '@/features/admin/appointments/components/AdminAppointmentsTable';
import { AdminAppointmentDetailDialog } from '@/features/admin/appointments/components/AppointmentDetailDialog';
import { AssignStaffDialog } from '@/features/admin/appointments/components/AssignStaffDialog';
import { CancelAppointmentDialog } from '@/features/admin/appointments/components/CancelAppointmentDialog';
import {
  appointmentTimelineStatusLabels,
  getAllowedAdminAppointmentStatuses,
} from '@/features/admin/appointments/constants/appointmentStatus';
import { EmptyAdminAppointmentsState } from '@/features/admin/appointments/components/EmptyAdminAppointmentsState';
import { RescheduleAppointmentDialog } from '@/features/admin/appointments/components/RescheduleAppointmentDialog';
import { UpdateAppointmentStatusDialog } from '@/features/admin/appointments/components/UpdateAppointmentStatusDialog';
import { useAppointmentDetail } from '@/features/admin/appointments/hooks/useAppointmentDetail';
import {
  useAssignStaffToAppointment,
  useCancelAppointmentByAdmin,
  useConfirmAppointmentPayment,
  useRescheduleAppointment,
  useUpdateAppointmentStatus,
} from '@/features/admin/appointments/hooks/useAdminAppointmentMutations';
import { useAppointments } from '@/features/admin/appointments/hooks/useAppointments';
import { useStaffWorkload } from '@/features/admin/customers/hooks/useAdminCustomers';
import type { StaffWorkload } from '@/services/userService';
import { formatCurrencyVi } from '@/lib/utils';
import { formatLicensePlateDisplay } from '@/features/customers/vehicles/utils/license-plate';

const getLocalDateRange = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day) {
    return {};
  }

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
const APPOINTMENTS_PER_PAGE_BIG = 100;
type TimelineStatus = Exclude<AppointmentStatus, 'cancelled'>;
type AppointmentTab = 'today' | 'all' | 'priority';

const isWaitingStatus = (a: AppointmentItem) =>
  a.status === 'pending' ||
  a.status === 'confirmed' ||
  a.status === 'in_queue' ||
  a.status === 'in_progress';

const appointmentGroupDate = (a: AppointmentItem): Date =>
  new Date(a.completedAt ?? a.cancelledAt ?? a.scheduledAt);

const TIER_PRIORITY: Record<string, number> = {
  Platinum: 4,
  Gold: 3,
  Silver: 2,
  Member: 1,
};

const getTierPriority = (appointment: AppointmentItem): number => {
  const tier = appointment.membershipTierId;
  if (tier && typeof tier === 'object' && 'name' in tier) {
    return TIER_PRIORITY[tier.name] ?? 0;
  }
  return 0;
};

export default function AdminAppointmentsPage() {
  const [appointmentTab, setAppointmentTab] = useState<AppointmentTab>('all');
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AppointmentStatus>(() =>
    window.location.pathname.includes('service-histories') ? 'completed' : 'all'
  );
  const [staffFilter, setStaffFilter] = useState<'all' | string>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [dateSort, setDateSort] = useState<DateSort>('desc');

  const [detailAppointment, setDetailAppointment] = useState<AppointmentItem | null>(null);
  const [assignAppointment, setAssignAppointment] = useState<AppointmentItem | null>(null);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [statusAppointment, setStatusAppointment] = useState<AppointmentItem | null>(null);
  const [confirmAppointment, setConfirmAppointment] = useState<AppointmentItem | null>(null);
  const [nextStatus, setNextStatus] = useState<AppointmentStatus | ''>('');
  const [rescheduleAppointment, setRescheduleAppointment] = useState<AppointmentItem | null>(null);
  const [cancelAppointment, setCancelAppointment] = useState<AppointmentItem | null>(null);
  const [paymentAppointment, setPaymentAppointment] = useState<AppointmentItem | null>(null);
  const [timelineStatusChange, setTimelineStatusChange] = useState<{
    appointment: AppointmentItem;
    status: TimelineStatus;
  } | null>(null);

  const appointmentFilters = useMemo<AdminAppointmentFilterParams>(() => {
    const trimmedKeyword = keyword.trim();
    const selectedDateRange =
      appointmentTab === 'today' || appointmentTab === 'priority'
        ? getTodayRange()
        : dateFilter
          ? getLocalDateRange(dateFilter)
          : {};

    return {
      ...(trimmedKeyword ? { search: trimmedKeyword } : {}),
      ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
      ...(staffFilter !== 'all' ? { staffId: staffFilter } : {}),
      ...selectedDateRange,
      page,
      limit:
        appointmentTab === 'all' || appointmentTab === 'priority'
          ? APPOINTMENTS_PER_PAGE_BIG
          : APPOINTMENTS_PER_PAGE,
      sortOrder: 'desc',
    };
  }, [appointmentTab, dateFilter, keyword, page, staffFilter, statusFilter]);

  const appointmentsQuery = useAppointments(appointmentFilters);
  const staffsQuery = useStaffWorkload();
  const detailQuery = useAppointmentDetail(detailAppointment?._id);
  const updateStatusMutation = useUpdateAppointmentStatus();
  const assignStaffMutation = useAssignStaffToAppointment();
  const rescheduleMutation = useRescheduleAppointment();
  const cancelMutation = useCancelAppointmentByAdmin();
  const confirmPaymentMutation = useConfirmAppointmentPayment();

  const appointments = useMemo(
    () => appointmentsQuery.data?.appointments ?? [],
    [appointmentsQuery.data?.appointments]
  );

  // Priority queue: waiting appointments of the real (today) day, sorted by tier desc
  const priorityList = useMemo(() => {
    return appointments
      .filter((a) => isWaitingStatus(a))
      .sort((a, b) => {
        const tierDiff = getTierPriority(b) - getTierPriority(a);
        if (tierDiff !== 0) return tierDiff;
        return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
      });
  }, [appointments]);

  // Split into the 4 buckets shown in "Tất cả lịch hẹn" (and reused for "Hôm nay")
  const { processingAppointments, unpaidAppointments, completedAppointments, olderAppointments } =
    useMemo(() => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

      const processing: AppointmentItem[] = [];
      const unpaid: AppointmentItem[] = [];
      const completed: AppointmentItem[] = [];
      const older: AppointmentItem[] = [];

      for (const a of appointments) {
        // Cancelled always lives with the completed/older groups (renders as "Đã hủy")
        if (a.status === 'cancelled') {
          const dateStart = new Date(
            appointmentGroupDate(a).getFullYear(),
            appointmentGroupDate(a).getMonth(),
            appointmentGroupDate(a).getDate()
          ).getTime();
          if (dateStart >= todayStart) completed.push(a);
          else older.push(a);
          continue;
        }
        // Any non-cancelled unpaid order → "Chưa thanh toán" (needs admin payment confirmation)
        if (a.paymentStatus !== 'paid') {
          unpaid.push(a);
          continue;
        }
        if (a.status === 'completed') {
          const dateStart = new Date(
            appointmentGroupDate(a).getFullYear(),
            appointmentGroupDate(a).getMonth(),
            appointmentGroupDate(a).getDate()
          ).getTime();
          if (dateStart >= todayStart) completed.push(a);
          else older.push(a);
          continue;
        }
        processing.push(a);
      }

      return {
        processingAppointments: processing,
        unpaidAppointments: unpaid,
        completedAppointments: completed,
        olderAppointments: older,
      };
    }, [appointments]);

  const detailData = detailQuery.data ?? detailAppointment;
  const staffOptions = useMemo<Array<AppointmentAssignedStaff & StaffWorkload>>(() => {
    return (staffsQuery.data ?? [])
      .filter((staff) => staff.isActive !== false)
      .map((staff) => ({
        _id: staff._id,
        displayName: staff.displayName,
        phone: staff.phone,
        avatarUrl: staff.avatarUrl,
        todayCount: staff.todayCount,
        weekCount: staff.weekCount,
        activeCount: staff.activeCount,
        completedCount: staff.completedCount,
      }));
  }, [staffsQuery.data]);

  const summary = appointmentsQuery.data?.summary ?? {
    total: 0,
    pending: 0,
    confirmed: 0,
    inQueue: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
  };

  const handleConfirmAssignStaff = async () => {
    if (!assignAppointment || selectedStaffIds.length === 0) {
      return;
    }

    await assignStaffMutation.mutateAsync({
      appointmentId: assignAppointment._id,
      payload: { staffIds: selectedStaffIds },
    });
    setAssignAppointment(null);
  };

  const handleConfirmUpdateStatus = async (evidenceImage?: File | null) => {
    if (!statusAppointment || !nextStatus) {
      return;
    }

    const appointmentBeingUpdated = statusAppointment;
    const statusBeingApplied = nextStatus;

    await updateStatusMutation.mutateAsync({
      appointmentId: appointmentBeingUpdated._id,
      payload: { status: statusBeingApplied, evidenceImage },
    });
    setStatusAppointment(null);
  };

  const handleConfirmPendingAppointment = async () => {
    if (!confirmAppointment) {
      return;
    }

    await updateStatusMutation.mutateAsync({
      appointmentId: confirmAppointment._id,
      payload: { status: 'confirmed' },
    });
    setConfirmAppointment(null);
  };

  const handleConfirmTimelineStatus = async () => {
    if (!timelineStatusChange) return;

    const { appointment, status } = timelineStatusChange;
    if (status === 'in_queue' || status === 'completed') {
      setTimelineStatusChange(null);
      setNextStatus(status);
      setStatusAppointment(appointment);
      return;
    }

    await updateStatusMutation.mutateAsync({
      appointmentId: appointment._id,
      payload: { status },
    });
    setTimelineStatusChange(null);
  };

  const handleConfirmReschedule = async (scheduledAt: string) => {
    if (!rescheduleAppointment) {
      return;
    }

    await rescheduleMutation.mutateAsync({
      appointmentId: rescheduleAppointment._id,
      payload: { scheduledAt },
    });
    setRescheduleAppointment(null);
  };

  const handleConfirmCancel = async (cancelReason?: string) => {
    if (!cancelAppointment) {
      return;
    }

    await cancelMutation.mutateAsync({
      appointmentId: cancelAppointment._id,
      payload: { cancelReason },
    });
    setCancelAppointment(null);
  };

  const handleConfirmPayment = async () => {
    if (!paymentAppointment) {
      return;
    }

    await confirmPaymentMutation.mutateAsync({
      appointmentId: paymentAppointment._id,
      payload: {
        paymentStatus: 'paid',
        paymentMethod: paymentAppointment.paymentMethod || 'cash',
      },
    });
    setPaymentAppointment(null);
  };

  const openAssignStaffDialog = (appointment: AppointmentItem) => {
    setSelectedStaffIds(
      appointment.assignedStaffIds?.length
        ? appointment.assignedStaffIds.map((staff) => staff._id)
        : appointment.assignedStaffId?._id
          ? [appointment.assignedStaffId._id]
          : []
    );
    setAssignAppointment(appointment);
  };

  const openStatusDialog = (appointment: AppointmentItem) => {
    if (appointment.status === 'pending') {
      setConfirmAppointment(appointment);
      return;
    }

    setNextStatus(getAllowedAdminAppointmentStatuses(appointment.status)[0] ?? '');
    setStatusAppointment(appointment);
  };

  const toggleDateSort = () => setDateSort((prev) => (prev === 'desc' ? 'asc' : 'desc'));

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden bg-[#f8fafc] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1540px] min-w-0 flex-col gap-7">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="contents">
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
                Quản lý lịch hẹn
              </h1>
              <p className="mt-2 max-w-2xl text-base text-slate-500">
                Theo dõi, phân công nhân viên và cập nhật tiến độ lịch hẹn.
              </p>
            </div>
          </div>
          <Tabs
            value={appointmentTab}
            onValueChange={(value) => {
              setAppointmentTab(value as AppointmentTab);
              setPage(1);
              setDateFilter('');
            }}
          >
            <TabsList className="grid w-full grid-cols-3 sm:w-auto">
              <TabsTrigger value="all">Tất cả lịch hẹn</TabsTrigger>
              <TabsTrigger value="today">Hôm nay</TabsTrigger>
              <TabsTrigger value="priority">Hàng đợi ưu tiên</TabsTrigger>
            </TabsList>
          </Tabs>
        </section>

        <AdminAppointmentSummaryCards
          total={summary.total}
          pending={summary.pending}
          confirmed={summary.confirmed}
          inQueue={summary.inQueue}
          inProgress={summary.inProgress}
          completed={summary.completed}
          cancelled={summary.cancelled}
        />

        <AdminAppointmentFilters
          key={appointmentTab}
          keyword={keyword}
          status={statusFilter}
          staffId={staffFilter}
          date={dateFilter}
          staffOptions={staffOptions.map((staff) => ({
            _id: staff._id,
            displayName: staff.displayName,
          }))}
          onKeywordChange={(value) => {
            setKeyword(value);
            setPage(1);
          }}
          onStatusChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
          onStaffChange={(value) => {
            setStaffFilter(value);
            setPage(1);
          }}
          onDateChange={(date) => {
            setDateFilter(date);
            setPage(1);
            if (date) setAppointmentTab('all');
          }}
        />
        {appointmentsQuery.isLoading ? (
          <section className="rounded-lg border border-border/80 bg-white px-6 py-16 text-center">
            <Loader2 className="mx-auto size-8 animate-spin text-slate-400" />
            <p className="mt-4 text-sm text-slate-500">Đang tải danh sách lịch hẹn...</p>
          </section>
        ) : appointmentsQuery.isError ? (
          <section className="rounded-lg border border-rose-200 bg-rose-50 px-6 py-16 text-center">
            <h2 className="text-xl font-semibold text-rose-700">
              Không thể tải danh sách lịch hẹn
            </h2>
            <p className="mt-2 text-sm text-rose-600">Vui lòng thử lại.</p>
            <Button className="mt-5 rounded-md" onClick={() => appointmentsQuery.refetch()}>
              Thử lại
            </Button>
          </section>
        ) : appointmentTab === 'priority' ? (
          priorityList.length === 0 ? (
            <EmptyAdminAppointmentsState
              title="Hàng đợi ưu tiên trống"
              description="Không có lịch hẹn nào đang chờ xử lý trong hôm nay. Hàng đợi ưu tiên sắp xếp theo hạng Platinum → Gold → Silver → Member, khách hạng cao xếp trước."
            />
          ) : (
            <section className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950">Hàng đợi ưu tiên</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {priorityList.length} lịch hẹn đang chờ trong hôm nay, xếp theo hạng thành viên
                  (Platinum → Gold → Silver → Member).
                </p>
              </div>
              <AdminAppointmentsTable
                appointments={priorityList}
                onViewDetail={setDetailAppointment}
                onAssignStaff={openAssignStaffDialog}
                onUpdateStatus={openStatusDialog}
                onConfirmPayment={setPaymentAppointment}
                onReschedule={setRescheduleAppointment}
                onCancel={setCancelAppointment}
              />
            </section>
          )
        ) : processingAppointments.length === 0 &&
          unpaidAppointments.length === 0 &&
          completedAppointments.length === 0 &&
          olderAppointments.length === 0 ? (
          <EmptyAdminAppointmentsState
            title={
              appointmentTab === 'today'
                ? 'Hôm nay chưa có lịch hẹn nào'
                : dateFilter
                  ? 'Không có lịch hẹn nào trong ngày đã chọn'
                  : undefined
            }
            description={
              appointmentTab === 'today'
                ? 'Chuyển sang tab Hàng đợi ưu tiên để xem lịch sắp xếp theo hạng thành viên.'
                : dateFilter
                  ? 'Hãy chọn ngày khác hoặc xóa bộ lọc ngày hẹn để xem toàn bộ lịch.'
                  : undefined
            }
          />
        ) : (
          <section className="space-y-8">
            {processingAppointments.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-950">Đang xử lý</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {processingAppointments.length} lịch hẹn chưa hoàn thành và đã thanh toán.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={toggleDateSort}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                    title="Sắp xếp theo ngày hẹn"
                  >
                    <ArrowUpDown className="size-3.5" />
                    {dateSort === 'desc' ? 'Mới nhất' : 'Cũ nhất'}
                  </button>
                </div>
                <AdminAppointmentsTable
                  appointments={processingAppointments}
                  onViewDetail={setDetailAppointment}
                  onAssignStaff={openAssignStaffDialog}
                  onUpdateStatus={openStatusDialog}
                  onConfirmPayment={setPaymentAppointment}
                  onReschedule={setRescheduleAppointment}
                  onCancel={setCancelAppointment}
                  dateSort={dateSort}
                  onDateSortToggle={toggleDateSort}
                />
              </div>
            ) : null}

            {unpaidAppointments.length > 0 ? (
              <div className="space-y-3">
                <div>
                  <h3 className="text-xl font-semibold text-rose-700">Chưa thanh toán</h3>
                  <p className="mt-1 text-sm text-rose-600">
                    {unpaidAppointments.length} lịch hẹn chưa thanh toán, cần xác nhận thu tiền.
                  </p>
                </div>
                <AdminAppointmentsTable
                  appointments={unpaidAppointments}
                  onViewDetail={setDetailAppointment}
                  onAssignStaff={openAssignStaffDialog}
                  onUpdateStatus={openStatusDialog}
                  onConfirmPayment={setPaymentAppointment}
                  onReschedule={setRescheduleAppointment}
                  onCancel={setCancelAppointment}
                  dateSort={dateSort}
                  onDateSortToggle={toggleDateSort}
                />
              </div>
            ) : null}

            {completedAppointments.length > 0 ? (
              <div className="space-y-3">
                <div>
                  <h3 className="text-xl font-semibold text-emerald-700">
                    Đã hoàn thành {appointmentTab === 'today' ? '' : '(hôm nay trở đi)'}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {completedAppointments.length} lịch hẹn hoàn thành hoặc đã hủy được hiển thị tại
                    đây.
                  </p>
                </div>
                <AdminAppointmentsTable
                  appointments={completedAppointments}
                  onViewDetail={setDetailAppointment}
                  onAssignStaff={openAssignStaffDialog}
                  onUpdateStatus={openStatusDialog}
                  onConfirmPayment={setPaymentAppointment}
                  onReschedule={setRescheduleAppointment}
                  onCancel={setCancelAppointment}
                  dateSort={dateSort}
                  onDateSortToggle={toggleDateSort}
                />
              </div>
            ) : null}

            {olderAppointments.length > 0 ? (
              <div className="space-y-3">
                <div>
                  <h3 className="text-xl font-semibold text-slate-400">Cũ hơn</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {olderAppointments.length} lịch hẹn hoàn thành/hủy trước hôm nay.
                  </p>
                </div>
                <AdminAppointmentsTable
                  appointments={olderAppointments}
                  onViewDetail={setDetailAppointment}
                  onAssignStaff={openAssignStaffDialog}
                  onUpdateStatus={openStatusDialog}
                  onConfirmPayment={setPaymentAppointment}
                  onReschedule={setRescheduleAppointment}
                  onCancel={setCancelAppointment}
                  dateSort={dateSort}
                  onDateSortToggle={toggleDateSort}
                />
              </div>
            ) : null}

            <PaginationControls
              pagination={appointmentsQuery.data?.pagination}
              itemCount={appointments.length}
              onPageChange={setPage}
            />
          </section>
        )}
      </div>

      <AdminAppointmentDetailDialog
        appointment={detailData ?? null}
        open={!!detailAppointment}
        onOpenChange={(open) => {
          if (!open) {
            setDetailAppointment(null);
          }
        }}
      />

      <AssignStaffDialog
        appointment={assignAppointment}
        open={!!assignAppointment}
        selectedStaffIds={selectedStaffIds}
        staffOptions={staffOptions}
        isLoadingStaffs={staffsQuery.isLoading}
        isSubmitting={assignStaffMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedStaffIds([]);
            setAssignAppointment(null);
          }
        }}
        onSelectedStaffIdsChange={setSelectedStaffIds}
        onConfirm={handleConfirmAssignStaff}
      />

      <UpdateAppointmentStatusDialog
        key={statusAppointment?._id ?? 'status-dialog'}
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
        onConfirm={handleConfirmUpdateStatus}
      />

      <Dialog
        open={!!timelineStatusChange}
        onOpenChange={(open) => {
          if (!open && !updateStatusMutation.isPending) setTimelineStatusChange(null);
        }}
      >
        <DialogContent className="sm:max-w-[28rem]">
          <DialogHeader>
            <DialogTitle>Xác nhận chuyển trạng thái</DialogTitle>
            <DialogDescription>
              Chuyển trạng thái sang{' '}
              <span className="font-semibold text-slate-900">
                “
                {timelineStatusChange
                  ? appointmentTimelineStatusLabels[timelineStatusChange.status]
                  : ''}
                ”
              </span>
              ?
            </DialogDescription>
          </DialogHeader>
          {timelineStatusChange ? (
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm">
              <p className="font-semibold text-slate-950">
                {timelineStatusChange.appointment.customerId.displayName}
              </p>
              <p className="mt-1 text-slate-500">
                {timelineStatusChange.appointment.vehicleId.brand}{' '}
                {timelineStatusChange.appointment.vehicleId.model} ·{' '}
                {formatLicensePlateDisplay(timelineStatusChange.appointment.vehicleId.licensePlate)}
              </p>
            </div>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setTimelineStatusChange(null)}
              disabled={updateStatusMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleConfirmTimelineStatus}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                'Xác nhận'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!confirmAppointment}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmAppointment(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[28rem]">
          <DialogHeader>
            <DialogTitle>Xác nhận lịch hẹn</DialogTitle>
            <DialogDescription>
              Bạn có muốn xác nhận lịch hẹn của{' '}
              {confirmAppointment?.customerId.displayName ?? 'khách hàng'} này hay không?
            </DialogDescription>
          </DialogHeader>
          {confirmAppointment ? (
            <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-950">
                {confirmAppointment.customerId.displayName}
              </p>
              <p className="mt-1">
                {confirmAppointment.vehicleId.brand} {confirmAppointment.vehicleId.model} -{' '}
                {formatLicensePlateDisplay(confirmAppointment.vehicleId.licensePlate)}
              </p>
            </div>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmAppointment(null)}
              disabled={updateStatusMutation.isPending}
            >
              Đóng
            </Button>
            <Button
              type="button"
              onClick={handleConfirmPendingAppointment}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                'Xác nhận'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RescheduleAppointmentDialog
        appointment={rescheduleAppointment}
        open={!!rescheduleAppointment}
        isSubmitting={rescheduleMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setRescheduleAppointment(null);
          }
        }}
        onConfirm={handleConfirmReschedule}
      />

      <CancelAppointmentDialog
        key={cancelAppointment?._id ?? 'closed'}
        appointment={cancelAppointment}
        open={!!cancelAppointment}
        isSubmitting={cancelMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setCancelAppointment(null);
          }
        }}
        onConfirm={handleConfirmCancel}
      />

      <Dialog
        open={!!paymentAppointment}
        onOpenChange={(open) => {
          if (!open && !confirmPaymentMutation.isPending) setPaymentAppointment(null);
        }}
      >
        <DialogContent className="sm:max-w-[28rem]">
          <DialogHeader>
            <DialogTitle>Xác nhận thanh toán</DialogTitle>
            <DialogDescription>Xác nhận khách hàng đã thanh toán thành công?</DialogDescription>
          </DialogHeader>
          {paymentAppointment ? (
            <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-950">
                {paymentAppointment.customerId.displayName}
              </p>
              <p className="mt-1">
                {paymentAppointment.vehicleId.brand} {paymentAppointment.vehicleId.model} ·{' '}
                {formatLicensePlateDisplay(paymentAppointment.vehicleId.licensePlate)}
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                {formatCurrencyVi(
                  Number(paymentAppointment.finalAmount ?? paymentAppointment.totalPrice ?? 0)
                )}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Hình thức:{' '}
                {paymentAppointment.paymentMethod === 'vnpay'
                  ? 'VNPay'
                  : paymentAppointment.paymentMethod === 'momo'
                    ? 'Momo'
                    : 'Tiền mặt'}
              </p>
            </div>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPaymentAppointment(null)}
              disabled={confirmPaymentMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleConfirmPayment}
              disabled={confirmPaymentMutation.isPending}
            >
              {confirmPaymentMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                'Xác nhận thanh toán'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

import {
  CheckCircle2,
  Clock3,
  CreditCard,
  DollarSign,
  Ellipsis,
  Eye,
  Loader2,
  Printer,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { PaginationControls } from '@/components/shared/PaginationControls';
import { StatCard } from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AdminAppointmentDetailDialog } from '@/features/admin/appointments/components/AppointmentDetailDialog';
import { useConfirmAppointmentPayment } from '@/features/admin/appointments/hooks/useAdminAppointmentMutations';
import { useAdminPayments } from '@/features/admin/payments/hooks/useAdminPayments';
import { cn, formatCurrencyVi } from '@/lib/utils';
import type {
  AppointmentItem,
  AppointmentPaymentMethod,
  AppointmentPaymentStatus,
} from '@/types/appointment';

const PAYMENTS_PER_PAGE = 10;

type PaymentFilter = 'all' | 'paid' | 'unpaid' | 'cancelled';

const compactStatCardClassName =
  'min-h-[96px] p-4 [&_.card-icon]:size-10 [&_.card-value]:text-[26px] [&_.card-value]:leading-none [&_p:first-child]:text-sm';

const paymentStatusLabels: Record<AppointmentPaymentStatus, string> = {
  unpaid: 'Chưa thanh toán',
  paid: 'Đã thanh toán',
  cancelled: 'Đã hủy',
};

const paymentMethodLabels: Record<AppointmentPaymentMethod, string> = {
  cash: 'Tiền mặt',
};

const getPaymentMethodLabel = (paymentMethod: AppointmentItem['paymentMethod']) =>
  paymentMethod === 'cash' ? paymentMethodLabels.cash : 'Chưa chọn';

const getPaymentMethodBadgeClassName = (paymentMethod: AppointmentItem['paymentMethod']) => {
  if (paymentMethod === 'cash') return 'border-slate-200 bg-slate-50 text-slate-800';
  return 'border-slate-200 bg-slate-100 text-slate-600';
};

const paymentFilters: Array<{ label: string; value: PaymentFilter }> = [
  { label: 'Tất cả thanh toán', value: 'all' },
  { label: 'Đã thanh toán', value: 'paid' },
  { label: 'Chưa thanh toán', value: 'unpaid' },
  { label: 'Đã hủy', value: 'cancelled' },
];

const getPaymentAmount = (appointment: AppointmentItem) =>
  Number(appointment.finalAmount ?? appointment.totalPrice ?? 0);

const getDisplayDate = (appointment: AppointmentItem) =>
  appointment.paidAt || appointment.updatedAt || appointment.createdAt || appointment.scheduledAt;

const getDateParts = (value: string) => {
  const date = new Date(value);
  return {
    date: new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date),
    time: new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date),
  };
};

const getServiceTitle = (appointment: AppointmentItem) => {
  const firstService = appointment.services[0]?.nameSnapshot || 'Dịch vụ chăm sóc xe';
  return appointment.services.length > 1
    ? `${firstService} +${appointment.services.length - 1} dịch vụ`
    : firstService;
};

const matchesPaymentFilter = (appointment: AppointmentItem, filter: PaymentFilter) => {
  if (filter === 'all') return true;
  return appointment.paymentStatus === filter;
};

function PaymentStatusBadge({ status }: { status: AppointmentPaymentStatus }) {
  const styles: Record<AppointmentPaymentStatus, string> = {
    unpaid: 'bg-slate-100 text-slate-700',
    paid: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-slate-200 text-slate-600',
  };
  const Icon = status === 'paid' ? CheckCircle2 : status === 'unpaid' ? Clock3 : XCircle;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold',
        'whitespace-nowrap',
        styles[status]
      )}
    >
      <Icon className="size-3.5" />
      {paymentStatusLabels[status]}
    </span>
  );
}

function PaymentActionsMenu({
  appointment,
  isConfirming,
  onView,
  onConfirmPayment,
  onPrintInvoice,
}: {
  appointment: AppointmentItem;
  isConfirming: boolean;
  onView: (appointment: AppointmentItem) => void;
  onConfirmPayment: (appointment: AppointmentItem) => void;
  onPrintInvoice: (appointment: AppointmentItem) => void;
}) {
  const isUnpaid = appointment.paymentStatus === 'unpaid';
  const isPaid = appointment.paymentStatus === 'paid';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="rounded-md">
          <Ellipsis className="size-4" />
          <span className="sr-only">Mở menu thao tác</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuItem onClick={() => onView(appointment)}>
          <Eye className="size-4" />
          Xem chi tiết
        </DropdownMenuItem>

        {isUnpaid ? (
          <DropdownMenuItem disabled={isConfirming} onClick={() => onConfirmPayment(appointment)}>
            <CheckCircle2 className="size-4" />
            Xác nhận thanh toán
          </DropdownMenuItem>
        ) : null}

        {isPaid ? (
          <DropdownMenuItem onClick={() => onPrintInvoice(appointment)}>
            <Printer className="size-4" />
            In hóa đơn
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function PaymentsPage() {
  const [activeFilter, setActiveFilter] = useState<PaymentFilter>('all');
  const [page, setPage] = useState(1);
  const [detailAppointment, setDetailAppointment] = useState<AppointmentItem | null>(null);

  const paymentsQuery = useAdminPayments();
  const confirmPaymentMutation = useConfirmAppointmentPayment();

  const appointments = useMemo(() => paymentsQuery.data ?? [], [paymentsQuery.data]);
  const paidAppointments = useMemo(
    () => appointments.filter((appointment) => appointment.paymentStatus === 'paid'),
    [appointments]
  );
  const totalRevenue = useMemo(
    () => paidAppointments.reduce((total, appointment) => total + getPaymentAmount(appointment), 0),
    [paidAppointments]
  );
  const awaitingCount = useMemo(
    () => appointments.filter((appointment) => appointment.paymentStatus === 'unpaid').length,
    [appointments]
  );
  const averageTransaction = paidAppointments.length ? totalRevenue / paidAppointments.length : 0;

  const filteredAppointments = useMemo(
    () => appointments.filter((appointment) => matchesPaymentFilter(appointment, activeFilter)),
    [activeFilter, appointments]
  );
  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / PAYMENTS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const visibleAppointments = filteredAppointments.slice(
    (safePage - 1) * PAYMENTS_PER_PAGE,
    safePage * PAYMENTS_PER_PAGE
  );
  const recentAppointments = appointments.slice(0, 5);

  const handlePrintInvoice = (appointment: AppointmentItem) => {
    setDetailAppointment(appointment);
    window.setTimeout(() => window.print(), 100);
  };

  const stats = [
    {
      label: 'Tổng doanh thu',
      value: formatCurrencyVi(totalRevenue),
      icon: DollarSign,
    },
    {
      label: 'Đã thanh toán',
      value: paidAppointments.length.toString(),
      icon: CheckCircle2,
    },
    {
      label: 'Đang chờ',
      value: awaitingCount.toString(),
      icon: Clock3,
    },
    {
      label: 'Trung bình/Giao dịch',
      value: formatCurrencyVi(averageTransaction),
      icon: CreditCard,
    },
  ];

  return (
    <>
      <main className="min-h-[calc(100vh-81px)] bg-[#f8fafc] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1540px] space-y-7">
          <section>
            <div>
              <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
                Thanh toán
              </h1>
              <p className="mt-2 text-base text-slate-500">
                Theo dõi và quản lý thanh toán từ dữ liệu lịch hẹn thực tế
              </p>
            </div>
          </section>

          {paymentsQuery.isLoading ? (
            <section className="flex min-h-80 items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <div className="text-center text-slate-500">
                <Loader2 className="mx-auto size-8 animate-spin" />
                <p className="mt-3 text-sm">Đang tải dữ liệu thanh toán...</p>
              </div>
            </section>
          ) : paymentsQuery.isError ? (
            <section className="rounded-2xl border border-rose-200 bg-white p-8 text-center">
              <XCircle className="mx-auto size-10 text-rose-600" />
              <h2 className="mt-4 text-lg font-semibold text-slate-950">
                Không thể tải dữ liệu thanh toán
              </h2>
              <p className="mt-2 text-sm text-slate-500">Vui lòng kiểm tra kết nối và thử lại.</p>
              <Button className="mt-5" variant="outline" onClick={() => paymentsQuery.refetch()}>
                <RefreshCw className="size-4" />
                Thử lại
              </Button>
            </section>
          ) : (
            <>
              <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <StatCard
                    key={stat.label}
                    title={stat.label}
                    value={stat.value}
                    icon={stat.icon}
                    className={compactStatCardClassName}
                  />
                ))}
              </section>

              <section className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-lg border border-border/80 bg-white p-6">
                  <p className="text-xl font-semibold text-slate-950">Giao dịch gần đây</p>
                  <div className="mt-7 space-y-4">
                    {recentAppointments.length ? (
                      recentAppointments.map((appointment) => {
                        const date = getDateParts(getDisplayDate(appointment));
                        return (
                          <button
                            key={appointment._id}
                            type="button"
                            className="flex w-full items-center justify-between gap-4 rounded-lg bg-slate-50 p-4 text-left transition hover:bg-slate-100"
                            onClick={() => setDetailAppointment(appointment)}
                          >
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">
                                {appointment.customerId.displayName}
                              </p>
                              <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                                {getServiceTitle(appointment)}
                              </p>
                              <p className="text-xs text-slate-500">{date.time}</p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="font-bold text-slate-950">
                                {formatCurrencyVi(getPaymentAmount(appointment))}
                              </p>
                              <div className="mt-2">
                                <PaymentStatusBadge status={appointment.paymentStatus} />
                              </div>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <p className="rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-500">
                        Chưa có dữ liệu thanh toán.
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section className="overflow-x-auto">
                <div className="flex w-max min-w-full rounded-lg bg-slate-200/70 p-1">
                  {paymentFilters.map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      className={cn(
                        'h-9 whitespace-nowrap rounded-md px-4 text-sm font-semibold text-slate-900 transition',
                        activeFilter === filter.value ? 'bg-white shadow-sm' : 'hover:bg-white/60'
                      )}
                      onClick={() => {
                        setActiveFilter(filter.value);
                        setPage(1);
                      }}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-border/80 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xl font-semibold text-slate-950">Lịch sử thanh toán</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {filteredAppointments.length} giao dịch phù hợp
                    </p>
                  </div>
                </div>

                {visibleAppointments.length ? (
                  <div className="mt-5 overflow-hidden">
                    <table className="w-full table-fixed border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-border text-slate-900">
                          <th className="w-[16%] px-2 py-3 font-semibold">Khách hàng</th>
                          <th className="w-[10%] px-2 py-3 font-semibold">Biển số</th>
                          <th className="w-[19%] px-2 py-3 font-semibold">Dịch vụ</th>
                          <th className="w-[13%] px-2 py-3 text-right font-semibold">Số tiền</th>
                          <th className="w-[11%] px-2 py-3 font-semibold">Phương thức</th>
                          <th className="w-[11%] px-2 py-3 font-semibold">Ngày & Giờ</th>
                          <th className="w-[14%] px-2 py-3 font-semibold">Trạng thái</th>
                          <th className="w-[6%] px-2 py-3 text-center font-semibold">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleAppointments.map((appointment) => {
                          const date = getDateParts(getDisplayDate(appointment));
                          return (
                            <tr
                              key={appointment._id}
                              tabIndex={0}
                              role="button"
                              className="cursor-pointer border-b border-border/70 transition-colors last:border-0 hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
                              onClick={() => setDetailAppointment(appointment)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();
                                  setDetailAppointment(appointment);
                                }
                              }}
                            >
                              <td className="px-2 py-3">
                                <p className="truncate font-semibold text-slate-900">
                                  {appointment.customerId.displayName}
                                </p>
                              </td>
                              <td className="px-2 py-3 text-slate-900">
                                {appointment.vehicleId.licensePlate}
                              </td>
                              <td className="px-2 py-3 text-slate-900">
                                <span className="line-clamp-2">{getServiceTitle(appointment)}</span>
                              </td>
                              <td className="px-2 py-3 text-right font-bold text-slate-950">
                                <span className="whitespace-nowrap">
                                  {formatCurrencyVi(getPaymentAmount(appointment))}
                                </span>
                              </td>
                              <td className="px-2 py-3">
                                <span
                                  className={cn(
                                    'inline-flex whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-semibold',
                                    getPaymentMethodBadgeClassName(appointment.paymentMethod)
                                  )}
                                >
                                  {getPaymentMethodLabel(appointment.paymentMethod)}
                                </span>
                              </td>
                              <td className="px-2 py-3 text-slate-900">
                                <div className="font-medium">{date.date}</div>
                                <div className="text-xs text-slate-500">{date.time}</div>
                              </td>
                              <td className="px-2 py-3">
                                <PaymentStatusBadge status={appointment.paymentStatus} />
                              </td>
                              <td
                                className="px-2 py-3 text-center"
                                onClick={(event) => event.stopPropagation()}
                                onKeyDown={(event) => event.stopPropagation()}
                              >
                                <PaymentActionsMenu
                                  appointment={appointment}
                                  isConfirming={confirmPaymentMutation.isPending}
                                  onView={setDetailAppointment}
                                  onConfirmPayment={(selectedAppointment) =>
                                    confirmPaymentMutation.mutate({
                                      appointmentId: selectedAppointment._id,
                                      payload: { paymentStatus: 'paid', paymentMethod: 'cash' },
                                    })
                                  }
                                  onPrintInvoice={handlePrintInvoice}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="mt-7 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                    <CreditCard className="mx-auto size-10 text-slate-400" />
                    <p className="mt-3 text-sm text-slate-500">
                      Không có giao dịch phù hợp với bộ lọc này.
                    </p>
                  </div>
                )}

                <PaginationControls
                  pagination={{
                    page: safePage,
                    limit: PAYMENTS_PER_PAGE,
                    total: filteredAppointments.length,
                    totalPages,
                  }}
                  itemCount={visibleAppointments.length}
                  onPageChange={setPage}
                />
              </section>
            </>
          )}
        </div>
      </main>

      <AdminAppointmentDetailDialog
        appointment={detailAppointment}
        open={Boolean(detailAppointment)}
        onOpenChange={(open) => {
          if (!open) setDetailAppointment(null);
        }}
      />
    </>
  );
}

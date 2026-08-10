import {
  Award,
  CalendarClock,
  CalendarDays,
  CarFront,
  Coins,
  CreditCard,
  Ellipsis,
  Eye,
  Lock,
  Loader2,
  PencilLine,
  Phone,
  RefreshCw,
  Search,
  Sparkles,
  Unlock,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminAppointmentDetailDialog } from '@/features/admin/appointments/components/AppointmentDetailDialog';
import { useAppointments } from '@/features/admin/appointments/hooks/useAppointments';
import {
  useCustomers,
  useUpdateCustomer,
} from '@/features/admin/customers/hooks/useAdminCustomers';
import { AppointmentStatusBadge } from '@/features/customers/appointments/components/AppointmentStatusBadge';
import { PaymentStatusBadge } from '@/components/shared/PaymentStatusBadge';
import { MembershipTierBadge } from '@/features/shared/loyalty/components/MembershipTierBadge';
import {
  useCustomerLoyaltyAccount,
  useMembershipTiers,
} from '@/features/shared/loyalty/hooks/use-loyalty';
import type { LoyaltyAccount } from '@/features/shared/loyalty/types/loyalty.types';
import { getAccountTier } from '@/features/shared/loyalty/utils/tier-progress';
import { cn, formatDate, formatDateTimeVi, formatPrice } from '@/lib/utils';
import type { AppointmentItem } from '@/types/appointment';
import type { User } from '@/types/user';

type CustomerStatusFilter = 'all' | 'active' | 'inactive';
type CustomerDetailTab = 'overview' | 'appointments' | 'payments';

interface CustomerRow {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role?: User['role'];
  createdAt?: string;
  updatedAt?: string;
  isActive: boolean;
}

interface EditCustomerForm {
  name: string;
  phone: string;
  isActive: boolean;
}

const statusLabels = {
  all: 'Tất cả trạng thái',
  active: 'Đang hoạt động',
  inactive: 'Tạm khóa',
} as const;

const roleLabels: Record<NonNullable<User['role']>, string> = {
  admin: 'Quản trị viên',
  staff: 'Nhân viên',
  customer: 'Khách hàng',
};

const primaryButtonClassName =
  'rounded-md bg-slate-950 text-white hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-500';

function formatNumber(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value);
}

function isCreatedThisMonth(createdAt?: string) {
  if (!createdAt) return false;
  const date = new Date(createdAt);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function mapUserToCustomer(user: User): CustomerRow {
  return {
    id: user._id,
    name: user.displayName || user.phone || 'Khách hàng',
    phone: user.phone,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    isActive: user.isActive !== false,
  };
}

function CustomerActionsMenu({
  customer,
  onViewDetail,
  onEdit,
  onToggleStatus,
}: {
  customer: CustomerRow;
  onViewDetail: (customer: CustomerRow) => void;
  onEdit: (customer: CustomerRow) => void;
  onToggleStatus: (customer: CustomerRow) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-8 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-950"
        >
          <Ellipsis className="size-4" />
          <span className="sr-only">Mở menu thao tác</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuItem onClick={() => onViewDetail(customer)}>
          <Eye className="size-4" />
          Xem chi tiết
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(customer)}>
          <PencilLine className="size-4" />
          Chỉnh sửa thông tin
        </DropdownMenuItem>
        <DropdownMenuItem
          className={customer.isActive ? 'text-rose-600 focus:text-rose-700' : undefined}
          onClick={() => onToggleStatus(customer)}
        >
          {customer.isActive ? <Lock className="size-4" /> : <Unlock className="size-4" />}
          {customer.isActive ? 'Tạm khóa' : 'Mở khóa tài khoản'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CompactStatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Users;
}) {
  return (
    <div className="flex h-[96px] items-center justify-between gap-3 rounded-lg border border-border/80 bg-white px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-bold tracking-normal text-slate-950">{value}</p>
      </div>
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-700">
        <Icon className="size-4" />
      </span>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-slate-200 bg-white px-3 py-2.5">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 truncate font-semibold text-slate-950" title={value}>
        {value}
      </p>
    </div>
  );
}

function LoyaltyMetric({
  label,
  value,
  icon: Icon,
  tone = 'slate',
}: {
  label: string;
  value: string;
  icon: typeof Coins;
  tone?: 'slate' | 'emerald' | 'amber' | 'rose';
}) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
          <p
            className="mt-2 truncate text-xl font-bold tracking-normal text-slate-950"
            title={value}
          >
            {value}
          </p>
        </div>
        <span className={cn('grid size-9 shrink-0 place-items-center rounded-md', tones[tone])}>
          <Icon className="size-4" />
        </span>
      </div>
    </div>
  );
}

function CustomerDetailDialogBody({
  customer,
  loyalty,
  isLoading,
  isError,
  onRetry,
}: {
  customer: CustomerRow;
  loyalty?: LoyaltyAccount | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  const tiersQuery = useMembershipTiers();
  const tier = getAccountTier(loyalty);
  const tierName = tier?.name ?? 'Chưa có hạng';
  const statusLabel = customer.isActive ? 'Hoạt động' : 'Tạm khóa';

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-slate-500">Khách hàng</p>
            <h3 className="mt-1 truncate text-2xl font-bold tracking-normal text-slate-950">
              {customer.name}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <Phone className="size-4" />
              <span>{customer.phone || 'Chưa có số điện thoại'}</span>
            </div>
          </div>
          <span
            className={cn(
              'inline-flex w-fit items-center rounded-md px-3 py-1 text-xs font-semibold',
              customer.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'
            )}
          >
            {statusLabel}
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <DetailField label="Vai trò" value={roleLabels[customer.role ?? 'customer']} />
          <DetailField
            label="Ngày tham gia"
            value={customer.createdAt ? formatDate(customer.createdAt) : 'Chưa có dữ liệu'}
          />
          <DetailField
            label="Cập nhật gần nhất"
            value={customer.updatedAt ? formatDate(customer.updatedAt) : 'Chưa có dữ liệu'}
          />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Loyalty</p>
            <h3 className="mt-1 text-lg font-bold tracking-normal text-slate-950">
              Điểm thưởng và hạng thành viên
            </h3>
          </div>
          {loyalty ? (
            <MembershipTierBadge tier={tier} tiers={tiersQuery.data} className="px-3 py-1" />
          ) : null}
        </div>

        {isLoading ? (
          <div className="mt-4 rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
            <Loader2 className="mx-auto mb-3 size-6 animate-spin text-slate-400" />
            Đang tải loyalty của khách hàng...
          </div>
        ) : isError ? (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <p className="font-semibold">Không thể tải loyalty của khách hàng.</p>
            <Button className="mt-3 h-9 rounded-md" variant="outline" onClick={onRetry}>
              <RefreshCw className="size-4" />
              Thử lại
            </Button>
          </div>
        ) : loyalty ? (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <LoyaltyMetric
                label="Điểm khả dụng"
                value={formatNumber(loyalty.currentPoints)}
                icon={Coins}
                tone="emerald"
              />
              <LoyaltyMetric
                label="Tổng tích lũy"
                value={formatNumber(loyalty.totalEarnedPoints)}
                icon={Sparkles}
                tone="amber"
              />
              <LoyaltyMetric
                label="Đã đổi thưởng"
                value={formatNumber(loyalty.totalRedeemedPoints)}
                icon={Award}
              />
              <LoyaltyMetric
                label="Đã hết hạn"
                value={formatNumber(loyalty.totalExpiredPoints)}
                icon={CalendarDays}
                tone="rose"
              />
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <DetailField
                label="Hạng hiện tại"
                value={`${tierName}${tier?.discountPercent ? ` - giảm ${tier.discountPercent}%` : ''}`}
              />
              <DetailField
                label="Lần tích điểm gần nhất"
                value={
                  loyalty.lastPointEarnedAt
                    ? formatDate(loyalty.lastPointEarnedAt)
                    : 'Chưa có dữ liệu'
                }
              />
            </div>
          </>
        ) : (
          <div className="mt-4 rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
            Khách hàng này chưa có tài khoản loyalty.
          </div>
        )}
      </section>
    </div>
  );
}

function HistoryState({
  isLoading,
  isError,
  isEmpty,
  emptyMessage,
  onRetry,
  children,
}: {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  emptyMessage: string;
  onRetry: () => void;
  children: React.ReactNode;
}) {
  if (isLoading) {
    return (
      <div className="grid min-h-64 place-items-center rounded-lg border border-dashed border-slate-300 text-sm text-slate-500">
        <span className="flex items-center gap-2">
          <Loader2 className="size-5 animate-spin" />
          Đang tải dữ liệu...
        </span>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="grid min-h-64 place-items-center rounded-lg border border-rose-200 bg-rose-50 p-5 text-center text-sm text-rose-700">
        <div>
          <p className="font-semibold">Không thể tải dữ liệu.</p>
          <Button variant="outline" className="mt-3" onClick={onRetry}>
            <RefreshCw className="size-4" />
            Thử lại
          </Button>
        </div>
      </div>
    );
  }
  if (isEmpty) {
    return (
      <div className="grid min-h-64 place-items-center rounded-lg border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }
  return children;
}

function HistoryPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-sm text-slate-500">
      <span>
        Trang {page}/{totalPages}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Trước
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Sau
        </Button>
      </div>
    </div>
  );
}

function AppointmentHistoryTab({
  query,
  page,
  onPageChange,
  onView,
}: {
  query: ReturnType<typeof useAppointments>;
  page: number;
  onPageChange: (page: number) => void;
  onView: (appointment: AppointmentItem) => void;
}) {
  const items = query.data?.appointments ?? [];
  const totalPages = query.data?.pagination?.totalPages ?? 1;
  return (
    <HistoryState
      isLoading={query.isLoading}
      isError={query.isError}
      isEmpty={!items.length}
      emptyMessage="Khách hàng chưa đặt lịch dịch vụ nào."
      onRetry={() => query.refetch()}
    >
      <div className="space-y-3">
        {items.map((appointment) => (
          <button
            key={appointment._id}
            type="button"
            onClick={() => onView(appointment)}
            className="grid w-full gap-3 rounded-lg border border-slate-200 p-4 text-left transition hover:border-slate-300 hover:bg-slate-50 md:grid-cols-[1.2fr_1fr_auto] md:items-center"
          >
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                <CalendarClock className="size-4 text-slate-500" />
                {formatDateTimeVi(appointment.scheduledAt)}
              </p>
              <p className="mt-1 truncate text-sm text-slate-500">
                {appointment.services.map((service) => service.nameSnapshot).join(', ')}
              </p>
            </div>
            <div className="min-w-0 text-sm">
              <p className="flex items-center gap-2 font-medium text-slate-800">
                <CarFront className="size-4 text-slate-400" />
                {appointment.vehicleId.brand} {appointment.vehicleId.model}
              </p>
              <p className="mt-1 text-slate-500">
                {appointment.vehicleId.licensePlate} ·{' '}
                {formatPrice(appointment.finalAmount ?? appointment.totalPrice)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 md:justify-end">
              <AppointmentStatusBadge status={appointment.status} />
              <PaymentStatusBadge status={appointment.paymentStatus} />
            </div>
          </button>
        ))}
        <HistoryPagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </HistoryState>
  );
}

function PaymentHistoryTab({
  query,
  page,
  onPageChange,
  onView,
}: {
  query: ReturnType<typeof useAppointments>;
  page: number;
  onPageChange: (page: number) => void;
  onView: (appointment: AppointmentItem) => void;
}) {
  const items = query.data?.appointments ?? [];
  const totalPages = query.data?.pagination?.totalPages ?? 1;
  return (
    <HistoryState
      isLoading={query.isLoading}
      isError={query.isError}
      isEmpty={!items.length}
      emptyMessage="Khách hàng chưa có thông tin thanh toán."
      onRetry={() => query.refetch()}
    >
      <div className="space-y-3">
        {items.map((appointment) => (
          <button
            key={appointment._id}
            type="button"
            onClick={() => onView(appointment)}
            className="grid w-full gap-3 rounded-lg border border-slate-200 p-4 text-left transition hover:border-slate-300 hover:bg-slate-50 md:grid-cols-[1.2fr_1fr_auto] md:items-center"
          >
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                <CreditCard className="size-4 text-slate-500" />
                {formatPrice(appointment.finalAmount ?? appointment.totalPrice)}
              </p>
              <div className="text-sm text-slate-600">
                <p>
                  {appointment.paymentMethod === 'cash' ? 'Thanh toán tại gara' : 'Chưa thanh toán'}
                </p>
                <p className="mt-1 text-xs">
                  {appointment.paidAt
                    ? `Hoàn tất ${formatDateTimeVi(appointment.paidAt)}`
                    : `Tạo ${formatDateTimeVi(appointment.createdAt ?? appointment.scheduledAt)}`}
                </p>
              </div>
            </div>
            <div className="md:justify-self-end">
              <PaymentStatusBadge status={appointment.paymentStatus} />
            </div>
          </button>
        ))}
        <HistoryPagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </HistoryState>
  );
}

export default function CustomerManagementPage() {
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<CustomerStatusFilter>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusTarget, setStatusTarget] = useState<CustomerRow | null>(null);
  const [detailTarget, setDetailTarget] = useState<CustomerRow | null>(null);
  const [detailTab, setDetailTab] = useState<CustomerDetailTab>('overview');
  const [appointmentPage, setAppointmentPage] = useState(1);
  const [paymentPage, setPaymentPage] = useState(1);
  const [viewAppointment, setViewAppointment] = useState<AppointmentItem | null>(null);
  const [editTarget, setEditTarget] = useState<CustomerRow | null>(null);
  const [editForm, setEditForm] = useState<EditCustomerForm>({
    name: '',
    phone: '',
    isActive: true,
  });

  const { data, isLoading } = useCustomers({ limit: 100, sortBy: 'createdAt', sortOrder });
  const updateUserMutation = useUpdateCustomer();
  const loyaltyQuery = useCustomerLoyaltyAccount(detailTarget?.id ?? '');
  const appointmentsQuery = useAppointments(
    {
      customerId: detailTarget?.id,
      page: appointmentPage,
      limit: 10,
      sortBy: 'scheduledAt',
      sortOrder: 'desc',
    },
    Boolean(detailTarget && detailTab === 'appointments')
  );
  const paymentsQuery = useAppointments(
    {
      customerId: detailTarget?.id,
      hasPayment: true,
      page: paymentPage,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
    Boolean(detailTarget && detailTab === 'payments')
  );

  const customers = useMemo(() => data?.customers.map(mapUserToCustomer) ?? [], [data]);

  const openEditDialog = (customer: CustomerRow) => {
    setEditTarget(customer);
    setEditForm({
      name: customer.name,
      phone: customer.phone,
      isActive: customer.isActive,
    });
  };

  const openDetailDialog = (customer: CustomerRow) => {
    setDetailTab('overview');
    setAppointmentPage(1);
    setPaymentPage(1);
    setViewAppointment(null);
    setDetailTarget(customer);
  };

  const displayStats = useMemo(
    () => [
      {
        label: 'Tổng khách hàng',
        value: formatNumber(data?.total ?? customers.length),
        icon: Users,
      },
      {
        label: 'Đang hoạt động',
        value: formatNumber(customers.filter((customer) => customer.isActive).length),
        icon: UserCheck,
      },
      {
        label: 'Khách mới tháng này',
        value: formatNumber(
          customers.filter((customer) => isCreatedThisMonth(customer.createdAt)).length
        ),
        icon: UserPlus,
      },
      {
        label: 'Tạm khóa',
        value: formatNumber(customers.filter((customer) => !customer.isActive).length),
        icon: Lock,
      },
    ],
    [customers, data]
  );

  const filteredCustomers = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();

    return customers.filter((customer) => {
      const statusMatched =
        status === 'all' ||
        (status === 'active' && customer.isActive) ||
        (status === 'inactive' && !customer.isActive);
      const keywordMatched =
        !normalized ||
        [customer.name, customer.phone, customer.email, customer.role]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalized);

      return statusMatched && keywordMatched;
    });
  }, [customers, keyword, status]);

  const canSubmitEdit = Boolean(editForm.name.trim() && editForm.phone.trim());

  const handleSubmitEdit = async () => {
    if (!editTarget || !canSubmitEdit) return;

    await updateUserMutation.mutateAsync({
      userId: editTarget.id,
      payload: {
        displayName: editForm.name.trim(),
        phone: editForm.phone.trim(),
        isActive: editForm.isActive,
      },
    });
    setEditTarget(null);
  };

  return (
    <main className="min-h-[calc(100vh-81px)] bg-[#f8fafc] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1540px] space-y-5">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
              Quản lý khách hàng
            </h1>
            <p className="mt-2 text-base text-slate-500">
              Quản lý dữ liệu khách hàng. Điểm tích lũy được tra cứu ở mục Tích điểm.
            </p>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {displayStats.map((stat) => (
            <CompactStatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
            />
          ))}
        </section>

        <section className="rounded-lg border border-border/80 bg-white p-3">
          <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_220px_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="h-9 rounded-md border-0 bg-slate-100 pl-10 text-sm shadow-none focus-visible:ring-1"
                placeholder="Tìm theo tên hoặc số điện thoại..."
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
              />
            </div>
            <select
              aria-label="Trạng thái khách hàng"
              className="h-9 rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-slate-500"
              value={status}
              onChange={(event) => setStatus(event.target.value as CustomerStatusFilter)}
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              className="h-9 rounded-md border border-input bg-white px-3 text-sm"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value as 'asc' | 'desc')}
            >
              <option value="desc">Mới tạo trước</option>
              <option value="asc">Cũ tạo trước</option>
            </select>
          </div>
        </section>

        <section className="rounded-lg border border-border/80 bg-white p-4">
          <h2 className="text-xl font-semibold tracking-normal text-slate-950">
            Danh sách khách hàng
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[840px] table-fixed border-collapse text-left text-sm">
              <colgroup>
                <col className="w-[31%]" />
                <col className="w-[22%]" />
                <col className="w-[15%]" />
                <col className="w-[18%]" />
                <col className="w-[14%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-border text-slate-900">
                  <th className="px-3 py-3 font-semibold">Khách hàng</th>
                  <th className="px-3 py-3 font-semibold">Số điện thoại</th>
                  <th className="px-3 py-3 text-center font-semibold">Trạng thái</th>
                  <th className="px-3 py-3 text-center font-semibold">Ngày tham gia</th>
                  <th className="px-3 py-3 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-border/70 last:border-0">
                    <td className="px-3 py-3 align-middle">
                      <div className="min-w-0">
                        <div
                          className="truncate font-semibold text-slate-950"
                          title={customer.name}
                        >
                          {customer.name}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {roleLabels[customer.role ?? 'customer']}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 align-middle text-slate-900">
                      <div className="flex items-center gap-2">
                        <Phone className="size-4 shrink-0 text-slate-400" />
                        <span className="truncate">{customer.phone}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center align-middle">
                      <span
                        className={cn(
                          'inline-flex min-w-20 justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-semibold',
                          customer.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        )}
                      >
                        {customer.isActive ? 'Hoạt động' : 'Tạm khóa'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-center align-middle text-slate-900">
                      {customer.createdAt ? formatDate(customer.createdAt) : 'Chưa có dữ liệu'}
                    </td>
                    <td className="px-3 py-3 text-right align-middle">
                      <CustomerActionsMenu
                        customer={customer}
                        onViewDetail={openDetailDialog}
                        onEdit={openEditDialog}
                        onToggleStatus={setStatusTarget}
                      />
                    </td>
                  </tr>
                ))}
                {!filteredCustomers.length && (
                  <tr>
                    <td colSpan={5} className="px-2 py-10 text-center text-sm text-slate-500">
                      {isLoading ? 'Đang tải khách hàng...' : 'Không có khách hàng phù hợp.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <Dialog open={!!detailTarget} onOpenChange={(open) => !open && setDetailTarget(null)}>
        <DialogContent className="max-h-[92vh] overflow-hidden sm:max-w-[72rem]">
          <DialogHeader>
            <DialogTitle>Chi tiết khách hàng</DialogTitle>
            <DialogDescription>
              Hồ sơ, loyalty, lịch dịch vụ đã đặt và thông tin thanh toán của khách hàng.
            </DialogDescription>
          </DialogHeader>
          {detailTarget ? (
            <Tabs
              value={detailTab}
              onValueChange={(value) => setDetailTab(value as CustomerDetailTab)}
              className="min-h-0"
            >
              <TabsList className="grid h-auto w-full grid-cols-3">
                <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                <TabsTrigger value="appointments">Lịch đã đặt</TabsTrigger>
                <TabsTrigger value="payments">Thanh toán</TabsTrigger>
              </TabsList>
              <div className="max-h-[70vh] overflow-y-auto pr-1">
                <TabsContent value="overview">
                  <CustomerDetailDialogBody
                    customer={detailTarget}
                    loyalty={loyaltyQuery.data}
                    isLoading={loyaltyQuery.isLoading}
                    isError={loyaltyQuery.isError}
                    onRetry={() => loyaltyQuery.refetch()}
                  />
                </TabsContent>
                <TabsContent value="appointments">
                  <AppointmentHistoryTab
                    query={appointmentsQuery}
                    page={appointmentPage}
                    onPageChange={setAppointmentPage}
                    onView={setViewAppointment}
                  />
                </TabsContent>
                <TabsContent value="payments">
                  <PaymentHistoryTab
                    query={paymentsQuery}
                    page={paymentPage}
                    onPageChange={setPaymentPage}
                    onView={setViewAppointment}
                  />
                </TabsContent>
              </div>
            </Tabs>
          ) : null}
        </DialogContent>
      </Dialog>

      <AdminAppointmentDetailDialog
        appointment={viewAppointment}
        open={Boolean(viewAppointment)}
        onOpenChange={(open) => !open && setViewAppointment(null)}
      />

      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin khách hàng</DialogTitle>
            <DialogDescription>
              Cập nhật họ tên, số điện thoại và trạng thái tài khoản.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Họ tên
              <Input
                className="h-10 rounded-md"
                value={editForm.name}
                onChange={(event) =>
                  setEditForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Số điện thoại
              <Input
                className="h-10 rounded-md"
                value={editForm.phone}
                onChange={(event) =>
                  setEditForm((current) => ({ ...current, phone: event.target.value }))
                }
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Trạng thái
              <select
                className="h-10 rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-slate-500"
                value={editForm.isActive ? 'active' : 'inactive'}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    isActive: event.target.value === 'active',
                  }))
                }
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm khóa</option>
              </select>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              Hủy
            </Button>
            <Button
              className={primaryButtonClassName}
              disabled={updateUserMutation.isPending || !canSubmitEdit}
              onClick={handleSubmitEdit}
            >
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!statusTarget} onOpenChange={(open) => !open && setStatusTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {statusTarget?.isActive ? 'Tạm khóa khách hàng?' : 'Mở khóa khách hàng?'}
            </DialogTitle>
            <DialogDescription>
              Thao tác này sẽ cập nhật trạng thái hoạt động của tài khoản.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
            {statusTarget?.name}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusTarget(null)}>
              Hủy
            </Button>
            <Button
              className={
                statusTarget?.isActive
                  ? 'rounded-md bg-rose-600 text-white hover:bg-rose-700'
                  : primaryButtonClassName
              }
              disabled={updateUserMutation.isPending || !statusTarget}
              onClick={async () => {
                if (!statusTarget) return;
                await updateUserMutation.mutateAsync({
                  userId: statusTarget.id,
                  payload: { isActive: !statusTarget.isActive },
                });
                setStatusTarget(null);
              }}
            >
              {statusTarget?.isActive ? 'Tạm khóa' : 'Mở khóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

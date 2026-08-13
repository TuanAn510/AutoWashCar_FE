import {
  Ellipsis,
  Loader2,
  Lock,
  PencilLine,
  Phone,
  Search,
  ShieldCheck,
  Unlock,
  UserCheck,
  UserCog,
  UserPlus,
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
import {
  useCreateStaffAccount,
  useStaffOperationalMetrics,
  useStaffAccounts,
  useToggleStaffAccountStatus,
  useUpdateStaffAccount,
} from '@/features/admin/staff/hooks/useAdminStaff';
import { cn, formatDate } from '@/lib/utils';
import type { User } from '@/types/user';

type StaffStatusFilter = 'all' | 'active' | 'inactive';

interface StaffRow extends User {
  todayCount: number;
  weekCount: number;
  activeCount: number;
  completedCount: number;
}

interface StaffFormState {
  fullName: string;
  phone: string;
  password: string;
  isActive: boolean;
}

const emptyForm: StaffFormState = {
  fullName: '',
  phone: '',
  password: '',
  isActive: true,
};

const statusLabels: Record<StaffStatusFilter, string> = {
  all: 'Tất cả trạng thái',
  active: 'Đang hoạt động',
  inactive: 'Đã khóa',
};

const primaryButtonClassName =
  'rounded-md bg-slate-950 text-white hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-500';

function formatNumber(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value);
}

function getStaffName(staff: User) {
  return staff.displayName || staff.phone || 'Nhân viên';
}

function StaffStatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex min-w-24 justify-center rounded-md px-3 py-1 text-xs font-semibold',
        active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
      )}
    >
      {active ? 'Hoạt động' : 'Đã khóa'}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof UserCog;
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

function StaffActionsMenu({
  staff,
  onEdit,
  onToggleStatus,
}: {
  staff: User;
  onEdit: (staff: User) => void;
  onToggleStatus: (staff: User) => void;
}) {
  const active = staff.isActive !== false;

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
        <DropdownMenuItem onClick={() => onEdit(staff)}>
          <PencilLine className="size-4" />
          Chỉnh sửa tài khoản
        </DropdownMenuItem>
        <DropdownMenuItem
          className={active ? 'text-rose-600 focus:text-rose-700' : undefined}
          onClick={() => onToggleStatus(staff)}
        >
          {active ? <Lock className="size-4" /> : <Unlock className="size-4" />}
          {active ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function StaffManagementPage() {
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<StaffStatusFilter>('all');
  const [formTarget, setFormTarget] = useState<User | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<User | null>(null);
  const [form, setForm] = useState<StaffFormState>(emptyForm);

  const staffQuery = useStaffAccounts();
  const workloadQuery = useStaffOperationalMetrics();
  const createStaffMutation = useCreateStaffAccount();
  const updateStaffMutation = useUpdateStaffAccount();
  const toggleStatusMutation = useToggleStaffAccountStatus();

  const staffs = useMemo<StaffRow[]>(() => {
    const workloadMap = new Map((workloadQuery.data ?? []).map((staff) => [staff._id, staff]));

    return (staffQuery.data?.staffs ?? []).map((staff) => {
      const workload = workloadMap.get(staff._id);

      return {
        ...staff,
        todayCount: workload?.todayCount ?? 0,
        weekCount: workload?.weekCount ?? 0,
        activeCount: workload?.activeCount ?? 0,
        completedCount: workload?.completedCount ?? 0,
      };
    });
  }, [staffQuery.data?.staffs, workloadQuery.data]);

  const stats = useMemo(
    () => [
      {
        label: 'Tổng nhân viên',
        value: formatNumber(staffs.length),
        icon: UserCog,
      },
      {
        label: 'Đang hoạt động',
        value: formatNumber(staffs.filter((staff) => staff.isActive !== false).length),
        icon: UserCheck,
      },
      {
        label: 'Đã khóa',
        value: formatNumber(staffs.filter((staff) => staff.isActive === false).length),
        icon: Lock,
      },
      {
        label: 'Lịch đang xử lý',
        value: formatNumber(staffs.reduce((total, staff) => total + staff.activeCount, 0)),
        icon: ShieldCheck,
      },
    ],
    [staffs]
  );

  const filteredStaffs = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();

    return staffs.filter((staff) => {
      const active = staff.isActive !== false;
      const statusMatched =
        status === 'all' || (status === 'active' && active) || (status === 'inactive' && !active);
      const keywordMatched =
        !normalized ||
        [getStaffName(staff), staff.phone, staff.role]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalized);

      return statusMatched && keywordMatched;
    });
  }, [keyword, staffs, status]);

  const isEditing = Boolean(formTarget);
  const canSubmit = Boolean(
    form.fullName.trim() && form.phone.trim() && (isEditing || form.password.trim().length >= 8)
  );
  const isSaving = createStaffMutation.isPending || updateStaffMutation.isPending;

  const openCreateDialog = () => {
    setForm(emptyForm);
    setFormTarget(null);
    setIsCreateOpen(true);
  };

  const openEditDialog = (staff: User) => {
    setForm({
      fullName: getStaffName(staff),
      phone: staff.phone,
      password: '',
      isActive: staff.isActive !== false,
    });
    setFormTarget(staff);
    setIsCreateOpen(false);
  };

  const closeFormDialog = () => {
    setFormTarget(null);
    setIsCreateOpen(false);
    setForm(emptyForm);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    if (formTarget) {
      await updateStaffMutation.mutateAsync({
        userId: formTarget._id,
        payload: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          isActive: form.isActive,
          ...(form.password.trim() ? { password: form.password.trim() } : {}),
        },
      });
    } else {
      await createStaffMutation.mutateAsync({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        password: form.password.trim(),
      });
    }

    closeFormDialog();
  };

  return (
    <main className="min-h-[calc(100vh-81px)] bg-[#f8fafc] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1540px] space-y-5">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
              Quản lý staff
            </h1>
            <p className="mt-2 max-w-3xl text-base text-slate-500">
              Cấp tài khoản, cập nhật thông tin và khóa quyền truy cập của nhân viên khi cần.
            </p>
          </div>
          <Button className={primaryButtonClassName} onClick={openCreateDialog}>
            <UserPlus className="size-4" />
            Thêm nhân viên
          </Button>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} />
          ))}
        </section>

        <section className="rounded-lg border border-border/80 bg-white p-3">
          <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_220px]">
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
              aria-label="Trạng thái nhân viên"
              className="h-9 rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-slate-500"
              value={status}
              onChange={(event) => setStatus(event.target.value as StaffStatusFilter)}
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="rounded-lg border border-border/80 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-normal text-slate-950">
              Danh sách nhân viên
            </h2>
            {staffQuery.isFetching || workloadQuery.isFetching ? (
              <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="size-4 animate-spin" />
                Đang đồng bộ
              </span>
            ) : null}
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[980px] table-fixed border-collapse text-left text-sm">
              <colgroup>
                <col className="w-[28%]" />
                <col className="w-[19%]" />
                <col className="w-[13%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[10%]" />
                <col className="w-[6%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-border text-slate-900">
                  <th className="px-3 py-3 font-semibold">Nhân viên</th>
                  <th className="px-3 py-3 font-semibold">Số điện thoại</th>
                  <th className="px-3 py-3 text-center font-semibold">Trạng thái</th>
                  <th className="px-3 py-3 text-center font-semibold">Hôm nay</th>
                  <th className="px-3 py-3 text-center font-semibold">Đang xử lý</th>
                  <th className="px-3 py-3 text-center font-semibold">Tuần này</th>
                  <th className="px-3 py-3 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaffs.map((staff) => (
                  <tr key={staff._id} className="border-b border-border/70 last:border-0">
                    <td className="px-3 py-3 align-middle">
                      <div className="min-w-0">
                        <div
                          className="truncate font-semibold text-slate-950"
                          title={getStaffName(staff)}
                        >
                          {getStaffName(staff)}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">Nhân viên vận hành</div>
                      </div>
                    </td>
                    <td className="px-3 py-3 align-middle text-slate-900">
                      <div className="flex items-center gap-2">
                        <Phone className="size-4 shrink-0 text-slate-400" />
                        <span className="truncate">{staff.phone}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center align-middle">
                      <StaffStatusBadge active={staff.isActive !== false} />
                    </td>
                    <td className="px-3 py-3 text-center align-middle font-semibold text-slate-900">
                      {formatNumber(staff.todayCount)}
                    </td>
                    <td className="px-3 py-3 text-center align-middle font-semibold text-slate-900">
                      {formatNumber(staff.activeCount)}
                    </td>
                    <td className="px-3 py-3 text-center align-middle">
                      <div className="font-semibold text-slate-900">
                        {formatNumber(staff.weekCount)}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Tạo {staff.createdAt ? formatDate(staff.createdAt) : 'chưa rõ'}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right align-middle">
                      <StaffActionsMenu
                        staff={staff}
                        onEdit={openEditDialog}
                        onToggleStatus={setStatusTarget}
                      />
                    </td>
                  </tr>
                ))}
                {!filteredStaffs.length && (
                  <tr>
                    <td colSpan={7} className="px-2 py-10 text-center text-sm text-slate-500">
                      {staffQuery.isLoading
                        ? 'Đang tải danh sách nhân viên...'
                        : 'Không có nhân viên phù hợp.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <Dialog
        open={isCreateOpen || Boolean(formTarget)}
        onOpenChange={(open) => !open && closeFormDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên'}</DialogTitle>
            <DialogDescription>
              Tài khoản được tạo với quyền staff và chỉ truy cập các màn hình vận hành.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Họ tên
              <Input
                className="h-10 rounded-md"
                value={form.fullName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, fullName: event.target.value }))
                }
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Số điện thoại
              <Input
                className="h-10 rounded-md"
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({ ...current, phone: event.target.value }))
                }
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              {isEditing ? 'Mật khẩu mới' : 'Mật khẩu'}
              <Input
                className="h-10 rounded-md"
                type="password"
                placeholder={isEditing ? 'Bỏ trống nếu không đổi mật khẩu' : 'Tối thiểu 8 ký tự'}
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
              />
            </label>
            {isEditing ? (
              <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                Trạng thái
                <select
                  className="h-10 rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-slate-500"
                  value={form.isActive ? 'active' : 'inactive'}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      isActive: event.target.value === 'active',
                    }))
                  }
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Đã khóa</option>
                </select>
              </label>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeFormDialog}>
              Hủy
            </Button>
            <Button
              className={primaryButtonClassName}
              disabled={!canSubmit || isSaving}
              onClick={handleSubmit}
            >
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
              {isEditing ? 'Cập nhật' : 'Tạo tài khoản'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(statusTarget)} onOpenChange={(open) => !open && setStatusTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {statusTarget?.isActive !== false
                ? 'Khóa tài khoản nhân viên?'
                : 'Mở khóa tài khoản nhân viên?'}
            </DialogTitle>
            <DialogDescription>
              Khi bị khóa, nhân viên không thể đăng nhập để nhận việc hoặc cập nhật tiến độ rửa xe.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
            {statusTarget ? getStaffName(statusTarget) : ''}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusTarget(null)}>
              Hủy
            </Button>
            <Button
              className={
                statusTarget?.isActive !== false
                  ? 'rounded-md bg-rose-600 text-white hover:bg-rose-700'
                  : primaryButtonClassName
              }
              disabled={toggleStatusMutation.isPending || !statusTarget}
              onClick={async () => {
                if (!statusTarget) return;
                await toggleStatusMutation.mutateAsync({
                  userId: statusTarget._id,
                  isActive: statusTarget.isActive === false,
                });
                setStatusTarget(null);
              }}
            >
              {toggleStatusMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {statusTarget?.isActive !== false ? 'Khóa tài khoản' : 'Mở khóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

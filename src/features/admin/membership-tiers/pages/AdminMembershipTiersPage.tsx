import {
  CheckCircle2,
  Edit,
  Ellipsis,
  Eye,
  Loader2,
  Plus,
  Power,
  PowerOff,
  RotateCcw,
  Search,
  Trophy,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';

import { AdminStatusSwitch } from '@/components/admin/AdminStatusSwitch';
import { Badge } from '@/components/ui/badge';
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
import { Textarea } from '@/components/ui/textarea';
import { loyaltyApi } from '@/features/shared/loyalty/api/loyalty-api';
import {
  loyaltyKeys,
  useCustomersWithLoyalty,
  useMembershipTiers,
  useTierMutations,
} from '@/features/shared/loyalty/hooks/use-loyalty';
import type {
  LoyaltyCustomer,
  MembershipTier,
  MembershipTierPayload,
} from '@/features/shared/loyalty/types/loyalty.types';
import { formatPoints } from '@/features/shared/loyalty/utils/loyalty-formatters';
import { cn, formatDate } from '@/lib/utils';

type TierFormErrors = Partial<Record<'name' | 'minTotalEarnedPoints' | 'discountPercent', string>>;

const TIER_CUSTOMER_LIMIT = 8;

const primaryButtonClassName =
  'rounded-md bg-slate-950 text-white hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-500';
const secondaryButtonClassName =
  'rounded-md border-slate-300 bg-white text-slate-900 hover:bg-slate-100';
const fieldFocusClassName =
  'focus:border-slate-700 focus:ring-2 focus:ring-slate-700/10 focus-visible:border-slate-700 focus-visible:ring-slate-700/10';
const switchClassName =
  'bg-slate-300 focus-visible:border-slate-700 focus-visible:ring-slate-700/20 data-[state=checked]:bg-slate-950';

function getCustomerName(customer: LoyaltyCustomer) {
  return customer.displayName || customer.phone || 'Khách hàng';
}

function LoadingState() {
  return (
    <section className="rounded-lg border border-border/80 bg-white px-6 py-16 text-center">
      <Loader2 className="mx-auto size-8 animate-spin text-slate-400" />
      <p className="mt-4 text-sm text-slate-500">Đang tải danh sách hạng...</p>
    </section>
  );
}

function StatTile({
  label,
  value,
  icon: Icon,
  isLoading = false,
}: {
  label: string;
  value: string;
  icon: typeof Users;
  isLoading?: boolean;
}) {
  return (
    <div className="flex h-[104px] items-center justify-between gap-3 rounded-lg border border-border/80 bg-white px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-bold tracking-normal text-slate-950">
          {isLoading ? (
            <span className="inline-block h-7 w-16 animate-pulse rounded-md bg-slate-100 align-middle" />
          ) : (
            value
          )}
        </p>
      </div>
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-700">
        <Icon className="size-4" />
      </span>
    </div>
  );
}

function TierCustomerStatsCards({
  tiers,
  customerCounts,
  isLoading,
}: {
  tiers: MembershipTier[];
  customerCounts: Map<string, number>;
  isLoading: boolean;
}) {
  const activeTiers = tiers.filter((tier) => tier.isActive !== false).length;
  const inactiveTiers = tiers.length - activeTiers;
  const customersWithTier = Array.from(customerCounts.values()).reduce(
    (total, count) => total + count,
    0
  );
  const cards = [
    {
      label: 'Tổng hạng thành viên',
      value: tiers.length.toLocaleString('vi-VN'),
      icon: Trophy,
    },
    {
      label: 'Đang hoạt động',
      value: activeTiers.toLocaleString('vi-VN'),
      icon: CheckCircle2,
    },
    {
      label: 'Tạm ngưng',
      value: inactiveTiers.toLocaleString('vi-VN'),
      icon: PowerOff,
    },
    {
      label: 'Khách hàng có hạng',
      value: customersWithTier.toLocaleString('vi-VN'),
      icon: Users,
      isLoading,
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <StatTile
          key={card.label}
          label={card.label}
          value={card.value}
          icon={card.icon}
          isLoading={card.isLoading}
        />
      ))}
    </section>
  );
}

function TierDialog({
  open,
  tier,
  tiers,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  tier: MembershipTier | null;
  tiers: MembershipTier[];
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: MembershipTierPayload) => Promise<unknown>;
}) {
  const [name, setName] = useState(tier?.name ?? '');
  const [minTotalEarnedPoints, setMinTotalEarnedPoints] = useState(
    String(tier?.minTotalEarnedPoints ?? 0)
  );
  const [discountPercent, setDiscountPercent] = useState(String(tier?.discountPercent ?? 0));
  const [description, setDescription] = useState(tier?.description ?? '');
  const [isActive, setIsActive] = useState(tier?.isActive !== false);
  const [errors, setErrors] = useState<TierFormErrors>({});

  const validate = () => {
    const nextErrors: TierFormErrors = {};
    const minPointValue = Number(minTotalEarnedPoints);
    const discountValue = Number(discountPercent);

    if (!name.trim()) {
      nextErrors.name = 'Tên hạng không được để trống';
    }

    if (!Number.isFinite(minPointValue) || minPointValue < 0) {
      nextErrors.minTotalEarnedPoints = 'Ngưỡng tổng điểm không được âm';
    }

    if (!Number.isFinite(discountValue) || discountValue < 0 || discountValue > 100) {
      nextErrors.discountPercent = 'Ưu đãi phải từ 0% đến 100%';
    }

    const isDuplicateThreshold = tiers.some(
      (item) => item._id !== tier?._id && item.minTotalEarnedPoints === minPointValue
    );

    if (isDuplicateThreshold) {
      nextErrors.minTotalEarnedPoints = 'Ngưỡng điểm không được trùng với hạng khác';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    await onSubmit({
      name: name.trim(),
      minTotalEarnedPoints: Number(minTotalEarnedPoints),
      discountPercent: Number(discountPercent),
      description: description.trim() || undefined,
      isActive,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{tier ? 'Sửa hạng thành viên' : 'Thêm hạng thành viên'}</DialogTitle>
          <DialogDescription>
            Hạng được tính theo điểm tích trong quý và reset vào đầu quý kế tiếp.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Tên hạng
            <Input
              className={cn('h-10 rounded-md bg-white px-3', fieldFocusClassName)}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nhập tên hạng, ví dụ: Diamond"
            />
            {errors.name ? <span className="text-xs text-rose-600">{errors.name}</span> : null}
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Ngưỡng điểm trong quý
            <div
              className={cn(
                'flex rounded-md border border-input bg-white focus-within:border-slate-700 focus-within:ring-2 focus-within:ring-slate-700/10'
              )}
            >
              <Input
                type="number"
                min={0}
                className="border-0 shadow-none focus-visible:ring-0"
                value={minTotalEarnedPoints}
                onChange={(event) => setMinTotalEarnedPoints(event.target.value)}
                placeholder="Nhập số điểm tối thiểu"
              />
              <span className="flex items-center px-3 text-sm text-slate-500">điểm</span>
            </div>
            {errors.minTotalEarnedPoints ? (
              <span className="text-xs text-rose-600">{errors.minTotalEarnedPoints}</span>
            ) : null}
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Ưu đãi
            <div className="flex rounded-md border border-input bg-white focus-within:border-slate-700 focus-within:ring-2 focus-within:ring-slate-700/10">
              <Input
                type="number"
                min={0}
                max={100}
                className="border-0 shadow-none focus-visible:ring-0"
                value={discountPercent}
                onChange={(event) => setDiscountPercent(event.target.value)}
                placeholder="Nhập phần trăm ưu đãi"
              />
              <span className="flex items-center px-3 text-sm text-slate-500">%</span>
            </div>
            {errors.discountPercent ? (
              <span className="text-xs text-rose-600">{errors.discountPercent}</span>
            ) : null}
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Mô tả
            <Textarea
              className={cn('min-h-24 rounded-md bg-white px-3 py-2', fieldFocusClassName)}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Nhập mô tả hạng thành viên"
              rows={2}
            />
          </label>

          <AdminStatusSwitch
            checked={isActive}
            onCheckedChange={setIsActive}
            switchClassName={switchClassName}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            className={secondaryButtonClassName}
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button className={primaryButtonClassName} disabled={isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            {tier ? 'Cập nhật hạng' : 'Lưu hạng'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TierActionsMenu({
  tier,
  onEdit,
  onToggleStatus,
  onViewCustomers,
}: {
  tier: MembershipTier;
  onEdit: (tier: MembershipTier) => void;
  onToggleStatus: (tier: MembershipTier) => void;
  onViewCustomers: (tier: MembershipTier) => void;
}) {
  const isActive = tier.isActive !== false;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="rounded-xl">
          <Ellipsis className="size-4" />
          <span className="sr-only">Mở menu thao tác</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuItem onClick={() => onEdit(tier)}>
          <Edit className="size-4" />
          Chỉnh sửa
        </DropdownMenuItem>
        <DropdownMenuItem
          variant={isActive ? 'destructive' : 'default'}
          onClick={() => onToggleStatus(tier)}
        >
          {isActive ? <PowerOff className="size-4" /> : <Power className="size-4" />}
          {isActive ? 'Tạm ngưng' : 'Kích hoạt lại'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onViewCustomers(tier)}>
          <Eye className="size-4" />
          Xem khách hàng thuộc hạng
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TierCustomersDialog({
  tier,
  onOpenChange,
}: {
  tier: MembershipTier;
  onOpenChange: (open: boolean) => void;
}) {
  const [keyword, setKeyword] = useState('');
  const [submittedKeyword, setSubmittedKeyword] = useState('');
  const [page, setPage] = useState(1);
  const customersQuery = useCustomersWithLoyalty({
    membershipTierId: tier._id,
    search: submittedKeyword || undefined,
    page,
    limit: TIER_CUSTOMER_LIMIT,
  });
  const customers = customersQuery.data?.customers ?? [];
  const pagination = customersQuery.data?.pagination;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);

  const handleSearch = () => {
    setSubmittedKeyword(keyword.trim());
    setPage(1);
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="grid max-h-[85vh] grid-rows-[auto_auto_minmax(0,1fr)_auto] overflow-hidden sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>Khách hàng thuộc hạng {tier.name}</DialogTitle>
          <DialogDescription>
            Danh sách khách hàng hiện đang được xếp vào hạng thành viên này.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSearch();
              }}
              className={cn('h-10 rounded-md bg-white pl-9', fieldFocusClassName)}
              placeholder="Tìm theo tên hoặc số điện thoại..."
            />
          </div>
          <Button
            className={primaryButtonClassName}
            onClick={handleSearch}
            disabled={customersQuery.isFetching}
          >
            <Search className="size-4" />
            Tìm kiếm
          </Button>
        </div>

        <div className="min-h-0 max-h-[calc(85vh-220px)] overflow-auto overscroll-contain rounded-lg border border-border/80">
          {customersQuery.isLoading ? (
            <div className="px-6 py-14 text-center">
              <Loader2 className="mx-auto size-7 animate-spin text-slate-400" />
              <p className="mt-3 text-sm text-slate-500">Đang tải danh sách khách hàng...</p>
            </div>
          ) : customersQuery.isError ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-rose-600">Không thể tải danh sách khách hàng.</p>
              <Button
                variant="outline"
                size="sm"
                className={cn('mt-4', secondaryButtonClassName)}
                onClick={() => customersQuery.refetch()}
              >
                <RotateCcw className="size-4" />
                Thử lại
              </Button>
            </div>
          ) : customers.length === 0 ? (
            <div className="px-6 py-14 text-center text-sm text-slate-500">
              {submittedKeyword
                ? 'Không tìm thấy khách hàng phù hợp.'
                : 'Chưa có khách hàng nào thuộc hạng này.'}
            </div>
          ) : (
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="sticky top-0 z-10 bg-white text-slate-900 shadow-[0_1px_0_0_rgba(226,232,240,1)]">
                <tr className="border-b">
                  <th className="px-4 py-3 font-semibold">Khách hàng</th>
                  <th className="px-4 py-3 font-semibold">Điểm khả dụng</th>
                  <th className="px-4 py-3 font-semibold">Điểm xét hạng quý</th>
                  <th className="px-4 py-3 font-semibold">Ngày tham gia</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(({ customer, loyaltyAccount }) => (
                  <tr key={customer._id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">
                          {getCustomerName(customer)}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {customer.phone || customer._id}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">
                      {formatPoints(loyaltyAccount?.currentPoints ?? 0)}
                    </td>
                    <td className="px-4 py-3">
                      {formatPoints(loyaltyAccount?.currentQuarterEarnedPoints ?? 0)}
                    </td>
                    <td className="px-4 py-3">
                      {customer.createdAt ? formatDate(customer.createdAt) : 'Chưa có'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <DialogFooter className="items-center sm:justify-between">
          <span className="text-sm text-slate-500">
            Tổng {pagination?.total ?? customersQuery.data?.total ?? 0} khách hàng
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className={secondaryButtonClassName}
              disabled={page <= 1 || customersQuery.isFetching}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={secondaryButtonClassName}
              disabled={page >= totalPages || customersQuery.isFetching}
              onClick={() => setPage((current) => current + 1)}
            >
              Sau
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminMembershipTiersPage() {
  const tiersQuery = useMembershipTiers();
  const tierMutations = useTierMutations();
  const [editingTier, setEditingTier] = useState<MembershipTier | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [statusTier, setStatusTier] = useState<MembershipTier | null>(null);
  const [customerTier, setCustomerTier] = useState<MembershipTier | null>(null);

  const tiers = useMemo(
    () =>
      [...(tiersQuery.data ?? [])].sort((a, b) => a.minTotalEarnedPoints - b.minTotalEarnedPoints),
    [tiersQuery.data]
  );
  const tierCustomerStatsQueries = useQueries({
    queries: tiers.map((tier) => ({
      queryKey: loyaltyKeys.customers({ membershipTierId: tier._id, page: 1, limit: 1 }),
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        loyaltyApi.getCustomers({ membershipTierId: tier._id, page: 1, limit: 1 }, signal),
      enabled: tiers.length > 0,
    })),
  });
  const tierCustomerCounts = useMemo(
    () =>
      new Map(
        tiers.map((tier, index) => [
          tier._id,
          tierCustomerStatsQueries[index]?.data?.total ??
            tierCustomerStatsQueries[index]?.data?.pagination?.total ??
            0,
        ])
      ),
    [tierCustomerStatsQueries, tiers]
  );
  const isTierStatsLoading = tierCustomerStatsQueries.some(
    (query) => query.isLoading || query.isFetching
  );

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden bg-[#f8fafc] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1540px] min-w-0 flex-col gap-7">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
              Quản lý hạng thành viên
            </h1>
            <p className="mt-2 max-w-2xl text-base text-slate-500">
              Thiết lập hạng theo điểm tích trong từng quý. Đổi thưởng không làm giảm hạng, nhưng
              điểm xét hạng sẽ reset vào đầu quý kế tiếp.
            </p>
          </div>
          <Button
            className="h-10 shrink-0 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
            onClick={() => {
              setEditingTier(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="size-4" />
            Thêm hạng
          </Button>
        </section>

        {tiersQuery.isLoading ? (
          <LoadingState />
        ) : tiersQuery.isError ? (
          <section className="rounded-lg border border-rose-200 bg-rose-50 px-6 py-16 text-center">
            <h2 className="text-xl font-semibold text-rose-700">Không thể tải danh sách hạng</h2>
            <Button
              className={cn('mt-5', primaryButtonClassName)}
              onClick={() => tiersQuery.refetch()}
            >
              <RotateCcw className="size-4" />
              Thử lại
            </Button>
          </section>
        ) : tiers.length === 0 ? (
          <section className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-12 text-center text-sm text-slate-500">
            Chưa có hạng thành viên nào. Hãy tạo hạng đầu tiên để bắt đầu chương trình tích điểm.
          </section>
        ) : (
          <>
            <TierCustomerStatsCards
              tiers={tiers}
              customerCounts={tierCustomerCounts}
              isLoading={isTierStatsLoading}
            />
            <div className="rounded-lg border border-border/80 bg-white p-4">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] table-fixed text-left text-sm">
                  <thead>
                    <tr className="border-b text-slate-900">
                      <th className="w-[240px] px-2 py-3 font-semibold">Tên hạng</th>
                      <th className="w-[180px] px-2 py-3 font-semibold">Ngưỡng tổng điểm</th>
                      <th className="w-[100px] px-2 py-3 font-semibold">Ưu đãi</th>
                      <th className="w-[150px] px-2 py-3 font-semibold">Trạng thái</th>
                      <th className="w-[90px] px-2 py-3 text-right font-semibold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tiers.map((tier) => {
                      const isActive = tier.isActive !== false;

                      return (
                        <tr key={tier._id} className="border-b last:border-0">
                          <td className="px-2 py-3">
                            <p className="truncate font-semibold text-slate-950" title={tier.name}>
                              {tier.name}
                            </p>
                            {tier.description ? (
                              <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                                {tier.description}
                              </p>
                            ) : null}
                          </td>
                          <td className="px-2 py-3">{formatPoints(tier.minTotalEarnedPoints)}</td>
                          <td className="px-2 py-3">{tier.discountPercent ?? 0}%</td>
                          <td className="px-2 py-3">
                            <Badge
                              className={cn(
                                isActive
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-slate-100 text-slate-600'
                              )}
                            >
                              {isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                            </Badge>
                          </td>
                          <td className="px-2 py-3 text-right">
                            <TierActionsMenu
                              tier={tier}
                              onEdit={(selected) => {
                                setEditingTier(selected);
                                setDialogOpen(true);
                              }}
                              onToggleStatus={setStatusTier}
                              onViewCustomers={setCustomerTier}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {isDialogOpen ? (
        <TierDialog
          key={editingTier?._id ?? 'create'}
          open
          tier={editingTier}
          tiers={tiers}
          isSubmitting={tierMutations.create.isPending || tierMutations.update.isPending}
          onOpenChange={setDialogOpen}
          onSubmit={(payload) =>
            editingTier
              ? tierMutations.update.mutateAsync({ id: editingTier._id, payload })
              : tierMutations.create.mutateAsync(payload)
          }
        />
      ) : null}

      {customerTier ? (
        <TierCustomersDialog
          key={customerTier._id}
          tier={customerTier}
          onOpenChange={(open) => !open && setCustomerTier(null)}
        />
      ) : null}

      <Dialog open={!!statusTier} onOpenChange={(open) => !open && setStatusTier(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {statusTier?.isActive === false ? 'Kích hoạt lại hạng?' : 'Tạm ngưng hạng?'}
            </DialogTitle>
            <DialogDescription>
              Nếu hạng đang có khách hàng sử dụng, hệ thống sẽ thông báo lý do không thể tạm ngưng.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
            {statusTier?.name}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className={secondaryButtonClassName}
              onClick={() => setStatusTier(null)}
            >
              Hủy
            </Button>
            <Button
              variant={statusTier?.isActive === false ? 'default' : 'destructive'}
              className={statusTier?.isActive === false ? primaryButtonClassName : undefined}
              disabled={tierMutations.update.isPending || !statusTier}
              onClick={async () => {
                if (!statusTier) return;
                await tierMutations.update.mutateAsync({
                  id: statusTier._id,
                  payload: {
                    name: statusTier.name,
                    minTotalEarnedPoints: statusTier.minTotalEarnedPoints,
                    discountPercent: statusTier.discountPercent ?? 0,
                    description: statusTier.description ?? undefined,
                    isActive: statusTier.isActive === false,
                  },
                });
                setStatusTier(null);
              }}
            >
              {tierMutations.update.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : statusTier?.isActive === false ? (
                <Power className="size-4" />
              ) : (
                <PowerOff className="size-4" />
              )}
              {statusTier?.isActive === false ? 'Kích hoạt lại' : 'Tạm ngưng'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

import {
  CalendarDays,
  CheckCircle2,
  Coins,
  Ellipsis,
  Eye,
  Gift,
  Loader2,
  Package,
  Pencil,
  Plus,
  Power,
  RotateCcw,
  Search,
  Sparkles,
  TicketPercent,
  Trash2,
} from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';

import { AdminStatusSwitch } from '@/components/admin/AdminStatusSwitch';
import { StatCard } from '@/components/dashboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
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
import { useRewardMutations, useRewards } from '@/features/shared/loyalty/hooks/use-loyalty';
import type { Reward, RewardPayload } from '@/features/shared/loyalty/types/loyalty.types';
import {
  formatPoints,
  formatRewardDiscount,
  getRewardRemainingQuantity,
} from '@/features/shared/loyalty/utils/loyalty-formatters';
import { cn, formatDate } from '@/lib/utils';

type RewardStatusFilter = 'all' | 'active' | 'inactive' | 'expired';
type ConfirmAction = 'toggle' | 'delete';
type RewardFormState = ReturnType<typeof getInitialFormState>;

const primaryButtonClassName =
  'rounded-md bg-slate-950 text-white hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-500';
const secondaryButtonClassName =
  'rounded-md border-slate-300 bg-white text-slate-900 hover:bg-slate-100';
const fieldFocusClassName =
  'focus:border-slate-700 focus:ring-2 focus:ring-slate-700/10 focus-visible:border-slate-700 focus-visible:ring-slate-700/10';
const compactStatCardClassName =
  'min-h-[96px] p-4 [&_.card-icon]:size-10 [&_.card-value]:text-[26px] [&_.card-value]:leading-none [&_p:first-child]:text-sm';
const rewardSwitchClassName =
  'bg-slate-300 focus-visible:border-slate-700 focus-visible:ring-slate-700/20 data-[state=checked]:bg-slate-950';

const statusFilterLabels: Record<RewardStatusFilter, string> = {
  all: 'Tất cả trạng thái',
  active: 'Hoạt động',
  inactive: 'Tạm ngưng',
  expired: 'Hết hạn',
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value);
}

function isRewardExpired(reward: Reward) {
  if (!reward.expiredAt) return false;
  const expiredAt = new Date(reward.expiredAt);
  return Number.isFinite(expiredAt.getTime()) && expiredAt < new Date();
}

function getRewardStatus(reward: Reward) {
  if (isRewardExpired(reward)) {
    return { label: 'Hết hạn', className: 'bg-amber-50 text-amber-700' };
  }
  if (reward.isActive === false) {
    return { label: 'Tạm ngưng', className: 'bg-slate-100 text-slate-600' };
  }
  return { label: 'Hoạt động', className: 'bg-emerald-50 text-emerald-700' };
}

function getInitialFormState(reward: Reward | null) {
  return {
    name: reward?.name ?? '',
    description: reward?.description ?? '',
    requiredPoints: String(reward?.requiredPoints ?? ''),
    discountType: 'fixed_amount' as const,
    discountValue: String(reward?.discountValue ?? ''),
    minOrderAmount: String(reward?.minOrderAmount ?? 0),
    maxDiscountAmount: reward?.maxDiscountAmount == null ? '' : String(reward.maxDiscountAmount),
    quantity:
      reward?.quantity === null || typeof reward?.quantity === 'undefined'
        ? ''
        : String(reward.quantity),
    expiredAt: reward?.expiredAt ? formatDateForInput(reward.expiredAt) : '',
    isActive: reward?.isActive !== false,
  };
}

function formatDateForInput(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function parseDateInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return undefined;

  const [, year, month, day] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999);

  if (
    !Number.isFinite(parsed.getTime()) ||
    parsed.getFullYear() !== Number(year) ||
    parsed.getMonth() + 1 !== Number(month) ||
    parsed.getDate() !== Number(day)
  ) {
    return undefined;
  }

  return parsed.toISOString();
}

function validateRewardForm(form: RewardFormState) {
  const errors: Partial<Record<keyof RewardFormState, string>> = {};
  const pointsValue = Number(form.requiredPoints);
  const discountNumber = Number(form.discountValue);
  const quantityValue = form.quantity ? Number(form.quantity) : null;
  const parsedExpiredAt = parseDateInput(form.expiredAt);

  if (!form.name.trim()) errors.name = 'Tên phần thưởng là bắt buộc.';
  if (!Number.isInteger(pointsValue) || pointsValue <= 0) {
    errors.requiredPoints = 'Điểm cần đổi phải là số nguyên lớn hơn 0.';
  }

  if (form.description.length > 1000) errors.description = 'Mô tả tối đa 1.000 ký tự.';

  if (!form.discountValue.trim() || !Number.isFinite(discountNumber)) {
    errors.discountValue = 'Giá trị quyền lợi là bắt buộc.';
  } else if (discountNumber <= 0) {
    errors.discountValue = 'Số tiền giảm phải lớn hơn 0.';
  }

  if (form.quantity && (!Number.isInteger(quantityValue) || Number(quantityValue) < 0)) {
    errors.quantity = 'Số lượng phải là số nguyên lớn hơn hoặc bằng 0.';
  }

  if (typeof parsedExpiredAt === 'undefined') {
    errors.expiredAt = 'Hạn dùng không hợp lệ.';
  } else if (parsedExpiredAt) {
    const expiredAtDate = new Date(parsedExpiredAt);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    if (expiredAtDate < todayStart) {
      errors.expiredAt = 'Hạn đổi thưởng phải từ hôm nay trở đi.';
    }
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    values: {
      pointsValue,
      discountNumber,
      quantityValue,
      expiredAt: parsedExpiredAt,
    },
  };
}

function buildRewardPayload(reward: Reward, isActive: boolean): RewardPayload {
  return {
    name: reward.name,
    description: reward.description || undefined,
    requiredPoints: reward.requiredPoints,
    discountType: 'fixed_amount',
    discountValue: reward.discountValue,
    minOrderAmount: reward.minOrderAmount ?? 0,
    maxDiscountAmount: reward.maxDiscountAmount ?? null,
    quantity: typeof reward.quantity === 'undefined' ? null : reward.quantity,
    expiredAt: reward.expiredAt ?? null,
    isActive,
  };
}

function RewardDialog({
  reward,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: {
  reward: Reward | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: RewardPayload) => Promise<unknown>;
}) {
  const [form, setForm] = useState(() => getInitialFormState(reward));
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { errors, isValid, values } = validateRewardForm(form);
  const isEditing = Boolean(reward);
  const discountValueLabel = 'Số tiền giảm *';
  const discountValueUnit = 'đ';

  const setField = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const visibleErrors = hasSubmitted ? errors : {};
  const previewDiscount = form.discountValue
    ? `${formatNumber(Number(form.discountValue) || 0)} đ`
    : 'Chưa thiết lập';

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="grid max-h-[85vh] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden p-0 sm:max-w-[920px]">
        <DialogHeader className="border-b bg-slate-50/80 px-6 py-5 text-left">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white shadow-sm">
              <Gift className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                {isEditing ? 'Chỉnh sửa phần thưởng' : 'Thêm phần thưởng mới'}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Thiết lập điều kiện đổi điểm và quyền lợi khách hàng nhận được.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain px-6 py-5">
          <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="grid gap-6">
              <section className="grid gap-4">
                <SectionTitle icon={Sparkles} title="Thông tin phần thưởng" />
                <FormField label="Tên phần thưởng" required error={visibleErrors.name}>
                  <Input
                    className={cn('h-10 rounded-md bg-white px-3', fieldFocusClassName)}
                    value={form.name}
                    onChange={(event) => setField('name', event.target.value)}
                    placeholder="Ví dụ: Giảm 20% dịch vụ rửa xe"
                  />
                </FormField>
                <FormField
                  label="Mô tả"
                  hint={`${form.description.length}/1.000 ký tự`}
                  error={visibleErrors.description}
                >
                  <Textarea
                    className={cn('min-h-24 rounded-md bg-white px-3 py-2', fieldFocusClassName)}
                    value={form.description}
                    onChange={(event) => setField('description', event.target.value)}
                    placeholder="Mô tả ngắn quyền lợi và điều kiện áp dụng"
                    rows={2}
                  />
                </FormField>
              </section>

              <section className="grid gap-4 border-t pt-5">
                <SectionTitle icon={TicketPercent} title="Điều kiện và quyền lợi" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Điểm cần đổi" required error={visibleErrors.requiredPoints}>
                    <div className="relative">
                      <Input
                        type="number"
                        min={1}
                        step={1}
                        value={form.requiredPoints}
                        onChange={(event) => setField('requiredPoints', event.target.value)}
                        placeholder="Ví dụ: 500"
                        className={cn('h-10 rounded-md bg-white px-3 pr-14', fieldFocusClassName)}
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">
                        điểm
                      </span>
                    </div>
                  </FormField>
                  <FormField
                    label={discountValueLabel.replace(' *', '')}
                    required
                    error={visibleErrors.discountValue}
                  >
                    <div className="relative">
                      <Input
                        type="number"
                        min={1}
                        value={form.discountValue}
                        onChange={(event) => setField('discountValue', event.target.value)}
                        placeholder="Ví dụ: 50000"
                        className={cn('h-10 rounded-md bg-white px-3 pr-12', fieldFocusClassName)}
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
                        {discountValueUnit}
                      </span>
                    </div>
                  </FormField>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Giá trị đơn tối thiểu">
                    <Input
                      type="number"
                      min={0}
                      className={cn('h-10 rounded-md bg-white px-3', fieldFocusClassName)}
                      value={form.minOrderAmount}
                      onChange={(event) => setField('minOrderAmount', event.target.value)}
                    />
                  </FormField>
                  <FormField label="Mức giảm tối đa">
                    <Input
                      type="number"
                      min={0}
                      className={cn('h-10 rounded-md bg-white px-3', fieldFocusClassName)}
                      value={form.maxDiscountAmount}
                      onChange={(event) => setField('maxDiscountAmount', event.target.value)}
                      placeholder="Không giới hạn"
                    />
                  </FormField>
                </div>
              </section>

              <section className="grid gap-4 border-t pt-5">
                <SectionTitle icon={Package} title="Phạm vi phát hành" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Số lượng phát hành"
                    hint="Để trống nếu không giới hạn số lượt đổi."
                    error={visibleErrors.quantity}
                  >
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      className={cn('h-10 rounded-md bg-white px-3', fieldFocusClassName)}
                      value={form.quantity}
                      onChange={(event) => setField('quantity', event.target.value)}
                      placeholder="Không giới hạn"
                    />
                  </FormField>
                  <FormField
                    label="Hạn đổi thưởng"
                    hint="Để trống nếu phần thưởng không hết hạn."
                    error={visibleErrors.expiredAt}
                  >
                    <DatePicker
                      className={cn('h-10 rounded-md bg-white px-3', fieldFocusClassName)}
                      value={form.expiredAt}
                      onChange={(value) => setField('expiredAt', value)}
                      disabledDates={{ before: new Date() }}
                      placeholder="Chọn hạn đổi thưởng"
                    />
                  </FormField>
                </div>
                <AdminStatusSwitch
                  checked={form.isActive}
                  onCheckedChange={(value) => setField('isActive', value)}
                  label="Hiển thị cho khách hàng"
                  activeText="Khách hàng có thể thấy và đổi phần thưởng"
                  inactiveText="Phần thưởng được lưu nhưng chưa hiển thị"
                  className="bg-slate-50"
                  switchClassName={rewardSwitchClassName}
                />
              </section>
            </div>

            <aside className="h-fit rounded-lg border border-slate-200 bg-slate-50 p-4 lg:sticky lg:top-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                Xem trước
              </p>
              <div className="mt-4 rounded-xl border bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white">
                    <Gift className="size-5" />
                  </div>
                  <Badge
                    className={
                      form.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }
                  >
                    {form.isActive ? 'Sẵn sàng' : 'Bản nháp'}
                  </Badge>
                </div>
                <h3 className="mt-4 line-clamp-2 font-semibold text-slate-950">
                  {form.name.trim() || 'Tên phần thưởng'}
                </h3>
                <p className="mt-2 line-clamp-3 min-h-12 text-sm leading-6 text-slate-500">
                  {form.description.trim() || 'Mô tả phần thưởng sẽ hiển thị tại đây.'}
                </p>
                <div className="mt-4 grid gap-2 border-t pt-4 text-sm">
                  <PreviewRow
                    icon={Coins}
                    label="Điểm đổi"
                    value={
                      form.requiredPoints
                        ? `${formatNumber(Number(form.requiredPoints) || 0)} điểm`
                        : 'Chưa thiết lập'
                    }
                  />
                  <PreviewRow icon={TicketPercent} label="Quyền lợi" value={previewDiscount} />
                  <PreviewRow
                    icon={Package}
                    label="Số lượng"
                    value={
                      form.quantity
                        ? `${formatNumber(Number(form.quantity) || 0)} phần`
                        : 'Không giới hạn'
                    }
                  />
                  <PreviewRow
                    icon={CalendarDays}
                    label="Hạn đổi"
                    value={form.expiredAt ? formatDate(form.expiredAt) : 'Không hết hạn'}
                  />
                </div>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Thông tin này giúp kiểm tra nhanh trước khi lưu. Dữ liệu thực tế vẫn tuân theo trạng
                thái và hạn đổi thưởng.
              </p>
            </aside>
          </div>
        </div>
        <DialogFooter className="sticky bottom-0 border-t bg-white px-6 py-4">
          <Button
            variant="outline"
            className={secondaryButtonClassName}
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            className={primaryButtonClassName}
            disabled={isSubmitting}
            onClick={async () => {
              setHasSubmitted(true);
              if (!isValid) return;
              await onSubmit({
                name: form.name.trim(),
                description: form.description.trim() || undefined,
                requiredPoints: values.pointsValue,
                discountType: form.discountType,
                discountValue: values.discountNumber,
                minOrderAmount: Number(form.minOrderAmount || 0),
                maxDiscountAmount:
                  form.maxDiscountAmount === '' ? null : Number(form.maxDiscountAmount),
                quantity: values.quantityValue,
                expiredAt: values.expiredAt,
                isActive: form.isActive,
              });
              onOpenChange(false);
            }}
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            {isEditing ? 'Lưu thay đổi' : 'Tạo phần thưởng'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: typeof Gift; title: string }) {
  return (
    <div className="flex items-center gap-2 text-slate-950">
      <Icon className="size-4 text-slate-700" />
      <h3 className="font-semibold">{title}</h3>
    </div>
  );
}

function PreviewRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gift;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 shrink-0 text-slate-400" />
      <span className="text-slate-500">{label}</span>
      <span className="ml-auto text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}

function FormField({
  label,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2 text-sm font-medium text-slate-700">
      <span>
        {label} {required ? <span className="text-rose-500">*</span> : null}
      </span>
      {children}
      {error ? <span className="text-xs font-normal text-rose-600">{error}</span> : null}
      {!error && hint ? <span className="text-xs font-normal text-slate-500">{hint}</span> : null}
    </div>
  );
}

function RewardDetailDialog({
  reward,
  onOpenChange,
}: {
  reward: Reward | null;
  onOpenChange: (open: boolean) => void;
}) {
  if (!reward) return null;

  const status = getRewardStatus(reward);

  return (
    <Dialog open={!!reward} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chi tiết phần thưởng</DialogTitle>
          <DialogDescription>Thông tin quyền lợi và điều kiện đổi thưởng.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="font-semibold text-slate-950">{reward.name}</p>
            <p className="mt-2 text-sm text-slate-600">{reward.description || 'Không có mô tả'}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Info label="Điểm cần đổi" value={formatPoints(reward.requiredPoints)} />
            <Info label="Quyền lợi" value={formatRewardDiscount(reward)} />
            <Info
              label="Số lượng còn lại"
              value={String(getRewardRemainingQuantity(reward) ?? 'Không giới hạn')}
            />
            <Info label="Tổng lượt đổi" value={formatNumber(reward.redeemedCount ?? 0)} />
            <Info
              label="Hạn dùng"
              value={reward.expiredAt ? formatDate(reward.expiredAt) : 'Không có'}
            />
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs font-medium text-slate-500">Trạng thái</p>
              <Badge className={cn('mt-2', status.className)}>{status.label}</Badge>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            className={secondaryButtonClassName}
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function RewardActionsMenu({
  reward,
  onView,
  onEdit,
  onToggle,
  onDelete,
}: {
  reward: Reward;
  onView: (reward: Reward) => void;
  onEdit: (reward: Reward) => void;
  onToggle: (reward: Reward) => void;
  onDelete: (reward: Reward) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="rounded-xl">
          <Ellipsis className="size-4" />
          <span className="sr-only">Mở menu thao tác</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuItem onClick={() => onView(reward)}>
          <Eye className="size-4" />
          Xem chi tiết
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(reward)}>
          <Pencil className="size-4" />
          Chỉnh sửa
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggle(reward)}>
          <Power className="size-4" />
          {reward.isActive === false ? 'Kích hoạt lại' : 'Tạm ngưng'}
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={() => onDelete(reward)}>
          <Trash2 className="size-4" />
          Xóa phần thưởng
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: string; icon: typeof Gift }) {
  return <StatCard title={label} value={value} icon={icon} className={compactStatCardClassName} />;
}

export default function AdminRewardsPage() {
  const rewardsQuery = useRewards();
  const rewardMutations = useRewardMutations();
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [detailReward, setDetailReward] = useState<Reward | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{
    reward: Reward;
    action: ConfirmAction;
  } | null>(null);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<RewardStatusFilter>('all');

  const rewards = useMemo(() => rewardsQuery.data ?? [], [rewardsQuery.data]);
  const filteredRewards = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return rewards.filter((reward) => {
      const matchesKeyword =
        !normalizedKeyword ||
        [reward.name, reward.description]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalizedKeyword);

      const expired = isRewardExpired(reward);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'expired' && expired) ||
        (statusFilter === 'active' && reward.isActive !== false && !expired) ||
        (statusFilter === 'inactive' && reward.isActive === false && !expired);

      return matchesKeyword && matchesStatus;
    });
  }, [keyword, rewards, statusFilter]);

  const summary = useMemo(() => {
    const expiredIds = new Set(rewards.filter(isRewardExpired).map((reward) => reward._id));
    return {
      total: rewards.length,
      active: rewards.filter((reward) => reward.isActive !== false && !expiredIds.has(reward._id))
        .length,
      inactive: rewards.filter((reward) => reward.isActive === false && !expiredIds.has(reward._id))
        .length,
      expired: expiredIds.size,
      redeemed: rewards.reduce((sum, reward) => sum + (reward.redeemedCount ?? 0), 0),
    };
  }, [rewards]);

  const handleConfirmAction = async () => {
    if (!confirmTarget) return;

    if (confirmTarget.action === 'delete') {
      await rewardMutations.remove.mutateAsync(confirmTarget.reward._id);
      setConfirmTarget(null);
      return;
    }

    await rewardMutations.update.mutateAsync({
      id: confirmTarget.reward._id,
      payload: buildRewardPayload(confirmTarget.reward, confirmTarget.reward.isActive === false),
    });
    setConfirmTarget(null);
  };

  const confirmTitle =
    confirmTarget?.action === 'delete'
      ? 'Xóa phần thưởng?'
      : confirmTarget?.reward.isActive === false
        ? 'Kích hoạt lại phần thưởng?'
        : 'Tạm ngưng phần thưởng?';

  const confirmDescription =
    confirmTarget?.action === 'delete'
      ? 'Phần thưởng sẽ không còn xuất hiện trong danh sách đổi thưởng của khách hàng.'
      : confirmTarget?.reward.isActive === false
        ? 'Phần thưởng sẽ xuất hiện lại trong danh sách đổi thưởng nếu còn hợp lệ.'
        : 'Phần thưởng sẽ tạm thời không xuất hiện trong danh sách đổi thưởng của khách hàng.';

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden bg-[#f8fafc] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1540px] min-w-0 flex-col gap-7">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
              Quản lý phần thưởng
            </h1>
            <p className="mt-2 max-w-2xl text-base text-slate-500">
              Thiết lập quà tặng, điều kiện đổi điểm và theo dõi mức độ sử dụng của khách hàng.
            </p>
          </div>
          <Button
            className={cn('h-10 shrink-0 px-4 text-sm font-semibold', primaryButtonClassName)}
            onClick={() => {
              setEditingReward(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="size-4" />
            Thêm phần thưởng
          </Button>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Tổng phần thưởng" value={formatNumber(summary.total)} icon={Gift} />
          <SummaryCard
            label="Đang hoạt động"
            value={formatNumber(summary.active)}
            icon={CheckCircle2}
          />
          <SummaryCard
            label="Đã hết hạn"
            value={formatNumber(summary.expired)}
            icon={CalendarDays}
          />
          <SummaryCard
            label="Tổng lượt đổi"
            value={formatNumber(summary.redeemed)}
            icon={RotateCcw}
          />
        </section>

        <section className="rounded-lg border border-border/80 bg-white p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm theo tên phần thưởng..."
                className={cn(
                  'h-10 rounded-md border-0 bg-slate-100 pl-10 text-sm shadow-none',
                  fieldFocusClassName
                )}
              />
            </div>
            <select
              className={cn(
                'h-10 rounded-md border border-input bg-white px-3 text-sm outline-none',
                fieldFocusClassName
              )}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as RewardStatusFilter)}
            >
              {Object.entries(statusFilterLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {rewardsQuery.isError ? (
          <section className="rounded-lg border border-rose-200 bg-rose-50 px-6 py-16 text-center">
            <h2 className="text-xl font-semibold text-rose-700">
              Không thể tải danh sách phần thưởng
            </h2>
            <Button
              className={cn('mt-5', primaryButtonClassName)}
              onClick={() => rewardsQuery.refetch()}
            >
              <RotateCcw className="size-4" />
              Thử lại
            </Button>
          </section>
        ) : (
          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              {summary.inactive > 0 ? (
                <Badge className="bg-slate-100 text-slate-600">{summary.inactive} tạm ngưng</Badge>
              ) : null}
            </div>
            <div className="overflow-hidden rounded-lg border border-border/80 bg-white p-4">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] table-fixed text-left text-sm">
                  <thead className="bg-slate-50/80">
                    <tr className="border-b text-slate-900">
                      <th className="w-[27%] px-2 py-3 font-semibold">Tên phần thưởng</th>
                      <th className="w-[13%] px-2 py-3 font-semibold">Điểm cần đổi</th>
                      <th className="w-[16%] px-2 py-3 font-semibold">Quyền lợi</th>
                      <th className="w-[12%] px-2 py-3 font-semibold">Số lượng</th>
                      <th className="w-[12%] px-2 py-3 font-semibold">Hạn dùng</th>
                      <th className="w-[12%] px-2 py-3 font-semibold">Trạng thái</th>
                      <th className="w-[8%] px-2 py-3 text-right font-semibold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rewardsQuery.isLoading ? (
                      <tr>
                        <td colSpan={7} className="px-2 py-12 text-center text-sm text-slate-500">
                          <Loader2 className="mx-auto mb-3 size-6 animate-spin text-slate-400" />
                          Đang tải danh sách phần thưởng...
                        </td>
                      </tr>
                    ) : filteredRewards.length ? (
                      filteredRewards.map((reward) => {
                        const status = getRewardStatus(reward);

                        return (
                          <tr
                            key={reward._id}
                            className="border-b transition-colors last:border-0 hover:bg-slate-50/70"
                          >
                            <td className="px-2 py-4">
                              <p
                                className="truncate font-semibold text-slate-950"
                                title={reward.name}
                              >
                                {reward.name}
                              </p>
                              <p
                                className="mt-1 max-w-[280px] truncate text-slate-500"
                                title={reward.description || 'Không có mô tả'}
                              >
                                {reward.description || 'Không có mô tả'}
                              </p>
                            </td>
                            <td className="px-2 py-4">{formatPoints(reward.requiredPoints)}</td>
                            <td className="px-2 py-4">{formatRewardDiscount(reward)}</td>
                            <td className="px-2 py-4">
                              {getRewardRemainingQuantity(reward) ?? 'Không giới hạn'}
                            </td>
                            <td className="px-2 py-4">
                              {reward.expiredAt ? formatDate(reward.expiredAt) : 'Không có'}
                            </td>
                            <td className="px-2 py-4">
                              <Badge className={cn('border-0', status.className)}>
                                {status.label}
                              </Badge>
                            </td>
                            <td className="px-2 py-4 text-right">
                              <RewardActionsMenu
                                reward={reward}
                                onView={setDetailReward}
                                onEdit={(selectedReward) => {
                                  setEditingReward(selectedReward);
                                  setDialogOpen(true);
                                }}
                                onToggle={(selectedReward) =>
                                  setConfirmTarget({ reward: selectedReward, action: 'toggle' })
                                }
                                onDelete={(selectedReward) =>
                                  setConfirmTarget({ reward: selectedReward, action: 'delete' })
                                }
                              />
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-2 py-12 text-center text-sm text-slate-500">
                          {rewards.length
                            ? 'Không có phần thưởng phù hợp.'
                            : 'Chưa có phần thưởng nào. Hãy tạo phần thưởng để khách hàng có thể đổi điểm.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>

      {isDialogOpen ? (
        <RewardDialog
          key={editingReward?._id ?? 'create'}
          reward={editingReward}
          isSubmitting={rewardMutations.create.isPending || rewardMutations.update.isPending}
          onOpenChange={setDialogOpen}
          onSubmit={(payload) =>
            editingReward
              ? rewardMutations.update.mutateAsync({ id: editingReward._id, payload })
              : rewardMutations.create.mutateAsync(payload)
          }
        />
      ) : null}

      <RewardDetailDialog
        reward={detailReward}
        onOpenChange={(open) => {
          if (!open) setDetailReward(null);
        }}
      />

      <Dialog open={!!confirmTarget} onOpenChange={(open) => !open && setConfirmTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmTitle}</DialogTitle>
            <DialogDescription>{confirmDescription}</DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
            {confirmTarget?.reward.name}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className={secondaryButtonClassName}
              onClick={() => setConfirmTarget(null)}
            >
              Hủy
            </Button>
            <Button
              variant={confirmTarget?.action === 'delete' ? 'destructive' : 'default'}
              className={confirmTarget?.action === 'delete' ? undefined : primaryButtonClassName}
              disabled={
                rewardMutations.remove.isPending ||
                rewardMutations.update.isPending ||
                !confirmTarget
              }
              onClick={handleConfirmAction}
            >
              {rewardMutations.remove.isPending || rewardMutations.update.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : confirmTarget?.action === 'delete' ? (
                <Trash2 className="size-4" />
              ) : (
                <Power className="size-4" />
              )}
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

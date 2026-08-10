import {
  CheckCircle2,
  Ellipsis,
  Eye,
  Loader2,
  Megaphone,
  Pencil,
  Plus,
  Power,
  RotateCcw,
  Search,
  TicketPercent,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { AdminStatusSwitch } from '@/components/admin/AdminStatusSwitch';
import { StatCard } from '@/components/dashboard';
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
import { useMembershipTiers } from '@/features/shared/loyalty/hooks/use-loyalty';
import { useActiveServices } from '@/features/admin/services/hooks/useServices';
import {
  usePromotions,
  usePromotionMutations,
} from '@/features/admin/promotions/hooks/usePromotions';
import { cn, formatDate } from '@/lib/utils';
import {
  type Promotion,
  type PromotionPayload,
  type PromotionFormType,
  type PromotionTargetType,
  type PromotionType,
} from '@/services/promotionService';

const PAGE_SIZE = 10;

const primaryButtonClassName =
  'rounded-md bg-slate-950 text-white hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-500';
const secondaryButtonClassName =
  'rounded-md border-slate-300 bg-white text-slate-900 hover:bg-slate-100';
const fieldFocusClassName =
  'focus:border-slate-700 focus:ring-2 focus:ring-slate-700/10 focus-visible:border-slate-700 focus-visible:ring-slate-700/10';
const compactStatCardClassName =
  'min-h-[96px] p-4 [&_.card-icon]:size-10 [&_.card-value]:text-[26px] [&_.card-value]:leading-none [&_p:first-child]:text-sm';
const promotionSwitchClassName =
  'bg-slate-300 focus-visible:border-slate-700 focus-visible:ring-slate-700/20 data-[state=checked]:bg-slate-950';

const promotionTypeLabels: Record<PromotionType, string> = {
  percentage: 'Giảm theo phần trăm',
  fixed_amount: 'Giảm số tiền',
  bonus_points: 'Tặng điểm',
  free_service: 'Miễn phí dịch vụ',
};

const promotionTypeOptions: Array<{ value: PromotionFormType; label: string }> = [
  { value: 'percentage', label: promotionTypeLabels.percentage },
  { value: 'fixed_amount', label: promotionTypeLabels.fixed_amount },
  { value: 'free_service', label: promotionTypeLabels.free_service },
];

const initialFormState = {
  title: '',
  code: '',
  description: '',
  type: 'percentage' as PromotionFormType,
  discountValue: '',
  startDate: '',
  endDate: '',
  minOrderAmount: '0',
  maxDiscountAmount: '',
  usageLimit: '',
  isActive: true,
  targetType: 'all' as PromotionTargetType,
  membershipTierId: '',
  serviceId: '',
};

type PromotionFormState = typeof initialFormState;

function formatCurrency(value?: number | null) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value ?? 0);
}

function formatNumber(value?: number | null) {
  return new Intl.NumberFormat('vi-VN').format(value ?? 0);
}

function parseVietnameseDate(value: string) {
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (!match) return '';

  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00.000Z`;
}

function formatDatePickerValue(value: string) {
  return parseVietnameseDate(value).slice(0, 10);
}

function formatDateForForm(value: string) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}/${month}/${year}` : '';
}

function formatDateForInput(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN').format(date);
}

function createFormState(promotion: Promotion | null): PromotionFormState {
  if (!promotion) return initialFormState;

  const serviceId =
    typeof promotion.serviceId === 'string'
      ? promotion.serviceId
      : (promotion.serviceId?._id ?? '');
  const membershipTierId =
    typeof promotion.membershipTierId === 'string'
      ? promotion.membershipTierId
      : (promotion.membershipTierId?._id ?? '');

  return {
    title: promotion.title,
    code: promotion.code,
    description: promotion.description ?? '',
    type: promotion.type === 'bonus_points' ? 'percentage' : promotion.type,
    discountValue:
      typeof promotion.discountValue === 'number' ? String(promotion.discountValue) : '',
    startDate: formatDateForInput(promotion.startDate),
    endDate: formatDateForInput(promotion.endDate),
    minOrderAmount: String(promotion.minOrderAmount ?? 0),
    maxDiscountAmount:
      promotion.maxDiscountAmount == null ? '' : String(promotion.maxDiscountAmount),
    usageLimit: typeof promotion.usageLimit === 'number' ? String(promotion.usageLimit) : '',
    isActive: promotion.isActive,
    targetType: promotion.targetType,
    membershipTierId,
    serviceId,
  };
}

function toNullableNumber(value: string) {
  const trimmed = value.trim();
  return trimmed ? Number(trimmed) : null;
}

function getPromotionStatus(promotion: Promotion) {
  const now = new Date();
  const startDate = new Date(promotion.startDate);
  const endDate = new Date(promotion.endDate);

  if (!promotion.isActive) return { label: 'Tạm ngưng', className: 'bg-slate-100 text-slate-700' };
  if (Number.isFinite(startDate.getTime()) && startDate > now) {
    return { label: 'Sắp diễn ra', className: 'bg-slate-50 text-slate-700' };
  }
  if (Number.isFinite(endDate.getTime()) && endDate < now) {
    return { label: 'Hết hạn', className: 'bg-amber-50 text-amber-700' };
  }
  if (promotion.usageLimit && (promotion.usedCount ?? 0) >= promotion.usageLimit) {
    return { label: 'Hết lượt', className: 'bg-rose-50 text-rose-700' };
  }

  return { label: 'Đang chạy', className: 'bg-emerald-50 text-emerald-700' };
}

function getPromotionOffer(promotion: Promotion) {
  if (promotion.type === 'percentage') return `Giảm ${formatNumber(promotion.discountValue)}%`;
  if (promotion.type === 'fixed_amount') return `Giảm ${formatCurrency(promotion.discountValue)}`;
  if (promotion.type === 'bonus_points') return `Tặng ${formatNumber(promotion.bonusPoints)} điểm`;
  return 'Miễn phí dịch vụ';
}

function getPromotionScope(promotion: Promotion) {
  if (promotion.targetType === 'membership_tier') return 'Theo hạng thành viên';
  if (promotion.targetType === 'service') return 'Theo dịch vụ';
  return 'Tất cả khách hàng';
}

function buildPromotionPayload(form: PromotionFormState): PromotionPayload {
  const payload: PromotionPayload = {
    title: form.title,
    code: form.code,
    description: form.description || undefined,
    type: form.type,
    targetType: form.type === 'free_service' ? 'service' : form.targetType,
    membershipTierId:
      form.type !== 'free_service' && form.targetType === 'membership_tier'
        ? form.membershipTierId
        : null,
    serviceId: form.targetType === 'service' ? form.serviceId : null,
    startDate: parseVietnameseDate(form.startDate),
    endDate: parseVietnameseDate(form.endDate),
    minOrderAmount: Number(form.minOrderAmount || 0),
    maxDiscountAmount: form.maxDiscountAmount === '' ? null : Number(form.maxDiscountAmount),
    usageLimit: toNullableNumber(form.usageLimit),
    isActive: form.isActive,
  };

  if (form.type === 'free_service') {
    payload.targetType = 'service';
    payload.serviceId = form.serviceId;
    payload.discountValue = 0;
    return payload;
  }

  payload.discountValue = Number(form.discountValue);
  return payload;
}

function validatePromotionForm(form: PromotionFormState) {
  if (!form.title.trim()) return 'Vui lòng nhập tên khuyến mãi.';
  if (!form.code.trim()) return 'Vui lòng nhập mã khuyến mãi.';
  const startDate = parseVietnameseDate(form.startDate);
  const endDate = parseVietnameseDate(form.endDate);
  if (!startDate) return 'Ngày bắt đầu phải có định dạng dd/mm/yyyy.';
  if (!endDate) return 'Ngày kết thúc phải có định dạng dd/mm/yyyy.';
  if (new Date(endDate) <= new Date(startDate)) return 'Ngày kết thúc phải sau ngày bắt đầu.';

  if (form.type === 'percentage') {
    if (!form.discountValue.trim()) return 'Vui lòng nhập phần trăm giảm.';
    const value = Number(form.discountValue);
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      return 'Phần trăm giảm phải nằm trong khoảng 0 đến 100.';
    }
  }

  if (form.type === 'fixed_amount') {
    if (!form.discountValue.trim()) return 'Vui lòng nhập số tiền giảm.';
    const value = Number(form.discountValue);
    if (!Number.isFinite(value) || value < 0) return 'Số tiền giảm phải lớn hơn hoặc bằng 0.';
  }

  if (form.type === 'free_service' && !form.serviceId) {
    return 'Vui lòng chọn dịch vụ được miễn phí.';
  }
  if (
    form.type !== 'free_service' &&
    form.targetType === 'membership_tier' &&
    !form.membershipTierId
  ) {
    return 'Vui lòng chọn hạng thành viên.';
  }
  if (form.type !== 'free_service' && form.targetType === 'service' && !form.serviceId) {
    return 'Vui lòng chọn dịch vụ áp dụng.';
  }

  if (Number(form.minOrderAmount || 0) < 0)
    return 'Giá trị đơn tối thiểu phải lớn hơn hoặc bằng 0.';
  if (form.usageLimit && Number(form.usageLimit) < 1) return 'Giới hạn lượt dùng phải lớn hơn 0.';

  return null;
}

function PromotionCreateDialog({
  promotion,
  open,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: {
  promotion: Promotion | null;
  open: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: PromotionPayload) => Promise<unknown>;
}) {
  const [form, setForm] = useState<PromotionFormState>(() => createFormState(promotion));
  const isEditing = Boolean(promotion);
  const servicesQuery = useActiveServices(
    { limit: 100 },
    { enabled: open && (form.type === 'free_service' || form.targetType === 'service') }
  );
  const membershipTiersQuery = useMembershipTiers();

  const setField = <K extends keyof PromotionFormState>(field: K, value: PromotionFormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async () => {
    const errorMessage = validatePromotionForm(form);
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    await onSubmit(buildPromotionPayload(form));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid max-h-[85vh] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:max-w-[760px]">
        <DialogHeader className="border-b bg-white px-5 py-4">
          <DialogTitle>{isEditing ? 'Chỉnh sửa khuyến mãi' : 'Tạo khuyến mãi'}</DialogTitle>
          <DialogDescription>
            Nhập thông tin khuyến mãi, loại ưu đãi, thời gian áp dụng và điều kiện sử dụng.
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 gap-4 overflow-y-auto overflow-x-hidden overscroll-contain px-5 py-4">
          <section className="rounded-lg border border-slate-200/80 p-3.5">
            <h3 className="text-sm font-semibold text-slate-900">Thông tin cơ bản</h3>
            <div className="mt-3 grid gap-3.5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Tên khuyến mãi *
                <Input
                  className={cn('h-10 rounded-md bg-white px-3', fieldFocusClassName)}
                  value={form.title}
                  onChange={(event) => setField('title', event.target.value)}
                  placeholder="Giảm 20% rửa xe"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Mã khuyến mãi *
                <Input
                  className={cn('h-10 rounded-md bg-white px-3', fieldFocusClassName)}
                  value={form.code}
                  onChange={(event) => setField('code', event.target.value.toUpperCase())}
                  placeholder="WASH20"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
                Mô tả
                <Textarea
                  className={cn('min-h-20 rounded-md bg-white px-3 py-2', fieldFocusClassName)}
                  value={form.description}
                  onChange={(event) => setField('description', event.target.value)}
                  placeholder="Mô tả ngắn về khuyến mãi"
                />
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200/80 p-3.5">
            <h3 className="text-sm font-semibold text-slate-900">Ưu đãi</h3>
            <div className="mt-3 grid gap-3.5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Loại khuyến mãi *
                <select
                  className={cn(
                    'h-10 rounded-md border border-input bg-white px-3 text-sm outline-none',
                    fieldFocusClassName
                  )}
                  value={form.type}
                  onChange={(event) => {
                    const type = event.target.value as PromotionFormType;
                    setForm((current) => ({
                      ...current,
                      type,
                      discountValue: type === 'free_service' ? '' : current.discountValue,
                      targetType: type === 'free_service' ? 'service' : current.targetType,
                      serviceId: type === 'free_service' ? current.serviceId : '',
                    }));
                  }}
                >
                  {promotionTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              {form.type === 'percentage' ? (
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Phần trăm giảm (%) *
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    className={cn('h-10 rounded-md bg-white px-3', fieldFocusClassName)}
                    value={form.discountValue}
                    onChange={(event) => setField('discountValue', event.target.value)}
                    placeholder="20"
                  />
                </label>
              ) : null}

              {form.type === 'fixed_amount' ? (
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Số tiền giảm (đ) *
                  <Input
                    type="number"
                    min={0}
                    className={cn('h-10 rounded-md bg-white px-3', fieldFocusClassName)}
                    value={form.discountValue}
                    onChange={(event) => setField('discountValue', event.target.value)}
                    placeholder="100000"
                  />
                </label>
              ) : null}

              {form.type === 'free_service' ? (
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Dịch vụ được miễn phí *
                  <select
                    className={cn(
                      'h-10 rounded-md border border-input bg-white px-3 text-sm outline-none',
                      fieldFocusClassName
                    )}
                    value={form.serviceId}
                    onChange={(event) => setField('serviceId', event.target.value)}
                    disabled={servicesQuery.isLoading}
                  >
                    <option value="">
                      {servicesQuery.isLoading ? 'Đang tải dịch vụ...' : 'Chọn dịch vụ'}
                    </option>
                    {(servicesQuery.data ?? []).map((service) => (
                      <option key={service._id} value={service._id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200/80 p-3.5">
            <h3 className="text-sm font-semibold text-slate-900">Đối tượng & phạm vi áp dụng</h3>
            <div className="mt-3 grid gap-3.5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Đối tượng áp dụng *
                <select
                  className={cn(
                    'h-10 rounded-md border border-input bg-white px-3 text-sm outline-none',
                    fieldFocusClassName
                  )}
                  value={form.type === 'free_service' ? 'service' : form.targetType}
                  disabled={form.type === 'free_service'}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      targetType: event.target.value as PromotionTargetType,
                      membershipTierId: '',
                      serviceId: '',
                    }))
                  }
                >
                  <option value="all">Tất cả khách hàng</option>
                  <option value="membership_tier">Theo hạng thành viên</option>
                  <option value="service">Theo dịch vụ</option>
                </select>
              </label>
              {form.type !== 'free_service' && form.targetType === 'membership_tier' ? (
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Hạng thành viên *
                  <select
                    className={cn(
                      'h-10 rounded-md border border-input bg-white px-3 text-sm outline-none',
                      fieldFocusClassName
                    )}
                    value={form.membershipTierId}
                    onChange={(event) => setField('membershipTierId', event.target.value)}
                    disabled={membershipTiersQuery.isLoading}
                  >
                    <option value="">
                      {membershipTiersQuery.isLoading ? 'Đang tải hạng...' : 'Chọn hạng thành viên'}
                    </option>
                    {(membershipTiersQuery.data ?? [])
                      .filter((tier) => tier.isActive)
                      .map((tier) => (
                        <option key={tier._id} value={tier._id}>
                          {tier.name}
                        </option>
                      ))}
                  </select>
                </label>
              ) : null}
              {form.type !== 'free_service' && form.targetType === 'service' ? (
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Dịch vụ áp dụng *
                  <select
                    className={cn(
                      'h-10 rounded-md border border-input bg-white px-3 text-sm outline-none',
                      fieldFocusClassName
                    )}
                    value={form.serviceId}
                    onChange={(event) => setField('serviceId', event.target.value)}
                    disabled={servicesQuery.isLoading}
                  >
                    <option value="">
                      {servicesQuery.isLoading ? 'Đang tải dịch vụ...' : 'Chọn dịch vụ'}
                    </option>
                    {(servicesQuery.data ?? []).map((service) => (
                      <option key={service._id} value={service._id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200/80 p-3.5">
            <h3 className="text-sm font-semibold text-slate-900">Thời gian & điều kiện</h3>
            <div className="mt-3 grid gap-3.5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Ngày bắt đầu *
                <DatePicker
                  className={cn('h-10 rounded-md bg-white px-3', fieldFocusClassName)}
                  value={formatDatePickerValue(form.startDate)}
                  onChange={(value) => setField('startDate', formatDateForForm(value))}
                  placeholder="Chọn ngày bắt đầu"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Ngày kết thúc *
                <DatePicker
                  className={cn('h-10 rounded-md bg-white px-3', fieldFocusClassName)}
                  value={formatDatePickerValue(form.endDate)}
                  onChange={(value) => setField('endDate', formatDateForForm(value))}
                  placeholder="Chọn ngày kết thúc"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Giá trị đơn tối thiểu (đ)
                <Input
                  type="number"
                  min={0}
                  className={cn('h-10 rounded-md bg-white px-3', fieldFocusClassName)}
                  value={form.minOrderAmount}
                  onChange={(event) => setField('minOrderAmount', event.target.value)}
                  placeholder="100000"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Giới hạn lượt dùng
                <Input
                  type="number"
                  min={1}
                  className={cn('h-10 rounded-md bg-white px-3', fieldFocusClassName)}
                  value={form.usageLimit}
                  onChange={(event) => setField('usageLimit', event.target.value)}
                  placeholder="Không giới hạn"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Mức giảm tối đa (đ)
                <Input
                  type="number"
                  min={0}
                  className={cn('h-10 rounded-md bg-white px-3', fieldFocusClassName)}
                  value={form.maxDiscountAmount}
                  onChange={(event) => setField('maxDiscountAmount', event.target.value)}
                  placeholder="Không giới hạn"
                />
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200/80 p-3.5">
            <AdminStatusSwitch
              checked={form.isActive}
              onCheckedChange={(checked) => setField('isActive', checked)}
              switchClassName={promotionSwitchClassName}
            />
          </section>
        </div>

        <DialogFooter className="sticky bottom-0 border-t bg-white px-5 py-4">
          <Button
            variant="outline"
            className={secondaryButtonClassName}
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button className={primaryButtonClassName} onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : isEditing ? (
              <CheckCircle2 className="size-4" />
            ) : (
              <Plus className="size-4" />
            )}
            {isEditing ? 'Lưu thay đổi' : 'Tạo khuyến mãi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PromotionDetailDialog({
  promotion,
  onOpenChange,
}: {
  promotion: Promotion | null;
  onOpenChange: (open: boolean) => void;
}) {
  if (!promotion) return null;

  const status = getPromotionStatus(promotion);

  return (
    <Dialog open={!!promotion} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chi tiết khuyến mãi</DialogTitle>
          <DialogDescription>Thông tin ưu đãi, phạm vi và thời gian áp dụng.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="font-semibold text-slate-950">{promotion.title}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">{promotion.code}</p>
            <p className="mt-2 text-sm text-slate-600">
              {promotion.description || 'Không có mô tả'}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Info label="Ưu đãi" value={getPromotionOffer(promotion)} />
            <Info label="Phạm vi" value={getPromotionScope(promotion)} />
            <Info
              label="Thời gian"
              value={`${formatDate(promotion.startDate)} - ${formatDate(promotion.endDate)}`}
            />
            <Info
              label="Lượt dùng"
              value={`${formatNumber(promotion.usedCount)} / ${
                promotion.usageLimit ? formatNumber(promotion.usageLimit) : 'Không giới hạn'
              }`}
            />
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs font-medium text-slate-500">Trạng thái</p>
              <span
                className={cn(
                  'mt-2 inline-flex rounded-md px-3 py-1 text-xs font-semibold',
                  status.className
                )}
              >
                {status.label}
              </span>
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

function PromotionActionsMenu({
  promotion,
  isMutating,
  onView,
  onEdit,
  onToggle,
  onDelete,
}: {
  promotion: Promotion;
  isMutating: boolean;
  onView: (promotion: Promotion) => void;
  onEdit: (promotion: Promotion) => void;
  onToggle: (promotion: Promotion) => void;
  onDelete: (promotion: Promotion) => void;
}) {
  const status = getPromotionStatus(promotion);
  const toggleLabel =
    status.label === 'Hết hạn'
      ? 'Gia hạn khuyến mãi'
      : promotion.isActive
        ? 'Tạm ngưng'
        : 'Kích hoạt';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="rounded-md">
          <Ellipsis className="size-4" />
          <span className="sr-only">Mở menu thao tác</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuItem onClick={() => onView(promotion)}>
          <Eye className="size-4" />
          Xem chi tiết
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(promotion)}>
          <Pencil className="size-4" />
          Chỉnh sửa
        </DropdownMenuItem>
        <DropdownMenuItem
          variant={promotion.isActive && status.label !== 'Hết hạn' ? 'destructive' : 'default'}
          disabled={isMutating}
          onClick={() => (status.label === 'Hết hạn' ? onEdit(promotion) : onToggle(promotion))}
        >
          <Power className="size-4" />
          {toggleLabel}
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={() => onDelete(promotion)}>
          <Trash2 className="size-4" />
          Xóa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function PromotionsPage() {
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [detailPromotion, setDetailPromotion] = useState<Promotion | null>(null);
  const [deletePromotion, setDeletePromotion] = useState<Promotion | null>(null);

  const listParams = {
    page,
    limit: PAGE_SIZE,
    isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
  };

  const promotionsQuery = usePromotions(listParams);
  const {
    create: createMutation,
    update: updateMutation,
    status: statusMutation,
    remove: removeMutation,
  } = usePromotionMutations();

  const closeDialog = (open: boolean) => {
    setIsCreateOpen(open);
    if (!open) setEditingPromotion(null);
  };

  const promotions = useMemo(
    () => promotionsQuery.data?.items ?? [],
    [promotionsQuery.data?.items]
  );
  const filteredPromotions = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) return promotions;

    return promotions.filter((promotion) =>
      [promotion.title, promotion.code, promotion.description, promotionTypeLabels[promotion.type]]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalizedKeyword)
    );
  }, [keyword, promotions]);

  const summary = useMemo(() => {
    const running = promotions.filter(
      (promotion) => getPromotionStatus(promotion).label === 'Đang chạy'
    ).length;
    const active = promotions.filter((promotion) => promotion.isActive).length;
    const totalUsed = promotions.reduce((sum, promotion) => sum + (promotion.usedCount ?? 0), 0);

    return { total: promotionsQuery.data?.total ?? promotions.length, running, active, totalUsed };
  }, [promotions, promotionsQuery.data?.total]);

  const totalPages = Math.max(1, promotionsQuery.data?.pagination?.totalPages ?? 1);

  return (
    <main className="min-h-[calc(100vh-81px)] bg-[#f8fafc] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1540px] space-y-6">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
              Quản lý khuyến mãi
            </h1>
            <p className="mt-2 max-w-3xl text-base text-slate-500">
              Quản lý khuyến mãi và danh sách khuyến mãi đang áp dụng cho khách hàng.
            </p>
          </div>
          <Button
            className={cn('h-10 px-4 text-sm font-semibold', primaryButtonClassName)}
            onClick={() => {
              setEditingPromotion(null);
              setIsCreateOpen(true);
            }}
          >
            <Plus className="size-4" />
            Tạo khuyến mãi
          </Button>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Tổng khuyến mãi"
            value={formatNumber(summary.total)}
            icon={TicketPercent}
          />
          <SummaryCard label="Đang chạy" value={formatNumber(summary.running)} icon={Megaphone} />
          <SummaryCard
            label="Đang kích hoạt"
            value={formatNumber(summary.active)}
            icon={CheckCircle2}
          />
          <SummaryCard
            label="Tổng lượt dùng"
            value={formatNumber(summary.totalUsed)}
            icon={RotateCcw}
          />
        </section>

        <section className="rounded-lg border border-border/80 bg-white p-3">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm theo tên, mã hoặc loại khuyến mãi..."
                className={cn('h-10 rounded-md bg-white pl-10', fieldFocusClassName)}
              />
            </div>
            <select
              className={cn(
                'h-10 rounded-md border border-input bg-white px-3 text-sm outline-none',
                fieldFocusClassName
              )}
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as typeof statusFilter);
                setPage(1);
              }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang kích hoạt</option>
              <option value="inactive">Tạm ngưng</option>
            </select>
          </div>
        </section>

        {promotionsQuery.isError ? (
          <section className="rounded-lg border border-rose-200 bg-rose-50 px-6 py-14 text-center">
            <h2 className="text-xl font-semibold text-rose-700">
              Không thể tải danh sách khuyến mãi
            </h2>
            <Button
              className={cn('mt-5', primaryButtonClassName)}
              onClick={() => promotionsQuery.refetch()}
            >
              <RotateCcw className="size-4" />
              Thử lại
            </Button>
          </section>
        ) : (
          <section className="rounded-lg border border-border/80 bg-white p-4">
            <div className="mt-4 overflow-x-auto">
              <table className="w-full table-fixed border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-slate-900">
                    <th className="w-[25%] px-2 py-3 font-semibold">Khuyến mãi</th>
                    <th className="w-[15%] px-2 py-3 font-semibold">Ưu đãi</th>
                    <th className="w-[15%] px-2 py-3 font-semibold">Phạm vi</th>
                    <th className="w-[17%] px-2 py-3 font-semibold">Thời gian</th>
                    <th className="w-[10%] px-2 py-3 font-semibold">Lượt dùng</th>
                    <th className="w-[10%] px-2 py-3 font-semibold">Trạng thái</th>
                    <th className="w-[8%] px-2 py-3 text-center font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {promotionsQuery.isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-2 py-12 text-center text-sm text-slate-500">
                        <Loader2 className="mx-auto mb-3 size-6 animate-spin text-slate-400" />
                        Đang tải khuyến mãi...
                      </td>
                    </tr>
                  ) : filteredPromotions.length ? (
                    filteredPromotions.map((promotion) => {
                      const status = getPromotionStatus(promotion);

                      return (
                        <tr key={promotion._id} className="border-b border-border/70 last:border-0">
                          <td className="px-2 py-4">
                            <div className="font-semibold text-slate-950">{promotion.title}</div>
                            <div className="mt-1 text-xs font-semibold text-slate-500">
                              {promotion.code}
                            </div>
                            <div className="mt-1 line-clamp-1 text-xs text-slate-500">
                              {promotion.description || 'Không có mô tả'}
                            </div>
                          </td>
                          <td className="px-2 py-4">
                            <div className="font-semibold text-slate-950">
                              {getPromotionOffer(promotion)}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              {promotionTypeLabels[promotion.type]}
                            </div>
                          </td>
                          <td className="px-2 py-4 text-slate-900">
                            {getPromotionScope(promotion)}
                          </td>
                          <td className="px-2 py-4 text-slate-900">
                            <div>{formatDate(promotion.startDate)}</div>
                            <div className="text-slate-500">
                              đến {formatDate(promotion.endDate)}
                            </div>
                          </td>
                          <td className="px-2 py-4 text-slate-900">
                            <div className="whitespace-nowrap font-medium">
                              {formatNumber(promotion.usedCount)} lượt
                            </div>
                            <div className="mt-1 whitespace-nowrap text-xs text-slate-500">
                              {promotion.usageLimit
                                ? `/ ${formatNumber(promotion.usageLimit)} lượt`
                                : 'Không giới hạn'}
                            </div>
                          </td>
                          <td className="px-2 py-4">
                            <span
                              className={cn(
                                'inline-flex rounded-md px-3 py-1 text-xs font-semibold',
                                status.className
                              )}
                            >
                              {status.label}
                            </span>
                          </td>
                          <td className="px-2 py-4 text-center">
                            <PromotionActionsMenu
                              promotion={promotion}
                              isMutating={statusMutation.isPending}
                              onView={setDetailPromotion}
                              onEdit={(selectedPromotion) => {
                                setEditingPromotion(selectedPromotion);
                                setIsCreateOpen(true);
                              }}
                              onToggle={(selectedPromotion) =>
                                statusMutation.mutate({
                                  promotionId: selectedPromotion._id,
                                  isActive: !selectedPromotion.isActive,
                                })
                              }
                              onDelete={setDeletePromotion}
                            />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-2 py-12 text-center text-sm text-slate-500">
                        Không có khuyến mãi phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {promotionsQuery.data?.pagination ? (
          <div className="flex flex-col gap-3 rounded-lg border border-border/80 bg-white p-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Tổng{' '}
              {formatNumber(promotionsQuery.data.pagination.total ?? promotionsQuery.data.total)}{' '}
              khuyến mãi, trang {promotionsQuery.data.pagination.page ?? page}/{totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className={secondaryButtonClassName}
                disabled={page <= 1 || promotionsQuery.isFetching}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={secondaryButtonClassName}
                disabled={page >= totalPages || promotionsQuery.isFetching}
                onClick={() => setPage((current) => current + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {isCreateOpen ? (
        <PromotionCreateDialog
          key={editingPromotion?._id ?? 'create'}
          promotion={editingPromotion}
          open
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onOpenChange={closeDialog}
          onSubmit={async (payload) => {
            if (editingPromotion) {
              await updateMutation.mutateAsync({ promotionId: editingPromotion._id, payload });
            } else {
              await createMutation.mutateAsync(payload);
            }
            closeDialog(false);
          }}
        />
      ) : null}

      <PromotionDetailDialog
        promotion={detailPromotion}
        onOpenChange={(open) => {
          if (!open) setDetailPromotion(null);
        }}
      />

      <Dialog open={!!deletePromotion} onOpenChange={(open) => !open && setDeletePromotion(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa khuyến mãi?</DialogTitle>
            <DialogDescription>
              Khuyến mãi sẽ không còn xuất hiện trong danh sách quản trị và luồng áp dụng cho khách
              hàng.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
            {deletePromotion?.title}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className={secondaryButtonClassName}
              onClick={() => setDeletePromotion(null)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              disabled={removeMutation.isPending || !deletePromotion}
              onClick={async () => {
                if (!deletePromotion) return;
                await removeMutation.mutateAsync(deletePromotion._id);
                setDeletePromotion(null);
              }}
            >
              {removeMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: typeof Megaphone;
}) {
  return <StatCard title={label} value={value} icon={icon} className={compactStatCardClassName} />;
}

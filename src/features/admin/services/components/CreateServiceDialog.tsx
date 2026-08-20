import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import type { ComponentProps } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { VndCurrencyInput } from '@/features/admin/services/components/VndCurrencyInput';
import {
  calculateServiceRewardPoints,
  MAX_SERVICE_PRICE,
} from '@/features/admin/services/utils/vnd-currency';
import { cn } from '@/lib/utils';
import type { ServiceCategory } from '@/types/serviceCategory';
import type { CreateServicePayload } from '@/types/service';

const createServiceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập tên dịch vụ.')
    .max(120, 'Tên dịch vụ không được vượt quá 120 ký tự.'),
  description: z.string().trim().max(2000, 'Mô tả không được vượt quá 2000 ký tự.').optional(),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục dịch vụ.'),
  price: z
    .number()
    .int('Giá dịch vụ phải là số nguyên.')
    .min(0, 'Giá dịch vụ phải lớn hơn hoặc bằng 0.')
    .max(MAX_SERVICE_PRICE, 'Giá dịch vụ vượt quá giới hạn cho phép.'),
  estimatedDuration: z
    .number()
    .int('Thời lượng phải là số nguyên.')
    .min(1, 'Thời lượng phải lớn hơn hoặc bằng 1 phút.'),
});

type CreateServiceFormValues = z.infer<typeof createServiceSchema>;

const primaryButtonClassName =
  'rounded-md bg-slate-950 text-white hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-500';
const secondaryButtonClassName =
  'rounded-md border-slate-300 bg-white text-slate-900 hover:bg-slate-100';
const fieldFocusClassName =
  'focus:border-slate-700 focus:ring-2 focus:ring-slate-700/10 focus-visible:border-slate-700 focus-visible:ring-slate-700/10';

const buildDefaultValues = (
  categories: ServiceCategory[],
  fixedCategory?: ServiceCategory
): CreateServiceFormValues => ({
  name: '',
  description: '',
  categoryId: fixedCategory?._id ?? categories[0]?._id ?? '',
  price: 0,
  estimatedDuration: 45,
});

interface CreateServiceDialogProps {
  categories: ServiceCategory[];
  fixedCategory?: ServiceCategory;
  isOpen: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateServicePayload) => void;
}

export function CreateServiceDialog({
  categories,
  fixedCategory,
  isOpen,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: CreateServiceDialogProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateServiceFormValues>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: buildDefaultValues(categories, fixedCategory),
  });
  const rewardPoints = calculateServiceRewardPoints(useWatch({ control, name: 'price' }));

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    reset(buildDefaultValues(categories, fixedCategory));
  }, [categories, fixedCategory, isOpen, reset]);

  const canCreate = fixedCategory?.isActive ?? categories.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-2xl">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-lg">Tạo dịch vụ mới</DialogTitle>
          <DialogDescription>
            {fixedCategory
              ? `Thêm dịch vụ mới vào danh mục “${fixedCategory.name}”.`
              : 'Nhập thông tin dịch vụ và chọn danh mục phù hợp.'}
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-5 px-6 pb-6"
          onSubmit={handleSubmit((values) =>
            onSubmit({
              ...values,
              description: values.description?.trim() || undefined,
            })
          )}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className={cn(fixedCategory && 'md:col-span-2')}>
              <FormInput label="Tên dịch vụ" error={errors.name?.message} {...register('name')} />
            </div>

            {fixedCategory ? (
              <input type="hidden" {...register('categoryId')} />
            ) : (
              <Field>
                <FieldLabel>Danh mục</FieldLabel>
                <select
                  className={cn(
                    'h-10 rounded-md border border-input bg-white px-3 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-100',
                    fieldFocusClassName
                  )}
                  disabled={!categories.length || isSubmitting}
                  {...register('categoryId')}
                >
                  {categories.length ? (
                    categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))
                  ) : (
                    <option value="">Không có danh mục đang hoạt động</option>
                  )}
                </select>
                <FieldError>{errors.categoryId?.message}</FieldError>
              </Field>
            )}

            <Controller
              control={control}
              name="price"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="create-service-price">Giá dịch vụ</FieldLabel>
                  <VndCurrencyInput
                    id="create-service-price"
                    aria-invalid={!!errors.price}
                    className={cn('h-10 rounded-md bg-white px-3', fieldFocusClassName)}
                    disabled={isSubmitting}
                    value={field.value}
                    onBlur={field.onBlur}
                    onValueChange={field.onChange}
                  />
                  <FieldError>{errors.price?.message}</FieldError>
                </Field>
              )}
            />

            <FormInput
              type="number"
              min={1}
              label="Thời lượng ước tính (phút)"
              error={errors.estimatedDuration?.message}
              {...register('estimatedDuration', { valueAsNumber: true })}
            />

            <Field>
              <FieldLabel>Điểm khách nhận được</FieldLabel>
              <Input value={`${rewardPoints} điểm`} readOnly aria-readonly="true" />
              <p className="text-xs text-muted-foreground">
                Tự động tính: mỗi 10.000₫ được 1 điểm.
              </p>
            </Field>
          </div>

          <Field>
            <FieldLabel>Mô tả</FieldLabel>
            <textarea
              className={cn(
                'min-h-24 rounded-md border border-input bg-white px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-100',
                fieldFocusClassName
              )}
              placeholder="Mô tả ngắn về dịch vụ, quy trình hoặc lưu ý cho khách hàng."
              disabled={isSubmitting}
              {...register('description')}
            />
            <FieldError>{errors.description?.message}</FieldError>
          </Field>

          {!canCreate && (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              Cần có ít nhất một danh mục dịch vụ đang hoạt động trước khi tạo dịch vụ mới.
            </p>
          )}

          <DialogFooter className="px-6" showCloseButton={false}>
            <Button
              type="button"
              variant="outline"
              className={secondaryButtonClassName}
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className={primaryButtonClassName}
              disabled={isSubmitting || !canCreate}
            >
              {isSubmitting ? 'Đang tạo...' : 'Tạo dịch vụ'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FormInput({
  label,
  error,
  ...props
}: ComponentProps<typeof Input> & { label: string; error?: string }) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Input className={cn('h-10 rounded-md bg-white px-3', fieldFocusClassName)} {...props} />
      <FieldError>{error}</FieldError>
    </Field>
  );
}

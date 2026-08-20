import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { AdminStatusSwitch } from '@/components/admin/AdminStatusSwitch';
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
import { MAX_SERVICE_PRICE } from '@/features/admin/services/utils/vnd-currency';
import { cn } from '@/lib/utils';
import type { Service, UpdateServicePayload } from '@/types/service';
import type { ServiceCategory } from '@/types/serviceCategory';

const updateServiceSchema = z.object({
  name: z.string().trim().min(1, 'Vui lòng nhập tên dịch vụ.').max(160),
  description: z.string().trim().max(2000).optional(),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục.'),
  price: z
    .number()
    .int('Giá dịch vụ phải là số nguyên.')
    .min(0, 'Giá dịch vụ phải lớn hơn hoặc bằng 0.')
    .max(MAX_SERVICE_PRICE, 'Giá dịch vụ vượt quá giới hạn cho phép.'),
  estimatedDuration: z.number().int().min(1, 'Thời lượng phải từ 1 phút.'),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof updateServiceSchema>;

const primaryButtonClassName =
  'rounded-md bg-slate-950 text-white hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-500';
const secondaryButtonClassName =
  'rounded-md border-slate-300 bg-white text-slate-900 hover:bg-slate-100';
const fieldFocusClassName =
  'focus:border-slate-700 focus:ring-2 focus:ring-slate-700/10 focus-visible:border-slate-700 focus-visible:ring-slate-700/10';

interface UpdateServiceDialogProps {
  service: Service | null;
  categories: ServiceCategory[];
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: UpdateServicePayload) => Promise<void>;
}

export function UpdateServiceDialog({
  service,
  categories,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: UpdateServiceDialogProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(updateServiceSchema) });

  useEffect(() => {
    if (!service) return;
    reset({
      name: service.name,
      description: service.description ?? '',
      categoryId: service.categoryId._id,
      price: service.price,
      estimatedDuration: service.estimatedDuration,
      isActive: service.isActive,
    });
  }, [reset, service]);

  const categoryOptions = service
    ? categories.some((category) => category._id === service.categoryId._id)
      ? categories
      : [service.categoryId, ...categories]
    : categories;

  return (
    <Dialog open={!!service} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Cập nhật dịch vụ</DialogTitle>
          <DialogDescription>Chỉnh sửa thông tin và trạng thái của dịch vụ.</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-5 px-6 pb-6"
          onSubmit={handleSubmit(async (values) => {
            if (!service) return;

            const selectedCategory = categoryOptions.find(
              (category) => category._id === values.categoryId
            );
            if (values.isActive && !selectedCategory?.isActive) {
              setError('categoryId', {
                message: 'Hãy chọn một danh mục đang hoạt động trước khi kích hoạt dịch vụ.',
              });
              return;
            }

            const payload: UpdateServicePayload = {
              name: values.name,
              description: values.description?.trim() ?? '',
              categoryId: values.categoryId,
              price: values.price,
              estimatedDuration: values.estimatedDuration,
              isActive: values.isActive,
              version: service.version,
            };
            await onSubmit(payload);
          })}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel>Tên dịch vụ</FieldLabel>
              <Input
                className={cn('h-10 rounded-md bg-white px-3', fieldFocusClassName)}
                disabled={isSubmitting}
                {...register('name')}
              />
              <FieldError>{errors.name?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel>Danh mục</FieldLabel>
              <select
                className={cn(
                  'h-10 rounded-md border border-input bg-white px-3 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-100',
                  fieldFocusClassName
                )}
                disabled={isSubmitting}
                {...register('categoryId')}
              >
                {categoryOptions.map((category) => (
                  <option key={category._id} value={category._id} disabled={!category.isActive}>
                    {category.name}
                    {!category.isActive ? ' (đã ẩn)' : ''}
                  </option>
                ))}
              </select>
              <FieldError>{errors.categoryId?.message}</FieldError>
            </Field>
            <Controller
              control={control}
              name="price"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="update-service-price">Giá dịch vụ</FieldLabel>
                  <VndCurrencyInput
                    id="update-service-price"
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
            <Field>
              <FieldLabel>Thời lượng ước tính (phút)</FieldLabel>
              <Input
                type="number"
                min={1}
                className={cn('h-10 rounded-md bg-white px-3', fieldFocusClassName)}
                disabled={isSubmitting}
                {...register('estimatedDuration', { valueAsNumber: true })}
              />
              <FieldError>{errors.estimatedDuration?.message}</FieldError>
            </Field>
          </div>
          <Field>
            <FieldLabel>Mô tả</FieldLabel>
            <textarea
              className={cn(
                'min-h-24 rounded-md border border-input bg-white px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-100',
                fieldFocusClassName
              )}
              disabled={isSubmitting}
              {...register('description')}
            />
            <FieldError>{errors.description?.message}</FieldError>
          </Field>
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <AdminStatusSwitch
                checked={field.value ?? true}
                onCheckedChange={field.onChange}
                disabled={isSubmitting}
              />
            )}
          />
          <DialogFooter showCloseButton={false}>
            <Button
              type="button"
              variant="outline"
              className={secondaryButtonClassName}
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" className={primaryButtonClassName} disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

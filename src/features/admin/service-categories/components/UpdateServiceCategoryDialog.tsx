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
import { cn } from '@/lib/utils';
import type { ServiceCategory, UpdateServiceCategoryPayload } from '@/types/serviceCategory';

const schema = z.object({
  name: z.string().trim().min(1, 'Vui lòng nhập tên danh mục.').max(120),
  description: z.string().trim().max(1000).optional(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const primaryButtonClassName =
  'rounded-md bg-slate-950 text-white hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-500';
const secondaryButtonClassName =
  'rounded-md border-slate-300 bg-white text-slate-900 hover:bg-slate-100';
const fieldFocusClassName =
  'focus:border-slate-700 focus:ring-2 focus:ring-slate-700/10 focus-visible:border-slate-700 focus-visible:ring-slate-700/10';

export function UpdateServiceCategoryDialog({
  category,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: {
  category: ServiceCategory | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: UpdateServiceCategoryPayload) => Promise<void>;
}) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!category) return;
    reset({
      name: category.name,
      description: category.description ?? '',
      isActive: category.isActive,
    });
  }, [category, reset]);

  return (
    <Dialog open={!!category} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Cập nhật danh mục dịch vụ</DialogTitle>
          <DialogDescription>Chỉnh sửa thông tin và trạng thái của danh mục.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-5 px-6 pb-6" onSubmit={handleSubmit(onSubmit)}>
          <Field>
            <FieldLabel>Tên danh mục</FieldLabel>
            <Input
              className={cn('h-10 rounded-md bg-white px-3', fieldFocusClassName)}
              disabled={isSubmitting}
              {...register('name')}
            />
            <FieldError>{errors.name?.message}</FieldError>
          </Field>
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

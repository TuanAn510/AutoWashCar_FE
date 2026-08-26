import type { ComponentProps } from 'react';
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
import type { CreateServiceCategoryPayload } from '@/types/serviceCategory';

const createServiceCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập tên danh mục.')
    .max(120, 'Tên danh mục không được vượt quá 120 ký tự.'),
  description: z.string().trim().max(1000, 'Mô tả không được vượt quá 1000 ký tự.').optional(),
});

type CreateServiceCategoryFormValues = z.infer<typeof createServiceCategorySchema>;

const primaryButtonClassName =
  'rounded-md bg-slate-950 text-white hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-500';
const secondaryButtonClassName =
  'rounded-md border-slate-300 bg-white text-slate-900 hover:bg-slate-100';
const fieldFocusClassName =
  'focus:border-slate-700 focus:ring-2 focus:ring-slate-700/10 focus-visible:border-slate-700 focus-visible:ring-slate-700/10';

const defaultValues: CreateServiceCategoryFormValues = {
  name: '',
  description: '',
};

interface CreateServiceCategoryModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateServiceCategoryPayload) => void;
}

export function CreateServiceCategoryModal({
  isOpen,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: CreateServiceCategoryModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateServiceCategoryFormValues>({
    resolver: zodResolver(createServiceCategorySchema),
    defaultValues,
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    reset(defaultValues);
  }, [isOpen, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Tạo danh mục dịch vụ mới</DialogTitle>
          <DialogDescription>
            Thêm danh mục mới cho hệ thống. Tên danh mục là duy nhất và không phân biệt hoa thường.
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-5 px-6 pb-6"
          onSubmit={handleSubmit((values) =>
            onSubmit({
              name: values.name.trim(),
              description: values.description?.trim() || undefined,
            })
          )}
        >
          <FormInput
            label="Tên danh mục"
            error={errors.name?.message}
            disabled={isSubmitting}
            {...register('name')}
          />

          <Field>
            <FieldLabel>Mô tả</FieldLabel>
            <textarea
              className={cn(
                'min-h-24 rounded-md border border-input bg-white px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-100',
                fieldFocusClassName
              )}
              placeholder="Ví dụ: Các dịch vụ rửa xe cơ bản và nâng cao."
              disabled={isSubmitting}
              {...register('description')}
            />
            <FieldError>{errors.description?.message}</FieldError>
          </Field>

          <DialogFooter className="px-6" showCloseButton={false}>
            <Button
              type="button"
              variant="outline"
              className={secondaryButtonClassName}
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" className={primaryButtonClassName} disabled={isSubmitting}>
              {isSubmitting ? 'Đang tạo...' : 'Tạo danh mục'}
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

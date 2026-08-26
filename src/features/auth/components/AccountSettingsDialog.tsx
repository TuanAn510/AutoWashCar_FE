import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateProfileMutation } from '@/features/auth/hooks/use-auth-mutations';
import type { User } from '@/types/user';

const roleLabels: Record<NonNullable<User['role']>, string> = {
  admin: 'Quản trị viên',
  staff: 'Nhân viên',
  customer: 'Khách hàng',
};

const schema = z
  .object({
    displayName: z.string().min(1, 'TÃªn hiá»ƒn thá»‹ khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng'),
    current_password: z.string().optional(),
    new_password: z.string().optional(),
    confirm_password: z.string().optional(),
  })
  .refine(
    (data) => {
      const current = data.current_password?.trim();
      const newPass = data.new_password?.trim();
      const confirm = data.confirm_password?.trim();
      const hasAnyPassword = !!current || !!newPass || !!confirm;

      if (!hasAnyPassword) return true;
      return !!current && !!newPass && !!confirm;
    },
    {
      path: ['current_password'],
      message: 'Vui lÃ²ng nháº­p Ä‘áº§y Ä‘á»§ thÃ´ng tin Ä‘á»•i máº­t kháº©u',
    }
  )
  .refine(
    (data) => {
      const newPass = data.new_password?.trim();
      const confirm = data.confirm_password?.trim();

      if (!newPass && !confirm) return true;
      return newPass === confirm;
    },
    {
      path: ['confirm_password'],
      message: 'Máº­t kháº©u xÃ¡c nháº­n khÃ´ng khá»›p',
    }
  );

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export function AccountSettingsDialog({ open, onOpenChange, user }: Readonly<Props>) {
  const updateProfileMutation = useUpdateProfileMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const name = user.displayName || user.phone;
  const fallback = name.slice(0, 2).toUpperCase();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: user.displayName || '',
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        displayName: user.displayName || '',
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    }
  }, [open, reset, user.displayName]);

  const handleClose = () => {
    setIsEditing(false);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    reset({
      displayName: user.displayName || '',
      current_password: '',
      new_password: '',
      confirm_password: '',
    });
    onOpenChange(false);
  };

  const onSubmit = async (data: FormValues) => {
    const payload: {
      displayName: string;
      current_password?: string;
      new_password?: string;
    } = {
      displayName: data.displayName,
    };

    if (data.current_password?.trim() && data.new_password?.trim()) {
      payload.current_password = data.current_password;
      payload.new_password = data.new_password;
    }

    await updateProfileMutation.mutateAsync(payload);
    setIsEditing(false);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    reset({
      displayName: data.displayName,
      current_password: '',
      new_password: '',
      confirm_password: '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          handleClose();
          return;
        }

        onOpenChange(value);
      }}
    >
      <DialogContent className="w-[calc(100vw-1rem)] max-w-4xl gap-0 overflow-hidden p-0 sm:w-[calc(100vw-2rem)]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="max-h-[calc(100vh-1rem)] overflow-y-auto sm:max-h-[calc(100vh-2rem)]"
        >
          <DialogHeader className="px-4 pt-5 sm:px-6 sm:pt-6">
            <DialogTitle>Thông tin tài khoản</DialogTitle>
            <DialogDescription>Xem và cập nhật thông tin cá nhân</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 px-4 pb-4 pt-5 sm:px-6 sm:pb-6">
            <div className="rounded-xl border p-4 sm:p-6">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatarUrl} alt={name} />
                  <AvatarFallback>{fallback}</AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{name}</h3>
                  <p className="truncate text-sm text-muted-foreground">{user.phone}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="TÃªn hiá»ƒn thá»‹"
                  error={errors.displayName?.message}
                  input={<Input {...register('displayName')} disabled={!isEditing} />}
                />
                <FormField
                  label="Vai trÃ²"
                  input={<Input value={roleLabels[user.role ?? 'customer']} disabled />}
                />
                <FormField
                  label="NgÃ y táº¡o tÃ i khoáº£n"
                  input={
                    <Input
                      value={
                        user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : ''
                      }
                      disabled
                    />
                  }
                />
              </div>
            </div>

            {isEditing && (
              <div className="rounded-xl border p-4 sm:p-6">
                <h3 className="mb-4 font-semibold">Äá»•i máº­t kháº©u (TÃ¹y chá»n)</h3>

                <div className="space-y-4">
                  <PasswordInput
                    label="Máº­t kháº©u hiá»‡n táº¡i"
                    visible={showCurrentPassword}
                    setVisible={setShowCurrentPassword}
                    register={register('current_password')}
                    error={errors.current_password?.message}
                  />
                  <PasswordInput
                    label="Máº­t kháº©u má»›i"
                    visible={showNewPassword}
                    setVisible={setShowNewPassword}
                    register={register('new_password')}
                    error={errors.new_password?.message}
                  />
                  <PasswordInput
                    label="XÃ¡c nháº­n máº­t kháº©u má»›i"
                    visible={showConfirmPassword}
                    setVisible={setShowConfirmPassword}
                    register={register('confirm_password')}
                    error={errors.confirm_password?.message}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      reset();
                    }}
                  >
                    Há»§y
                  </Button>
                  <Button type="submit" disabled={isSubmitting || updateProfileMutation.isPending}>
                    LÆ°u thay Ä‘á»•i
                  </Button>
                </>
              ) : (
                <Button type="button" onClick={() => setIsEditing(true)}>
                  Cáº­p nháº­t
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FormField({
  label,
  input,
  error,
}: {
  label: string;
  input: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="min-w-0">
      <Label>{label}</Label>
      {input}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

function PasswordInput({
  label,
  visible,
  setVisible,
  register,
  error,
}: {
  label: string;
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  register: UseFormRegisterReturn;
  error?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="relative">
        <Input type={visible ? 'text' : 'password'} {...register} />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

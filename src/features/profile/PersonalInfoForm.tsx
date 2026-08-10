import { useEffect } from 'react';
import { UserRound } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateProfileMutation } from '@/features/auth/hooks/use-auth-mutations';
import { formatDate } from '@/lib/utils';
import type { User } from '@/types/user';

interface PersonalInfoFormProps {
  user: User;
}

interface FormValues {
  displayName: string;
}

const roleLabels: Record<NonNullable<User['role']>, string> = {
  admin: 'Quản trị viên',
  staff: 'Nhân viên',
  customer: 'Khách hàng',
};

export default function PersonalInfoForm({ user }: PersonalInfoFormProps) {
  const updateProfileMutation = useUpdateProfileMutation();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      displayName: user.displayName ?? '',
    },
  });

  useEffect(() => {
    reset({ displayName: user.displayName ?? '' });
  }, [reset, user.displayName]);

  const displayName = useWatch({ control, name: 'displayName' });
  const hasChanges = displayName.trim() !== (user.displayName ?? '');

  const onSubmit = async (values: FormValues) => {
    if (!hasChanges) return;

    await updateProfileMutation.mutateAsync({
      displayName: values.displayName.trim(),
    });
  };

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-950">
          <UserRound className="size-5 text-slate-500" />
          Thông tin tài khoản
        </CardTitle>
        <CardDescription>Cập nhật thông tin định danh và trạng thái tài khoản.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Tên hiển thị">
              <Input {...register('displayName')} placeholder="Nhập tên hiển thị" />
            </FormField>
            <FormField label="Số điện thoại">
              <Input value={user.phone} disabled />
            </FormField>
            <FormField label="Vai trò">
              <Input value={roleLabels[user.role ?? 'customer']} disabled />
            </FormField>
            <FormField label="Trạng thái">
              <Input value={user.isActive === false ? 'Tạm khóa' : 'Đang hoạt động'} disabled />
            </FormField>
            <FormField label="Ngày tạo tài khoản">
              <Input
                value={user.createdAt ? formatDate(user.createdAt) : 'Chưa có dữ liệu'}
                disabled
              />
            </FormField>
          </div>

          <Button
            type="submit"
            disabled={!hasChanges || isSubmitting || updateProfileMutation.isPending}
          >
            Lưu thay đổi
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

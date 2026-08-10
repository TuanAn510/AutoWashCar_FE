import { useRef, type ChangeEvent } from 'react';
import { Camera } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUpdateProfileMutation } from '@/features/auth/hooks/use-auth-mutations';
import type { User } from '@/types/user';

interface ProfileCardProps {
  user: User;
}

const roleLabels: Record<NonNullable<User['role']>, string> = {
  admin: 'Quản trị viên',
  staff: 'Nhân viên',
  customer: 'Khách hàng',
};

export default function ProfileCard({ user }: ProfileCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateProfileMutation = useUpdateProfileMutation();
  const name = user.displayName || user.phone;
  const fallback = name.slice(0, 2).toUpperCase();
  const isActive = user.isActive !== false;

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    await updateProfileMutation.mutateAsync({ file });
    event.target.value = '';
  };

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="relative min-h-48 bg-linear-to-r from-slate-950 via-slate-800 to-slate-700 p-5 sm:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_34%)]" />
        <div className="relative flex min-h-36 flex-col justify-end gap-5 sm:flex-row sm:items-end">
          <div className="relative shrink-0">
            <Avatar className="size-24 border-4 border-white shadow-lg">
              <AvatarImage src={user.avatarUrl} alt={name} />
              <AvatarFallback className="text-xl font-semibold">{fallback}</AvatarFallback>
            </Avatar>
            <Button
              type="button"
              size="icon-sm"
              variant="secondary"
              className="absolute -bottom-2 -right-2 rounded-full shadow-md"
              disabled={updateProfileMutation.isPending}
              title="Cập nhật ảnh đại diện"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="size-4" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="min-w-0 flex-1 text-white">
            <h2 className="truncate text-2xl font-semibold">{name}</h2>
            <p className="mt-2 text-sm text-white/70">{roleLabels[user.role ?? 'customer']}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge className="border-white/20 bg-white text-emerald-700">
                <span className="size-2 rounded-full bg-emerald-500" />
                {isActive ? 'Đang hoạt động' : 'Tạm khóa'}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

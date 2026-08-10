import { Bell, KeyRound, Shield, ShieldBan, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacySettings() {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-950">
          <Shield className="size-5 text-slate-500" />
          Quyền riêng tư & bảo mật
        </CardTitle>
        <CardDescription>Quản lý các tác vụ bảo mật dành cho tài khoản.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3">
          <SecurityButton icon={KeyRound}>Đổi mật khẩu</SecurityButton>
          <SecurityButton icon={Bell}>Cài đặt thông báo</SecurityButton>
          <SecurityButton icon={ShieldBan}>Chặn & báo cáo</SecurityButton>
        </div>

        <div className="border-t border-slate-200 pt-5">
          <p className="mb-3 text-sm font-semibold text-rose-600">Khu vực nguy hiểm</p>
          <Button
            type="button"
            variant="outline"
            className="w-full border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800"
          >
            <Trash2 className="size-4" />
            Xoá tài khoản
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SecurityButton({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Button type="button" variant="outline" className="h-11 justify-start rounded-lg bg-white">
      <Icon className="size-4 text-slate-500" />
      {children}
    </Button>
  );
}

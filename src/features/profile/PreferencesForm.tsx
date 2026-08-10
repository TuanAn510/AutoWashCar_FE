import { MonitorCog, Moon, Sun } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function PreferencesForm() {
  const [darkMode, setDarkMode] = useState(false);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-950">
          <MonitorCog className="size-5 text-slate-500" />
          Cấu hình hiển thị
        </CardTitle>
        <CardDescription>Tuỳ chỉnh các thiết lập trải nghiệm trong ứng dụng.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <SettingRow
          label="Chế độ tối"
          description="Chuyển đổi giữa giao diện sáng và tối."
          control={
            <div className="flex items-center gap-2 text-slate-500">
              <Sun className="size-4" />
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              <Moon className="size-4" />
            </div>
          }
        />
        <SettingRow
          label="Hiển thị trạng thái online"
          description="Cho phép người khác thấy khi tài khoản đang hoạt động."
          control={<Switch checked={showOnlineStatus} onCheckedChange={setShowOnlineStatus} />}
        />
      </CardContent>
    </Card>
  );
}

function SettingRow({
  label,
  description,
  control,
}: {
  label: string;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="min-w-0">
        <Label className="text-sm font-semibold text-slate-900">{label}</Label>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

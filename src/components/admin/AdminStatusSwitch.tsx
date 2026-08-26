import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

type AdminStatusSwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  activeText?: string;
  inactiveText?: string;
  className?: string;
  switchClassName?: string;
};

export function AdminStatusSwitch({
  checked,
  onCheckedChange,
  disabled,
  label = 'Trạng thái',
  activeText = 'Đang hoạt động',
  inactiveText = 'Tạm ẩn',
  className,
  switchClassName,
}: AdminStatusSwitchProps) {
  return (
    <div className={cn('flex items-center justify-between rounded-lg border p-3', className)}>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="mt-1 text-xs text-slate-500">{checked ? activeText : inactiveText}</p>
      </div>

      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={switchClassName}
      />
    </div>
  );
}

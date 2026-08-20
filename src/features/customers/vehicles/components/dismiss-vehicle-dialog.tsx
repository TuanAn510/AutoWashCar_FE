import { Button } from '@/components/ui/button';
import { CustomerModalShell } from '@/features/customers/components/CustomerModalShell';
import { formatLicensePlateDisplay } from '@/features/customers/vehicles/utils/license-plate';
import { type ApiVehicle } from '@/types/vehicle';

interface DismissVehicleDialogProps {
  open: boolean;
  vehicle?: ApiVehicle | null;
  isDismissing: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
}

export function DismissVehicleDialog({
  open,
  vehicle,
  isDismissing,
  onOpenChange,
  onConfirm,
}: DismissVehicleDialogProps) {
  return (
    <CustomerModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="Ẩn xe này khỏi danh sách?"
      description={
        vehicle
          ? `Xe ${vehicle.brand} ${vehicle.model} - ${formatLicensePlateDisplay(vehicle.licensePlate)} sẽ không còn hiển thị trong tab "Đã khóa". Bạn có chắc muốn tiếp tục?`
          : 'Xe sẽ không còn hiển thị trong tab "Đã khóa". Bạn có chắc muốn tiếp tục?'
      }
      contentClassName="max-w-[720px]"
      bodyClassName="space-y-4"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-36"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="w-full sm:w-36"
            disabled={isDismissing}
            onClick={onConfirm}
          >
            {isDismissing ? 'Đang ẩn...' : 'Ẩn xe'}
          </Button>
        </>
      }
    >
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
        Xe sẽ không còn hiển thị trong danh sách "Đã khóa" của bạn. Lịch sử lịch hẹn và dữ liệu vẫn
        được hệ thống lưu giữ — bạn chỉ đang dọn bớt các mục đã khóa cho gọn màn hình.
      </div>
    </CustomerModalShell>
  );
}

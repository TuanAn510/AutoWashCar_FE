import { Button } from '@/components/ui/button';
import { CustomerModalShell } from '@/features/customers/components/CustomerModalShell';
import { type ApiVehicle } from '@/types/vehicle';

interface DeleteVehicleDialogProps {
  open: boolean;
  vehicle?: ApiVehicle | null;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
}

export function DeleteVehicleDialog({
  open,
  vehicle,
  isDeleting,
  onOpenChange,
  onConfirm,
}: DeleteVehicleDialogProps) {
  return (
    <CustomerModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="Xóa xe này?"
      description={
        vehicle
          ? `Xe ${vehicle.brand} ${vehicle.model} - ${vehicle.licensePlate} sẽ được xóa khỏi danh sách ô tô của bạn. Bạn có chắc muốn tiếp tục?`
          : 'Xe sẽ được xóa khỏi danh sách ô tô của bạn. Bạn có chắc muốn tiếp tục?'
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
            disabled={isDeleting}
            onClick={onConfirm}
          >
            {isDeleting ? 'Đang xóa...' : 'Xóa xe'}
          </Button>
        </>
      }
    >
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
        Xe sẽ không còn xuất hiện trong danh sách của bạn. Tuy nhiên, hệ thống vẫn lưu thông tin cần
        thiết để bạn có thể tra cứu lịch sử dịch vụ sau này.
      </div>
    </CustomerModalShell>
  );
}

import { Calendar, CarFront, ImageIcon, Tag } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CustomerEmptyState } from '@/features/customers/components/CustomerEmptyState';
import { CustomerModalShell } from '@/features/customers/components/CustomerModalShell';
import { resolveImageUrl } from '@/lib/image-url';
import { type ApiVehicle } from '@/types/vehicle';
import { formatLicensePlateDisplay } from '@/features/customers/vehicles/utils/license-plate';

const carTypeLabels: Record<string, string> = {
  sedan: 'Sedan',
  suv: 'SUV',
  pickup: 'Bán tải',
};

interface VehicleDetailDialogProps {
  open: boolean;
  vehicle?: ApiVehicle | null;
  onOpenChange: (open: boolean) => void;
}

export function VehicleDetailDialog({ open, vehicle, onOpenChange }: VehicleDetailDialogProps) {
  if (!vehicle) {
    return null;
  }

  return (
    <CustomerModalShell
      open={open}
      onOpenChange={onOpenChange}
      contentClassName="max-w-[1120px] sm:max-w-[1120px]"
      title={
        <>
          {vehicle.brand} {vehicle.model}
        </>
      }
      description="Chi tiết ô tô bạn đang sử dụng để đặt lịch dịch vụ."
      bodyClassName="grid gap-6"
      footer={
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-36"
          onClick={() => onOpenChange(false)}
        >
          Đóng
        </Button>
      }
    >
      <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <DetailTile icon={CarFront} label="Hãng xe" value={vehicle.brand} />
          <DetailTile icon={CarFront} label="Dòng xe" value={vehicle.model} />
          <DetailTile icon={Tag} label="Biển số xe" value={formatLicensePlateDisplay(vehicle.licensePlate)} />
          <DetailTile icon={Calendar} label="Năm sản xuất" value={String(vehicle.year)} />
          <DetailTile
            icon={CarFront}
            label="Loại xe"
            value={carTypeLabels[vehicle.carType] ?? vehicle.carType}
          />
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <ImageIcon className="size-4" />
          Hình ảnh xe
          <Badge variant="neutral" className="ml-auto rounded-full">
            {vehicle.images?.length ?? 0} ảnh
          </Badge>
        </div>
        {vehicle.images?.length ? (
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {vehicle.images.map((image) => (
              <div key={image.id} className="overflow-hidden rounded-2xl border border-slate-200">
                <img
                  src={resolveImageUrl(image.url)}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="aspect-[4/3] w-full object-cover transition duration-300 hover:scale-[1.02]"
                />
              </div>
            ))}
          </div>
        ) : (
          <CustomerEmptyState
            className="mt-4 bg-slate-50 py-8 shadow-none"
            icon={<ImageIcon />}
            title="Xe chưa có hình ảnh"
            description="Bạn có thể bổ sung ảnh khi chỉnh sửa thông tin xe."
          />
        )}
      </section>
    </CustomerModalShell>
  );
}

function DetailTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
        <Icon className="size-4" />
        {label}
      </div>
      <p className="mt-2 break-words text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

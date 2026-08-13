import { Calendar, CarFront, Eye, ImageIcon, Pencil, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { resolveImageUrl } from '@/lib/image-url';
import { type ApiVehicle } from '@/types/vehicle';

const carTypeLabels: Record<string, string> = {
  sedan: 'Sedan',
  suv: 'SUV',
  pickup: 'Bán tải',
};

interface VehicleCardProps {
  vehicle: ApiVehicle;
  onView: (vehicle: ApiVehicle) => void;
  onEdit: (vehicle: ApiVehicle) => void;
  onDelete: (vehicle: ApiVehicle) => void;
}

export function VehicleCard({ vehicle, onView, onEdit, onDelete }: VehicleCardProps) {
  const coverImage = vehicle.images?.[0]?.url;
  const vehicleName = [vehicle.brand, vehicle.model, vehicle.year].filter(Boolean).join(' ');

  return (
    <Card
      size="sm"
      className="h-full min-w-0 gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white py-0 shadow-sm ring-0 transition-shadow hover:shadow-md"
    >
      <div className="aspect-video overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-200">
        {coverImage ? (
          <img src={resolveImageUrl(coverImage)} alt={vehicleName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            <CarFront className="size-12" />
          </div>
        )}
      </div>

      <CardHeader className="gap-3 px-4 pt-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <CardTitle
              className="truncate text-base font-semibold text-slate-950"
              title={vehicleName}
            >
              {vehicleName}
            </CardTitle>
            <Badge variant="outline" className="mt-1.5 rounded-full text-xs">
              {carTypeLabels[vehicle.carType] ?? vehicle.carType}
            </Badge>
          </div>
          <Badge variant="neutral" className="rounded-full px-2.5 py-1 font-semibold">
            {vehicle.licensePlate}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 px-4 py-4">
        <div className="grid grid-cols-2 gap-2">
          <InfoTile label="Năm sản xuất" value={String(vehicle.year)} icon={Calendar} />
          <InfoTile
            label="Hình ảnh"
            value={`${vehicle.images?.length ?? 0} ảnh`}
            icon={ImageIcon}
          />
        </div>
      </CardContent>

      <CardFooter className="grid grid-cols-3 gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3">
        <Button variant="outline" className="rounded-xl" onClick={() => onView(vehicle)}>
          <Eye className="size-4" />
          Xem
        </Button>
        <Button variant="outline" className="rounded-xl" onClick={() => onEdit(vehicle)}>
          <Pencil className="size-4" />
          Sửa
        </Button>
        <Button variant="destructive" className="rounded-xl" onClick={() => onDelete(vehicle)}>
          <Trash2 className="size-4" />
          Xóa
        </Button>
      </CardFooter>
    </Card>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-slate-50 px-3 py-2.5">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Icon className="size-4 shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-1 truncate text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

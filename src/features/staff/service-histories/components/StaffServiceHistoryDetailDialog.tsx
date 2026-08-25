import { CalendarClock, CarFront, Clock3, NotebookPen, UserRound, Wrench } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CustomerModalShell } from '@/features/customers/components/CustomerModalShell';
import type { ServiceHistoryItem } from '@/types/serviceHistory';
import { formatServiceHistoryDate, formatServiceHistoryPrice, formatTime } from '@/lib/utils';
import { formatLicensePlateDisplay } from '@/features/customers/vehicles/utils/license-plate';

export function StaffServiceHistoryDetailDialog({
  serviceHistory,
  open,
  onOpenChange,
}: {
  serviceHistory: ServiceHistoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!serviceHistory) {
    return null;
  }

  return (
    <CustomerModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="Chi tiết lịch sử dịch vụ"
      description="Xem lại các dịch vụ bạn đã hoàn thành cho khách hàng."
      contentClassName="max-w-[920px]"
      bodyClassName="grid gap-6"
      footer={
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Đóng
        </Button>
      }
    >
      <section className="grid gap-4 md:grid-cols-2">
        <DetailTile
          icon={UserRound}
          label="Khách hàng"
          value={serviceHistory.customerId.displayName}
          subValue={serviceHistory.customerId.phone}
        />
        <DetailTile
          icon={CarFront}
          label="Xe"
          value={`${serviceHistory.vehicleId.brand} ${serviceHistory.vehicleId.model}`}
          subValue={formatLicensePlateDisplay(serviceHistory.vehicleId.licensePlate)}
        />
        <DetailTile
          icon={CalendarClock}
          label="Hoàn thành"
          value={formatServiceHistoryDate(serviceHistory.servicedAt)}
        />
        <DetailTile
          icon={Wrench}
          label="Tổng tiền"
          value={formatServiceHistoryPrice(serviceHistory.totalPrice)}
        />
      </section>

      <section className="rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
          Dịch vụ đã xử lý
        </h3>
        <div className="mt-4 space-y-3">
          {serviceHistory.services.map((service) => (
            <div
              key={service.serviceId}
              className="flex flex-col gap-2 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-slate-900">{service.nameSnapshot}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatTime(service.estimatedDurationSnapshot)}
                </p>
              </div>
              <p className="text-sm font-semibold text-slate-900">
                {formatServiceHistoryPrice(service.priceSnapshot)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <DetailTile
          icon={Clock3}
          label="Tổng thời lượng"
          value={formatTime(serviceHistory.totalEstimatedDuration)}
        />
      </section>

      <section className="rounded-2xl bg-slate-50 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <NotebookPen className="size-4" />
          Ghi chú / kết quả
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {serviceHistory.note?.trim() || 'Chưa có ghi chú cho lịch sử dịch vụ này.'}
        </p>
      </section>
    </CustomerModalShell>
  );
}

function DetailTile({
  icon: Icon,
  label,
  value,
  subValue,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
        <Icon className="size-4" />
        {label}
      </div>
      <p className="mt-2 break-words text-sm font-semibold text-slate-900">{value}</p>
      {subValue ? <p className="mt-1 text-sm text-slate-500">{subValue}</p> : null}
    </div>
  );
}

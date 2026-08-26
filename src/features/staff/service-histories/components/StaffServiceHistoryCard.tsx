import { CalendarClock, CarFront, Eye, UserRound, Wrench } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatLicensePlateDisplay } from '@/features/customers/vehicles/utils/license-plate';
import type { ServiceHistoryItem } from '@/types/serviceHistory';
import {
  formatServiceHistoryDate,
  formatServiceHistoryPrice,
  getServiceHistoryTitle,
} from '@/lib/utils';

export function StaffServiceHistoryCard({
  serviceHistory,
  onViewDetail,
}: {
  serviceHistory: ServiceHistoryItem;
  onViewDetail: (serviceHistory: ServiceHistoryItem) => void;
}) {
  const serviceNames = serviceHistory.services.map((service) => service.nameSnapshot);

  return (
    <article className="flex h-full flex-col rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Công việc đã hoàn thành
          </p>
          <h3 className="mt-3 text-xl font-semibold leading-tight text-slate-950">
            {serviceHistory.customerId.displayName}
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            {formatLicensePlateDisplay(serviceHistory.vehicleId.licensePlate)} ·{' '}
            {getServiceHistoryTitle(serviceNames)}
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
          Hoàn thành
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <InfoTile icon={Wrench} label="Dịch vụ" value={serviceNames.join(', ')} />
        <InfoTile
          icon={CalendarClock}
          label="Hoàn thành"
          value={formatServiceHistoryDate(serviceHistory.servicedAt)}
        />
        <InfoTile
          icon={CarFront}
          label="Xe"
          value={`${serviceHistory.vehicleId.brand} ${serviceHistory.vehicleId.model}`}
        />
        <InfoTile
          icon={UserRound}
          label="Tổng tiền"
          value={formatServiceHistoryPrice(serviceHistory.totalPrice)}
        />
      </div>

      {serviceHistory.note?.trim() ? (
        <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          {serviceHistory.note}
        </div>
      ) : null}

      <div className="mt-auto pt-5">
        <Button
          variant="outline"
          className="h-11 w-full rounded-xl sm:w-auto"
          onClick={() => onViewDetail(serviceHistory)}
        >
          <Eye className="size-4" />
          Xem chi tiết
        </Button>
      </div>
    </article>
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
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
        <Icon className="size-4" />
        {label}
      </div>
      <p className="mt-2 break-words text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

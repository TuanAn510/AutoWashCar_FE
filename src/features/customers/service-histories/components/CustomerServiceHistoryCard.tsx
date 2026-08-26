import { CalendarClock, Eye, NotebookPen, UserRound, Wrench } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  formatServiceHistoryVehicleLine,
  getServiceHistoryNote,
} from '@/features/customers/service-histories/utils/serviceHistoryDisplay';
import type { ServiceHistoryItem } from '@/types/serviceHistory';
import {
  formatServiceHistoryDate,
  formatServiceHistoryPrice,
  getServiceHistoryTitle,
} from '@/lib/utils';

export function CustomerServiceHistoryCard({
  serviceHistory,
  onViewDetail,
}: {
  serviceHistory: ServiceHistoryItem;
  onViewDetail: (serviceHistory: ServiceHistoryItem) => void;
}) {
  const serviceNames = serviceHistory.services.map((service) => service.nameSnapshot);
  const vehicleLine = formatServiceHistoryVehicleLine(serviceHistory);

  return (
    <article className="flex h-full min-w-0 flex-col rounded-xl border border-[#e5edf6] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[#0b67c2]">
            Lịch sử dịch vụ
          </p>
          <h3 className="mt-2 line-clamp-2 text-lg font-black leading-tight text-[#15243a]">
            {getServiceHistoryTitle(serviceNames)}
          </h3>
          <p className="mt-2 truncate text-sm text-[#64748b]">{vehicleLine}</p>
        </div>

        <span className="shrink-0 rounded-md bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-200">
          Hoàn tất
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <InfoTile
          icon={CalendarClock}
          label="Thời gian hoàn thành"
          value={formatServiceHistoryDate(serviceHistory.servicedAt)}
        />
        <InfoTile
          icon={UserRound}
          label="Nhân viên xử lý"
          value={serviceHistory.handledBy?.displayName || 'Chưa có thông tin'}
        />
        <InfoTile
          icon={Wrench}
          label="Tổng tiền"
          value={formatServiceHistoryPrice(serviceHistory.totalPrice)}
        />
        <InfoTile
          icon={NotebookPen}
          label="Ghi chú"
          value={getServiceHistoryNote(serviceHistory.note)}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-sm text-[#64748b]">
        <span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-black">
          {serviceHistory.services.length} dịch vụ
        </span>
        {serviceHistory.nextMaintenanceDate ? (
          <span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-black">
            Bảo dưỡng tiếp theo: {formatServiceHistoryDate(serviceHistory.nextMaintenanceDate)}
          </span>
        ) : null}
      </div>

      <div className="mt-auto flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 text-sm text-[#64748b]">
          <span className="font-black text-[#15243a]">Tổng tiền:</span>{' '}
          {formatServiceHistoryPrice(serviceHistory.totalPrice)}
        </div>
        <Button
          variant="outline"
          className="h-[42px] w-full shrink-0 rounded-md border-[#d8e2ef] font-semibold sm:w-auto"
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
    <div className="min-w-0 rounded-lg bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#64748b]">
        <Icon className="size-4 shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-black leading-6 text-[#15243a]">{value}</p>
    </div>
  );
}

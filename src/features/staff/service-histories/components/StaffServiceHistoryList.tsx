import { Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  formatServiceHistoryDateOnly,
  formatServiceHistoryPrice,
  getServiceHistoryTitle,
} from '@/lib/utils';
import type { ServiceHistoryItem } from '@/types/serviceHistory';

export function StaffServiceHistoryList({
  serviceHistories,
  onViewDetail,
}: {
  serviceHistories: ServiceHistoryItem[];
  onViewDetail: (serviceHistory: ServiceHistoryItem) => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="w-full max-w-full overflow-x-auto">
        <table className="w-full min-w-[940px] table-fixed border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-900">
              <th className="w-[190px] px-3 py-4 font-semibold">Khách hàng</th>
              <th className="w-[180px] px-3 py-4 font-semibold">Xe</th>
              <th className="w-[240px] px-3 py-4 font-semibold">Dịch vụ</th>
              <th className="w-[140px] px-3 py-4 font-semibold">Hoàn thành</th>
              <th className="w-[130px] px-3 py-4 font-semibold">Tổng tiền</th>
              <th className="w-[120px] px-3 py-4 font-semibold">Trạng thái</th>
              <th className="w-[110px] px-3 py-4 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {serviceHistories.map((serviceHistory) => {
              const vehicleName = `${serviceHistory.vehicleId.brand} ${serviceHistory.vehicleId.model}`;
              const serviceTitle = getServiceHistoryTitle(
                serviceHistory.services.map((service) => service.nameSnapshot)
              );

              return (
                <tr
                  key={serviceHistory._id}
                  className="border-b border-slate-100 align-top transition-colors hover:bg-slate-50/70 last:border-0"
                >
                  <td className="px-3 py-4">
                    <p
                      className="truncate font-semibold text-slate-950"
                      title={serviceHistory.customerId.displayName}
                    >
                      {serviceHistory.customerId.displayName}
                    </p>
                    <p className="mt-1 truncate text-slate-500">
                      {serviceHistory.customerId.phone || '—'}
                    </p>
                  </td>
                  <td className="px-3 py-4">
                    <p className="truncate font-semibold text-slate-900" title={vehicleName}>
                      {vehicleName}
                    </p>
                    <p className="mt-1 truncate text-slate-500">
                      {serviceHistory.vehicleId.licensePlate}
                    </p>
                  </td>
                  <td className="px-3 py-4">
                    <p className="line-clamp-2 text-slate-700" title={serviceTitle}>
                      {serviceTitle}
                    </p>
                  </td>
                  <td className="px-3 py-4 text-slate-700">
                    {formatServiceHistoryDateOnly(serviceHistory.servicedAt)}
                  </td>
                  <td className="px-3 py-4 font-semibold text-slate-950">
                    {formatServiceHistoryPrice(serviceHistory.totalPrice)}
                  </td>
                  <td className="px-3 py-4">
                    <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                      Hoàn thành
                    </span>
                  </td>
                  <td className="px-3 py-4 text-right">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="rounded-lg"
                      onClick={() => onViewDetail(serviceHistory)}
                    >
                      <Eye className="size-4" />
                      Chi tiết
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

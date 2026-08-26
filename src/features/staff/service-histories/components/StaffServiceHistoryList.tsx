import { ArrowDown, ArrowUp, ArrowUpDown, Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  formatServiceHistoryDateOnly,
  formatServiceHistoryPrice,
  getServiceHistoryTitle,
} from '@/lib/utils';
import type { AppointmentStatus } from '@/types/appointment';
import type { ServiceHistoryItem } from '@/types/serviceHistory';
import { formatLicensePlateDisplay } from '@/features/customers/vehicles/utils/license-plate';

export type DateSort = 'asc' | 'desc';

const getServiceDate = (serviceHistory: ServiceHistoryItem): string =>
  serviceHistory.appointmentId.completedAt ?? serviceHistory.servicedAt;

const statusMeta: Record<AppointmentStatus, { label: string; className: string }> = {
  pending: {
    label: 'Chờ xác nhận',
    className: 'bg-amber-50 text-amber-700 ring-amber-200',
  },
  confirmed: {
    label: 'Đã xác nhận',
    className: 'bg-sky-50 text-sky-700 ring-sky-200',
  },
  in_queue: {
    label: 'Đã check-in',
    className: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
  },
  in_progress: {
    label: 'Đang thực hiện',
    className: 'bg-blue-50 text-blue-700 ring-blue-200',
  },
  completed: {
    label: 'Hoàn thành',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  cancelled: {
    label: 'Đã hủy',
    className: 'bg-rose-50 text-rose-700 ring-rose-200',
  },
};

export function StaffServiceHistoryList({
  serviceHistories,
  onViewDetail,
  dateSort = 'desc',
  onDateSortToggle,
}: {
  serviceHistories: ServiceHistoryItem[];
  onViewDetail: (serviceHistory: ServiceHistoryItem) => void;
  dateSort?: DateSort;
  onDateSortToggle?: () => void;
}) {
  const sortedServiceHistories = [...serviceHistories].sort((a, b) => {
    const diff = new Date(getServiceDate(a)).getTime() - new Date(getServiceDate(b)).getTime();
    return dateSort === 'desc' ? -diff : diff;
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {onDateSortToggle ? (
        <div className="mb-2 flex items-center justify-end gap-1.5 text-xs font-medium text-slate-500">
          <ArrowUpDown className="size-3.5" />
          Sắp xếp theo ngày:{' '}
          <span className="font-semibold text-slate-700">
            {dateSort === 'desc' ? 'Mới nhất trước' : 'Cũ nhất trước'}
          </span>
        </div>
      ) : null}
      <div className="w-full max-w-full overflow-x-auto">
        <table className="w-full min-w-[940px] table-fixed border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-900">
              <th className="w-[190px] px-3 py-4 font-semibold">Khách hàng</th>
              <th className="w-[180px] px-3 py-4 font-semibold">Xe</th>
              <th className="w-[240px] px-3 py-4 font-semibold">Dịch vụ</th>
              <th className="w-[140px] px-3 py-4 font-semibold">
                {onDateSortToggle ? (
                  <button
                    type="button"
                    onClick={onDateSortToggle}
                    className="inline-flex items-center gap-1 rounded hover:text-slate-950"
                    title="Sắp xếp theo thời gian hoàn thành"
                  >
                    Thời gian
                    {dateSort === 'desc' ? (
                      <ArrowDown className="size-3.5" />
                    ) : (
                      <ArrowUp className="size-3.5" />
                    )}
                  </button>
                ) : (
                  'Thời gian'
                )}
              </th>
              <th className="w-[130px] px-3 py-4 font-semibold">Tổng tiền</th>
              <th className="w-[140px] px-3 py-4 font-semibold">Trạng thái</th>
              <th className="w-[110px] px-3 py-4 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {sortedServiceHistories.map((serviceHistory) => {
              const vehicleName = `${serviceHistory.vehicleId.brand} ${serviceHistory.vehicleId.model}`;
              const serviceTitle = getServiceHistoryTitle(
                serviceHistory.services.map((service) => service.nameSnapshot)
              );
              const status = serviceHistory.appointmentId.status;
              const meta = statusMeta[status];
              const serviceDate = getServiceDate(serviceHistory);

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
                      {serviceHistory.customerId.phone || '-'}
                    </p>
                  </td>
                  <td className="px-3 py-4">
                    <p className="truncate font-semibold text-slate-900" title={vehicleName}>
                      {vehicleName}
                    </p>
                    <p className="mt-1 truncate text-slate-500">
                      {formatLicensePlateDisplay(serviceHistory.vehicleId.licensePlate)}
                    </p>
                  </td>
                  <td className="px-3 py-4">
                    <p className="line-clamp-2 text-slate-700" title={serviceTitle}>
                      {serviceTitle}
                    </p>
                  </td>
                  <td className="px-3 py-4 text-slate-700">
                    {formatServiceHistoryDateOnly(serviceDate)}
                  </td>
                  <td className="px-3 py-4 font-semibold text-slate-950">
                    {formatServiceHistoryPrice(serviceHistory.totalPrice)}
                  </td>
                  <td className="px-3 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${meta.className}`}
                    >
                      {meta.label}
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

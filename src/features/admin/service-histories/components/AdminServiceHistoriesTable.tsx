import { AdminServiceHistoryActionsMenu } from '@/features/admin/service-histories/components/AdminServiceHistoryActionsMenu';
import type { ServiceHistoryItem } from '@/types/serviceHistory';
import { formatLicensePlateDisplay } from '@/features/customers/vehicles/utils/license-plate';
import {
  formatServiceHistoryDateOnly,
  formatServiceHistoryPrice,
  getServiceHistoryTitle,
} from '@/lib/utils';

export function AdminServiceHistoriesTable({
  serviceHistories,
  onViewDetail,
  onUpdate,
  onDelete,
}: {
  serviceHistories: ServiceHistoryItem[];
  onViewDetail: (serviceHistory: ServiceHistoryItem) => void;
  onUpdate: (serviceHistory: ServiceHistoryItem) => void;
  onDelete: (serviceHistory: ServiceHistoryItem) => void;
}) {
  return (
    <section className="rounded-lg border border-border/80 bg-white p-6">
      <div className="w-full max-w-full overflow-x-auto">
        <table className="w-full min-w-[1040px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border text-slate-900">
              <th className="px-2 py-4 font-semibold">Khách hàng</th>
              <th className="px-2 py-4 font-semibold">Staff xử lý</th>
              <th className="px-2 py-4 font-semibold">Xe / biển số</th>
              <th className="px-2 py-4 font-semibold">Dịch vụ</th>
              <th className="px-2 py-4 font-semibold">Ngày hoàn thành</th>
              <th className="px-2 py-4 font-semibold">Tổng tiền</th>
              <th className="px-2 py-4 font-semibold">Trạng thái</th>
              <th className="px-2 py-4 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {serviceHistories.map((serviceHistory) => (
              <tr
                key={serviceHistory._id}
                className="border-b border-border/70 align-top last:border-0"
              >
                <td className="px-2 py-4">
                  <p className="font-semibold text-slate-950">
                    {serviceHistory.customerId.displayName}
                  </p>
                  <p className="mt-1 text-slate-500">{serviceHistory.customerId.phone}</p>
                </td>
                <td className="px-2 py-4 text-slate-700">
                  {serviceHistory.handledBy?.displayName || 'Chưa có thông tin'}
                </td>
                <td className="px-2 py-4">
                  <p className="font-semibold text-slate-950">
                    {serviceHistory.vehicleId.brand} {serviceHistory.vehicleId.model}
                  </p>
                  <p className="mt-1 text-slate-500">
                    {formatLicensePlateDisplay(serviceHistory.vehicleId.licensePlate)}
                  </p>
                </td>
                <td className="px-2 py-4 text-slate-700">
                  <p className="max-w-[280px]">
                    {getServiceHistoryTitle(
                      serviceHistory.services.map((service) => service.nameSnapshot)
                    )}
                  </p>
                </td>
                <td className="px-2 py-4 text-slate-700">
                  {formatServiceHistoryDateOnly(serviceHistory.servicedAt)}
                </td>
                <td className="px-2 py-4 font-semibold text-slate-950">
                  {formatServiceHistoryPrice(serviceHistory.totalPrice)}
                </td>
                <td className="px-2 py-4">
                  <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                    Hoàn thành
                  </span>
                </td>
                <td className="px-2 py-4 text-right">
                  <AdminServiceHistoryActionsMenu
                    serviceHistory={serviceHistory}
                    onViewDetail={onViewDetail}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

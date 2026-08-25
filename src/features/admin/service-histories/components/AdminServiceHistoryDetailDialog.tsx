import { CalendarClock, CarFront, Clock3, NotebookPen, UserRound, Wrench } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CustomerModalShell } from '@/features/customers/components/CustomerModalShell';
import { formatLicensePlateDisplay } from '@/features/customers/vehicles/utils/license-plate';
import { useAdminServiceHistoryDetail } from '@/features/admin/service-histories/hooks/useAdminServiceHistoryDetail';
import { formatServiceHistoryDate, formatServiceHistoryPrice, formatTime } from '@/lib/utils';

export function AdminServiceHistoryDetailDialog({
  serviceHistoryId,
  open,
  onOpenChange,
}: {
  serviceHistoryId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const detailQuery = useAdminServiceHistoryDetail(serviceHistoryId);
  const serviceHistory = detailQuery.data;

  return (
    <CustomerModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="Chi tiết lịch sử dịch vụ"
      description="Theo dõi đầy đủ thông tin khách hàng, xe, dịch vụ và dữ liệu hệ thống."
      contentClassName="max-w-[980px]"
      bodyClassName="grid gap-6"
      footer={
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Đóng
        </Button>
      }
    >
      {detailQuery.isLoading ? (
        <p className="text-sm text-slate-500">Đang tải lịch sử dịch vụ...</p>
      ) : detailQuery.isError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-5 text-sm text-rose-700">
          Không thể tải chi tiết lịch sử dịch vụ. Vui lòng thử lại.
        </div>
      ) : !serviceHistory ? (
        <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">
          Không có dữ liệu chi tiết để hiển thị.
        </div>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2">
            <DetailTile
              icon={UserRound}
              label="Khách hàng"
              value={serviceHistory.customerId.displayName}
              subValue={serviceHistory.customerId.phone}
            />
            <DetailTile
              icon={UserRound}
              label="Staff xử lý"
              value={serviceHistory.handledBy?.displayName || 'Chưa có thông tin'}
              subValue={serviceHistory.handledBy?.phone}
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
          </section>

          <section className="rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
              Dịch vụ đã hoàn thành
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
            <DetailTile
              icon={Wrench}
              label="Tổng tiền"
              value={formatServiceHistoryPrice(serviceHistory.totalPrice)}
            />
            <DetailTile
              icon={CalendarClock}
              label="Bảo dưỡng tiếp theo"
              value={
                serviceHistory.nextMaintenanceDate
                  ? formatServiceHistoryDate(serviceHistory.nextMaintenanceDate)
                  : 'Chưa thiết lập'
              }
            />
          </section>

          <section className="rounded-2xl bg-slate-50 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <NotebookPen className="size-4" />
              Ghi chú
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {serviceHistory.note?.trim() || 'Chưa có ghi chú cho lịch sử dịch vụ này.'}
            </p>
          </section>
        </>
      )}
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

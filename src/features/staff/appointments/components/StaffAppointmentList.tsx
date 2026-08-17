import { ArrowDown, ArrowUp, ArrowUpDown, CirclePlay, CreditCard, Eye } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AppointmentStatusBadge } from '@/features/customers/appointments/components/AppointmentStatusBadge';
import { formatDateTime, formatTime } from '@/lib/utils';
import type { AppointmentItem, AppointmentStatus } from '@/types/appointment';

export type DateSort = 'asc' | 'desc';

const getQuickAction = (status: AppointmentStatus) => {
  if (status === 'confirmed') {
    return { label: 'Check-in', nextStatus: 'in_queue' as const };
  }

  if (status === 'in_queue') {
    return { label: 'Bắt đầu', nextStatus: 'in_progress' as const };
  }

  if (status === 'in_progress') {
    return { label: 'Hoàn thành', nextStatus: 'completed' as const };
  }

  return null;
};

export function StaffAppointmentList({
  appointments,
  onViewDetail,
  onOpenStatusDialog,
  onQuickUpdate,
  dateSort = 'desc',
  onDateSortToggle,
}: {
  appointments: AppointmentItem[];
  onViewDetail: (appointment: AppointmentItem) => void;
  onOpenStatusDialog: (appointment: AppointmentItem) => void;
  onQuickUpdate: (
    appointment: AppointmentItem,
    nextStatus: 'in_queue' | 'in_progress' | 'completed'
  ) => void;
  dateSort?: DateSort;
  onDateSortToggle?: () => void;
}) {
  const sortedAppointments = [...appointments].sort((a, b) => {
    const diff = new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime();
    return dateSort === 'desc' ? diff : -diff;
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
        <table className="w-full min-w-[1200px] table-fixed border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-900">
              <th className="w-[160px] px-3 py-4 font-semibold">Thao tác</th>
              <th className="w-[180px] px-3 py-4 font-semibold">Khách hàng</th>
              <th className="w-[170px] px-3 py-4 font-semibold">Xe</th>
              <th className="w-[220px] px-3 py-4 font-semibold">Dịch vụ</th>
              <th className="w-[150px] px-3 py-4 font-semibold">
                {onDateSortToggle ? (
                  <button
                    type="button"
                    onClick={onDateSortToggle}
                    className="inline-flex items-center gap-1 rounded hover:text-slate-950"
                    title="Sắp xếp theo ngày hẹn"
                  >
                    Thời gian hẹn
                    {dateSort === 'desc' ? (
                      <ArrowDown className="size-3.5" />
                    ) : (
                      <ArrowUp className="size-3.5" />
                    )}
                  </button>
                ) : (
                  'Thời gian hẹn'
                )}
              </th>
              <th className="w-[90px] px-3 py-4 font-semibold">Thời lượng</th>
              <th className="w-[130px] px-3 py-4 font-semibold">Trạng thái</th>
              <th className="w-[100px] px-3 py-4 font-semibold text-center">Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {sortedAppointments.map((appointment) => {
              const vehicleName = `${appointment.vehicleId.brand} ${appointment.vehicleId.model}`;
              const serviceNames = appointment.services
                .map((service) => service.nameSnapshot)
                .join(', ');
              const quickAction = getQuickAction(appointment.status);
              const isTerminal =
                appointment.status === 'completed' || appointment.status === 'cancelled';

              return (
                <tr
                  key={appointment._id}
                  className="border-b border-slate-100 align-top transition-colors hover:bg-slate-50/70 last:border-0"
                >
                  <td className="px-3 py-4">
                    <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap">
                      {!isTerminal && !quickAction ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="rounded-lg"
                          onClick={() => onOpenStatusDialog(appointment)}
                        >
                          <CirclePlay className="size-4" />
                          Cập nhật
                        </Button>
                      ) : null}
                      {quickAction ? (
                        <Button
                          type="button"
                          size="sm"
                          className="rounded-lg"
                          onClick={() => onQuickUpdate(appointment, quickAction.nextStatus)}
                        >
                          {quickAction.label}
                        </Button>
                      ) : null}
                      {appointment.status === 'completed' &&
                      appointment.paymentStatus === 'paid' ? (
                        <Badge variant="success" className="rounded-full px-2.5 py-0.5 text-xs">
                          <CreditCard className="mr-1 size-3" />
                          Đã thanh toán
                        </Badge>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <p
                      className="truncate font-semibold text-slate-950"
                      title={appointment.customerId.displayName}
                    >
                      {appointment.customerId.displayName}
                    </p>
                    <p className="mt-1 truncate text-slate-500">{appointment.customerId.phone}</p>
                  </td>
                  <td className="px-3 py-4">
                    <p className="truncate font-semibold text-slate-900" title={vehicleName}>
                      {vehicleName}
                    </p>
                    <p className="mt-1 truncate text-slate-500">
                      {appointment.vehicleId.licensePlate}
                    </p>
                  </td>
                  <td className="px-3 py-4">
                    <p className="line-clamp-2 text-slate-700" title={serviceNames}>
                      {serviceNames}
                    </p>
                  </td>
                  <td className="px-3 py-4 text-slate-700">
                    {formatDateTime(appointment.scheduledAt)}
                  </td>
                  <td className="px-3 py-4 text-slate-700">
                    {formatTime(appointment.totalEstimatedDuration)}
                  </td>
                  <td className="px-3 py-4">
                    <AppointmentStatusBadge status={appointment.status} />
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center justify-center">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="rounded-lg"
                        onClick={() => onViewDetail(appointment)}
                      >
                        <Eye className="size-4" />
                        Chi tiết
                      </Button>
                    </div>
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

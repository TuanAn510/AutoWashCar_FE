import { CirclePlay, CreditCard, Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AppointmentStatusBadge } from '@/features/customers/appointments/components/AppointmentStatusBadge';
import { formatDateTime, formatTime } from '@/lib/utils';
import type { AppointmentItem, AppointmentStatus } from '@/types/appointment';

const getQuickAction = (status: AppointmentStatus) => {
  if (status === 'confirmed') {
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
  onConfirmPayment,
}: {
  appointments: AppointmentItem[];
  onViewDetail: (appointment: AppointmentItem) => void;
  onOpenStatusDialog: (appointment: AppointmentItem) => void;
  onQuickUpdate: (appointment: AppointmentItem, nextStatus: 'in_progress' | 'completed') => void;
  onConfirmPayment: (appointment: AppointmentItem) => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="w-full max-w-full overflow-x-auto">
        <table className="w-full min-w-[1080px] table-fixed border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-900">
              <th className="w-[180px] px-3 py-4 font-semibold">Khách hàng</th>
              <th className="w-[170px] px-3 py-4 font-semibold">Xe</th>
              <th className="w-[220px] px-3 py-4 font-semibold">Dịch vụ</th>
              <th className="w-[150px] px-3 py-4 font-semibold">Thời gian hẹn</th>
              <th className="w-[100px] px-3 py-4 font-semibold">Thời lượng</th>
              <th className="w-[140px] px-3 py-4 font-semibold">Trạng thái</th>
              <th className="w-[210px] px-3 py-4 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => {
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
                    <div className="flex flex-nowrap items-center justify-end gap-2 whitespace-nowrap">
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
                      appointment.paymentStatus !== 'paid' ? (
                        <Button
                          type="button"
                          size="sm"
                          className="rounded-lg"
                          onClick={() => onConfirmPayment(appointment)}
                        >
                          <CreditCard className="size-4" />
                          Thanh toán
                        </Button>
                      ) : null}
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

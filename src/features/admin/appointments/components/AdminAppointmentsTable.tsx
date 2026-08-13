import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AdminAppointmentActionsMenu } from '@/features/admin/appointments/components/AdminAppointmentActionsMenu';
import { AppointmentStatusBadge } from '@/features/customers/appointments/components/AppointmentStatusBadge';
import { cn, formatPrice } from '@/lib/utils';
import type { AppointmentItem } from '@/types/appointment';

const getCustomerFallback = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const TIER_STYLES: Record<string, string> = {
  Platinum: 'bg-purple-100 text-purple-800',
  Gold: 'bg-amber-100 text-amber-800',
  Silver: 'bg-slate-200 text-slate-700',
  Member: 'bg-slate-100 text-slate-600',
};

const getTierBadge = (appointment: AppointmentItem) => {
  const tier = appointment.membershipTierId;
  if (tier && typeof tier === 'object' && 'name' in tier) {
    const name = tier.name;
    return (
      <span
        className={cn(
          'ml-1.5 inline-flex shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none',
          TIER_STYLES[name] ?? 'bg-slate-100 text-slate-600'
        )}
      >
        {name}
      </span>
    );
  }
  return null;
};

const formatAppointmentSchedule = (scheduledAt: string) => {
  const date = new Date(scheduledAt);

  return {
    time: new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date),
    date: new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date),
  };
};

export function AdminAppointmentsTable({
  appointments,
  onViewDetail,
  onAssignStaff,
  onUpdateStatus,
  onConfirmPayment,
  onReschedule,
  onCancel,
}: {
  appointments: AppointmentItem[];
  onViewDetail: (appointment: AppointmentItem) => void;
  onAssignStaff: (appointment: AppointmentItem) => void;
  onUpdateStatus: (appointment: AppointmentItem) => void;
  onConfirmPayment: (appointment: AppointmentItem) => void;
  onReschedule: (appointment: AppointmentItem) => void;
  onCancel: (appointment: AppointmentItem) => void;
}) {
  return (
    <section className="rounded-lg border border-border/80 bg-white p-3">
      <div className="w-full max-w-full overflow-x-auto">
        <table className="w-full min-w-[960px] table-fixed border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border text-slate-900">
              <th className="w-[17%] px-2 py-2.5 font-semibold">Khách hàng</th>
              <th className="w-[14%] px-2 py-2.5 font-semibold">Xe</th>
              <th className="w-[21%] px-2 py-2.5 font-semibold">Dịch vụ</th>
              <th className="w-[10%] px-2 py-2.5 font-semibold">Ngày hẹn</th>
              <th className="w-[13%] px-2 py-2.5 font-semibold">Nhân viên</th>
              <th className="w-[13%] px-2 py-2.5 font-semibold">Trạng thái</th>
              <th className="w-[7%] px-2 py-2.5 text-right font-semibold">Giá</th>
              <th className="w-[5%] px-2 py-2.5 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => {
              const serviceNames = appointment.services
                .map((service) => service.nameSnapshot)
                .join(', ');
              const vehicleLabel = `${appointment.vehicleId.brand} ${appointment.vehicleId.model}`;
              const assignedStaffs = appointment.assignedStaffIds?.length
                ? appointment.assignedStaffIds
                : appointment.assignedStaffId
                  ? [appointment.assignedStaffId]
                  : [];
              const schedule = formatAppointmentSchedule(appointment.scheduledAt);

              return (
                <tr
                  key={appointment._id}
                  className="border-b border-border/70 align-top last:border-0"
                >
                  <td className="px-2 py-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar className="size-8 shrink-0">
                        <AvatarImage
                          src={appointment.customerId.avatarUrl}
                          alt={appointment.customerId.displayName}
                        />
                        <AvatarFallback className="text-[11px] font-semibold">
                          {getCustomerFallback(appointment.customerId.displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p
                          className="truncate font-semibold text-slate-950"
                          title={appointment.customerId.displayName}
                        >
                          {appointment.customerId.displayName}
                          {getTierBadge(appointment)}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {appointment.customerId.phone}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <p
                      className="line-clamp-2 font-semibold text-slate-950"
                      title={`${vehicleLabel} - ${appointment.vehicleId.licensePlate}`}
                    >
                      {vehicleLabel}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {appointment.vehicleId.licensePlate}
                    </p>
                  </td>
                  <td className="px-2 py-3">
                    <p className="line-clamp-2 text-slate-700" title={serviceNames}>
                      {serviceNames}
                    </p>
                  </td>
                  <td className="px-2 py-3 text-slate-700">
                    <p className="font-semibold leading-5 text-slate-950">{schedule.time}</p>
                    <p className="mt-0.5 text-xs leading-4 text-slate-500">{schedule.date}</p>
                  </td>
                  <td className="px-2 py-3 text-slate-700">
                    {assignedStaffs.length ? (
                      <div className="flex flex-wrap gap-1.5">
                        {assignedStaffs.map((staff) => (
                          <span
                            key={staff._id}
                            className="inline-flex max-w-full rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"
                            title={staff.displayName}
                          >
                            <span className="truncate">{staff.displayName}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="inline-flex max-w-full rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                        Chưa phân công
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-3 align-middle">
                    <AppointmentStatusBadge status={appointment.status} />
                  </td>
                  <td className="px-2 py-3 text-right font-semibold text-slate-950">
                    {formatPrice(appointment.totalPrice)}
                  </td>
                  <td className="px-2 py-3 text-right">
                    <AdminAppointmentActionsMenu
                      appointment={appointment}
                      onViewDetail={onViewDetail}
                      onAssignStaff={onAssignStaff}
                      onUpdateStatus={onUpdateStatus}
                      onConfirmPayment={onConfirmPayment}
                      onReschedule={onReschedule}
                      onCancel={onCancel}
                    />
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

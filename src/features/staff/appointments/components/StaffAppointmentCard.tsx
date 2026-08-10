import { CalendarClock, CarFront, CirclePlay, Clock3, Eye, Phone, UserRound } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AppointmentStatusBadge,
  appointmentStatusLabels,
} from '@/features/customers/appointments/components/AppointmentStatusBadge';
import type { AppointmentItem, AppointmentStatus } from '@/types/appointment';
import { formatDateTime, formatTime } from '@/lib/utils';

const getQuickAction = (status: AppointmentStatus) => {
  if (status === 'confirmed') {
    return { label: 'Bắt đầu xử lý', nextStatus: 'in_progress' as const };
  }

  if (status === 'in_progress') {
    return { label: 'Hoàn thành', nextStatus: 'completed' as const };
  }

  return null;
};

export function StaffAppointmentCard({
  appointment,
  onViewDetail,
  onOpenStatusDialog,
  onQuickUpdate,
}: {
  appointment: AppointmentItem;
  onViewDetail: (appointment: AppointmentItem) => void;
  onOpenStatusDialog: (appointment: AppointmentItem) => void;
  onQuickUpdate: (appointment: AppointmentItem, nextStatus: 'in_progress' | 'completed') => void;
}) {
  const serviceNames = appointment.services.map((service) => service.nameSnapshot).join(', ');
  const quickAction = getQuickAction(appointment.status);

  return (
    <Card className="rounded-[28px] border border-slate-200 bg-white shadow-sm ring-0">
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Mã lịch hẹn
            </p>
            <CardTitle className="mt-2 text-xl font-semibold text-slate-950">
              {appointment._id}
            </CardTitle>
            <p className="mt-2 text-sm text-slate-500">{serviceNames}</p>
          </div>
          <AppointmentStatusBadge status={appointment.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoTile
            icon={UserRound}
            label="Khách hàng"
            value={appointment.customerId.displayName}
            subValue={appointment.customerId.phone}
          />
          <InfoTile
            icon={CarFront}
            label="Xe"
            value={`${appointment.vehicleId.brand} ${appointment.vehicleId.model}`}
            subValue={appointment.vehicleId.licensePlate}
          />
          <InfoTile
            icon={CalendarClock}
            label="Thời gian hẹn"
            value={formatDateTime(appointment.scheduledAt)}
          />
          <InfoTile
            icon={Clock3}
            label="Thời lượng dự kiến"
            value={formatTime(appointment.totalEstimatedDuration)}
          />
        </div>

        {appointment.note?.trim() ? (
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Ghi chú của khách
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{appointment.note}</p>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2 text-sm text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-1">
            {appointment.services.length} dịch vụ
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1">
            {appointmentStatusLabels[appointment.status]}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-stretch gap-3 border-t border-slate-100 bg-white pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Phone className="size-4" />
          {appointment.customerId.phone}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => onViewDetail(appointment)}
          >
            <Eye className="size-4" />
            Xem chi tiết
          </Button>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => onOpenStatusDialog(appointment)}
            disabled={appointment.status === 'completed' || appointment.status === 'cancelled'}
          >
            <CirclePlay className="size-4" />
            Cập nhật trạng thái
          </Button>
          {quickAction ? (
            <Button
              className="rounded-xl"
              onClick={() => onQuickUpdate(appointment, quickAction.nextStatus)}
            >
              {quickAction.label}
            </Button>
          ) : null}
        </div>
      </CardFooter>
    </Card>
  );
}

function InfoTile({
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
    <div className="min-w-0 rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
        <Icon className="size-4" />
        {label}
      </div>
      <p className="mt-2 break-words text-sm font-semibold text-slate-900">{value}</p>
      {subValue ? <p className="mt-1 text-sm text-slate-500">{subValue}</p> : null}
    </div>
  );
}

import {
  CalendarCheck2,
  CalendarClock,
  CalendarPlus2,
  Clock3,
  LogIn,
  PlayCircle,
} from 'lucide-react';

import type { AppointmentItem } from '@/types/appointment';
import { formatDateTime } from '@/lib/utils';
import { appointmentStatusLabels } from '@/features/customers/appointments/components/AppointmentStatusBadge';

export function AppointmentTimeMilestones({ appointment }: { appointment: AppointmentItem }) {
  const processingMinutes =
    appointment.serviceStartedAt && appointment.completedAt
      ? Math.max(
          0,
          Math.round(
            (new Date(appointment.completedAt).getTime() -
              new Date(appointment.serviceStartedAt).getTime()) /
              60000
          )
        )
      : null;
  const milestones = [
    {
      label: 'Th\u1eddi gian \u0111\u1eb7t l\u1ecbch',
      value: appointment.createdAt
        ? formatDateTime(appointment.createdAt, { weekday: 'long' })
        : 'Ch\u01b0a c\u00f3 d\u1eef li\u1ec7u',
      icon: CalendarPlus2,
    },
    {
      label: 'Th\u1eddi gian h\u1eb9n',
      value: formatDateTime(appointment.scheduledAt, { weekday: 'long' }),
      icon: CalendarClock,
    },
    {
      label: 'Th\u1eddi gian check-in',
      value: appointment.checkInAt
        ? formatDateTime(appointment.checkInAt, { weekday: 'long' })
        : 'Ch\u01b0a check-in',
      icon: LogIn,
    },
    {
      label: 'B\u1eaft \u0111\u1ea7u th\u1ef1c hi\u1ec7n',
      value: appointment.serviceStartedAt
        ? formatDateTime(appointment.serviceStartedAt, { weekday: 'long' })
        : 'Ch\u01b0a b\u1eaft \u0111\u1ea7u',
      icon: PlayCircle,
    },
    {
      label: 'Th\u1eddi gian x\u1eed l\u00fd',
      value:
        processingMinutes == null
          ? 'Ch\u01b0a c\u00f3 d\u1eef li\u1ec7u'
          : `${processingMinutes} ph\u00fat`,
      icon: Clock3,
    },
    {
      label: 'Th\u1eddi gian ho\u00e0n th\u00e0nh',
      value: appointment.completedAt
        ? formatDateTime(appointment.completedAt, { weekday: 'long' })
        : 'Ch\u01b0a ho\u00e0n th\u00e0nh',
      icon: CalendarCheck2,
    },
  ];
  const statusHistory = [...(appointment.statusHistory ?? [])].sort(
    (first, second) => new Date(first.changedAt).getTime() - new Date(second.changedAt).getTime()
  );

  return (
    <section className="rounded-xl border border-[#e5edf6] bg-white p-4">
      <h3 className="text-sm font-black uppercase tracking-[0.12em] text-[#0b67c2]">
        C\u00e1c m\u1ed1c th\u1eddi gian
      </h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {milestones.map(({ icon: Icon, label, value }) => (
          <div key={label} className="relative min-w-0 rounded-lg bg-slate-50 px-3 py-3">
            <div className="flex items-center gap-2 text-sm font-black text-[#15243a]">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-[#0b67c2] ring-1 ring-[#e5edf6]">
                <Icon className="size-4" />
              </span>
              {label}
            </div>
            <p className="mt-1 wrap-break-word text-sm leading-6 text-[#64748b]">{value}</p>
          </div>
        ))}
      </div>
      {statusHistory.length ? (
        <div className="mt-4 border-t border-[#e5edf6] pt-4">
          <h4 className="text-xs font-black uppercase tracking-[0.12em] text-[#64748b]">
            L\u1ecbch s\u1eed tr\u1ea1ng th\u00e1i
          </h4>
          <div className="mt-3 space-y-2">
            {statusHistory.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-1 rounded-lg bg-slate-50 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-bold text-[#15243a]">
                    {appointmentStatusLabels[item.newStatus] ?? item.newStatus}
                  </p>
                  <p className="mt-0.5 text-xs text-[#64748b]">
                    {item.actorName
                      ? `C\u1eadp nh\u1eadt b\u1edfi ${item.actorName}`
                      : 'H\u1ec7 th\u1ed1ng c\u1eadp nh\u1eadt'}
                  </p>
                </div>
                <div className="shrink-0 text-xs font-semibold text-[#64748b]">
                  {formatDateTime(item.changedAt, { weekday: 'long' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

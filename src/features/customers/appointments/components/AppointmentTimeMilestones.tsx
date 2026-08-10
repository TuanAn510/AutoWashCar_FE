import { CalendarCheck2, CalendarClock, CalendarPlus2 } from 'lucide-react';

import type { AppointmentItem } from '@/types/appointment';
import { formatDateTime } from '@/lib/utils';

export function AppointmentTimeMilestones({ appointment }: { appointment: AppointmentItem }) {
  const milestones = [
    {
      label: 'Thời gian đặt lịch',
      value: appointment.createdAt
        ? formatDateTime(appointment.createdAt, { weekday: 'long' })
        : 'Chưa có dữ liệu',
      icon: CalendarPlus2,
    },
    {
      label: 'Thời gian hẹn',
      value: formatDateTime(appointment.scheduledAt, { weekday: 'long' }),
      icon: CalendarClock,
    },
    {
      label: 'Thời gian hoàn thành',
      value: appointment.completedAt
        ? formatDateTime(appointment.completedAt, { weekday: 'long' })
        : 'Chưa hoàn thành',
      icon: CalendarCheck2,
    },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
        Các mốc thời gian
      </h3>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {milestones.map(({ icon: Icon, label, value }) => (
          <div key={label} className="relative min-w-0 rounded-xl bg-slate-50 px-3 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-slate-700 ring-1 ring-slate-200">
                <Icon className="size-4" />
              </span>
              {label}
            </div>
            <p className="mt-1 wrap-break-word text-sm leading-6 text-slate-600">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

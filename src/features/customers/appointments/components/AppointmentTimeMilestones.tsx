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
    <section className="rounded-xl border border-[#e5edf6] bg-white p-4">
      <h3 className="text-sm font-black uppercase tracking-[0.12em] text-[#0b67c2]">
        Các mốc thời gian
      </h3>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
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
    </section>
  );
}

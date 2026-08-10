import { CalendarDays, CircleDashed, CirclePlay, CircleCheckBig } from 'lucide-react';

interface StaffAppointmentSummaryCardsProps {
  scope: 'today' | 'all';
  totalCount: number;
  pendingCount: number;
  inProgressCount: number;
  completedCount: number;
}

const cards = [
  {
    key: 'totalCount',
    label: 'Tổng lịch hẹn',
    icon: CalendarDays,
    accent: 'bg-sky-50 text-sky-700',
  },
  {
    key: 'pendingCount',
    label: 'Chờ xử lý',
    icon: CircleDashed,
    accent: 'bg-amber-50 text-amber-700',
  },
  {
    key: 'inProgressCount',
    label: 'Đang thực hiện',
    icon: CirclePlay,
    accent: 'bg-violet-50 text-violet-700',
  },
  {
    key: 'completedCount',
    label: 'Hoàn thành',
    icon: CircleCheckBig,
    accent: 'bg-emerald-50 text-emerald-700',
  },
] as const;

export function StaffAppointmentSummaryCards({
  scope,
  totalCount,
  pendingCount,
  inProgressCount,
  completedCount,
}: StaffAppointmentSummaryCardsProps) {
  const values = { totalCount, pendingCount, inProgressCount, completedCount };

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.key}
            className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {card.key === 'totalCount' && scope === 'today' ? 'Lịch hẹn hôm nay' : card.label}
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">
                  {values[card.key].toLocaleString('vi-VN')}
                </p>
              </div>

              <div
                className={`flex size-12 items-center justify-center rounded-2xl ${card.accent}`}
              >
                <Icon className="size-5" />
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}

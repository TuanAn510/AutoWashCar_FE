import {
  CalendarRange,
  CircleAlert,
  CircleCheckBig,
  CircleDashed,
  CirclePlay,
  LogIn,
  XCircle,
} from 'lucide-react';

interface AdminAppointmentSummaryCardsProps {
  total: number;
  pending: number;
  confirmed: number;
  inQueue: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

const cards = [
  { key: 'total', label: 'Tổng lịch hẹn', icon: CalendarRange },
  { key: 'pending', label: 'Chờ xác nhận', icon: CircleDashed },
  { key: 'confirmed', label: 'Đã xác nhận', icon: CircleAlert },
  { key: 'inQueue', label: 'Đã check-in', icon: LogIn },
  { key: 'inProgress', label: 'Đang thực hiện', icon: CirclePlay },
  { key: 'completed', label: 'Hoàn thành', icon: CircleCheckBig },
  { key: 'cancelled', label: 'Đã hủy', icon: XCircle },
] as const;

export function AdminAppointmentSummaryCards(props: AdminAppointmentSummaryCardsProps) {
  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 2xl:grid-cols-7">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.key}
            className="flex h-[96px] items-center justify-between gap-3 rounded-lg border border-border/80 bg-white px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-500">{card.label}</p>
              <p className="mt-2 text-2xl font-bold tracking-normal text-slate-950">
                {props[card.key].toLocaleString('vi-VN')}
              </p>
            </div>
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-600">
              <Icon className="size-4" />
            </span>
          </div>
        );
      })}
    </section>
  );
}

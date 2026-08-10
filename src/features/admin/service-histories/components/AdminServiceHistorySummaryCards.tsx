import { Banknote, CalendarCheck2, CarFront, Wrench } from 'lucide-react';

import { StatCard } from '@/components/dashboard';
import { formatServiceHistoryPrice } from '@/lib/utils';

const items = [
  { key: 'total', label: 'Tổng lịch sử dịch vụ', icon: Wrench },
  { key: 'completedThisMonth', label: 'Hoàn thành trong tháng', icon: CalendarCheck2 },
  { key: 'revenue', label: 'Tổng doanh thu', icon: Banknote },
  { key: 'customers', label: 'Khách hàng đã phục vụ', icon: CarFront },
] as const;

export function AdminServiceHistorySummaryCards({
  total,
  completedThisMonth,
  revenue,
  customers,
}: {
  total: number;
  completedThisMonth: number;
  revenue: number;
  customers: number;
}) {
  const values = {
    total: `${total}`,
    completedThisMonth: `${completedThisMonth}`,
    revenue: formatServiceHistoryPrice(revenue),
    customers: `${customers}`,
  };

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map(({ key, label, icon }) => (
        <StatCard
          key={key}
          title={label}
          value={values[key]}
          icon={icon}
          className={
            key === 'revenue'
              ? '[&_.card-value]:whitespace-nowrap [&_.card-value]:text-xl xl:[&_.card-value]:text-2xl'
              : undefined
          }
        />
      ))}
    </section>
  );
}

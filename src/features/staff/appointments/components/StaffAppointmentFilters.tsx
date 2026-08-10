import { Search } from 'lucide-react';

import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import type { AppointmentStatus } from '@/types/appointment';

interface StaffAppointmentFiltersProps {
  keyword: string;
  status: 'all' | AppointmentStatus;
  date: string;
  onKeywordChange: (value: string) => void;
  onStatusChange: (value: 'all' | AppointmentStatus) => void;
  onDateChange: (value: string) => void;
}

export function StaffAppointmentFilters({
  keyword,
  status,
  date,
  onKeywordChange,
  onStatusChange,
  onDateChange,
}: StaffAppointmentFiltersProps) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
          <Input
            className="h-11 rounded-xl border-0 bg-slate-100 pl-12 text-sm shadow-none focus-visible:ring-1"
            placeholder="Tìm theo tên khách, số điện thoại, biển số..."
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
          />
        </div>

        <select
          className="h-11 rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-primary/40"
          value={status}
          onChange={(event) => onStatusChange(event.target.value as 'all' | AppointmentStatus)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="in_progress">Đang thực hiện</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>

        <DatePicker
          className="h-11 rounded-xl bg-white"
          value={date}
          onChange={onDateChange}
          placeholder="Chọn ngày hẹn"
        />
      </div>
    </section>
  );
}

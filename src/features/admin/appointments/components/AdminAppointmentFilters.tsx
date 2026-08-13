import { Search } from 'lucide-react';

import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import type { AppointmentStatus } from '@/types/appointment';

interface StaffOption {
  _id: string;
  displayName: string;
}

interface AdminAppointmentFiltersProps {
  keyword: string;
  status: 'all' | AppointmentStatus;
  staffId: 'all' | string;
  date: string;
  staffOptions: StaffOption[];
  onKeywordChange: (value: string) => void;
  onStatusChange: (value: 'all' | AppointmentStatus) => void;
  onStaffChange: (value: 'all' | string) => void;
  onDateChange: (value: string) => void;
}

export function AdminAppointmentFilters({
  keyword,
  status,
  staffId,
  date,
  staffOptions,
  onKeywordChange,
  onStatusChange,
  onStaffChange,
  onDateChange,
}: AdminAppointmentFiltersProps) {
  return (
    <section className="rounded-lg border border-border/80 bg-white p-3">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-[minmax(360px,1fr)_160px_170px_170px]">
        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="h-9 rounded-md border-0 bg-slate-100 pl-10 text-sm shadow-none focus-visible:ring-1"
            placeholder="Tìm mã lịch, khách hàng, số điện thoại, biển số, dịch vụ..."
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
          />
        </div>

        <select
          aria-label="Trạng thái"
          className="h-9 rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-primary/40"
          value={status}
          onChange={(event) => onStatusChange(event.target.value as 'all' | AppointmentStatus)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="in_queue">Đã check-in</option>
          <option value="in_progress">Đang thực hiện</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>

        <select
          aria-label="Nhân viên"
          className="h-9 rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-primary/40"
          value={staffId}
          onChange={(event) => onStaffChange(event.target.value)}
        >
          <option value="all">Tất cả nhân viên</option>
          {staffOptions.map((staff) => (
            <option key={staff._id} value={staff._id}>
              {staff.displayName}
            </option>
          ))}
        </select>

        <DatePicker
          aria-label="Chọn ngày hẹn"
          className="h-9 rounded-md bg-white"
          value={date}
          onChange={onDateChange}
          placeholder="Chọn ngày hẹn"
        />
      </div>
    </section>
  );
}

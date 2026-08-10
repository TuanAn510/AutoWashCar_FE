import { DatePicker } from '@/components/ui/date-picker';

interface StaffServiceHistoryFiltersProps {
  keyword: string;
  date: string;
  onKeywordChange: (value: string) => void;
  onDateChange: (value: string) => void;
}

export function StaffServiceHistoryFilters({
  keyword,
  date,
  onKeywordChange,
  onDateChange,
}: StaffServiceHistoryFiltersProps) {
  return (
    <section className="grid gap-4 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <input
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-400"
          placeholder="Tìm theo khách hàng, biển số, dịch vụ..."
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
        />
        <DatePicker
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-400"
          value={date}
          onChange={onDateChange}
          placeholder="Chọn ngày"
        />
      </div>
    </section>
  );
}

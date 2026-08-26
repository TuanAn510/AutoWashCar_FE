import { DatePicker } from '@/components/ui/date-picker';

interface AdminServiceHistoryFiltersProps {
  keyword: string;
  fromDate: string;
  toDate: string;
  onKeywordChange: (value: string) => void;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
}

function DateFilterInput({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <DatePicker
      aria-label={label}
      className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-slate-400"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
}

export function AdminServiceHistoryFilters({
  keyword,
  fromDate,
  toDate,
  onKeywordChange,
  onFromDateChange,
  onToDateChange,
}: AdminServiceHistoryFiltersProps) {
  return (
    <section className="rounded-lg border border-border/80 bg-white p-4">
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_160px_160px]">
        <input
          aria-label="Tìm kiếm"
          className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-slate-400"
          placeholder="Tìm theo khách hàng, xe, dịch vụ..."
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
        />
        <DateFilterInput
          key={`from-${fromDate}`}
          label="Từ ngày"
          placeholder="Từ ngày"
          value={fromDate}
          onChange={onFromDateChange}
        />
        <DateFilterInput
          key={`to-${toDate}`}
          label="Đến ngày"
          placeholder="Đến ngày"
          value={toDate}
          onChange={onToDateChange}
        />
      </div>
    </section>
  );
}

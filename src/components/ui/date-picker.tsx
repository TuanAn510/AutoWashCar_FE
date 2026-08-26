import { CalendarDays } from 'lucide-react';
import { useState } from 'react';
import type { Matcher } from 'react-day-picker';
import { vi } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  disabledDates?: Matcher | Matcher[];
  className?: string;
  'aria-label'?: string;
}

const parseDateValue = (value?: string) => {
  if (!value) return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const formatDateValue = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

export function DatePicker({
  value,
  onChange,
  placeholder = 'Chọn ngày',
  disabled = false,
  disabledDates,
  className,
  'aria-label': ariaLabel,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = parseDateValue(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          aria-label={ariaLabel ?? placeholder}
          className={cn(
            'h-10 w-full justify-start rounded-md bg-white px-3 text-left font-normal',
            !selected && 'text-muted-foreground',
            className
          )}
        >
          <CalendarDays className="size-4 shrink-0 text-slate-400" />
          <span className="truncate">
            {selected
              ? new Intl.DateTimeFormat('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                }).format(selected)
              : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <Calendar
          mode="single"
          locale={vi}
          selected={selected}
          defaultMonth={selected}
          disabled={disabledDates}
          onSelect={(date) => {
            onChange(date ? formatDateValue(date) : '');
            if (date) setOpen(false);
          }}
        />
        {selected ? (
          <div className="border-t p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
            >
              Xóa ngày đã chọn
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

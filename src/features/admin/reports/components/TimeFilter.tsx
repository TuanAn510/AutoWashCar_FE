import { CalendarDays } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type TimeFilterValue = { mode: 'all-time' } | { mode: 'month'; month: string };

type TimeFilterProps = {
  value: TimeFilterValue;
  currentMonth: string;
  label: string;
  isFetching?: boolean;
  onChange: (value: TimeFilterValue) => void;
};

export function TimeFilter({ value, currentMonth, label, isFetching, onChange }: TimeFilterProps) {
  const selectedMonth = value.mode === 'month' ? value.month : '';

  return (
    <Card className="gap-0 py-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div
            className="inline-flex w-fit rounded-lg bg-slate-100 p-1"
            role="group"
            aria-label="Chế độ thời gian"
          >
            <Button
              aria-pressed={value.mode === 'all-time'}
              className="h-8 rounded-md px-3 shadow-none"
              variant={value.mode === 'all-time' ? 'default' : 'ghost'}
              onClick={() => onChange({ mode: 'all-time' })}
            >
              Toàn thời gian
            </Button>
            <Button
              aria-pressed={value.mode === 'month'}
              className="h-8 rounded-md px-3 shadow-none"
              variant={value.mode === 'month' ? 'default' : 'ghost'}
              onClick={() => {
                if (value.mode !== 'month') onChange({ mode: 'month', month: currentMonth });
              }}
            >
              Tháng tùy chọn
            </Button>
          </div>

          {value.mode === 'month' ? (
            <div className="grid gap-1.5 sm:min-w-60">
              <Label htmlFor="report-custom-month" className="sr-only">
                Chọn tháng
              </Label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="report-custom-month"
                  className="h-10 border-primary-border bg-white pl-9 ring-2 ring-primary-light"
                  max={currentMonth}
                  type="month"
                  value={selectedMonth}
                  onChange={(event) => {
                    if (event.target.value) onChange({ mode: 'month', month: event.target.value });
                  }}
                />
              </div>
            </div>
          ) : null}

          <div className="flex min-w-0 items-center gap-3 text-xs lg:ml-auto">
            <p className="truncate text-slate-500">
              Đang hiển thị: <strong className="font-semibold text-slate-800">{label}</strong>
            </p>
            {isFetching ? (
              <span className="inline-flex shrink-0 items-center gap-1.5 font-medium text-primary-hover">
                <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                Đang cập nhật
              </span>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

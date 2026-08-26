import type { ComponentProps } from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { formatVndInput, parseVndInput } from '@/features/admin/services/utils/vnd-currency';

interface VndCurrencyInputProps extends Omit<
  ComponentProps<typeof Input>,
  'type' | 'value' | 'onChange'
> {
  value: number;
  onValueChange: (value: number) => void;
}

export function VndCurrencyInput({
  value,
  onValueChange,
  className,
  ...props
}: VndCurrencyInputProps) {
  return (
    <div className="relative">
      <Input
        {...props}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={formatVndInput(value)}
        onChange={(event) => onValueChange(parseVndInput(event.target.value))}
        className={cn('pr-14 tabular-nums', className)}
      />
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-slate-500">
        VND
      </span>
    </div>
  );
}

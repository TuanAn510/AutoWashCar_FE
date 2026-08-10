import * as React from 'react';
import { cn } from '@/lib/utils';

function Select({ className, children, ...props }: React.ComponentProps<'select'>) {
  return (
    <select data-slot="select" className={cn('control-base', className)} {...props}>
      {children}
    </select>
  );
}

export { Select };

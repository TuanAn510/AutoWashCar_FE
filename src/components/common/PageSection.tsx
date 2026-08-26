import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '@/lib/utils';

export type PageSectionProps = ComponentPropsWithoutRef<'section'>;

export function PageSection({ className, ...props }: PageSectionProps) {
  return (
    <section
      className={cn('rounded-xl border border-border/80 bg-white p-4 shadow-sm sm:p-6', className)}
      {...props}
    />
  );
}

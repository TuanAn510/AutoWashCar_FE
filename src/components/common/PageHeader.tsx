import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface PageHeaderProps extends Omit<ComponentPropsWithoutRef<'header'>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  action,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
        className
      )}
      {...props}
    >
      <div className="min-w-0 flex-1">
        {eyebrow}
        <h1
          className={cn(
            'text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl',
            eyebrow && 'mt-3'
          )}
        >
          {title}
        </h1>
        {description && <p className="mt-2 max-w-2xl text-base text-slate-500">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2 sm:justify-end">{action}</div>}
    </header>
  );
}

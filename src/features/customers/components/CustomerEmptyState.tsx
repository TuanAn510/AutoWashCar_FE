import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface CustomerEmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
}

export function CustomerEmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: CustomerEmptyStateProps) {
  return (
    <section
      className={cn(
        'rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm',
        className
      )}
    >
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-slate-100 text-slate-600 [&_svg]:size-7">
        {icon}
      </div>
      <h2 className="mt-5 text-xl font-semibold text-slate-950 sm:text-2xl">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">{description}</p>
      {primaryAction || secondaryAction ? (
        <div className="mt-6 flex flex-col-reverse justify-center gap-2 sm:flex-row">
          {secondaryAction}
          {primaryAction}
        </div>
      ) : null}
    </section>
  );
}

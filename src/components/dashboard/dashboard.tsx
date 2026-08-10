import { ArrowDownRight, ArrowUpRight, Search, type LucideIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { dashboardToneClasses, type DashboardTone } from './dashboard-tones';

export function PageShell({ className, children, ...props }: ComponentProps<'main'>) {
  return (
    <main className={cn('page-shell', className)} {...props}>
      <div className="page-container">{children}</div>
    </main>
  );
}

export function PageHeader({
  title,
  description,
  action,
  eyebrow,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  eyebrow?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}
    >
      <div className="min-w-0">
        {eyebrow ? <div className="mb-2 text-sm font-semibold text-primary">{eyebrow}</div> : null}
        <h1 className="page-title">{title}</h1>
        {description ? <p className="page-description">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

export function SectionHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('card-header', className)}>
      <div>
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function DashboardCard({
  className,
  hover = false,
  ...props
}: ComponentProps<'section'> & { hover?: boolean }) {
  return <section className={cn('card-dashboard', hover && 'card-hover', className)} {...props} />;
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
  ...props
}: ComponentProps<'section'> & {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  contentClassName?: string;
}) {
  return (
    <section className={cn('card-section', className)} {...props}>
      {title ? <SectionHeader title={title} description={description} action={action} /> : null}
      <div className={cn(title && 'card-content', contentClassName)}>{children}</div>
    </section>
  );
}

export type StatCardTrend = {
  value: string;
  label?: string;
  direction?: 'up' | 'down' | 'neutral';
};
export interface StatCardProps extends Omit<ComponentProps<'article'>, 'title'> {
  title: ReactNode;
  value?: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  trend?: StatCardTrend;
  loading?: boolean;
  empty?: boolean | ReactNode;
  tone?: DashboardTone;
  footer?: ReactNode;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  loading,
  empty,
  tone = 'secondary',
  footer,
  className,
  style,
  ...props
}: StatCardProps) {
  const TrendIcon = trend?.direction === 'down' ? ArrowDownRight : ArrowUpRight;
  return (
    <article className={cn('card-stat', className)} style={style} {...props}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-500">{title}</p>
          {loading ? (
            <Skeleton className="mt-3 h-7 w-2/3" />
          ) : empty ? (
            <p className="card-description">
              {typeof empty === 'boolean' ? 'Chưa có dữ liệu' : empty}
            </p>
          ) : (
            <p className="card-value">{value}</p>
          )}
          {description && !loading ? <p className="card-description">{description}</p> : null}
        </div>
        {Icon ? (
          <div className={cn('card-icon border', dashboardToneClasses[tone])}>
            <Icon className="size-5" aria-hidden="true" />
          </div>
        ) : null}
      </div>
      {trend && !loading ? (
        <div
          className={cn(
            'mt-3 flex items-center gap-1 text-xs font-medium',
            trend.direction === 'down'
              ? 'text-rose-600'
              : trend.direction === 'neutral'
                ? 'text-slate-500'
                : 'text-emerald-700'
          )}
        >
          {trend.direction !== 'neutral' ? <TrendIcon className="size-3.5" /> : null}
          <span>{trend.value}</span>
          {trend.label ? <span className="font-normal text-slate-500">{trend.label}</span> : null}
        </div>
      ) : null}
      {footer ? <div className="mt-4 border-t pt-3">{footer}</div> : null}
    </article>
  );
}

export function StatsGrid({ className, ...props }: ComponentProps<'section'>) {
  return (
    <section className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-4', className)} {...props} />
  );
}
export const MetricGrid = StatsGrid;

export function ResponsiveToolbar({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between',
        className
      )}
      {...props}
    />
  );
}
export function FilterBar({ className, ...props }: ComponentProps<'section'>) {
  return <section aria-label="Bộ lọc" className={cn('card-section', className)} {...props} />;
}

export function SearchInput({
  label = 'Tìm kiếm',
  className,
  inputClassName,
  ...props
}: ComponentProps<'input'> & { label?: string; inputClassName?: string }) {
  return (
    <label className={cn('relative block min-w-0', className)}>
      <span className="sr-only">{label}</span>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
      <Input type="search" className={cn('control-base pl-10', inputClassName)} {...props} />
    </label>
  );
}

export function EmptyState({
  title = 'Chưa có dữ liệu',
  description,
  icon: Icon,
  action,
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50/70 px-5 py-10 text-center',
        className
      )}
    >
      {Icon ? <Icon className="mb-3 size-8 text-slate-400" aria-hidden="true" /> : null}
      <h3 className="font-semibold text-slate-900">{title}</h3>
      {description ? <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function LoadingCard({
  label = 'Đang tải dữ liệu',
  rows = 3,
  className,
}: {
  label?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn('card-section space-y-4', className)} role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatusBadge({
  label,
  tone = 'secondary',
  icon: Icon,
  className,
}: {
  label: ReactNode;
  tone?: DashboardTone;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold',
        dashboardToneClasses[tone],
        className
      )}
    >
      {Icon ? <Icon className="size-3" aria-hidden="true" /> : null}
      {label}
    </span>
  );
}

export function ProgressCard({
  title,
  value,
  max = 100,
  description,
  tone = 'primary',
}: {
  title: ReactNode;
  value: number;
  max?: number;
  description?: ReactNode;
  tone?: DashboardTone;
}) {
  const percentage = Math.min(100, Math.max(0, max ? (value / max) * 100 : 0));
  return (
    <DashboardCard>
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-slate-900">{title}</p>
        <span className="text-sm text-slate-500">{Math.round(percentage)}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn(
            'h-full rounded-full transition-[width]',
            dashboardToneClasses[tone].split(' ').find((item) => item.startsWith('bg-'))
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {description ? <p className="card-description">{description}</p> : null}
    </DashboardCard>
  );
}

export function InfoRow({
  label,
  value,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 rounded-lg border border-border/80 p-3 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <span className="text-sm text-slate-500">{label}</span>
      <strong className="text-sm text-slate-900">{value}</strong>
    </div>
  );
}

export function TableRegion({
  label,
  className,
  ...props
}: ComponentProps<'div'> & { label: string }) {
  return (
    <div
      className={cn('table-region', className)}
      role="region"
      aria-label={label}
      tabIndex={0}
      {...props}
    />
  );
}

export function RetryState({
  title,
  description,
  onRetry,
}: {
  title: string;
  description?: string;
  onRetry: () => void;
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      action={<Button onClick={onRetry}>Thử lại</Button>}
    />
  );
}

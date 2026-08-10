import { type ReactNode } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface CustomerModalShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  headerAside?: ReactNode;
  contentClassName?: string;
  bodyClassName?: string;
}

export function CustomerModalShell({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  headerAside,
  contentClassName,
  bodyClassName,
}: CustomerModalShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex w-[calc(100vw-1rem)] max-h-[90vh] max-w-[1120px] flex-col gap-0 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-0 shadow-2xl sm:w-[calc(100vw-2rem)] sm:max-w-[1120px]',
          contentClassName
        )}
      >
        <DialogHeader className="shrink-0 border-b border-slate-100 px-4 pb-4 pt-5 sm:px-6 sm:pb-5 sm:pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <DialogTitle className="truncate text-left text-xl font-semibold text-slate-950 sm:text-2xl">
                {title}
              </DialogTitle>
              {description ? (
                <DialogDescription className="mt-2 max-w-3xl text-left text-sm leading-6 text-slate-500">
                  {description}
                </DialogDescription>
              ) : null}
            </div>
            {headerAside}
          </div>
        </DialogHeader>

        <div
          className={cn(
            'min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6',
            bodyClassName
          )}
        >
          {children}
        </div>

        {footer ? (
          <div className="shrink-0 border-t border-slate-100 bg-white/95 px-4 py-4 backdrop-blur sm:px-6">
            <div className="flex flex-col-reverse gap-2 [&_[data-slot=button]]:h-10 [&_[data-slot=button]]:rounded-xl sm:flex-row sm:items-center sm:justify-end">
              {footer}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

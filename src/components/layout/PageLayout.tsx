import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '@/lib/utils';

export interface PageLayoutProps extends ComponentPropsWithoutRef<'main'> {
  containerClassName?: string;
}

export function PageLayout({ children, className, containerClassName, ...props }: PageLayoutProps) {
  return (
    <main
      className={cn(
        'min-h-[calc(100vh-73px)] min-w-0 overflow-x-hidden bg-[#f8fafc] px-4 py-8 sm:px-6 lg:px-8',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'mx-auto flex w-full max-w-[1540px] min-w-0 flex-col gap-6',
          containerClassName
        )}
      >
        {children}
      </div>
    </main>
  );
}

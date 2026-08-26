import { CheckCircle2, Circle } from 'lucide-react';

import type { AppointmentTimelineItem } from '../data/mock-appointments';

export function AppointmentTimeline({ items }: { items: AppointmentTimelineItem[] }) {
  return (
    <div className="space-y-0">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={item.id} className="grid grid-cols-[28px_1fr] gap-3">
            <div className="flex flex-col items-center">
              {item.done ? (
                <CheckCircle2 className="size-5 text-emerald-500" />
              ) : (
                <Circle className="size-5 text-slate-300" />
              )}
              {!isLast && <span className="my-1 h-full min-h-10 w-px bg-border" />}
            </div>
            <div className="pb-5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-900">{item.title}</p>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                  {item.time}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{item.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

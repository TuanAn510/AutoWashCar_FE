import { motion } from 'framer-motion';
import { Check, CheckCircle2, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { AppointmentStatus } from '@/types/appointment';

const timelineSteps = [
  {
    status: 'pending',
    label: 'Chờ xác nhận',
    shortLabel: 'Chờ',
    color: 'bg-orange-500',
    textColor: 'text-orange-600',
    ringColor: 'ring-orange-100',
  },
  {
    status: 'confirmed',
    label: 'Đã xác nhận',
    shortLabel: 'XN',
    color: 'bg-blue-500',
    textColor: 'text-blue-600',
    ringColor: 'ring-blue-100',
  },
  {
    status: 'in_progress',
    label: 'Đang thực hiện',
    shortLabel: 'TH',
    color: 'bg-purple-500',
    textColor: 'text-purple-600',
    ringColor: 'ring-purple-100',
  },
  {
    status: 'completed',
    label: 'Hoàn thành',
    shortLabel: 'HT',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    ringColor: 'ring-emerald-100',
  },
] as const;

type TimelineStatus = Exclude<AppointmentStatus, 'cancelled'>;

export function AppointmentStatusTimeline({
  status,
  isUpdating = false,
  onStatusSelect,
}: {
  status: AppointmentStatus;
  isUpdating?: boolean;
  onStatusSelect: (status: TimelineStatus) => void;
}) {
  if (status === 'cancelled') {
    return (
      <Badge className="gap-1.5 border border-rose-200 bg-rose-50 px-2.5 py-1 text-rose-700 shadow-none">
        <XCircle className="size-3.5" />
        Đã hủy
      </Badge>
    );
  }

  if (status === 'completed') {
    return (
      <Badge className="gap-1.5 border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700 shadow-none">
        <CheckCircle2 className="size-3.5" />
        Hoàn thành
      </Badge>
    );
  }

  const currentIndex = timelineSteps.findIndex((step) => step.status === status);
  const currentStep = timelineSteps[currentIndex];

  return (
    <TooltipProvider delayDuration={150}>
      <div
        className="grid min-w-[232px] grid-cols-[28px_1fr_28px_1fr_28px_1fr_28px] items-start"
        aria-label={`Trạng thái hiện tại: ${currentStep.label}`}
      >
        {timelineSteps.map((step, index) => {
          const isPast = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div className="contents" key={step.status}>
              {index > 0 ? (
                <div className="relative mt-[13px] h-0.5 overflow-hidden bg-slate-200">
                  <motion.div
                    className={cn('absolute inset-y-0 left-0', currentStep.color)}
                    initial={false}
                    animate={{ width: index <= currentIndex ? '100%' : '0%' }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </div>
              ) : null}

              <div className="flex min-w-0 flex-col items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      type="button"
                      whileHover={!isUpdating && !isCurrent ? { scale: 1.12 } : undefined}
                      whileTap={!isUpdating && !isCurrent ? { scale: 0.96 } : undefined}
                      transition={{ duration: 0.18 }}
                      disabled={isUpdating || isCurrent}
                      onClick={() => onStatusSelect(step.status)}
                      aria-label={
                        isCurrent
                          ? `${step.label}, trạng thái hiện tại`
                          : `Chuyển sang ${step.label}`
                      }
                      className={cn(
                        'relative z-10 flex size-7 items-center justify-center rounded-full border-2 bg-white outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-default',
                        isPast && cn('border-transparent text-white', step.color),
                        isCurrent &&
                          cn('border-transparent text-white ring-4', step.color, step.ringColor),
                        !isPast &&
                          !isCurrent &&
                          'border-slate-300 text-transparent hover:border-slate-400'
                      )}
                    >
                      {isPast ? (
                        <Check className="size-3.5 stroke-[3]" aria-hidden="true" />
                      ) : isCurrent ? (
                        <span className="size-2 rounded-full bg-white" aria-hidden="true" />
                      ) : (
                        <span className="size-2 rounded-full bg-slate-200" aria-hidden="true" />
                      )}
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={8}>
                    {isCurrent ? `${step.label} (hiện tại)` : `Chuyển sang ${step.label}`}
                  </TooltipContent>
                </Tooltip>
                <span
                  className={cn(
                    'mt-2 whitespace-nowrap text-[10px] font-semibold leading-none transition-colors duration-300',
                    isCurrent ? step.textColor : 'text-slate-400'
                  )}
                >
                  {step.shortLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

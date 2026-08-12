import {
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Ellipsis,
  Eye,
  UserPlus,
  XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { AppointmentItem } from '@/types/appointment';

export function AdminAppointmentActionsMenu({
  appointment,
  onViewDetail,
  onAssignStaff,
  onUpdateStatus,
  onConfirmPayment,
  onReschedule,
  onCancel,
}: {
  appointment: AppointmentItem;
  onViewDetail: (appointment: AppointmentItem) => void;
  onAssignStaff: (appointment: AppointmentItem) => void;
  onUpdateStatus: (appointment: AppointmentItem) => void;
  onConfirmPayment: (appointment: AppointmentItem) => void;
  onReschedule: (appointment: AppointmentItem) => void;
  onCancel: (appointment: AppointmentItem) => void;
}) {
  const isTerminal = appointment.status === 'completed' || appointment.status === 'cancelled';
  const isPending = appointment.status === 'pending';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="rounded-xl">
          <Ellipsis className="size-4" />
          <span className="sr-only">Mở menu thao tác</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuItem onClick={() => onViewDetail(appointment)}>
          <Eye className="size-4" />
          Xem chi tiết
        </DropdownMenuItem>

        {appointment.status === 'completed' && appointment.paymentStatus !== 'paid' ? (
          <DropdownMenuItem onClick={() => onConfirmPayment(appointment)}>
            <CreditCard className="size-4" />
            {appointment.paymentStatus === 'pending' ? 'Xác nhận thanh toán online' : 'Thanh toán'}
          </DropdownMenuItem>
        ) : null}

        {isPending ? (
          <>
            <DropdownMenuItem onClick={() => onUpdateStatus(appointment)}>
              <CheckCircle2 className="size-4" />
              Xác nhận
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => onCancel(appointment)}>
              <XCircle className="size-4" />
              Hủy
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={() => onAssignStaff(appointment)} disabled={isTerminal}>
              <UserPlus className="size-4" />
              Phân công nhân viên
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onReschedule(appointment)} disabled={isTerminal}>
              <CalendarClock className="size-4" />
              Đổi lịch
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onCancel(appointment)}
              disabled={isTerminal}
            >
              <XCircle className="size-4" />
              Hủy lịch
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

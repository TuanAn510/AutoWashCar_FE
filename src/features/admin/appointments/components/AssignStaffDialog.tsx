import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { AppointmentAssignedStaff, AppointmentItem } from '@/types/appointment';
import type { StaffWorkload } from '@/services/userService';
import { CustomerModalShell } from '@/features/customers/components/CustomerModalShell';

export function AssignStaffDialog({
  appointment,
  open,
  selectedStaffId,
  staffOptions,
  isLoadingStaffs,
  isSubmitting,
  onOpenChange,
  onSelectedStaffIdChange,
  onConfirm,
}: {
  appointment: AppointmentItem | null;
  open: boolean;
  selectedStaffId: string;
  staffOptions: Array<AppointmentAssignedStaff & StaffWorkload>;
  isLoadingStaffs: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectedStaffIdChange: (value: string) => void;
  onConfirm: () => Promise<void> | void;
}) {
  const [staffPickerOpen, setStaffPickerOpen] = useState(false);

  if (!appointment) {
    return null;
  }

  const selectedStaff = staffOptions.find((staff) => staff._id === selectedStaffId);

  return (
    <CustomerModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="Phân công nhân viên"
      description="Chọn nhân viên phù hợp để phụ trách lịch hẹn."
      contentClassName="max-w-[720px]"
      bodyClassName="grid gap-4"
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button type="button" onClick={onConfirm} disabled={isSubmitting || !selectedStaffId}>
            {isSubmitting ? 'Đang phân công...' : 'Phân công'}
          </Button>
        </>
      }
    >
      <div className="rounded-2xl bg-slate-50 p-4">
        <p className="font-semibold text-slate-950">{appointment.customerId.displayName}</p>
        <p className="mt-1 text-sm text-slate-500">
          {appointment.vehicleId.brand} {appointment.vehicleId.model} -{' '}
          {appointment.vehicleId.licensePlate}
        </p>
      </div>

      <div className="grid gap-2">
        <span className="text-sm font-medium text-slate-900">Chọn nhân viên phụ trách</span>
        <Popover open={staffPickerOpen} onOpenChange={setStaffPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full justify-between rounded-xl bg-white px-3 font-normal"
              disabled={isLoadingStaffs || !staffOptions.length || isSubmitting}
            >
              <span className="truncate">
                {isLoadingStaffs
                  ? 'Đang tải nhân viên...'
                  : selectedStaff
                    ? selectedStaff.displayName
                    : staffOptions.length
                      ? 'Chọn nhân viên'
                      : 'Chưa có nhân viên khả dụng'}
              </span>
              <ChevronDown className="text-slate-500" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-xl"
          >
            <div className="overflow-x-auto">
              <div className="min-w-[620px]">
                <div className="grid grid-cols-[minmax(180px,1fr)_110px_110px_130px] gap-3 border-b bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                  <span>Nhân viên</span>
                  <span className="text-center">Hôm nay</span>
                  <span className="text-center">Tuần này</span>
                  <span className="text-center">Đã hoàn thành</span>
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {staffOptions.map((staff) => (
                    <button
                      key={staff._id}
                      type="button"
                      className="grid w-full grid-cols-[minmax(180px,1fr)_110px_110px_130px] items-center gap-3 px-3 py-2 text-left text-sm hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                      onClick={() => {
                        onSelectedStaffIdChange(staff._id);
                        setStaffPickerOpen(false);
                      }}
                    >
                      <span className="flex min-w-0 items-center gap-2 font-medium text-slate-900">
                        <Check
                          className={
                            selectedStaffId === staff._id
                              ? 'text-primary'
                              : 'invisible text-primary'
                          }
                        />
                        <span className="truncate">{staff.displayName}</span>
                      </span>
                      <span className="text-center">{staff.todayCount} lịch hẹn</span>
                      <span className="text-center">{staff.weekCount} lịch hẹn</span>
                      <span className="text-center">{staff.completedCount} lịch hẹn</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </CustomerModalShell>
  );
}

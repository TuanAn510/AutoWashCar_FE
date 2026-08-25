import { Check, Loader2, Phone, UserRoundCheck, UsersRound } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CustomerModalShell } from '@/features/customers/components/CustomerModalShell';
import { formatLicensePlateDisplay } from '@/features/customers/vehicles/utils/license-plate';
import { cn } from '@/lib/utils';
import type { StaffWorkload } from '@/services/userService';
import type { AppointmentAssignedStaff, AppointmentItem } from '@/types/appointment';

const MAX_ASSIGNED_STAFF = 2;

function isSelected(staffId: string, selectedStaffIds: string[]) {
  return selectedStaffIds.includes(staffId);
}

function toggleStaff(staffId: string, selectedStaffIds: string[]) {
  if (isSelected(staffId, selectedStaffIds)) {
    return selectedStaffIds.filter((id) => id !== staffId);
  }
  if (selectedStaffIds.length >= MAX_ASSIGNED_STAFF) {
    return selectedStaffIds;
  }
  return [...selectedStaffIds, staffId];
}

export function AssignStaffDialog({
  appointment,
  open,
  selectedStaffIds,
  staffOptions,
  isLoadingStaffs,
  isSubmitting,
  onOpenChange,
  onSelectedStaffIdsChange,
  onConfirm,
}: {
  appointment: AppointmentItem | null;
  open: boolean;
  selectedStaffIds: string[];
  staffOptions: Array<AppointmentAssignedStaff & StaffWorkload>;
  isLoadingStaffs: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectedStaffIdsChange: (value: string[]) => void;
  onConfirm: () => Promise<void> | void;
}) {
  if (!appointment) {
    return null;
  }

  const selectedStaffs = staffOptions.filter((staff) => selectedStaffIds.includes(staff._id));
  const canSelectMore = selectedStaffIds.length < MAX_ASSIGNED_STAFF;

  return (
    <CustomerModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="Phân công nhân viên"
      description="Chọn nhóm phụ trách lịch hẹn."
      contentClassName="!max-w-[920px]"
      bodyClassName="grid gap-5"
      headerAside={
        <span className="inline-flex h-9 shrink-0 items-center rounded-md bg-emerald-50 px-3 text-sm font-semibold text-emerald-700">
          {selectedStaffIds.length}/{MAX_ASSIGNED_STAFF}
        </span>
      }
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting || selectedStaffIds.length === 0}
          >
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
            {isSubmitting ? 'Đang phân công...' : 'Phân công'}
          </Button>
        </>
      }
    >
      <section className="rounded-lg bg-slate-50 p-4">
        <p className="font-semibold text-slate-950">{appointment.customerId.displayName}</p>
        <p className="mt-1 text-sm text-slate-500">
          {appointment.vehicleId.brand} {appointment.vehicleId.model} -{' '}
          {formatLicensePlateDisplay(appointment.vehicleId.licensePlate)}
        </p>
      </section>

      <section className="grid gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-950">Nhân viên phụ trách</h3>
            <p className="mt-1 text-sm text-slate-500">
              {selectedStaffs.length
                ? selectedStaffs.map((staff) => staff.displayName).join(', ')
                : 'Chưa chọn nhân viên'}
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            <UsersRound className="size-4" />
            Tối đa {MAX_ASSIGNED_STAFF}
          </span>
        </div>

        <div className="max-h-[360px] overflow-y-auto rounded-lg border border-slate-200 bg-white">
          {isLoadingStaffs ? (
            <div className="grid min-h-36 place-items-center text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-5 animate-spin" />
                Đang tải nhân viên...
              </span>
            </div>
          ) : staffOptions.length ? (
            <div className="divide-y divide-slate-100">
              {staffOptions.map((staff) => {
                const selected = isSelected(staff._id, selectedStaffIds);
                const disabled = !selected && !canSelectMore;

                return (
                  <button
                    key={staff._id}
                    type="button"
                    disabled={disabled || isSubmitting}
                    className={cn(
                      'grid w-full gap-3 px-4 py-3 text-left transition sm:grid-cols-[minmax(180px,1fr)_110px_110px_110px_auto] sm:items-center',
                      selected ? 'bg-emerald-50/70' : 'hover:bg-slate-50',
                      disabled && 'cursor-not-allowed opacity-55'
                    )}
                    onClick={() =>
                      onSelectedStaffIdsChange(toggleStaff(staff._id, selectedStaffIds))
                    }
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        className={cn(
                          'grid size-8 shrink-0 place-items-center rounded-md border',
                          selected
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-slate-200 bg-white text-slate-400'
                        )}
                      >
                        {selected ? (
                          <Check className="size-4" />
                        ) : (
                          <UserRoundCheck className="size-4" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-slate-950">
                          {staff.displayName}
                        </span>
                        <span className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <Phone className="size-3.5" />
                          {staff.phone}
                        </span>
                      </span>
                    </span>
                    <Metric label="Hôm nay" value={staff.todayCount} />
                    <Metric label="Đang xử lý" value={staff.activeCount} />
                    <Metric label="Tuần này" value={staff.weekCount} />
                    <span
                      className={cn(
                        'inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-semibold',
                        selected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      )}
                    >
                      {selected ? 'Đã chọn' : 'Chọn'}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid min-h-36 place-items-center px-4 text-center text-sm text-slate-500">
              Chưa có nhân viên khả dụng.
            </div>
          )}
        </div>
      </section>
    </CustomerModalShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-md bg-slate-50 px-3 py-2 text-center">
      <span className="block text-xs font-medium text-slate-500">{label}</span>
      <span className="mt-1 block font-bold text-slate-950">{value}</span>
    </span>
  );
}

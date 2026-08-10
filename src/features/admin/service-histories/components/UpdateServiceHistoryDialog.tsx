import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { CustomerModalShell } from '@/features/customers/components/CustomerModalShell';
import { useUpdateServiceHistory } from '@/features/admin/service-histories/hooks/useAdminServiceHistoryMutations';
import type { ServiceHistoryItem } from '@/types/serviceHistory';

const toDateInputValue = (value?: string | null) => {
  if (!value) {
    return '';
  }

  return new Date(value).toISOString().slice(0, 10);
};

export function UpdateServiceHistoryDialog({
  serviceHistory,
  open,
  onOpenChange,
}: {
  serviceHistory: ServiceHistoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateMutation = useUpdateServiceHistory();
  const [note, setNote] = useState(() => serviceHistory?.note ?? '');
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState(() =>
    toDateInputValue(serviceHistory?.nextMaintenanceDate)
  );

  const handleSubmit = async () => {
    if (!serviceHistory) {
      return;
    }

    const payload = {
      note: note.trim() || undefined,
      nextMaintenanceDate: nextMaintenanceDate || undefined,
    };

    await updateMutation.mutateAsync({
      serviceHistoryId: serviceHistory._id,
      payload,
    });

    onOpenChange(false);
  };

  return (
    <CustomerModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="Cập nhật lịch sử dịch vụ"
      description="Admin có thể cập nhật ghi chú và ngày bảo dưỡng tiếp theo."
      contentClassName="max-w-[720px]"
      bodyClassName="grid gap-5"
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
          </Button>
        </>
      }
    >
      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">Ghi chú dịch vụ</span>
        <textarea
          className="min-h-32 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
          placeholder="Nhập ghi chú hoặc kết quả xử lý..."
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">Ngày bảo dưỡng tiếp theo</span>
        <DatePicker
          className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-400"
          value={nextMaintenanceDate}
          onChange={setNextMaintenanceDate}
          placeholder="Chọn ngày bảo dưỡng"
        />
      </label>
    </CustomerModalShell>
  );
}

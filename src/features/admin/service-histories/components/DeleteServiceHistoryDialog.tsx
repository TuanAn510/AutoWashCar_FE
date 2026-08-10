import { Button } from '@/components/ui/button';
import { CustomerModalShell } from '@/features/customers/components/CustomerModalShell';
import { useDeleteServiceHistory } from '@/features/admin/service-histories/hooks/useAdminServiceHistoryMutations';
import type { ServiceHistoryItem } from '@/types/serviceHistory';

export function DeleteServiceHistoryDialog({
  serviceHistory,
  open,
  onOpenChange,
}: {
  serviceHistory: ServiceHistoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteMutation = useDeleteServiceHistory();

  const handleDelete = async () => {
    if (!serviceHistory) {
      return;
    }

    await deleteMutation.mutateAsync(serviceHistory._id);
    onOpenChange(false);
  };

  return (
    <CustomerModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="Xóa lịch sử dịch vụ này?"
      description="Lịch sử dịch vụ sẽ được xóa mềm khỏi danh sách. Bạn có chắc muốn tiếp tục?"
      contentClassName="max-w-[640px]"
      bodyClassName="grid gap-4"
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa lịch sử'}
          </Button>
        </>
      }
    >
      <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
        Lịch sử đang chọn:{' '}
        <span className="font-semibold text-slate-900">{serviceHistory?._id}</span>
      </div>
    </CustomerModalShell>
  );
}

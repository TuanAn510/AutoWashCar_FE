import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CreateServiceDialog } from '@/features/admin/services/components/CreateServiceDialog';
import { UpdateServiceDialog } from '@/features/admin/services/components/UpdateServiceDialog';
import { cn, formatTime } from '@/lib/utils';
import type { CreateServicePayload, Service, UpdateServicePayload } from '@/types/service';
import type { ServiceCategory } from '@/types/serviceCategory';

const primaryButtonClassName =
  'rounded-md bg-slate-950 text-white hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-500';
const secondaryButtonClassName =
  'rounded-md border-slate-300 bg-white text-slate-900 hover:bg-slate-100';
const iconButtonClassName =
  'rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-slate-400/40';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

interface CategoryServicesDialogProps {
  category: ServiceCategory | null;
  services: Service[];
  isAdmin: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (payload: CreateServicePayload) => Promise<void>;
  onUpdate: (serviceId: string, payload: UpdateServicePayload) => Promise<void>;
  onDelete: (serviceId: string) => Promise<void>;
}

export function CategoryServicesDialog({
  category,
  services,
  isAdmin,
  isCreating,
  isUpdating,
  isDeleting,
  onOpenChange,
  onCreate,
  onUpdate,
  onDelete,
}: CategoryServicesDialogProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);

  const categoryServices = useMemo(
    () => services.filter((service) => service.categoryId._id === category?._id),
    [category?._id, services]
  );
  const activeServices = categoryServices.filter((service) => service.isActive).length;

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setIsCreateOpen(false);
      setEditingService(null);
      setDeletingService(null);
    }
    onOpenChange(open);
  };

  return (
    <>
      <Dialog open={!!category} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-h-[88vh] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-0 sm:max-h-[88vh] sm:max-w-6xl">
          <DialogHeader className="border-b bg-white px-6 py-5">
            <div className="flex flex-col gap-4 pr-8 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="text-xl">
                    {category?.name ?? 'Chi tiết danh mục'}
                  </DialogTitle>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-1 text-xs font-semibold',
                      category?.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {category?.isActive ? 'Đang hoạt động' : 'Tạm ẩn'}
                  </span>
                </div>
                <DialogDescription className="mt-2 max-w-2xl leading-5">
                  {category?.description?.trim() || 'Danh mục chưa có mô tả.'}
                </DialogDescription>
              </div>
              {isAdmin && (
                <Button
                  type="button"
                  size="sm"
                  className={primaryButtonClassName}
                  disabled={!category?.isActive}
                  onClick={() => setIsCreateOpen(true)}
                >
                  <Plus className="size-4" />
                  Thêm dịch vụ
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="grid min-h-0 gap-5 overflow-y-auto overscroll-contain bg-slate-50/50 px-6 py-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <SummaryItem label="Tổng dịch vụ" value={String(categoryServices.length)} />
              <SummaryItem label="Đang hoạt động" value={String(activeServices)} />
              <SummaryItem
                label="Trạng thái danh mục"
                value={category?.isActive ? 'Đang hoạt động' : 'Tạm ẩn'}
              />
            </div>

            {!category?.isActive && isAdmin && (
              <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                Danh mục đang tạm ẩn. Hãy kích hoạt lại danh mục trước khi thêm dịch vụ mới.
              </p>
            )}

            <div className="max-h-[420px] overflow-x-hidden overflow-y-auto rounded-xl border bg-white shadow-sm">
              <table className="w-full table-fixed text-left text-sm">
                <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Dịch vụ</th>
                    <th className="w-[150px] px-4 py-3 text-right font-semibold">Giá</th>
                    <th className="w-[120px] px-4 py-3 text-center font-semibold">Thời lượng</th>
                    <th className="w-[130px] px-4 py-3 font-semibold">Trạng thái</th>
                    {isAdmin && (
                      <th className="w-[112px] px-4 py-3 text-center font-semibold">Thao tác</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {!categoryServices.length && (
                    <tr>
                      <td
                        colSpan={isAdmin ? 5 : 4}
                        className="px-4 py-10 text-center text-slate-500"
                      >
                        Danh mục này chưa có dịch vụ.
                      </td>
                    </tr>
                  )}
                  {categoryServices.map((service) => (
                    <tr
                      key={service._id}
                      className="border-t transition-colors hover:bg-slate-50/80"
                    >
                      <td className="px-4 py-3">
                        <p className="line-clamp-2 font-semibold text-slate-900">{service.name}</p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {service.description?.trim() || 'Chưa có mô tả'}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">
                        {formatCurrency(service.price)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-slate-700">
                        {formatTime(service.estimatedDuration)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex rounded-md px-2.5 py-1 text-xs font-semibold',
                            service.isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          )}
                        >
                          {service.isActive ? 'Hoạt động' : 'Đã xóa'}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className={iconButtonClassName}
                              onClick={() => setEditingService(service)}
                            >
                              <Pencil className="size-4" />
                              <span className="sr-only">Sửa {service.name}</span>
                            </Button>
                            {service.isActive && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => setDeletingService(service)}
                              >
                                <Trash2 className="size-4" />
                                <span className="sr-only">Xóa {service.name}</span>
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CreateServiceDialog
        categories={category?.isActive ? [category] : []}
        fixedCategory={category?.isActive ? category : undefined}
        isOpen={isCreateOpen}
        isSubmitting={isCreating}
        onOpenChange={setIsCreateOpen}
        onSubmit={async (payload) => {
          await onCreate(payload);
          setIsCreateOpen(false);
        }}
      />

      <UpdateServiceDialog
        service={editingService}
        categories={category ? [category] : []}
        isSubmitting={isUpdating}
        onOpenChange={(open) => {
          if (!open) setEditingService(null);
        }}
        onSubmit={async (payload) => {
          if (!editingService) return;
          await onUpdate(editingService._id, payload);
          setEditingService(null);
        }}
      />

      <Dialog open={!!deletingService} onOpenChange={(open) => !open && setDeletingService(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa dịch vụ?</DialogTitle>
            <DialogDescription>
              Dịch vụ “{deletingService?.name}” sẽ bị ẩn khỏi các luồng đặt lịch mới. Dữ liệu lịch
              sử vẫn được giữ lại.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton={false}>
            <Button
              type="button"
              variant="outline"
              className={secondaryButtonClassName}
              onClick={() => setDeletingService(null)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={async () => {
                if (!deletingService) return;
                await onDelete(deletingService._id);
                setDeletingService(null);
              }}
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa dịch vụ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-slate-50/70 p-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}

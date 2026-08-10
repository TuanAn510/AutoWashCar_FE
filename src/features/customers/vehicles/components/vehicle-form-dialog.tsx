import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { CustomerModalShell } from '@/features/customers/components/CustomerModalShell';
import {
  type ApiVehicle,
  type CreateVehiclePayload,
  type UpdateVehiclePayload,
} from '@/types/vehicle';
import { VehicleForm } from '@/features/customers/vehicles/components/vehicle-form';

interface VehicleFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  vehicle?: ApiVehicle | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateVehiclePayload | UpdateVehiclePayload) => Promise<void> | void;
}

export function VehicleFormDialog({
  open,
  mode,
  vehicle,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: VehicleFormDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const formId = useMemo(
    () => (mode === 'edit' ? 'customer-edit-vehicle-form' : 'customer-create-vehicle-form'),
    [mode]
  );

  return (
    <CustomerModalShell
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setSelectedFiles([]);
        }
        onOpenChange(nextOpen);
      }}
      title={mode === 'edit' ? 'Chỉnh sửa xe' : 'Thêm xe mới'}
      description={
        mode === 'edit'
          ? 'Cập nhật thông tin ô tô và bổ sung ảnh nếu cần.'
          : 'Thêm ô tô để bạn đặt lịch chăm sóc và bảo dưỡng nhanh hơn.'
      }
      contentClassName="max-w-[1120px] sm:max-w-[1120px]"
      bodyClassName="grid gap-6"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full rounded-xl sm:w-36"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            form={formId}
            className="h-10 w-full rounded-xl sm:w-36"
            disabled={isSubmitting}
          >
            {mode === 'edit' ? 'Lưu thay đổi' : 'Thêm xe'}
          </Button>
        </>
      }
    >
      <VehicleForm
        formId={formId}
        initialValue={vehicle}
        existingImages={vehicle?.images ?? []}
        selectedFiles={selectedFiles}
        isSubmitting={isSubmitting}
        onFilesChange={setSelectedFiles}
        onSubmit={onSubmit}
      />
    </CustomerModalShell>
  );
}

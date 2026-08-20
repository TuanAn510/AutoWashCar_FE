import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getApiErrorMessage, toApiError } from '@/api/errors';
import { serviceApi } from '@/services/serviceService';
import type { CreateServicePayload, UpdateServicePayload } from '@/types/service';
import { serviceQueryKeys } from '@/features/admin/services/hooks/useServices';
import { useServiceManagementStore } from '@/features/admin/services/store/useServiceManagementStore';

const getErrorMessage = getApiErrorMessage;

export function useCreateServiceMutation() {
  const queryClient = useQueryClient();
  const closeCreateDialog = useServiceManagementStore((state) => state.closeCreateDialog);

  return useMutation({
    mutationFn: (payload: CreateServicePayload) => serviceApi.createService(payload),
    onSuccess: () => {
      closeCreateDialog();
      queryClient.invalidateQueries({ queryKey: serviceQueryKeys.all });
      toast.success('Tạo dịch vụ thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Tạo dịch vụ thất bại. Vui lòng thử lại.'));
    },
  });
}

export function useUpdateServiceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, payload }: { serviceId: string; payload: UpdateServicePayload }) =>
      serviceApi.updateService(serviceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceQueryKeys.all });
      toast.success('Cập nhật dịch vụ thành công.');
    },
    onError: (error) => {
      const apiError = toApiError(error);
      if (apiError.status === 409) {
        queryClient.invalidateQueries({ queryKey: serviceQueryKeys.all });
        toast.error(
          'Dịch vụ đã được thay đổi bởi một phiên làm việc khác. Danh sách đã được cập nhật; vui lòng mở lại và thử lại.'
        );
        return;
      }
      toast.error(getErrorMessage(error, 'Cập nhật dịch vụ thất bại. Vui lòng thử lại.'));
    },
  });
}

export function useDeleteServiceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceId: string) => serviceApi.updateService(serviceId, { isActive: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceQueryKeys.all });
      toast.success('Xóa dịch vụ thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Xóa dịch vụ thất bại. Vui lòng thử lại.'));
    },
  });
}

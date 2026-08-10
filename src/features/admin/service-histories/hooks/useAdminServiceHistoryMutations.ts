import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { adminServiceHistoryApi } from '@/services/serviceHistoryService';
import { adminServiceHistoriesQueryKey } from '@/features/admin/service-histories/hooks/useAdminServiceHistories';
import type { UpdateServiceHistoryPayload } from '@/types/serviceHistory';

const getErrorMessage = getApiErrorMessage;

export function useUpdateServiceHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      serviceHistoryId,
      payload,
    }: {
      serviceHistoryId: string;
      payload: UpdateServiceHistoryPayload;
    }) => adminServiceHistoryApi.updateServiceHistory(serviceHistoryId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminServiceHistoriesQueryKey });
      queryClient.invalidateQueries({
        queryKey: queryKeys.serviceHistories.admin.detail(variables.serviceHistoryId),
      });
      toast.success('Cập nhật lịch sử dịch vụ thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể cập nhật lịch sử dịch vụ. Vui lòng thử lại.'));
    },
  });
}

export function useDeleteServiceHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceHistoryId: string) =>
      adminServiceHistoryApi.deleteServiceHistory(serviceHistoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminServiceHistoriesQueryKey });
      toast.success('Xóa lịch sử dịch vụ thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể xóa lịch sử dịch vụ. Vui lòng thử lại.'));
    },
  });
}
import { getApiErrorMessage } from '@/api/errors';
import { queryKeys } from '@/constants/queryKeys';

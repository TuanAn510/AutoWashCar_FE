import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { serviceCategoryApi } from '@/services/serviceCategoryService';
import type {
  CreateServiceCategoryPayload,
  UpdateServiceCategoryPayload,
} from '@/types/serviceCategory';
import { serviceCategoryQueryKeys } from '@/features/admin/service-categories/hooks/useActiveServiceCategories';
import { useServiceCategoryFormStore } from '@/features/admin/service-categories/stores/serviceCategoryFormStore';

const getErrorMessage = getApiErrorMessage;

export function useCreateServiceCategory() {
  const queryClient = useQueryClient();
  const closeModal = useServiceCategoryFormStore((state) => state.closeModal);

  return useMutation({
    mutationFn: (payload: CreateServiceCategoryPayload) =>
      serviceCategoryApi.createServiceCategory(payload),
    onSuccess: () => {
      closeModal();
      queryClient.invalidateQueries({ queryKey: serviceCategoryQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: serviceCategoryQueryKeys.active });
      toast.success('Tạo danh mục dịch vụ thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Tạo danh mục dịch vụ thất bại. Vui lòng thử lại.'));
    },
  });
}

export function useUpdateServiceCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      payload,
    }: {
      categoryId: string;
      payload: UpdateServiceCategoryPayload;
    }) => serviceCategoryApi.updateServiceCategory(categoryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceCategoryQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: serviceCategoryQueryKeys.active });
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
      toast.success('Cập nhật danh mục dịch vụ thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Cập nhật danh mục thất bại. Vui lòng thử lại.'));
    },
  });
}
import { getApiErrorMessage } from '@/api/errors';
import { queryKeys } from '@/constants/queryKeys';

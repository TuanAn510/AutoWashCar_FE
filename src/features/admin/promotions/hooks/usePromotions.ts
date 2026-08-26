import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getApiErrorMessage } from '@/api/errors';
import { queryKeys } from '@/constants/queryKeys';
import {
  promotionApi,
  type Promotion,
  type PromotionListParams,
  type PromotionPayload,
} from '@/services/promotionService';

type PromotionListResult = Awaited<ReturnType<typeof promotionApi.list>>;

export function usePromotions(params?: PromotionListParams) {
  return useQuery({
    queryKey: queryKeys.promotions.list(params),
    queryFn: ({ signal }) => promotionApi.list(params, signal),
  });
}

export function useActivePromotions(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.promotions.active(),
    queryFn: ({ signal }) => promotionApi.listActive(signal),
    enabled: options.enabled,
  });
}

export function usePromotionMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.promotions.all });

  return {
    create: useMutation({
      mutationFn: promotionApi.create,
      onSuccess: async () => {
        await invalidate();
        toast.success('Tạo khuyến mãi thành công.');
      },
      onError: (error) => toast.error(getApiErrorMessage(error, 'Không thể tạo khuyến mãi.')),
    }),
    update: useMutation({
      mutationFn: ({ promotionId, payload }: { promotionId: string; payload: PromotionPayload }) =>
        promotionApi.update(promotionId, payload),
      onSuccess: async () => {
        await invalidate();
        toast.success('Cập nhật khuyến mãi thành công.');
      },
      onError: (error) => toast.error(getApiErrorMessage(error, 'Không thể cập nhật khuyến mãi.')),
    }),
    status: useMutation({
      mutationFn: ({ promotionId, isActive }: { promotionId: string; isActive: boolean }) =>
        promotionApi.updateStatus(promotionId, isActive),
      onMutate: async ({ promotionId, isActive }) => {
        await queryClient.cancelQueries({ queryKey: queryKeys.promotions.all });
        const snapshots = queryClient.getQueriesData<PromotionListResult>({
          queryKey: queryKeys.promotions.all,
        });
        queryClient.setQueriesData<PromotionListResult>(
          { queryKey: queryKeys.promotions.all },
          (current) =>
            current
              ? {
                  ...current,
                  items: current.items.map((promotion: Promotion) =>
                    promotion._id === promotionId ? { ...promotion, isActive } : promotion
                  ),
                }
              : current
        );
        return { snapshots };
      },
      onSuccess: (_promotion, variables) => {
        toast.success(variables.isActive ? 'Đã kích hoạt khuyến mãi.' : 'Đã tạm dừng khuyến mãi.');
      },
      onError: (error, _variables, context) => {
        context?.snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data));
        toast.error(getApiErrorMessage(error, 'Không thể đổi trạng thái khuyến mãi.'));
      },
      onSettled: invalidate,
    }),
    remove: useMutation({
      mutationFn: promotionApi.remove,
      onSuccess: async () => {
        await invalidate();
        toast.success('Đã xóa khuyến mãi.');
      },
      onError: (error) => toast.error(getApiErrorMessage(error, 'Không thể xóa khuyến mãi.')),
    }),
  };
}

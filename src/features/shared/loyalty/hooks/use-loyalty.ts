import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { queryKeys } from '@/constants/queryKeys';
import { adminAppointmentsQueryKey } from '@/features/admin/appointments/hooks/useAppointments';
import {
  loyaltyApi,
  membershipTierApi,
  rewardApi,
} from '@/features/shared/loyalty/api/loyalty-api';
import {
  loyaltyKeys,
  membershipTierKeys,
  rewardKeys,
} from '@/features/shared/loyalty/constants/query-keys';
import type {
  MembershipTierPayload,
  RewardPayload,
} from '@/features/shared/loyalty/types/loyalty.types';
import { getErrorMessage } from '@/features/shared/loyalty/utils/error-message';
import { adminAppointmentsApi } from '@/services/appointmentService';

export { loyaltyKeys, membershipTierKeys, rewardKeys };

export function useMyLoyaltyAccount() {
  return useQuery({
    queryKey: loyaltyKeys.me,
    queryFn: ({ signal }) => loyaltyApi.getMyAccount(signal),
  });
}

export function useMyLoyaltyTransactions() {
  return useQuery({
    queryKey: loyaltyKeys.myTransactions,
    queryFn: ({ signal }) => loyaltyApi.getMyTransactions(signal),
  });
}

export function useCustomersWithLoyalty(
  params: { search?: string; membershipTierId?: string; page?: number; limit?: number } = {}
) {
  return useQuery({
    queryKey: loyaltyKeys.customers(params),
    queryFn: ({ signal }) => loyaltyApi.getCustomers(params, signal),
  });
}

export function useCustomerLoyaltyAccount(customerId: string) {
  return useQuery({
    queryKey: loyaltyKeys.customer(customerId),
    queryFn: ({ signal }) => loyaltyApi.getCustomerAccount(customerId, signal),
    enabled: !!customerId,
  });
}

export function useCustomerLoyaltyTransactions(customerId: string) {
  return useQuery({
    queryKey: loyaltyKeys.customerTransactions(customerId),
    queryFn: ({ signal }) => loyaltyApi.getCustomerTransactions(customerId, signal),
    enabled: !!customerId,
  });
}

export function useCustomerRedemptions(customerId: string) {
  return useQuery({
    queryKey: loyaltyKeys.customerRedemptions(customerId),
    queryFn: ({ signal }) => loyaltyApi.getCustomerRedemptions(customerId, signal),
    enabled: !!customerId,
  });
}

export function useMembershipTiers() {
  return useQuery({
    queryKey: membershipTierKeys.all,
    queryFn: ({ signal }) => membershipTierApi.list(signal),
  });
}

export function useRewards(params: { sortBy?: string; sortOrder?: 'asc' | 'desc' } = {}) {
  return useQuery({
    queryKey: queryKeys.rewards.list(params),
    queryFn: ({ signal }) => rewardApi.list(params, signal),
  });
}

export function useMyRewardRedemptions() {
  return useQuery({
    queryKey: rewardKeys.myRedemptions,
    queryFn: ({ signal }) => rewardApi.getMyRedemptions(signal),
  });
}

export function useRedeemReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rewardApi.redeem,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: loyaltyKeys.me }),
        queryClient.invalidateQueries({ queryKey: loyaltyKeys.myTransactions }),
        queryClient.invalidateQueries({ queryKey: rewardKeys.all }),
        queryClient.invalidateQueries({ queryKey: rewardKeys.myRedemptions }),
      ]);
      toast.success('Đổi thưởng thành công.');
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, 'Không thể đổi thưởng. Vui lòng thử lại.')),
  });
}

export function useTierMutations() {
  const queryClient = useQueryClient();
  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: membershipTierKeys.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.loyalty.all }),
    ]);
  };

  return {
    create: useMutation({
      mutationFn: (payload: MembershipTierPayload) => membershipTierApi.create(payload),
      onSuccess: async () => {
        await invalidate();
        toast.success('Tạo hạng thành viên thành công.');
      },
      onError: (error) => toast.error(getErrorMessage(error, 'Không thể tạo hạng thành viên.')),
    }),
    update: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: MembershipTierPayload }) =>
        membershipTierApi.update(id, payload),
      onSuccess: async () => {
        await invalidate();
        toast.success('Cập nhật hạng thành viên thành công.');
      },
      onError: (error) =>
        toast.error(getErrorMessage(error, 'Không thể cập nhật hạng thành viên.')),
    }),
    remove: useMutation({
      mutationFn: membershipTierApi.remove,
      onSuccess: async () => {
        await invalidate();
        toast.success('Ngừng kích hoạt hạng thành viên thành công.');
      },
      onError: (error) =>
        toast.error(getErrorMessage(error, 'Không thể ngừng kích hoạt hạng thành viên.')),
    }),
  };
}

export function useRewardMutations() {
  const queryClient = useQueryClient();
  const invalidate = async () => queryClient.invalidateQueries({ queryKey: rewardKeys.all });

  return {
    create: useMutation({
      mutationFn: (payload: RewardPayload) => rewardApi.create(payload),
      onSuccess: async () => {
        await invalidate();
        toast.success('Tạo phần thưởng thành công.');
      },
      onError: (error) => toast.error(getErrorMessage(error, 'Không thể tạo phần thưởng.')),
    }),
    update: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: RewardPayload }) =>
        rewardApi.update(id, payload),
      onSuccess: async () => {
        await invalidate();
        toast.success('Cập nhật phần thưởng thành công.');
      },
      onError: (error) => toast.error(getErrorMessage(error, 'Không thể cập nhật phần thưởng.')),
    }),
    remove: useMutation({
      mutationFn: rewardApi.remove,
      onSuccess: async () => {
        await invalidate();
        toast.success('Xóa phần thưởng thành công.');
      },
      onError: (error) => toast.error(getErrorMessage(error, 'Không thể xóa phần thưởng.')),
    }),
  };
}

export function useMarkRedemptionUsed(customerId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rewardApi.markRedemptionUsed,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: rewardKeys.myRedemptions }),
        queryClient.invalidateQueries({ queryKey: queryKeys.loyalty.all }),
        customerId
          ? queryClient.invalidateQueries({
              queryKey: loyaltyKeys.customerTransactions(customerId),
            })
          : Promise.resolve(),
      ]);
      toast.success('Đã đánh dấu phần thưởng là đã sử dụng.');
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, 'Không thể đánh dấu phần thưởng. Vui lòng thử lại.')),
  });
}

export function useUpdateAppointmentPaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      paymentStatus,
      paymentMethod,
    }: {
      appointmentId: string;
      paymentStatus: 'paid';
      paymentMethod: 'cash';
    }) => adminAppointmentsApi.updatePaymentStatus(appointmentId, { paymentStatus, paymentMethod }),
    onSuccess: async (appointment) => {
      const customerId =
        typeof appointment.customerId === 'object'
          ? appointment.customerId?._id
          : appointment.customerId;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminAppointmentsQueryKey }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.appointments.admin.detail(appointment._id),
        }),
        customerId
          ? queryClient.invalidateQueries({ queryKey: loyaltyKeys.customer(customerId) })
          : Promise.resolve(),
        customerId
          ? queryClient.invalidateQueries({
              queryKey: loyaltyKeys.customerTransactions(customerId),
            })
          : Promise.resolve(),
      ]);
      toast.success(
        'Xác nhận thanh toán thành công. Điểm tích lũy sẽ được cập nhật nếu đủ điều kiện.'
      );
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, 'Không thể xác nhận thanh toán. Vui lòng thử lại.')),
  });
}

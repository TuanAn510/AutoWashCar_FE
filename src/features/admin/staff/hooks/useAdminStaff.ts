import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getApiErrorMessage } from '@/api/errors';
import { queryKeys } from '@/constants/queryKeys';
import {
  staffsApi,
  type CreateStaffPayload,
  type UpdateStaffPayload,
} from '@/services/userService';
import type { User } from '@/types/user';

export function useStaffAccounts() {
  return useQuery({
    queryKey: queryKeys.users.staffs.list({ scope: 'admin', includeInactive: true }),
    queryFn: ({ signal }) => staffsApi.listAccounts(undefined, signal),
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  });
}

export function useStaffOperationalMetrics() {
  return useQuery({
    queryKey: queryKeys.users.staffs.workload(),
    queryFn: ({ signal }) => staffsApi.workload(signal),
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  });
}

function upsertStaffAccountCache(queryClient: ReturnType<typeof useQueryClient>, staff: User) {
  queryClient.setQueriesData<{ staffs: User[]; total: number }>(
    { queryKey: queryKeys.users.staffs.all },
    (current) => {
      if (!current?.staffs) return current;
      const exists = current.staffs.some((item) => item._id === staff._id);
      const staffs = exists
        ? current.staffs.map((item) => (item._id === staff._id ? { ...item, ...staff } : item))
        : [staff, ...current.staffs];

      return {
        ...current,
        staffs,
        total: staffs.length,
      };
    }
  );
}

export function useCreateStaffAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStaffPayload) => staffsApi.createAccount(payload),
    onSuccess: (staff) => {
      upsertStaffAccountCache(queryClient, staff);
      toast.success('Đã tạo tài khoản nhân viên.');
      queryClient.invalidateQueries({ queryKey: queryKeys.users.staffs.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Không thể tạo tài khoản nhân viên.'));
    },
  });
}

export function useUpdateStaffAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateStaffPayload }) =>
      staffsApi.updateAccount(userId, payload),
    onSuccess: (staff) => {
      upsertStaffAccountCache(queryClient, staff);
      toast.success('Đã cập nhật tài khoản nhân viên.');
      queryClient.invalidateQueries({ queryKey: queryKeys.users.staffs.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Không thể cập nhật tài khoản nhân viên.'));
    },
  });
}

export function useToggleStaffAccountStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      isActive ? staffsApi.unlockAccount(userId) : staffsApi.lockAccount(userId),
    onSuccess: (staff, variables) => {
      upsertStaffAccountCache(queryClient, staff);
      toast.success(
        variables.isActive ? 'Đã mở khóa tài khoản nhân viên.' : 'Đã khóa tài khoản nhân viên.'
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.users.staffs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.staffs.workload() });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Không thể cập nhật trạng thái nhân viên.'));
    },
  });
}

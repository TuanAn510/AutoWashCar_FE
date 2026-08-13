import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getApiErrorMessage } from '@/api/errors';
import { queryKeys } from '@/constants/queryKeys';
import { customersApi, staffsApi, type UpdateUserByAdminPayload } from '@/services/userService';
import type { PaginationParams } from '@/types/api';

type CustomerListResult = Awaited<ReturnType<typeof customersApi.list>>;

export function useCustomers(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.users.customers.list(params),
    queryFn: ({ signal }) => customersApi.list(params, signal),
  });
}

export function useStaffWorkload() {
  return useQuery({
    queryKey: queryKeys.users.staffs.workload(),
    queryFn: ({ signal }) => staffsApi.workload(signal),
    staleTime: 0,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateUserByAdminPayload }) =>
      customersApi.updateByAdmin(userId, payload),
    onMutate: async ({ userId, payload }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.users.customers.all });
      const snapshots = queryClient.getQueriesData<CustomerListResult>({
        queryKey: queryKeys.users.customers.all,
      });

      queryClient.setQueriesData<CustomerListResult>(
        { queryKey: queryKeys.users.customers.all },
        (current) =>
          current
            ? {
                ...current,
                customers: current.customers.map((customer) =>
                  customer._id === userId ? { ...customer, ...payload } : customer
                ),
              }
            : current
      );

      return { snapshots };
    },
    onError: (error, _variables, context) => {
      context?.snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error(getApiErrorMessage(error, 'Không thể cập nhật khách hàng. Vui lòng thử lại.'));
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKeys.users.customers.detail(updatedUser._id), updatedUser);
      toast.success('Cập nhật khách hàng thành công.');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.customers.all }),
  });
}

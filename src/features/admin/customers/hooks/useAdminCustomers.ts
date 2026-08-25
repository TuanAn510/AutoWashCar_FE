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
  const customerListQueryKey = [...queryKeys.users.customers.all, 'list'] as const;

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateUserByAdminPayload }) =>
      customersApi.updateByAdmin(userId, payload),
    onMutate: async ({ userId, payload }) => {
      await queryClient.cancelQueries({ queryKey: customerListQueryKey });
      const snapshots = queryClient.getQueriesData<CustomerListResult>({
        queryKey: customerListQueryKey,
      });

      queryClient.setQueriesData<CustomerListResult>(
        { queryKey: customerListQueryKey },
        (current) =>
          current
            ? {
                ...current,
                customers: current.customers.map((customer) =>
                  customer._id === userId
                    ? {
                        ...customer,
                        ...payload,
                        ...(payload.isActive === undefined ? {} : { active: payload.isActive }),
                      }
                    : customer
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
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.users.customers.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.reports.all }),
      ]),
  });
}

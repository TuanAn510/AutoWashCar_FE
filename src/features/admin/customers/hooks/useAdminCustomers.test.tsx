// @vitest-environment jsdom
import type { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/api/errors';
import { queryKeys } from '@/constants/queryKeys';
import { useUpdateCustomer } from '@/features/admin/customers/hooks/useAdminCustomers';
import { customersApi } from '@/services/userService';
import type { User } from '@/types/user';

describe('useUpdateCustomer', () => {
  it('rolls back an optimistic status update when the request fails', async () => {
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const key = queryKeys.users.customers.list({ page: 1 });
    const customer = { _id: 'customer-1', isActive: true } as User;
    client.setQueryData(key, { customers: [customer], total: 1 });
    vi.spyOn(customersApi, 'updateByAdmin').mockRejectedValue(
      new ApiError({ message: 'Rejected', kind: 'validation' })
    );

    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useUpdateCustomer(), { wrapper });

    await act(async () => {
      await result.current
        .mutateAsync({ userId: customer._id, payload: { isActive: false } })
        .catch(() => undefined);
    });

    await waitFor(() => {
      const cached = client.getQueryData<{ customers: User[] }>(key);
      expect(cached?.customers[0].isActive).toBe(true);
    });
  });
});

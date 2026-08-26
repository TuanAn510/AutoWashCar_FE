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
  it('updates list caches without treating customer detail caches as lists', async () => {
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries');
    const listKey = queryKeys.users.customers.list({ page: 1 });
    const detailKey = queryKeys.users.customers.detail('customer-1');
    const customer = {
      _id: 'customer-1',
      phone: '0900000001',
      displayName: 'Customer',
      isActive: true,
      active: true,
    } as User;
    const detailCustomer = { ...customer, displayName: 'Customer detail' };
    client.setQueryData(listKey, { customers: [customer], total: 1 });
    client.setQueryData(detailKey, detailCustomer);

    let requestCount = 0;
    const updateSpy = vi.spyOn(customersApi, 'updateByAdmin').mockImplementation(
      async (_userId, payload) => {
        requestCount += 1;
        const cachedList = client.getQueryData<{ customers: User[] }>(listKey);
        expect(cachedList?.customers[0]).toMatchObject({
          isActive: payload.isActive,
          active: payload.isActive,
        });
        expect(client.getQueryData<User>(detailKey)?.isActive).toBe(requestCount === 1);
        if (requestCount === 1) {
          expect(client.getQueryData<User>(detailKey)).toEqual(detailCustomer);
        }
        return { ...customer, ...payload, active: payload.isActive };
      }
    );
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useUpdateCustomer(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        userId: customer._id,
        payload: { isActive: false },
      });
    });

    expect(updateSpy).toHaveBeenCalledWith(customer._id, { isActive: false });
    expect(client.getQueryData<User>(detailKey)).toMatchObject({
      _id: customer._id,
      isActive: false,
    });

    await act(async () => {
      await result.current.mutateAsync({
        userId: customer._id,
        payload: { isActive: true },
      });
    });

    expect(client.getQueryData<{ customers: User[] }>(listKey)?.customers[0].isActive).toBe(true);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.reports.all });
  });

  it('rolls back an optimistic status update when the request fails', async () => {
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const key = queryKeys.users.customers.list({ page: 1 });
    const detailKey = queryKeys.users.customers.detail('customer-1');
    const customer = { _id: 'customer-1', isActive: true } as User;
    const detailCustomer = { ...customer, displayName: 'Customer detail' };
    client.setQueryData(key, { customers: [customer], total: 1 });
    client.setQueryData(detailKey, detailCustomer);
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
      expect(client.getQueryData<User>(detailKey)).toEqual(detailCustomer);
    });
  });
});

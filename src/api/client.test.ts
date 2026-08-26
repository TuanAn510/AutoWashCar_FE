import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { apiClient } from '@/api/client';
import { ApiError } from '@/api/errors';
import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/store/useAuthStore';

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(apiClient);
  queryClient.clear();
  useAuthStore.getState().clearState();
});

afterEach(() => mock.restore());

describe('API authentication interceptors', () => {
  it('injects the in-memory bearer token', async () => {
    useAuthStore.getState().setAccessToken('access-1');
    mock.onGet('/protected').reply((config) => [200, config.headers?.Authorization]);

    const response = await apiClient.get('/protected');
    expect(response.data).toBe('Bearer access-1');
  });

  it('runs one refresh for concurrent 401 responses and replays both requests once', async () => {
    let refreshCount = 0;
    mock
      .onGet('/protected')
      .reply((config) =>
        config.headers?.Authorization === 'Bearer access-2' ? [200, { ok: true }] : [401]
      );
    mock.onPost('/auth/refresh-token').reply(() => {
      refreshCount += 1;
      return [200, { success: true, message: 'ok', data: { accessToken: 'access-2' } }];
    });

    const responses = await Promise.all([apiClient.get('/protected'), apiClient.get('/protected')]);

    expect(refreshCount).toBe(1);
    expect(responses.every(({ data }) => data.ok)).toBe(true);
    expect(useAuthStore.getState().accessToken).toBe('access-2');
  });

  it('refreshes a 403 response when the app reloads without an in-memory token', async () => {
    let refreshCount = 0;
    mock
      .onGet('/auth/me')
      .reply((config) =>
        config.headers?.Authorization === 'Bearer access-after-reload'
          ? [200, { id: 1, role: 'customer' }]
          : [403]
      );
    mock.onPost('/auth/refresh-token').reply(() => {
      refreshCount += 1;
      return [200, { success: true, message: 'ok', data: { accessToken: 'access-after-reload' } }];
    });

    const response = await apiClient.get('/auth/me');

    expect(refreshCount).toBe(1);
    expect(response.data.role).toBe('customer');
    expect(useAuthStore.getState().accessToken).toBe('access-after-reload');
  });

  it('does not refresh a 403 response when a bearer token was already sent', async () => {
    useAuthStore.getState().setAccessToken('customer-token');
    mock.onGet('/api/admin/users').reply(403, { message: 'Forbidden' });
    mock.onPost('/auth/refresh-token').reply(200);

    await expect(apiClient.get('/api/admin/users')).rejects.toMatchObject({ kind: 'forbidden' });
    expect(mock.history.post.filter(({ url }) => url === '/auth/refresh-token')).toHaveLength(0);
  });

  it('never refreshes excluded authentication requests', async () => {
    mock.onPost('/auth/signin').reply(401, { message: 'Bad credentials' });
    mock.onPost('/auth/refresh-token').reply(200);

    await expect(apiClient.post('/auth/signin')).rejects.toMatchObject({
      kind: 'unauthorized',
    });
    expect(mock.history.post.filter(({ url }) => url === '/auth/refresh-token')).toHaveLength(0);
  });

  it('clears session state when refresh fails', async () => {
    useAuthStore.getState().setAccessToken('expired');
    mock.onGet('/protected').reply(401);
    mock.onPost('/auth/refresh-token').reply(403, { message: 'Session expired' });

    await expect(apiClient.get('/protected')).rejects.toBeInstanceOf(ApiError);
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('replays a request only once when the refreshed token is also rejected', async () => {
    let refreshCount = 0;
    mock.onGet('/protected').reply(401);
    mock.onPost('/auth/refresh-token').reply(() => {
      refreshCount += 1;
      return [200, { success: true, message: 'ok', data: { accessToken: 'still-invalid' } }];
    });

    await expect(apiClient.get('/protected')).rejects.toMatchObject({ kind: 'unauthorized' });
    expect(refreshCount).toBe(1);
    expect(mock.history.get).toHaveLength(2);
  });
});

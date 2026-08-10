import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { apiClient } from '@/api/client';
import { reportApi } from '@/services/reportService';

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(apiClient);
  mock.onAny().reply(200, { success: true, message: 'ok', data: {} });
});

afterEach(() => mock.restore());

describe('reportApi.getStatistics', () => {
  it('sends both selected month boundaries to every filtered report endpoint', async () => {
    await reportApi.getStatistics({
      startMonth: '2026-06',
      endMonth: '2026-07',
      period: 'monthly',
      limit: 8,
    });

    expect(mock.history.get).toHaveLength(7);
    for (const request of mock.history.get) {
      expect(request.params).toMatchObject({ startMonth: '2026-06', endMonth: '2026-07' });
    }
    expect(mock.history.get.find(({ url }) => url === '/reports/revenue')?.params).toMatchObject({
      period: 'monthly',
    });
    expect(mock.history.get.find(({ url }) => url === '/reports/services')?.params).toMatchObject({
      limit: 8,
    });
  });

  it('requests unbounded monthly data for the all-time overview', async () => {
    await reportApi.getStatistics({ period: 'monthly', limit: 8 });

    expect(mock.history.get).toHaveLength(7);
    expect(mock.history.get.find(({ url }) => url === '/reports/revenue')?.params).toMatchObject({
      period: 'monthly',
    });
    for (const request of mock.history.get) {
      expect(request.params.startMonth).toBeUndefined();
      expect(request.params.endMonth).toBeUndefined();
    }
  });
});

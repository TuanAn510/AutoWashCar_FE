import { describe, expect, it } from 'vitest';

import { queryKeys } from '@/constants/queryKeys';

describe('queryKeys', () => {
  it('uses a shared domain root for lists and details', () => {
    expect(queryKeys.appointments.admin.list({ page: 1 }).slice(0, 2)).toEqual(
      queryKeys.appointments.admin.all
    );
    expect(queryKeys.users.customers.detail('customer-1').slice(0, 2)).toEqual(
      queryKeys.users.customers.all
    );
  });

  it('separates filters and entity identifiers', () => {
    expect(queryKeys.promotions.list({ page: 1 })).not.toEqual(
      queryKeys.promotions.list({ page: 2 })
    );
    expect(queryKeys.payments.status('a')).not.toEqual(queryKeys.payments.status('b'));
  });
});

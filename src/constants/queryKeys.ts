const keyed = <T>(value: T) => value;

export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    me: () => ['auth', 'me'] as const,
  },
  users: {
    all: ['users'] as const,
    customers: {
      all: ['users', 'customers'] as const,
      list: (params?: object) => keyed(['users', 'customers', 'list', params ?? {}] as const),
      detail: (id: string) => ['users', 'customers', 'detail', id] as const,
    },
    staffs: {
      all: ['users', 'staffs'] as const,
      list: (params?: object) => keyed(['users', 'staffs', 'list', params ?? {}] as const),
      workload: () => ['users', 'staffs', 'workload'] as const,
    },
  },
  vehicles: {
    all: ['vehicles'] as const,
    mine: (params?: object) => keyed(['vehicles', 'mine', params ?? {}] as const),
  },
  appointments: {
    all: ['appointments'] as const,
    mine: (params?: object) => keyed(['appointments', 'mine', params ?? {}] as const),
    admin: {
      all: ['appointments', 'admin'] as const,
      list: (filters?: object) => keyed(['appointments', 'admin', 'list', filters ?? {}] as const),
      detail: (id: string) => ['appointments', 'admin', 'detail', id] as const,
    },
    staff: {
      all: ['appointments', 'staff'] as const,
      mine: (params?: object) => keyed(['appointments', 'staff', 'mine', params ?? {}] as const),
    },
  },
  payments: {
    all: ['payments'] as const,
    admin: () => ['payments', 'admin'] as const,
    status: (reference: string) => ['payments', 'status', reference] as const,
  },
  services: {
    all: ['services'] as const,
    list: (params?: object) => keyed(['services', 'list', params ?? {}] as const),
    allItems: () => ['services', 'all-items'] as const,
    active: (params?: object) => keyed(['services', 'active', params ?? {}] as const),
  },
  serviceCategories: {
    all: ['service-categories'] as const,
    list: (params?: object) => keyed(['service-categories', 'list', params ?? {}] as const),
    allItems: () => ['service-categories', 'all-items'] as const,
    active: (params?: object) => keyed(['service-categories', 'active', params ?? {}] as const),
  },
  serviceHistories: {
    all: ['service-histories'] as const,
    admin: {
      all: ['service-histories', 'admin'] as const,
      list: (filters?: object) =>
        keyed(['service-histories', 'admin', 'list', filters ?? {}] as const),
      detail: (id: string) => ['service-histories', 'admin', 'detail', id] as const,
    },
    customer: {
      all: ['service-histories', 'customer'] as const,
      list: (vehicleId: string, params?: object) =>
        keyed(['service-histories', 'customer', 'list', vehicleId, params ?? {}] as const),
      detail: (id: string) => ['service-histories', 'customer', 'detail', id] as const,
    },
    staff: () => ['service-histories', 'staff', 'mine'] as const,
  },
  promotions: {
    all: ['promotions'] as const,
    list: (params?: object) => keyed(['promotions', 'list', params ?? {}] as const),
    active: () => ['promotions', 'active'] as const,
  },
  reports: {
    all: ['reports'] as const,
    statistics: (params: {
      startMonth?: string;
      endMonth?: string;
      startDate?: string;
      endDate?: string;
      period?: string;
      limit?: number;
    }) =>
      keyed([
        'reports',
        'statistics',
        {
          startMonth: params.startMonth,
          endMonth: params.endMonth,
          startDate: params.startDate,
          endDate: params.endDate,
          period: params.period,
          limit: params.limit,
        },
      ] as const),
  },
  loyalty: {
    all: ['loyalty'] as const,
    me: () => ['loyalty', 'me'] as const,
    myTransactions: () => ['loyalty', 'me', 'transactions'] as const,
    customers: (params?: object) => keyed(['loyalty', 'customers', params ?? {}] as const),
    customer: (id: string) => ['loyalty', 'customers', id] as const,
    customerTransactions: (id: string) => ['loyalty', 'customers', id, 'transactions'] as const,
  },
  membershipTiers: {
    all: ['membership-tiers'] as const,
  },
  rewards: {
    all: ['rewards'] as const,
    list: (params?: object) => keyed(['rewards', 'list', params ?? {}] as const),
    myRedemptions: () => ['rewards', 'my-redemptions'] as const,
  },
} as const;

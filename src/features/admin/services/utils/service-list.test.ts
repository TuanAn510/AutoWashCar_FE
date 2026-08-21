import { describe, expect, it } from 'vitest';

import {
  buildServiceFilterCategories,
  filterAndSortServices,
} from '@/features/admin/services/utils/service-list';
import type { Service } from '@/types/service';
import type { ServiceCategory } from '@/types/serviceCategory';

const washingCategory: ServiceCategory = {
  _id: 'washing',
  name: 'Rửa xe',
  isActive: true,
};

const detailingCategory: ServiceCategory = {
  _id: 'detailing',
  name: 'Chăm sóc xe',
  isActive: false,
};

const service = (
  id: string,
  name: string,
  category: ServiceCategory,
  isActive: boolean
): Service => ({
  _id: id,
  name,
  slug: id,
  categoryId: category,
  description: '',
  price: 150_000,
  estimatedDuration: 30,
  baseRewardPoints: 15,
  rewardMultiplier: 1,
  rewardPoints: 15,
  isActive,
  version: 0,
  createdAt: '2026-08-20T00:00:00',
  updatedAt: '2026-08-20T00:00:00',
});

const services = [
  service('premium', 'Vệ Sinh Cao Cấp', detailingCategory, true),
  service('basic', 'Rửa Cơ Bản', washingCategory, true),
  service('hidden', 'Rửa Nhanh', washingCategory, false),
];

describe('service management list', () => {
  it('searches service names without depending on case or Vietnamese accents', () => {
    const result = filterAndSortServices(services, {
      keyword: 'rua co ban',
      categoryId: 'all',
      status: 'all',
      sortOrder: 'asc',
    });

    expect(result.map((item) => item._id)).toEqual(['basic']);
  });

  it('combines category and status filters', () => {
    const result = filterAndSortServices(services, {
      keyword: '',
      categoryId: 'washing',
      status: 'inactive',
      sortOrder: 'asc',
    });

    expect(result.map((item) => item._id)).toEqual(['hidden']);
  });

  it('sorts names in both directions without mutating the source list', () => {
    const originalOrder = services.map((item) => item._id);
    const ascending = filterAndSortServices(services, {
      keyword: '',
      categoryId: 'all',
      status: 'all',
      sortOrder: 'asc',
    });
    const descending = filterAndSortServices(services, {
      keyword: '',
      categoryId: 'all',
      status: 'all',
      sortOrder: 'desc',
    });

    expect(descending.map((item) => item.name)).toEqual(
      ascending.map((item) => item.name).reverse()
    );
    expect(services.map((item) => item._id)).toEqual(originalOrder);
  });

  it('keeps categories used by existing services available in the filter', () => {
    const categories = buildServiceFilterCategories([washingCategory], services);

    expect(categories.map((category) => category._id)).toEqual(['detailing', 'washing']);
  });
});

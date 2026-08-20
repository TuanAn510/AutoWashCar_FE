import type { Service } from '@/types/service';
import type { ServiceCategory } from '@/types/serviceCategory';

export type ServiceStatusFilter = 'all' | 'active' | 'inactive';
export type ServiceNameSortOrder = 'asc' | 'desc';

interface ServiceListFilters {
  keyword: string;
  categoryId: string;
  status: ServiceStatusFilter;
  sortOrder: ServiceNameSortOrder;
}

const normalizeSearchText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[đĐ]/g, 'd')
    .toLocaleLowerCase('vi-VN')
    .trim();

export function filterAndSortServices(services: Service[], filters: ServiceListFilters) {
  const normalizedKeyword = normalizeSearchText(filters.keyword);

  return services
    .filter((service) => {
      const matchesKeyword =
        !normalizedKeyword || normalizeSearchText(service.name).includes(normalizedKeyword);
      const matchesCategory =
        filters.categoryId === 'all' || service.categoryId._id === filters.categoryId;
      const matchesStatus =
        filters.status === 'all' || service.isActive === (filters.status === 'active');

      return matchesKeyword && matchesCategory && matchesStatus;
    })
    .sort((left, right) => {
      const comparison = left.name.localeCompare(right.name, 'vi-VN', {
        sensitivity: 'base',
        numeric: true,
      });

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });
}

export function buildServiceFilterCategories(
  activeCategories: ServiceCategory[],
  services: Service[]
) {
  const categories = new Map<string, ServiceCategory>();

  activeCategories.forEach((category) => categories.set(category._id, category));
  services.forEach((service) => {
    if (!categories.has(service.categoryId._id)) {
      categories.set(service.categoryId._id, service.categoryId);
    }
  });

  return [...categories.values()].sort((left, right) =>
    left.name.localeCompare(right.name, 'vi-VN', { sensitivity: 'base' })
  );
}

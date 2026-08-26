import type { Service } from '@/types/service';

export type ServiceStatusFilter = 'all' | 'active' | 'inactive';
export type ServiceNameSortOrder = 'asc' | 'desc';

interface ServiceListFilters {
  keyword: string;
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
      const matchesStatus =
        filters.status === 'all' || service.isActive === (filters.status === 'active');

      return matchesKeyword && matchesStatus;
    })
    .sort((left, right) => {
      const comparison = left.name.localeCompare(right.name, 'vi-VN', {
        sensitivity: 'base',
        numeric: true,
      });

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });
}

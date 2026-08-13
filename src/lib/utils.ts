import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDateTime = (date: string, options?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(new Date(date));

export const formatNumberVi = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '0';
  return new Intl.NumberFormat('vi-VN').format(value);
};

export const formatCurrencyVi = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '0đ';

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatDateVi = (date?: string | Date | null) => {
  if (!date) return 'Chưa có dữ liệu';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
};

export const formatDateTimeVi = (date?: string | Date | null) => {
  if (!date) return 'Chưa có dữ liệu';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const calculateChangePercent = (current: number, previous: number) => {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
};

export const formatDate = (date: string, options?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  }).format(new Date(date));

export const formatPrice = (value: number) => formatCurrencyVi(value);

export const formatTime = (totalMinutes: number) => {
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;
  const parts = [
    days > 0 ? `${days} ngày` : null,
    hours > 0 ? `${hours} giờ` : null,
    minutes > 0 ? `${minutes} phút` : null,
  ].filter((part): part is string => Boolean(part));

  return parts.length > 0 ? parts.join(' ') : '0 phút';
};

export const formatServiceHistoryDate = (date?: string | null) => {
  if (!date) {
    return 'Chưa có dữ liệu';
  }

  return formatDateTime(date);
};

export const formatServiceHistoryDateOnly = (date?: string | null) => {
  if (!date) {
    return 'Chưa có dữ liệu';
  }

  return formatDate(date);
};

export const formatServiceHistoryPrice = formatPrice;

export const getServiceHistoryTitle = (serviceNames: string[]) => {
  if (serviceNames.length === 0) {
    return 'Lịch sử dịch vụ';
  }

  if (serviceNames.length === 1) {
    return serviceNames[0];
  }

  return `${serviceNames[0]} và ${serviceNames.length - 1} dịch vụ khác`;
};

export const getMonthStartISOString = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return start.toISOString();
};

export const formatRelativeCreatedTime = (dateString?: string | null): string => {
  if (!dateString) return '';

  const now = new Date();
  const created = new Date(dateString);
  const diffMs = now.getTime() - created.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Vừa tạo';
  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
  return 'Cũ hơn';
};

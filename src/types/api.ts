export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginationMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface PaginatedEnvelope<T, TSummary = unknown> extends ApiEnvelope<T[]> {
  pagination?: PaginationMeta;
  summary?: TSummary;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination?: PaginationMeta;
  total: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  keyword?: string;
  carType?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

import type { AppointmentStatus } from '@/types/appointment';
import type { PaginatedResult } from '@/types/api';

export type { PaginatedResult, PaginationMeta } from '@/types/api';

export interface ServiceHistoryUserSummary {
  _id: string;
  displayName: string;
  phone?: string;
  avatarUrl?: string;
}

export interface ServiceHistoryVehicleSummary {
  _id: string;
  brand: string;
  model: string;
  licensePlate: string;
  year: number;
}

export interface ServiceHistoryAppointmentSummary {
  _id: string;
  status: AppointmentStatus;
  scheduledAt?: string | null;
  completedAt?: string | null;
  paymentStatus?: 'unpaid' | 'paid';
}

export interface ServiceHistoryServiceSnapshot {
  serviceId: string;
  nameSnapshot: string;
  priceSnapshot: number;
  estimatedDurationSnapshot: number;
}

export interface ServiceHistoryItem {
  _id: string;
  customerId: ServiceHistoryUserSummary;
  vehicleId: ServiceHistoryVehicleSummary;
  appointmentId: ServiceHistoryAppointmentSummary;
  services: ServiceHistoryServiceSnapshot[];
  totalPrice: number;
  totalEstimatedDuration: number;
  servicedAt: string;
  handledBy: ServiceHistoryUserSummary | null;
  note?: string;
  nextMaintenanceDate?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceHistoryListParams {
  page?: number;
  limit?: number;
  customerId?: string;
  vehicleId?: string;
  appointmentId?: string;
  fromDate?: string;
  toDate?: string;
}

export interface UpdateServiceHistoryPayload {
  note?: string;
  nextMaintenanceDate?: string;
}

export type ServiceHistoryListResult = PaginatedResult<ServiceHistoryItem>;

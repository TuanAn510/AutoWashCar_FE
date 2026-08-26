import type { ServiceHistoryItem } from '@/types/serviceHistory';

export const getServiceHistoryNote = (note?: string | null) =>
  note?.trim() ? note.trim() : 'Không có ghi chú';

export const formatServiceHistoryVehicleLine = (serviceHistory: ServiceHistoryItem) =>
  `${serviceHistory.vehicleId.brand} ${serviceHistory.vehicleId.model} · ${serviceHistory.vehicleId.licensePlate}`;

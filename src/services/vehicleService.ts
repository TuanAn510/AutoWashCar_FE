import api from '@/api/client';
import type { ApiEnvelope, PaginationMeta, PaginationParams } from '@/types/api';
import type { ApiVehicle, CreateVehiclePayload, UpdateVehiclePayload } from '@/types/vehicle';

interface VehicleListEnvelope {
  success: boolean;
  message: string;
  data: ApiVehicle[];
  pagination?: PaginationMeta;
}

const buildVehicleFormData = (payload: CreateVehiclePayload | UpdateVehiclePayload) => {
  const formData = new FormData();

  if (typeof payload.brand !== 'undefined') {
    formData.append('brand', payload.brand);
  }
  if (typeof payload.model !== 'undefined') {
    formData.append('model', payload.model);
  }
  if (typeof payload.licensePlate !== 'undefined') {
    formData.append('licensePlate', payload.licensePlate);
  }
  if (typeof payload.year !== 'undefined') {
    formData.append('year', String(payload.year));
  }
  payload.files?.forEach((file) => {
    formData.append('files', file);
  });

  return formData;
};

export const vehiclesApi = {
  getMyVehicles: async (params?: PaginationParams, signal?: AbortSignal) => {
    const response = await api.get<VehicleListEnvelope>('/vehicles/me', {
      params,
      signal,
    });

    return {
      vehicles: response.data.data,
      pagination: response.data.pagination,
      total: response.data.pagination?.total ?? response.data.data.length,
      message: response.data.message,
    };
  },

  listMine: async (params?: PaginationParams, signal?: AbortSignal) => {
    return vehiclesApi.getMyVehicles(params, signal);
  },

  createVehicle: async (payload: CreateVehiclePayload) => {
    const response = await api.post<ApiEnvelope<ApiVehicle>>(
      '/vehicles',
      buildVehicleFormData(payload),
      {}
    );

    return response.data.data;
  },

  updateVehicle: async (vehicleId: string, payload: UpdateVehiclePayload) => {
    const response = await api.patch<ApiEnvelope<ApiVehicle>>(
      `/vehicles/${vehicleId}`,
      buildVehicleFormData(payload),
      {}
    );

    return response.data.data;
  },

  deleteVehicle: async (vehicleId: string) => {
    const response = await api.delete<ApiEnvelope<ApiVehicle>>(`/vehicles/${vehicleId}`);
    return response.data.data;
  },
};

export const vehicleService = vehiclesApi;

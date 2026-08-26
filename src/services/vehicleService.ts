import api from '@/api/client';
import type { ApiEnvelope, PaginationMeta, PaginationParams } from '@/types/api';
import type {
  ApiVehicle,
  CreateVehiclePayload,
  UpdateVehiclePayload,
  VehicleBrand,
  VehicleModel,
} from '@/types/vehicle';

interface VehicleListEnvelope {
  success: boolean;
  message: string;
  data: ApiVehicle[];
  pagination?: PaginationMeta;
}

/** Unwrap an envelope ({ data: T }) or a raw array, whichever the backend returns. */
const unwrapList = <T>(envelope: ApiEnvelope<T[]> | T[]): T[] =>
  Array.isArray(envelope) ? envelope : envelope.data;

const buildVehicleFormData = (payload: CreateVehiclePayload | UpdateVehiclePayload) => {
  const formData = new FormData();

  if (typeof payload.brand !== 'undefined') {
    formData.append('brand', payload.brand);
  }
  if (typeof payload.model !== 'undefined') {
    formData.append('model', payload.model);
  }
  if (typeof payload.brandId !== 'undefined') {
    formData.append('brandId', payload.brandId);
  }
  if (typeof payload.modelId !== 'undefined') {
    formData.append('modelId', payload.modelId);
  }
  if (typeof payload.suggestedBrandName !== 'undefined') {
    formData.append('suggestedBrandName', payload.suggestedBrandName);
  }
  if (typeof payload.suggestedModelName !== 'undefined') {
    formData.append('suggestedModelName', payload.suggestedModelName);
  }
  if (typeof payload.licensePlate !== 'undefined') {
    formData.append('licensePlate', payload.licensePlate);
  }
  if (typeof payload.year !== 'undefined') {
    formData.append('year', String(payload.year));
  }
  if (typeof payload.carType !== 'undefined') {
    formData.append('carType', payload.carType);
  }
  payload.files?.forEach((file) => {
    formData.append('files', file);
  });

  return formData;
};

export const vehiclesApi = {
  getVehicleBrands: async (signal?: AbortSignal): Promise<VehicleBrand[]> => {
    const response = await api.get<ApiEnvelope<VehicleBrand[]> | VehicleBrand[]>(
      '/vehicle-brands',
      { signal }
    );
    return unwrapList<VehicleBrand>(response.data);
  },

  getVehicleModels: async (brandId: string, signal?: AbortSignal): Promise<VehicleModel[]> => {
    const response = await api.get<ApiEnvelope<VehicleModel[]> | VehicleModel[]>(
      `/vehicle-brands/${brandId}/models`,
      { signal }
    );
    return unwrapList<VehicleModel>(response.data);
  },

  getMyVehicles: async (
    params?: PaginationParams,
    signal?: AbortSignal,
    includeInactive = false
  ) => {
    const response = await api.get<VehicleListEnvelope>('/vehicles/me', {
      // includeInactive=1 để trang "Xe của tôi" kèm các xe đã bị KHÓA (biển chuyển
      // quyền) nhằm hiển thị "đã khóa" cho chủ cũ; các nơi khác (đặt lịch, filter)
      // bỏ qua → vẫn chỉ nhận xe active như cũ.
      params: includeInactive ? { ...params, includeInactive: true } : params,
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

  createVehicle: async (payload: CreateVehiclePayload): Promise<ApiVehicle> => {
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

  /** Ẩn xe đã khóa (bất hoạt) khỏi tab "Đã khóa" của customer. Không xóa dữ liệu. */
  dismissVehicle: async (vehicleId: string) => {
    const response = await api.patch<ApiEnvelope<ApiVehicle>>(`/vehicles/${vehicleId}/dismiss`);
    return response.data.data;
  },

  // Admin
  listAll: async (params?: PaginationParams, signal?: AbortSignal) => {
    const response = await api.get<VehicleListEnvelope>('/vehicles', {
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

  getById: async (vehicleId: string, signal?: AbortSignal) => {
    const response = await api.get<ApiEnvelope<ApiVehicle>>(`/vehicles/${vehicleId}`, { signal });
    return response.data.data;
  },
};

export const vehicleService = vehiclesApi;

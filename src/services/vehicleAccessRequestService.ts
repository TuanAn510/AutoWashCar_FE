import api from '@/api/client';
import type { ApiEnvelope, PaginationMeta } from '@/types/api';
import type {
  CreateVehicleAccessRequestPayload,
  VehicleAccessRequest,
  VehicleAccessRequestStatus,
} from '@/types/vehicle';

interface ListEnvelope {
  data: VehicleAccessRequest[];
  pagination?: PaginationMeta;
}
export const vehicleAccessRequestApi = {
  create: async (payload: CreateVehicleAccessRequestPayload) => {
    const form = new FormData();
    form.append('licensePlate', payload.licensePlate);
    form.append('relationship', payload.relationship);
    if (payload.note) form.append('note', payload.note);
    // Luồng combined (trùng biển + "Khác" hãng/dòng): backend đọc 2 field
    // riêng brandModelDocuments + plateDocuments.
    const isCombined = Boolean(payload.suggestedBrandName || payload.suggestedModelName);
    if (payload.suggestedBrandName) form.append('suggestedBrandName', payload.suggestedBrandName);
    if (payload.suggestedModelName) form.append('suggestedModelName', payload.suggestedModelName);
    if (payload.catalogBrandName) form.append('catalogBrandName', payload.catalogBrandName);
    if (payload.catalogModelName) form.append('catalogModelName', payload.catalogModelName);
    if (isCombined) {
      payload.brandModelDocuments?.forEach((file) => form.append('brandModelDocuments', file));
      payload.documents?.forEach((file) => form.append('plateDocuments', file));
    } else {
      // Luồng biển số đơn (chọn hãng/dòng CÓ SẴN): backend đọc field documents.
      payload.documents?.forEach((file) => form.append('documents', file));
    }
    return (await api.post<ApiEnvelope<VehicleAccessRequest>>('/vehicle-access-requests', form))
      .data.data;
  },
  listMine: async () => (await api.get<ListEnvelope>('/vehicle-access-requests/me')).data.data,
  resubmitBrandModel: async (payload: {
    /** Present when the request is linked to an already-existing vehicle (edit path). */
    vehicleId?: string;
    licensePlate: string;
    suggestedBrandName?: string;
    suggestedModelName?: string;
    carType?: string;
    manufactureYear?: number;
    note?: string;
    documents: File[];
  }) => {
    const form = new FormData();
    if (payload.vehicleId) form.append('vehicleId', payload.vehicleId);
    form.append('licensePlate', payload.licensePlate);
    if (payload.suggestedBrandName) form.append('suggestedBrandName', payload.suggestedBrandName);
    if (payload.suggestedModelName) form.append('suggestedModelName', payload.suggestedModelName);
    if (payload.carType) form.append('carType', payload.carType);
    if (payload.manufactureYear != null)
      form.append('manufactureYear', String(payload.manufactureYear));
    if (payload.note) form.append('note', payload.note);
    payload.documents.forEach((file) => form.append('documents', file));
    return (
      await api.post<ApiEnvelope<VehicleAccessRequest>>(
        '/vehicle-access-requests/brand-model',
        form
      )
    ).data.data;
  },
  listAdmin: async (status?: VehicleAccessRequestStatus) =>
    (await api.get<ListEnvelope>('/vehicle-access-requests', { params: { status, limit: 100 } }))
      .data.data,
  approve: async (id: string, reviewNote: string) =>
    (
      await api.patch<ApiEnvelope<VehicleAccessRequest>>(`/vehicle-access-requests/${id}/approve`, {
        reviewNote,
      })
    ).data.data,
  reject: async (id: string, reviewNote: string) =>
    (
      await api.patch<ApiEnvelope<VehicleAccessRequest>>(`/vehicle-access-requests/${id}/reject`, {
        reviewNote,
      })
    ).data.data,
};

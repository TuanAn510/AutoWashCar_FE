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
    payload.documents?.forEach((file) => form.append('documents', file));
    return (await api.post<ApiEnvelope<VehicleAccessRequest>>('/vehicle-access-requests', form))
      .data.data;
  },
  listMine: async () => (await api.get<ListEnvelope>('/vehicle-access-requests/me')).data.data,
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

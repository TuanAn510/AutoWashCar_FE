import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { vehicleAccessRequestApi } from '@/services/vehicleAccessRequestService';
import { queryKeys } from '@/constants/queryKeys';
import type { CreateVehicleAccessRequestPayload } from '@/types/vehicle';

export const vehicleAccessRequestKeys = {
  all: ['vehicle-access-requests'] as const,
  mine: ['vehicle-access-requests', 'mine'] as const,
};
export const useMyVehicleAccessRequests = () =>
  useQuery({ queryKey: vehicleAccessRequestKeys.mine, queryFn: vehicleAccessRequestApi.listMine });
export const useCreateVehicleAccessRequest = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVehicleAccessRequestPayload) =>
      vehicleAccessRequestApi.create(payload),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: vehicleAccessRequestKeys.mine });
      toast.success('Đã gửi yêu cầu xác minh.');
    },
  });
};
export const useResubmitBrandModel = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      vehicleId?: string;
      licensePlate: string;
      suggestedBrandName?: string;
      suggestedModelName?: string;
      carType?: string;
      manufactureYear?: number;
      note: string;
      documents: File[];
    }) => vehicleAccessRequestApi.resubmitBrandModel(payload),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: vehicleAccessRequestKeys.mine });
      client.invalidateQueries({ queryKey: queryKeys.vehicles.mine() });
      toast.success('Đã gửi lại yêu cầu xác minh hãng/dòng xe.');
    },
  });
};

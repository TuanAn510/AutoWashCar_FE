import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getApiErrorMessage, toApiError } from '@/api/errors';
import { queryKeys } from '@/constants/queryKeys';
import { vehiclesApi } from '@/services/vehicleService';
import type { CreateVehiclePayload, UpdateVehiclePayload } from '@/types/vehicle';

const getErrorMessage = getApiErrorMessage;

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVehiclePayload) => vehiclesApi.createVehicle(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
      toast.success('Thêm xe thành công.');
    },
    onError: (error) => {
      if (toApiError(error).code === 'VEHICLE_VERIFICATION_REQUIRED') return;
      toast.error(getErrorMessage(error, 'Không thể thêm xe. Vui lòng thử lại.'));
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vehicleId, payload }: { vehicleId: string; payload: UpdateVehiclePayload }) =>
      vehiclesApi.updateVehicle(vehicleId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
      toast.success('Cập nhật xe thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể cập nhật xe. Vui lòng thử lại.'));
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vehicleId: string) => vehiclesApi.deleteVehicle(vehicleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
      toast.success('Xóa xe thành công.');
    },
    onError: (error) => {
      const apiError = toApiError(error);
      if (apiError.code === 'VEHICLE_ACTIVE_APPOINTMENT' || apiError.status === 409) {
        toast.error(
          'Không thể xóa xe vì xe đang có lịch hẹn chờ xác nhận hoặc đang được thực hiện.'
        );
        return;
      }
      toast.error(getErrorMessage(error, 'Không thể xóa xe. Vui lòng thử lại.'));
    },
  });
}

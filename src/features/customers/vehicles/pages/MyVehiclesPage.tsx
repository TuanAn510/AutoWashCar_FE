import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { CarFront, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomerEmptyState } from '@/features/customers/components/CustomerEmptyState';
import {
  type ApiVehicle,
  type CreateVehiclePayload,
  type UpdateVehiclePayload,
} from '@/types/vehicle';
import { DeleteVehicleDialog } from '@/features/customers/vehicles/components/delete-vehicle-dialog';
import { toApiError } from '@/api/errors';
import { VehicleVerificationDialog } from '@/features/customers/vehicles/components/vehicle-verification-dialog';
import {
  useCreateVehicleAccessRequest,
  useMyVehicleAccessRequests,
} from '@/features/customers/vehicles/hooks/useVehicleAccessRequests';

import { VehicleCard } from '@/features/customers/vehicles/components/vehicle-card';
import { VehicleDetailDialog } from '@/features/customers/vehicles/components/vehicle-detail-dialog';
import { VehicleFormDialog } from '@/features/customers/vehicles/components/vehicle-form-dialog';
import { useMyVehicles } from '@/features/customers/vehicles/hooks/useMyVehicles';
import {
  useCreateVehicle,
  useDeleteVehicle,
  useUpdateVehicle,
} from '@/features/customers/vehicles/hooks/useVehicleMutations';

export default function MyVehiclesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<ApiVehicle | null>(null);
  const [detailVehicle, setDetailVehicle] = useState<ApiVehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<ApiVehicle | null>(null);
  const [verificationPlate, setVerificationPlate] = useState<string | null>(null);

  const myVehiclesQuery = useMyVehicles();
  const createVehicleMutation = useCreateVehicle();
  const updateVehicleMutation = useUpdateVehicle();
  const deleteVehicleMutation = useDeleteVehicle();
  const accessRequestsQuery = useMyVehicleAccessRequests();
  const createAccessRequest = useCreateVehicleAccessRequest();

  const vehicles = myVehiclesQuery.data?.vehicles ?? [];
  const pendingAccessRequests = accessRequestsQuery.data?.filter((request) => request.status === 'pending') ?? [];
  const isCreateRequested = searchParams.get('create') === '1';
  const isCreateDialogOpen = isCreateOpen || isCreateRequested;

  const clearCreateSearchParam = () => {
    if (!isCreateRequested) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete('create');
    setSearchParams(nextSearchParams, { replace: true });
  };

  const handleCreateVehicle = async (payload: CreateVehiclePayload | UpdateVehiclePayload) => {
    try {
      await createVehicleMutation.mutateAsync(payload as CreateVehiclePayload);
    } catch (error) {
      if (toApiError(error).code === 'VEHICLE_VERIFICATION_REQUIRED') {
        setVerificationPlate((payload as CreateVehiclePayload).licensePlate);
        setIsCreateOpen(false);
        clearCreateSearchParam();
        return;
      }
      throw error;
    }
    setIsCreateOpen(false);
    clearCreateSearchParam();
  };

  const handleUpdateVehicle = async (payload: CreateVehiclePayload | UpdateVehiclePayload) => {
    if (!editingVehicle) return;

    await updateVehicleMutation.mutateAsync({
      vehicleId: editingVehicle._id,
      payload: payload as UpdateVehiclePayload,
    });
    setEditingVehicle(null);
  };

  const handleDeleteVehicle = async () => {
    if (!deletingVehicle) return;

    await deleteVehicleMutation.mutateAsync(deletingVehicle._id);
    setDeletingVehicle(null);
  };

  return (
    <main className="min-h-[calc(100vh-73px)] min-w-0 overflow-x-hidden bg-[#f8fafc] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1240px] min-w-0 flex-col gap-5">
        <section className="flex w-full min-w-0 flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Customer Vehicles
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Xe của tôi
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Quản lý các ô tô bạn dùng để đặt lịch dịch vụ tại AutoWash Pro.
              </p>
            </div>

            <Button
              className="h-10 w-full rounded-md px-5 sm:w-auto"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="size-4" />
              Thêm xe mới
            </Button>
          </div>
        </section>

        {myVehiclesQuery.isLoading ? (
          <section
            aria-label="Đang tải danh sách xe"
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-80 rounded-2xl" />
            ))}
          </section>
        ) : myVehiclesQuery.isError ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-14 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-rose-700">Không thể tải danh sách xe</h2>
            <p className="mt-2 text-sm text-rose-600">Vui lòng thử lại sau ít phút.</p>
            <Button className="mt-5 rounded-xl" onClick={() => myVehiclesQuery.refetch()}>
              Thử lại
            </Button>
          </section>
        ) : vehicles.length === 0 ? (
          <CustomerEmptyState
            icon={<CarFront />}
            title="Bạn chưa có xe nào"
            description="Hãy thêm ô tô để dễ dàng đặt lịch chăm sóc và bảo dưỡng."
            primaryAction={
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="size-4" />
                Thêm xe đầu tiên
              </Button>
            }
          />
        ) : (
          <section className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Danh sách ô tô</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Bạn hiện có {myVehiclesQuery.data?.total ?? vehicles.length} xe trong tài khoản.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle._id}
                  vehicle={vehicle}
                  onView={setDetailVehicle}
                  onEdit={setEditingVehicle}
                  onDelete={setDeletingVehicle}
                />
              ))}
            </div>
          </section>
        )}
        {!!pendingAccessRequests.length && (
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold">Yêu cầu xác minh xe</h2>
            <div className="mt-3 grid gap-2">
              {pendingAccessRequests.map((request) => (
                <div key={request._id} className="rounded-xl border p-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="font-semibold">{request.licensePlate}</span>
                    <span className="capitalize">{request.status}</span>
                  </div>
                  <p className="mt-1 text-slate-500">{request.relationship}</p>
                  {request.reviewNote && <p className="mt-1">Phản hồi: {request.reviewNote}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <VehicleFormDialog
        key={`create-${isCreateDialogOpen}`}
        open={isCreateDialogOpen}
        mode="create"
        isSubmitting={createVehicleMutation.isPending}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) clearCreateSearchParam();
        }}
        onSubmit={handleCreateVehicle}
      />

      <VehicleFormDialog
        key={editingVehicle?._id ?? 'closed'}
        open={!!editingVehicle}
        mode="edit"
        vehicle={editingVehicle}
        isSubmitting={updateVehicleMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setEditingVehicle(null);
        }}
        onSubmit={handleUpdateVehicle}
      />

      <VehicleDetailDialog
        open={!!detailVehicle}
        vehicle={detailVehicle}
        onOpenChange={(open) => {
          if (!open) setDetailVehicle(null);
        }}
      />

      <DeleteVehicleDialog
        open={!!deletingVehicle}
        vehicle={deletingVehicle}
        isDeleting={deleteVehicleMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setDeletingVehicle(null);
        }}
        onConfirm={handleDeleteVehicle}
      />

      <VehicleVerificationDialog
        plate={verificationPlate ?? ''}
        open={Boolean(verificationPlate)}
        pending={createAccessRequest.isPending}
        onOpenChange={(open) => {
          if (!open) setVerificationPlate(null);
        }}
        onSubmit={async (value) => {
          if (!verificationPlate) return;
          await createAccessRequest.mutateAsync({ licensePlate: verificationPlate, ...value });
          setVerificationPlate(null);
        }}
      />
    </main>
  );
}

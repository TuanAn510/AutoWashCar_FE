import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import { CarFront, Clock, Plus, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTimeVi } from '@/lib/utils';
import { CustomerEmptyState } from '@/features/customers/components/CustomerEmptyState';
import {
  type ApiVehicle,
  type CreateVehiclePayload,
  type UpdateVehiclePayload,
  type VehicleAccessRequest,
} from '@/types/vehicle';
import { DeleteVehicleDialog } from '@/features/customers/vehicles/components/delete-vehicle-dialog';
import { toApiError } from '@/api/errors';
import { queryKeys } from '@/constants/queryKeys';
import { VehicleVerificationDialog } from '@/features/customers/vehicles/components/vehicle-verification-dialog';
import { BrandModelVerificationDialog } from '@/features/customers/vehicles/components/brand-model-verification-dialog';
import {
  useCreateVehicleAccessRequest,
  useMyVehicleAccessRequests,
  useResubmitBrandModel,
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
  const [verificationPlate, setVerificationPlate] = useState<{
    licensePlate: string;
    brand?: string;
    model?: string;
    /** True khi khách chọn "Khác" (custom) ở hãng và/hoặc dòng → cần xác minh
     *  thêm hãng/dòng, không chỉ biển số. */
    needsBrandModelVerification?: boolean;
  } | null>(null);
  const [resubmitRequest, setResubmitRequest] = useState<VehicleAccessRequest | null>(null);
  const [resubmitBrandModelRequest, setResubmitBrandModelRequest] = useState<VehicleAccessRequest | null>(null);
  // "Yêu cầu đã xác minh" chỉ hiện 3 mới nhất; bấm "Xem thêm" để hiện hết.
  const [showAllApproved, setShowAllApproved] = useState(false);

  const myVehiclesQuery = useMyVehicles();
  const createVehicleMutation = useCreateVehicle();
  const updateVehicleMutation = useUpdateVehicle();
  const deleteVehicleMutation = useDeleteVehicle();
  const accessRequestsQuery = useMyVehicleAccessRequests();
  const createAccessRequest = useCreateVehicleAccessRequest();
  const resubmitBrandModel = useResubmitBrandModel();
  const queryClient = useQueryClient();

  const vehicles = myVehiclesQuery.data?.vehicles ?? [];
  const accessRequests = accessRequestsQuery.data ?? [];
  const pendingAccessRequests = accessRequests.filter((request) => request.status === 'pending');
  const approvedAccessRequests = accessRequests.filter((request) => request.status === 'approved');
  // Ẩn thẻ "Chưa đủ minh chứng" chỉ khi biến số đó còn một yêu cầu khác (pending hoặc approved)
  // MỚI HƠN — tức là khách đã gửi lại / đã được duyệt xong. Các approved cũ không làm ẩn.
  const rejectedAccessRequests = accessRequests.filter((request) =>
    request.status === 'rejected'
      ? !accessRequests.some(
          (other) =>
            other.licensePlate === request.licensePlate &&
            other.status !== 'rejected' &&
            other.createdAt > request.createdAt
        )
      : false
  );
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
      const code = toApiError(error).code;
      if (code === 'VEHICLE_VERIFICATION_REQUIRED') {
        const vehiclePayload = payload as CreateVehiclePayload;
        // Popup mang đủ hãng/dòng cuối cùng khách chọn: lấy tên custom nếu chọn
        // "Khác", ngược lại lấy tên catalog — để xe mới khi duyệt không bị kế
        // thừa nhầm hãng/dòng của xe cũ trong trường hợp chỉ "Khác" 1 trong 2.
        setVerificationPlate({
          licensePlate: vehiclePayload.licensePlate,
          brand: vehiclePayload.suggestedBrandName ?? vehiclePayload.brand,
          model: vehiclePayload.suggestedModelName ?? vehiclePayload.model,
          needsBrandModelVerification: Boolean(
            vehiclePayload.suggestedBrandName || vehiclePayload.suggestedModelName
          ),
        });
        setIsCreateOpen(false);
        clearCreateSearchParam();
        return;
      }
      if (code === 'BRAND_MODEL_VERIFICATION_REQUIRED') {
        // Hãng/dòng chọn "Khác": xe chưa được thêm, chờ admin duyệt request.
        queryClient.invalidateQueries({ queryKey: ['vehicle-access-requests'] });
        queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
        toast.success('Đã gửi yêu cầu xác minh hãng/dòng xe cho admin. Chờ duyệt.');
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
        {approvedAccessRequests.length > 0 && (
          <section className="rounded-2xl bg-emerald-50/50 p-5 shadow-sm ring-1 ring-emerald-100">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold">Yêu cầu đã xác minh</h2>
              <span className="text-sm text-slate-500">({approvedAccessRequests.length})</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Các yêu cầu dưới đây đã được admin xác minh; xe đã được thêm vào "Xe của tôi".
            </p>
            <div className="mt-3 grid gap-2">
              {(showAllApproved
                ? approvedAccessRequests
                : approvedAccessRequests.slice(0, 3)
              ).map((request) => (
                <RequestCard key={request._id} request={request} />
              ))}
            </div>
            {approvedAccessRequests.length > 3 ? (
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full rounded-xl"
                onClick={() => setShowAllApproved((open) => !open)}
              >
                {showAllApproved
                  ? 'Thu gọn'
                  : `Xem thêm ${approvedAccessRequests.length - 3} yêu cầu`}
              </Button>
            ) : null}
          </section>
        )}
        {(!!pendingAccessRequests.length || !!rejectedAccessRequests.length) && (
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold">Yêu cầu xác minh xe</h2>
            <div className="mt-3 grid gap-2">
              {pendingAccessRequests.map((request) => (
                <RequestCard key={request._id} request={request} />
              ))}
              {rejectedAccessRequests.map((request) => (
                <RequestCard
                  key={request._id}
                  request={request}
                  onSupplement={
                    request.requestType === 'brand_model_verification'
                      ? () => setResubmitBrandModelRequest(request)
                      : () => setResubmitRequest(request)
                  }
                />
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
        title={
          verificationPlate?.needsBrandModelVerification
            ? 'Yêu cầu xác minh hãng/dòng xe và biển số'
            : undefined
        }
        description={
          verificationPlate?.needsBrandModelVerification
            ? 'Biển số này đã tồn tại và bạn đã chọn hãng/dòng mới. Yêu cầu cần được xác minh cả hãng/dòng xe lẫn quyền sử dụng biển số.'
            : undefined
        }
        plate={verificationPlate?.licensePlate ?? ''}
        initialBrand={verificationPlate?.brand ?? ''}
        initialModel={verificationPlate?.model ?? ''}
        needsBrandModelVerification={Boolean(verificationPlate?.needsBrandModelVerification)}
        open={Boolean(verificationPlate)}
        pending={createAccessRequest.isPending}
        onOpenChange={(open) => {
          if (!open) setVerificationPlate(null);
        }}
        onSubmit={async (value) => {
          if (!verificationPlate) return;
          // Chỉ gửi hãng/dòng đề xuất khi khách thực sự chọn "Khác" (tự nhập).
          // Nếu chọn hãng/dòng CÓ SẴN trong catalog (chỉ trùng biển) thì KHÔNG
          // gửi suggestedBrandName/Model → luồng xác minh chỉ là "biển số".
          await createAccessRequest.mutateAsync({
            licensePlate: verificationPlate.licensePlate,
            suggestedBrandName: verificationPlate.needsBrandModelVerification
              ? verificationPlate.brand
              : undefined,
            suggestedModelName: verificationPlate.needsBrandModelVerification
              ? verificationPlate.model
              : undefined,
            ...value,
          });
          setVerificationPlate(null);
        }}
      />

      <VehicleVerificationDialog
        title={
          resubmitRequest?.suggestedBrandName || resubmitRequest?.suggestedModelName
            ? 'Bổ sung minh chứng hãng/dòng xe và biển số'
            : 'Bổ sung minh chứng cho xe'
        }
        description={
          resubmitRequest?.suggestedBrandName || resubmitRequest?.suggestedModelName
            ? 'Yêu cầu trước chưa được chấp nhận. Vui lòng gửi lại minh chứng cho CẢ biển số trùng lẫn hãng/dòng đã chọn để chờ admin xác nhận.'
            : 'Yêu cầu trước của bạn chưa được chấp nhận do minh chứng không đủ. Vui lòng gửi lại với hình ảnh chứng minh quyền sử dụng xe để chờ admin xác nhận.'
        }
        plate={resubmitRequest?.licensePlate ?? ''}
        initialBrand={resubmitRequest?.suggestedBrandName ?? ''}
        initialModel={resubmitRequest?.suggestedModelName ?? ''}
        needsBrandModelVerification={Boolean(
          resubmitRequest?.suggestedBrandName || resubmitRequest?.suggestedModelName
        )}
        initialRelationship={resubmitRequest?.relationship ?? ''}
        initialNote={resubmitRequest?.note ?? ''}
        reviewNote={resubmitRequest?.reviewNote}
        open={Boolean(resubmitRequest)}
        pending={createAccessRequest.isPending}
        onOpenChange={(open) => {
          if (!open) setResubmitRequest(null);
        }}
        onSubmit={async (value) => {
          if (!resubmitRequest) return;
          // Giữ nguyên hãng/dòng đề xuất (trường hợp cần xác minh cả hãng/dòng
          // lẫn biển) khi gửi lại, để admin duyệt lại đúng yêu cầu cũ.
          await createAccessRequest.mutateAsync({
            licensePlate: resubmitRequest.licensePlate,
            suggestedBrandName: resubmitRequest.suggestedBrandName,
            suggestedModelName: resubmitRequest.suggestedModelName,
            ...value,
          });
          setResubmitRequest(null);
        }}
      />

      <BrandModelVerificationDialog
        vehicleName={
          [resubmitBrandModelRequest?.suggestedBrandName, resubmitBrandModelRequest?.suggestedModelName]
            .filter(Boolean)
            .join(' ') || ''
        }
        plate={resubmitBrandModelRequest?.licensePlate ?? ''}
        reviewNote={resubmitBrandModelRequest?.reviewNote}
        open={Boolean(resubmitBrandModelRequest)}
        pending={resubmitBrandModel.isPending}
        onOpenChange={(open) => {
          if (!open) setResubmitBrandModelRequest(null);
        }}
        onSubmit={async (value) => {
          if (!resubmitBrandModelRequest) return;
          const linkedVehicleId =
            resubmitBrandModelRequest.vehicleId &&
            typeof resubmitBrandModelRequest.vehicleId === 'object'
              ? resubmitBrandModelRequest.vehicleId._id
              : undefined;
          await resubmitBrandModel.mutateAsync({
            vehicleId: linkedVehicleId,
            licensePlate: resubmitBrandModelRequest.licensePlate,
            suggestedBrandName: resubmitBrandModelRequest.suggestedBrandName,
            suggestedModelName: resubmitBrandModelRequest.suggestedModelName,
            carType: resubmitBrandModelRequest.carType,
            manufactureYear: resubmitBrandModelRequest.manufactureYear,
            note: value.note,
            documents: value.documents,
          });
          setResubmitBrandModelRequest(null);
        }}
      />
    </main>
  );
}

function RequestCard({
  request,
  onSupplement,
}: {
  request: VehicleAccessRequest;
  onSupplement?: (request: VehicleAccessRequest) => void;
}) {
  const isPending = request.status === 'pending';
  const isRejected = request.status === 'rejected';
  const isBrandModel =
    (request.requestType ?? 'access_request') === 'brand_model_verification';
  const supplementText = isBrandModel ? 'Bổ sung minh chứng hãng/dòng' : 'Bổ sung minh chứng';

  const borderClass = isRejected
    ? 'border-rose-200'
    : isPending
      ? 'border-slate-200'
      : 'border-emerald-200';
  const badgeClass = isPending
    ? 'bg-amber-50 text-amber-700'
    : isRejected
      ? 'bg-rose-50 text-rose-700'
      : 'bg-emerald-50 text-emerald-700';
  const badgeLabel = isPending
    ? 'Đang chờ xác minh'
    : isRejected
      ? 'Chưa đủ minh chứng'
      : 'Đã xác minh';

  return (
    <div className={`rounded-xl border p-3 text-sm ${borderClass}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">
            {isBrandModel ? 'Xác minh hãng / dòng xe' : 'Yêu cầu quyền sử dụng xe'}
            <span className="ml-2 text-slate-500">{request.licensePlate}</span>
          </p>
          {isBrandModel ? (
            <p className="mt-0.5 text-xs text-slate-500">
              Hãng/Dòng đề xuất:{' '}
              {[request.suggestedBrandName, request.suggestedModelName].filter(Boolean).join(' · ') ||
                '—'}
            </p>
          ) : (
            <p className="mt-0.5 text-slate-500">{request.relationship}</p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${badgeClass}`}
        >
          {badgeLabel}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" />
          Gửi yêu cầu: {formatDateTimeVi(request.createdAt)}
        </span>
        {request.reviewedAt && (
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            {isPending ? 'Chờ xử lý' : 'Xử lý'}: {formatDateTimeVi(request.reviewedAt)}
          </span>
        )}
      </div>
      {isRejected && (
        <p className="mt-1 text-rose-600">
          {request.reviewNote || 'Minh chứng không được chấp nhận. Vui lòng bổ sung.'}
        </p>
      )}
      {isRejected && onSupplement ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-3 rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50"
          onClick={() => onSupplement(request)}
        >
          <RotateCcw className="size-4" />
          {supplementText}
        </Button>
      ) : null}
    </div>
  );
}

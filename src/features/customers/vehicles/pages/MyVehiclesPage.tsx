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
import { DismissVehicleDialog } from '@/features/customers/vehicles/components/dismiss-vehicle-dialog';
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
  useDismissVehicle,
  useUpdateVehicle,
} from '@/features/customers/vehicles/hooks/useVehicleMutations';
import { formatLicensePlateDisplay } from '@/features/customers/vehicles/utils/license-plate';

const normalizeLicensePlate = (value: string) => value.replace(/[^0-9A-Za-z]/g, '').toUpperCase();

export default function MyVehiclesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<ApiVehicle | null>(null);
  const [detailVehicle, setDetailVehicle] = useState<ApiVehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<ApiVehicle | null>(null);
  const [dismissingVehicle, setDismissingVehicle] = useState<ApiVehicle | null>(null);
  const [verificationPlate, setVerificationPlate] = useState<{
    licensePlate: string;
    brand?: string;
    model?: string;
    /** True khi khách chọn "Khác" (custom) ở hãng và/hoặc dòng → cần xác minh
     *  thêm hãng/dòng, không chỉ biển số. */
    needsBrandModelVerification?: boolean;
  } | null>(null);
  const [resubmitRequest, setResubmitRequest] = useState<VehicleAccessRequest | null>(null);
  const [resubmitBrandModelRequest, setResubmitBrandModelRequest] =
    useState<VehicleAccessRequest | null>(null);
  // Bộ lọc trên trang "Xe của tôi": nhóm xe (đã/đang/khóa) + nhóm "Yêu cầu xác minh".
  const [vehicleFilter, setVehicleFilter] = useState<
    'approved' | 'pending' | 'locked' | 'requests'
  >('approved');
  // Trong tab "Yêu cầu xác minh", mỗi bảng chỉ hiện tối đa 6 mục; bật "Xem thêm" để mở rộng.
  const [showAllPending, setShowAllPending] = useState(false);
  const [showAllApproved, setShowAllApproved] = useState(false);

  const myVehiclesQuery = useMyVehicles(true);
  const createVehicleMutation = useCreateVehicle();
  const updateVehicleMutation = useUpdateVehicle();
  const deleteVehicleMutation = useDeleteVehicle();
  const dismissVehicleMutation = useDismissVehicle();
  const accessRequestsQuery = useMyVehicleAccessRequests();
  const createAccessRequest = useCreateVehicleAccessRequest();
  const resubmitBrandModel = useResubmitBrandModel();
  const queryClient = useQueryClient();

  const vehicles = myVehiclesQuery.data?.vehicles ?? [];
  // includeInactive=true nên danh sách kèm cả xe đã bị KHÓA (biển chuyển quyền qua
  // xác minh). Phân loại theo 3 nhóm filter; mỗi nhóm sort cái mới nhất lên đầu.
  const verifiedVehicles = vehicles
    .filter((vehicle) => vehicle.deletedAt == null && vehicle.verificationStatus === 'approved')
    .sort(byNewestFirst);
  const verifyingVehicles = vehicles
    .filter((vehicle) => vehicle.deletedAt == null && vehicle.verificationStatus !== 'approved')
    .sort(byNewestFirst);
  const lockedVehicles = vehicles
    .filter(
      (vehicle) =>
        vehicle.deletedAt != null &&
        // Bỏ xe khách đã ẩn (dismiss) khỏi tab "Đã khóa" để tránh hiện nhiều mục.
        !vehicle.customerDismissed
    )
    .sort(byNewestFirst);
  const shownVehicles =
    vehicleFilter === 'approved'
      ? verifiedVehicles
      : vehicleFilter === 'pending'
        ? verifyingVehicles
        : lockedVehicles;
  const accessRequests = accessRequestsQuery.data ?? [];
  // Tab "Yêu cầu xác minh" CHỈ còn 2 bảng:
  // - Khối "Yêu cầu xác minh xe": các yêu cầu bị admin KHÔNG chấp nhận (rejected) —
  //   để khách bổ sung giấy tờ rồi gửi lại.
  // - Khối "Yêu cầu đã xác minh": admin đã duyệt (approved).
  // Yêu cầu ĐANG ĐỢI admin duyệt (pending) hiển thị ở tab filter "Đang xác minh".
  const pendingRequests = accessRequests
    .filter((request) => request.status === 'pending')
    .sort(byRequestNewestFirst);
  const rejectedRequests = accessRequests
    .filter((request) => request.status === 'rejected')
    .sort(byRequestNewestFirst);
  const approvedRequests = accessRequests
    .filter((request) => request.status === 'approved')
    .sort(byRequestNewestFirst);
  // Biển đã thuộc quyền sở hữu của khách (đã là xe đã xác minh, active): mọi yêu cầu
  // rejected còn sót cho biển đó coi như đã hoàn tất — bỏ để tránh hiện lặp yêu cầu cũ
  // của cùng một chiếc xe. So sánh bằng biển chuẩn hóa.
  const hasPendingRequestForPlate = (licensePlate: string) =>
    pendingRequests.some(
      (request) =>
        normalizeLicensePlate(request.licensePlate) === normalizeLicensePlate(licensePlate)
    );
  // Khối "Yêu cầu xác minh xe": CHỈ các yêu cầu bị admin từ chối (rejected) — đang chờ
  // khách bổ sung giấy tờ rồi gửi lại.
  // Chỉ cất KHỎI bảng khi biển đó đã được xác minh lại SAU lúc bị từ chối (khách sở hữu
  // xe active / có yêu cầu ĐƯỢC DUYỆT cùng biển, đều SINH RA SAU lời từ chối) — tức lời
  // từ chối đã trở nên vô nghĩa. KHÔNG phủ theo "biển đang có thuộc quyền khách hay không"
  // đơn thuần: khi khách tạo xe TRÙNG biển với xe mình rồi bị từ chối, biển đó đã thuộc
  // về họ từ trước, nhưng yêu cầu bị từ chối VẪN phải hiện để khách bổ sung giấy tờ.
  const supplementRequests = rejectedRequests.filter((request) => {
    // Đã gửi lại (đang có yêu cầu pending mới cùng biển) → cất yêu cầu rejected cũ.
    if (hasPendingRequestForPlate(request.licensePlate)) return false;
    const plate = normalizeLicensePlate(request.licensePlate);
    const rejectedAt = new Date(request.createdAt).getTime();
    // Nếu timestamp null/không chuẩn → coi là KHÔNG xác minh sau từ chối (vẫn hiện).
    const happenedAfterReject = (timestamp?: string) =>
      timestamp != null && new Date(timestamp).getTime() > rejectedAt;
    const ownsVehicleAfter = verifiedVehicles.some(
      (vehicle) =>
        normalizeLicensePlate(vehicle.licensePlate) === plate &&
        (happenedAfterReject(vehicle.createdAt) || happenedAfterReject(vehicle.updatedAt))
    );
    const approvedAfter = approvedRequests.some(
      (approved) =>
        normalizeLicensePlate(approved.licensePlate) === plate &&
        happenedAfterReject(approved.createdAt)
    );
    return !ownsVehicleAfter && !approvedAfter;
  });
  const vehicleFilterOptions = [
    { key: 'approved' as const, label: 'Đã xác minh', count: verifiedVehicles.length },
    { key: 'pending' as const, label: 'Đang xác minh', count: pendingRequests.length },
    { key: 'locked' as const, label: 'Đã khóa', count: lockedVehicles.length },
    {
      key: 'requests' as const,
      label: 'Yêu cầu xác minh',
      count: supplementRequests.length + approvedRequests.length,
    },
  ];
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
    const vehiclePayload = payload as CreateVehiclePayload;

    if (hasPendingRequestForPlate(vehiclePayload.licensePlate)) {
      toast.error('Biển số này đã có yêu cầu xác minh đang chờ xử lý.');
      return;
    }

    try {
      await createVehicleMutation.mutateAsync(vehiclePayload);
    } catch (error) {
      const code = toApiError(error).code;
      if (code === 'VEHICLE_VERIFICATION_REQUIRED') {
        if (hasPendingRequestForPlate(vehiclePayload.licensePlate)) {
          toast.error('Biển số này đã có yêu cầu xác minh đang chờ xử lý.');
          return;
        }

        // Popup phía customer chỉ yêu cầu xác minh quyền sử dụng biển số.
        // Nếu khách chọn hãng/dòng khác, vẫn giữ thông tin đó trong request để admin kiểm tra sau.
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
      if (code === 'VEHICLE_ALREADY_VERIFIED') {
        toast.error('Xe này đã được xác minh rồi, không thể gửi yêu cầu.');
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

  const handleDismissVehicle = async () => {
    if (!dismissingVehicle) return;

    await dismissVehicleMutation.mutateAsync(dismissingVehicle._id);
    setDismissingVehicle(null);
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
                  Bạn hiện có {verifiedVehicles.length + verifyingVehicles.length} xe trong tài
                  khoản
                  {lockedVehicles.length > 0 ? ` (${lockedVehicles.length} xe đã khóa)` : ''}.
                </p>
              </div>
            </div>

            {/* Bộ lọc 4 nhóm: đã xác minh / đang xác minh / đã khóa / yêu cầu xác minh */}
            <div className="inline-flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
              {vehicleFilterOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setVehicleFilter(option.key)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    vehicleFilter === option.key
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {option.label} ({option.count})
                </button>
              ))}
            </div>

            {vehicleFilter === 'requests' ? (
              <div className="grid gap-4">
                {supplementRequests.length + approvedRequests.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                    Chưa có yêu cầu xác minh nào.
                  </p>
                ) : (
                  <>
                    {supplementRequests.length > 0 ? (
                      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                        <div className="flex items-center justify-between gap-3">
                          <h2 className="text-lg font-semibold">Yêu cầu xác minh xe</h2>
                          <span className="text-sm text-slate-500">
                            ({supplementRequests.length})
                          </span>
                        </div>
                        <div className="mt-3 grid gap-2">
                          {(showAllPending
                            ? supplementRequests
                            : supplementRequests.slice(0, MAX_REQUEST_ROWS)
                          ).map((request) => (
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
                        {supplementRequests.length > MAX_REQUEST_ROWS ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 w-full rounded-xl"
                            onClick={() => setShowAllPending(!showAllPending)}
                          >
                            {showAllPending
                              ? 'Thu gọn'
                              : `Xem thêm ${supplementRequests.length - MAX_REQUEST_ROWS} yêu cầu`}
                          </Button>
                        ) : null}
                      </section>
                    ) : null}
                    {approvedRequests.length > 0 ? (
                      <section className="rounded-2xl bg-emerald-50/50 p-5 shadow-sm ring-1 ring-emerald-100">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <h2 className="text-lg font-semibold">Yêu cầu đã xác minh</h2>
                          <span className="text-sm text-slate-500">
                            ({approvedRequests.length})
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          Các yêu cầu dưới đây đã được admin xác minh; xe đã được thêm vào "Xe của
                          tôi".
                        </p>
                        <div className="mt-3 grid gap-2">
                          {(showAllApproved
                            ? approvedRequests
                            : approvedRequests.slice(0, MAX_REQUEST_ROWS)
                          ).map((request) => (
                            <RequestCard key={request._id} request={request} />
                          ))}
                        </div>
                        {approvedRequests.length > MAX_REQUEST_ROWS ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 w-full rounded-xl"
                            onClick={() => setShowAllApproved(!showAllApproved)}
                          >
                            {showAllApproved
                              ? 'Thu gọn'
                              : `Xem thêm ${approvedRequests.length - MAX_REQUEST_ROWS} yêu cầu`}
                          </Button>
                        ) : null}
                      </section>
                    ) : null}
                  </>
                )}
              </div>
            ) : vehicleFilter === 'pending' ? (
              pendingRequests.length === 0 ? (
                <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                  Không có yêu cầu đang chờ admin xác minh.
                </p>
              ) : (
                <div className="grid gap-2">
                  {pendingRequests.map((request) => (
                    <RequestCard key={request._id} request={request} />
                  ))}
                </div>
              )
            ) : shownVehicles.length === 0 ? (
              <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                Không có xe nào trong mục này.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {shownVehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle._id}
                    vehicle={vehicle}
                    onView={setDetailVehicle}
                    onEdit={setEditingVehicle}
                    onDelete={setDeletingVehicle}
                    onDismiss={setDismissingVehicle}
                  />
                ))}
              </div>
            )}
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

      <DismissVehicleDialog
        open={!!dismissingVehicle}
        vehicle={dismissingVehicle}
        isDismissing={dismissVehicleMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setDismissingVehicle(null);
        }}
        onConfirm={handleDismissVehicle}
      />

      <VehicleVerificationDialog
        title={
          verificationPlate?.needsBrandModelVerification
            ? 'Yêu cầu xác minh quyền sử dụng xe và thông tin hãng/dòng'
            : undefined
        }
        description={
          verificationPlate?.needsBrandModelVerification
            ? 'Biển số này đã tồn tại trong hệ thống và bạn đã chọn hãng/dòng khác. Vui lòng gửi minh chứng quyền sử dụng biển số; thông tin hãng/dòng sẽ được admin kiểm tra khi duyệt yêu cầu.'
            : undefined
        }
        plate={verificationPlate?.licensePlate ?? ''}
        initialBrand={verificationPlate?.brand ?? ''}
        initialModel={verificationPlate?.model ?? ''}
        needsBrandModelVerification={false}
        // Luồng 4 (khách chọn "Khác" + biển trùng): hiện thêm thẻ hãng/dòng dạng text-only.
        showBrandModelInfoOnly={verificationPlate?.needsBrandModelVerification ?? false}
        open={Boolean(verificationPlate)}
        pending={createAccessRequest.isPending}
        onOpenChange={(open) => {
          if (!open) setVerificationPlate(null);
        }}
        onSubmit={async (value) => {
          if (!verificationPlate) return;
          if (hasPendingRequestForPlate(verificationPlate.licensePlate)) {
            toast.error('Xe này đã có yêu cầu xác minh đang chờ xử lý.');
            return;
          }
          // Customer chỉ upload minh chứng biển số; hãng/dòng khác nếu có sẽ để admin kiểm tra sau.
          // CHỈ gửi tên hãng/dòng đề xuất khi khách chọn "Khác" (luồng 4, kèm biển trùng →
          // admin xem mục "biển + hãng/dòng"). Luồng 2 (hãng/dòng chọn từ catalog, biển trùng)
          // gửi catalogBrandName/catalogModelName để backend buildKeeper() tạo xe đúng hãng/dòng.
          await createAccessRequest.mutateAsync({
            licensePlate: verificationPlate.licensePlate,
            suggestedBrandName: verificationPlate.needsBrandModelVerification
              ? verificationPlate.brand || undefined
              : undefined,
            suggestedModelName: verificationPlate.needsBrandModelVerification
              ? verificationPlate.model || undefined
              : undefined,
            catalogBrandName: !verificationPlate.needsBrandModelVerification
              ? verificationPlate.brand || undefined
              : undefined,
            catalogModelName: !verificationPlate.needsBrandModelVerification
              ? verificationPlate.model || undefined
              : undefined,
            ...value,
          });
          setVerificationPlate(null);
        }}
      />

      <VehicleVerificationDialog
        title="Bổ sung minh chứng cho xe"
        description="Yêu cầu trước của bạn chưa được chấp nhận do minh chứng không đủ. Vui lòng gửi lại với hình ảnh chứng minh quyền sử dụng xe để chờ admin xác nhận."
        plate={resubmitRequest?.licensePlate ?? ''}
        initialBrand={resubmitRequest?.suggestedBrandName ?? ''}
        initialModel={resubmitRequest?.suggestedModelName ?? ''}
        needsBrandModelVerification={false}
        // Luồng 4 (từ chối yêu cầu biển + hãng/dòng "Khác"): hiện thẻ hãng/dòng
        // text-only + thẻ biển yêu cầu nộp file. Luồng 3 (chỉ biển) thì plate-only.
        showBrandModelInfoOnly={Boolean(
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
          if (hasPendingRequestForPlate(resubmitRequest.licensePlate)) {
            toast.error('Xe này đã có yêu cầu xác minh đang chờ xử lý.');
            return;
          }
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
          [
            resubmitBrandModelRequest?.suggestedBrandName,
            resubmitBrandModelRequest?.suggestedModelName,
          ]
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

// Sắp xe mới tạo lên đầu (dùng chung cho các nhóm filter).
const byNewestFirst = (a: ApiVehicle, b: ApiVehicle) =>
  new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();

// Sắp yêu cầu xác minh mới nhất lên đầu (dùng chung cho các nhóm trong tab "Yêu cầu xác minh").
const byRequestNewestFirst = (a: VehicleAccessRequest, b: VehicleAccessRequest) =>
  new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();

// Số mục tối đa hiển thị mặc định trong mỗi khối yêu cầu trước khi cần "Xem thêm".
const MAX_REQUEST_ROWS = 6;

function RequestCard({
  request,
  onSupplement,
}: {
  request: VehicleAccessRequest;
  onSupplement?: (request: VehicleAccessRequest) => void;
}) {
  const isPending = request.status === 'pending';
  const isRejected = request.status === 'rejected';
  const isBrandModel = (request.requestType ?? 'access_request') === 'brand_model_verification';
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
            <span className="ml-2 text-slate-500">
              {formatLicensePlateDisplay(request.licensePlate)}
            </span>
          </p>
          {isBrandModel ? (
            <p className="mt-0.5 text-xs text-slate-500">
              Hãng/Dòng đề xuất:{' '}
              {[request.suggestedBrandName, request.suggestedModelName]
                .filter(Boolean)
                .join(' · ') || '—'}
            </p>
          ) : (
            <p className="mt-0.5 text-slate-500">{request.relationship}</p>
          )}
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${badgeClass}`}>
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

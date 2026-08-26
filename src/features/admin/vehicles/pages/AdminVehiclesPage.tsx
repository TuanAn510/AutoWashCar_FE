import {
  Car,
  CarFront,
  Eye,
  Loader2,
  Pencil,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { PageSection } from '@/components/common/PageSection';
import { StatCard } from '@/components/dashboard';
import { PaginationControls } from '@/components/shared/PaginationControls';
import { useAdminVehicles } from '@/features/admin/vehicles/hooks/useAdminVehicles';
import { vehiclesApi } from '@/services/vehicleService';
import { vehicleAccessRequestApi } from '@/services/vehicleAccessRequestService';
import { queryKeys } from '@/constants/queryKeys';
import { cn } from '@/lib/utils';
import { resolveImageUrl } from '@/lib/image-url';
import { formatLicensePlateDisplay } from '@/features/customers/vehicles/utils/license-plate';
import type { ApiVehicle, CarType, VehicleAccessRequest } from '@/types/vehicle';

const CAR_TYPE_LABELS: Record<CarType, string> = {
  sedan: 'Sedan',
  suv: 'SUV',
  pickup: 'Pickup / Bán tải',
};

const CAR_TYPE_BADGES: Record<CarType, string> = {
  sedan: 'bg-blue-50 text-blue-700',
  suv: 'bg-emerald-50 text-emerald-700',
  pickup: 'bg-amber-50 text-amber-700',
};

/** Trạng thái xác minh của xe trên bảng Quản lý xe. */
const VERIFY_META = {
  approved: { label: 'Đã xác minh', className: 'bg-emerald-50 text-emerald-700' },
  pending: { label: 'Chờ xác minh', className: 'bg-amber-50 text-amber-700' },
  rejected: { label: 'Bị từ chối', className: 'bg-rose-50 text-rose-700' },
} as const;

function ownerName(vehicle: ApiVehicle): string {
  if (typeof vehicle.customerId === 'object' && vehicle.customerId) {
    return vehicle.customerId.displayName || vehicle.customerId.phone || 'Không rõ';
  }
  return 'Không rõ';
}

function ownerPhone(vehicle: ApiVehicle): string {
  if (typeof vehicle.customerId === 'object' && vehicle.customerId) {
    return vehicle.customerId.phone || '—';
  }
  return '—';
}

function vehicleCreatedAt(vehicle: ApiVehicle, options?: Intl.DateTimeFormatOptions) {
  if (!vehicle.createdAt) return 'Chua co';

  return new Intl.DateTimeFormat('vi-VN', options).format(new Date(vehicle.createdAt));
}

function isCombinedRequest(request: VehicleAccessRequest) {
  return (
    (request.requestType ?? 'access_request') === 'access_request' &&
    Boolean(request.suggestedBrandName || request.suggestedModelName)
  );
}

function requestTypeLabel(request: VehicleAccessRequest): string {
  if ((request.requestType ?? 'access_request') === 'brand_model_verification') {
    return 'Hãng / Dòng xe';
  }
  return isCombinedRequest(request) ? 'Biển số + Hãng/Dòng' : 'Biển số / Quyền sử dụng';
}

function requesterName(request: VehicleAccessRequest): string {
  if (typeof request.requesterId !== 'object') return 'Không rõ';
  return (
    request.requesterId.displayName ||
    request.requesterId.phone ||
    request.requesterId.email ||
    'Không rõ'
  );
}

function suggestedVehicleText(request: VehicleAccessRequest): string {
  return [request.suggestedBrandName, request.suggestedModelName].filter(Boolean).join(' ');
}

export default function AdminVehiclesPage() {
  const [keyword, setKeyword] = useState('');
  const [carTypeFilter, setCarTypeFilter] = useState<CarType | 'all'>('all');
  const [page, setPage] = useState(1);
  const [viewVehicle, setViewVehicle] = useState<ApiVehicle | null>(null);
  const [editVehicle, setEditVehicle] = useState<ApiVehicle | null>(null);
  const [deleteVehicle, setDeleteVehicle] = useState<ApiVehicle | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const navigate = useNavigate();

  // Các yêu cầu xác minh đang chờ (cả 3 luồng) — để admin thấy XE CHƯA XÁC MINH
  // mà chưa có record trong bảng xe (xe chỉ được tạo khi duyệt yêu cầu).
  const pendingRequestsQuery = useQuery({
    queryKey: ['vehicle-access-requests', 'admin', 'pending'],
    queryFn: () => vehicleAccessRequestApi.listAdmin('pending'),
    refetchOnMount: 'always',
  });
  const pendingRequests = useMemo(
    () => pendingRequestsQuery.data ?? [],
    [pendingRequestsQuery.data]
  );

  const queryClient = useQueryClient();
  const vehiclesQuery = useAdminVehicles({
    page,
    limit: 20,
    keyword: keyword.trim() || undefined,
    carType: carTypeFilter === 'all' ? undefined : carTypeFilter,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Toàn bộ xe trong hệ thống (dùng cho thẻ thống kê bên trên).
  const allVehicles = useMemo(
    () => vehiclesQuery.data?.vehicles ?? [],
    [vehiclesQuery.data?.vehicles]
  );
  // Bảng "Danh sách xe" chỉ hiển thị xe ĐÃ XÁC MINH (approved hoặc không yêu cầu
  // xác minh). Xe đang chờ/bị từ chối nằm ở mục "Xe chờ xác minh" phía trên.
  const verifiedVehicles = useMemo(
    () =>
      allVehicles.filter(
        (vehicle) => !vehicle.verificationStatus || vehicle.verificationStatus === 'approved'
      ),
    [allVehicles]
  );
  const pagination = vehiclesQuery.data?.pagination;
  const total = vehiclesQuery.data?.total ?? 0;

  const stats = useMemo(() => {
    return {
      total,
      sedan: allVehicles.filter((v) => v.carType === 'sedan').length,
      suv: allVehicles.filter((v) => v.carType === 'suv').length,
      pickup: allVehicles.filter((v) => v.carType === 'pickup').length,
    };
  }, [allVehicles, total]);

  const handleViewDetail = async (vehicle: ApiVehicle) => {
    setLoadingDetailId(vehicle._id);
    try {
      setViewVehicle(await vehiclesApi.getById(vehicle._id));
    } catch {
      toast.error('Không thể tải chi tiết xe. Vui lòng thử lại.');
    } finally {
      setLoadingDetailId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteVehicle) return;
    setIsDeleting(true);
    try {
      await vehiclesApi.deleteVehicle(deleteVehicle._id);
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.admin.all });
      vehiclesQuery.refetch();
      toast.success('Xóa xe thành công.');
      setDeleteVehicle(null);
    } catch {
      toast.error('Không thể xóa xe. Vui lòng thử lại.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (payload: {
    brand: string;
    model: string;
    licensePlate: string;
    year: number;
    carType: CarType;
  }) => {
    if (!editVehicle) return;
    setIsUpdating(true);
    try {
      await vehiclesApi.updateVehicle(editVehicle._id, payload);
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.admin.all });
      vehiclesQuery.refetch();
      toast.success('Cập nhật xe thành công.');
      setEditVehicle(null);
    } catch {
      toast.error('Không thể cập nhật xe. Vui lòng thử lại.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="Quản lý xe"
        description="Xem và quản lý tất cả xe của khách hàng trong hệ thống."
      />

      {/* Summary Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Tổng số xe"
          value={vehiclesQuery.isLoading ? '—' : String(stats.total)}
          icon={Car}
        />
        <StatCard
          title="Sedan"
          value={vehiclesQuery.isLoading ? '—' : String(stats.sedan)}
          icon={CarFront}
          tone="info"
        />
        <StatCard
          title="SUV"
          value={vehiclesQuery.isLoading ? '—' : String(stats.suv)}
          icon={CarFront}
          tone="success"
        />
        <StatCard
          title="Pickup / Bán tải"
          value={vehiclesQuery.isLoading ? '—' : String(stats.pickup)}
          icon={CarFront}
          tone="warning"
        />
      </section>

      {/* Filters */}
      <PageSection>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="h-10 border-0 bg-slate-100 pl-10 shadow-none"
              placeholder="Tìm theo biển số, hãng xe, dòng xe, chủ xe..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            className="h-10 rounded-md border border-input bg-white px-3 text-sm"
            value={carTypeFilter}
            onChange={(e) => {
              setCarTypeFilter(e.target.value as CarType | 'all');
              setPage(1);
            }}
          >
            <option value="all">Tất cả loại xe</option>
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
            <option value="pickup">Pickup / Bán tải</option>
          </select>
        </div>
      </PageSection>

      {/* Xe chờ xác minh — gồm cả yêu cầu chưa có xe trong hệ thống (biển số /
          biển + hãng/dòng) để admin thấy đầy đủ mọi xe cần duyệt. */}
      {pendingRequests.length > 0 && (
        <PageSection>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-950">
                <ShieldAlert className="size-5 text-amber-500" />
                Xe chờ xác minh
                <span className="text-sm font-normal text-slate-500">
                  ({pendingRequests.length} yêu cầu)
                </span>
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Các xe chưa được xác minh, kể cả những yêu cầu chưa có xe trong danh sách. Bấm "Xác
                minh" để xử lý tại mục Xác minh xe.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => navigate('/admin/vehicle-access-requests')}
            >
              <ShieldCheck className="size-4" />
              Qua mục Xác minh xe
            </Button>
          </div>
          <div className="mt-4 grid gap-2">
            {pendingRequests.map((request) => (
              <div
                key={request._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-950">
                      {formatLicensePlateDisplay(request.licensePlate)}
                    </span>
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                      Chờ xác minh
                    </span>
                    <span className="rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      {requestTypeLabel(request)}
                    </span>
                  </div>
                  {suggestedVehicleText(request) ? (
                    <p className="mt-1 text-sm text-slate-600">
                      Hãng/Dòng đề xuất: {suggestedVehicleText(request)}
                    </p>
                  ) : null}
                  <p className="mt-0.5 text-xs text-slate-500">
                    Người yêu cầu: {requesterName(request)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-amber-300 text-amber-700 hover:bg-amber-100"
                  onClick={() =>
                    navigate(
                      `/admin/vehicle-access-requests?keyword=${encodeURIComponent(
                        request.licensePlate
                      )}`
                    )
                  }
                >
                  <ShieldCheck className="size-4" />
                  Xác minh
                </Button>
              </div>
            ))}
          </div>
        </PageSection>
      )}

      {/* Table */}
      <PageSection>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-950">
            Danh sách xe
            {!vehiclesQuery.isLoading && (
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({verifiedVehicles.length} xe đã xác minh)
              </span>
            )}
          </h2>
          {vehiclesQuery.isError && (
            <p className="text-sm text-destructive">Không thể tải danh sách xe.</p>
          )}
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[1040px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border text-slate-900">
                <th className="px-2 py-3 font-semibold">Biển số</th>
                <th className="px-2 py-3 font-semibold">Hãng - Dòng xe</th>
                <th className="px-2 py-3 font-semibold">Năm SX</th>
                <th className="px-2 py-3 font-semibold">Loại xe</th>
                <th className="px-2 py-3 font-semibold">Trạng thái xác minh</th>
                <th className="px-2 py-3 font-semibold">Chủ xe</th>
                <th className="px-2 py-3 font-semibold">Ngày tạo</th>
                <th className="w-[160px] px-2 py-3 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {vehiclesQuery.isLoading && <LoadingRow />}
              {!vehiclesQuery.isLoading && !vehiclesQuery.isError && !verifiedVehicles.length && (
                <EmptyRow text="Không có xe nào đã xác minh." />
              )}
              {vehiclesQuery.isError && <EmptyRow text="Đã có lỗi xảy ra khi tải dữ liệu." />}
              {verifiedVehicles.map((vehicle) => (
                <tr
                  key={vehicle._id}
                  className="border-b border-border/70 align-middle last:border-0"
                >
                  <td className="px-2 py-3.5">
                    <span className="font-bold text-slate-950">
                      {formatLicensePlateDisplay(vehicle.licensePlate)}
                    </span>
                  </td>
                  <td className="px-2 py-3.5">
                    <p className="font-medium text-slate-900">{vehicle.brand}</p>
                    <p className="text-xs text-slate-500">{vehicle.model}</p>
                  </td>
                  <td className="px-2 py-3.5 text-slate-700">{vehicle.year}</td>
                  <td className="px-2 py-3.5">
                    <span
                      className={cn(
                        'inline-flex rounded-md px-2.5 py-1 text-xs font-semibold',
                        CAR_TYPE_BADGES[vehicle.carType]
                      )}
                    >
                      {CAR_TYPE_LABELS[vehicle.carType]}
                    </span>
                  </td>
                  <td className="px-2 py-3.5">
                    {vehicle.verificationStatus ? (
                      <span
                        className={cn(
                          'inline-flex whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold',
                          VERIFY_META[vehicle.verificationStatus].className
                        )}
                      >
                        {VERIFY_META[vehicle.verificationStatus].label}
                      </span>
                    ) : (
                      <span className="inline-flex whitespace-nowrap rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                        Không yêu cầu
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-3.5">
                    <p className="font-medium text-slate-900">{ownerName(vehicle)}</p>
                    <p className="text-xs text-slate-500">{ownerPhone(vehicle)}</p>
                  </td>
                  <td className="whitespace-nowrap px-2 py-3.5 text-slate-600">
                    {vehicleCreatedAt(vehicle, { dateStyle: 'short' })}
                  </td>
                  <td className="px-2 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        title="Xem chi tiết"
                        disabled={loadingDetailId === vehicle._id}
                        onClick={() => void handleViewDetail(vehicle)}
                      >
                        {loadingDetailId === vehicle._id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </Button>
                      {vehicle.verificationStatus && vehicle.verificationStatus !== 'approved' && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                          title="Xác minh xe (chuyển sang mục Xác minh xe)"
                          onClick={() =>
                            navigate(
                              `/admin/vehicle-access-requests?keyword=${encodeURIComponent(
                                vehicle.licensePlate
                              )}`
                            )
                          }
                        >
                          <ShieldCheck className="size-4" />
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        title="Sửa xe"
                        onClick={() => setEditVehicle(vehicle)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-rose-600 hover:text-rose-700"
                        title="Xóa xe"
                        onClick={() => setDeleteVehicle(vehicle)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <PaginationControls
          pagination={pagination}
          itemCount={verifiedVehicles.length}
          onPageChange={setPage}
        />
      </PageSection>

      {/* Vehicle Detail Dialog */}
      <VehicleDetailDialog
        open={!!viewVehicle}
        vehicle={viewVehicle}
        onOpenChange={(open) => {
          if (!open) setViewVehicle(null);
        }}
      />

      {/* Edit Vehicle Dialog */}
      <EditVehicleDialog
        open={!!editVehicle}
        vehicle={editVehicle}
        isSubmitting={isUpdating}
        onOpenChange={(open) => {
          if (!open) setEditVehicle(null);
        }}
        onSubmit={handleUpdate}
      />

      {/* Delete Vehicle Dialog */}
      <Dialog
        open={!!deleteVehicle}
        onOpenChange={(open) => {
          if (!open) setDeleteVehicle(null);
        }}
      >
        <DialogContent
          className="max-w-[420px] gap-0 rounded-xl border border-[#e5edf6] p-0 shadow-[0_18px_44px_rgba(15,23,42,0.12)]"
          showCloseButton={false}
        >
          <DialogHeader className="border-b border-[#e5edf6] px-6 py-4">
            <DialogTitle className="text-lg font-black text-[#15243a]">Xóa xe</DialogTitle>
            <DialogDescription className="mt-0.5 text-sm text-[#64748b]">
              Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa xe này?
            </DialogDescription>
          </DialogHeader>

          {deleteVehicle && (
            <div className="px-6 py-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="font-bold text-slate-950">
                  {deleteVehicle.brand} {deleteVehicle.model}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Biển số: {formatLicensePlateDisplay(deleteVehicle.licensePlate)} · Đời{' '}
                  {deleteVehicle.year}
                </p>
                <p className="mt-1 text-sm text-slate-500">Chủ xe: {ownerName(deleteVehicle)}</p>
              </div>
            </div>
          )}

          <DialogFooter className="flex-row gap-3 border-t border-[#e5edf6] px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="h-[42px] flex-1 rounded-md"
              onClick={() => setDeleteVehicle(null)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="h-[42px] flex-1 rounded-md"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="size-4" />
                  Xác nhận xóa
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}

// ─── Vehicle Detail Dialog ────────────────────────────────────────────────────

function VehicleDetailDialog({
  open,
  vehicle,
  onOpenChange,
}: {
  open: boolean;
  vehicle: ApiVehicle | null;
  onOpenChange: (open: boolean) => void;
}) {
  if (!vehicle) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[560px] gap-0 rounded-xl border border-[#e5edf6] p-0 shadow-[0_18px_44px_rgba(15,23,42,0.12)]"
        showCloseButton={false}
      >
        <DialogHeader className="flex flex-row items-start justify-between border-b border-[#e5edf6] px-6 py-4">
          <div>
            <DialogTitle className="text-lg font-black text-[#15243a]">Chi tiết xe</DialogTitle>
            <DialogDescription className="mt-0.5 text-sm text-[#64748b]">
              Thông tin chi tiết của xe {formatLicensePlateDisplay(vehicle.licensePlate)}
            </DialogDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-4" />
          </Button>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          {/* Vehicle images */}
          {vehicle.images && vehicle.images.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {vehicle.images.map((img) => (
                <img
                  key={img.id}
                  src={resolveImageUrl(img.url)}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="h-32 w-48 shrink-0 rounded-lg border object-cover"
                  loading="lazy"
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-[#e5edf6] bg-slate-50 py-10">
              <div className="text-center">
                <Car className="mx-auto size-10 text-slate-300" />
                <p className="mt-2 text-sm text-slate-400">Chưa có ảnh xe</p>
              </div>
            </div>
          )}

          {/* Vehicle info grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoBlock label="Hãng xe" value={vehicle.brand} />
            <InfoBlock label="Dòng xe" value={vehicle.model} />
            <InfoBlock label="Biển số" value={formatLicensePlateDisplay(vehicle.licensePlate)} />
            <InfoBlock label="Năm sản xuất" value={String(vehicle.year)} />
            <InfoBlock
              label="Loại xe"
              value={
                <span
                  className={cn(
                    'inline-flex rounded-md px-2 py-0.5 text-xs font-semibold',
                    CAR_TYPE_BADGES[vehicle.carType]
                  )}
                >
                  {CAR_TYPE_LABELS[vehicle.carType]}
                </span>
              }
            />
            <InfoBlock
              label="Ngày tạo"
              value={vehicleCreatedAt(vehicle, { dateStyle: 'medium' })}
            />
          </div>

          {/* Owner info */}
          <div className="rounded-xl border border-[#e5edf6] bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <User className="size-4" />
              Thông tin chủ xe
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <InfoBlock label="Tên" value={ownerName(vehicle)} />
              <InfoBlock label="SĐT" value={ownerPhone(vehicle)} />
              {typeof vehicle.customerId === 'object' && vehicle.customerId?.avatarUrl && (
                <div className="sm:col-span-2">
                  <img
                    src={vehicle.customerId.avatarUrl}
                    alt={ownerName(vehicle)}
                    className="size-12 rounded-full border object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-[#e5edf6] px-6 py-4">
          <Button
            type="button"
            className="h-[42px] w-full rounded-md"
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InfoBlock({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</p>
      <div className="mt-1 text-sm font-medium text-slate-900">{value}</div>
    </div>
  );
}

// ─── Edit Vehicle Dialog ──────────────────────────────────────────────────────

function EditVehicleDialog({
  open,
  vehicle,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  vehicle: ApiVehicle | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    brand: string;
    model: string;
    licensePlate: string;
    year: number;
    carType: CarType;
  }) => Promise<void>;
}) {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [carType, setCarType] = useState<CarType>('sedan');

  // Reset form when vehicle changes
  const prevVehicleRef = useRef<string | null>(null);
  useEffect(() => {
    if (vehicle && vehicle._id !== prevVehicleRef.current) {
      prevVehicleRef.current = vehicle._id;
      setBrand(vehicle.brand);
      setModel(vehicle.model);
      setLicensePlate(vehicle.licensePlate);
      setYear(vehicle.year);
      setCarType(vehicle.carType);
    }
  }, [vehicle]);

  if (!vehicle) return null;

  const canSubmit =
    brand.trim() && model.trim() && licensePlate.trim() && year > 1900 && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await onSubmit({
      brand: brand.trim(),
      model: model.trim(),
      licensePlate: licensePlate.trim().toUpperCase(),
      year,
      carType,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[480px] gap-0 rounded-xl border border-[#e5edf6] p-0 shadow-[0_18px_44px_rgba(15,23,42,0.12)]"
        showCloseButton={false}
      >
        <DialogHeader className="flex flex-row items-start justify-between border-b border-[#e5edf6] px-6 py-4">
          <div>
            <DialogTitle className="text-lg font-black text-[#15243a]">
              Sửa thông tin xe
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-sm text-[#64748b]">
              Cập nhật thông tin xe {formatLicensePlateDisplay(vehicle.licensePlate)}
            </DialogDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-4" />
          </Button>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Hãng xe
              </span>
              <Input
                className="h-10 rounded-md"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="VD: Toyota"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Dòng xe
              </span>
              <Input
                className="h-10 rounded-md"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="VD: Camry"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Biển số
              </span>
              <Input
                className="h-10 rounded-md"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                placeholder="VD: 70A-99999"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Năm sản xuất
              </span>
              <Input
                type="number"
                className="h-10 rounded-md"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={1900}
                max={new Date().getFullYear()}
              />
            </label>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              Loại xe
            </span>
            <select
              className="h-10 rounded-md border border-input bg-white px-3 text-sm"
              value={carType}
              onChange={(e) => setCarType(e.target.value as CarType)}
            >
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="pickup">Pickup / Bán tải</option>
            </select>
          </label>
        </div>

        <DialogFooter className="flex-row gap-3 border-t border-[#e5edf6] px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="h-[42px] flex-1 rounded-md"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            className="h-[42px] flex-1 rounded-md shadow-[0_12px_26px_rgba(11,103,194,0.24)]"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              'Lưu thay đổi'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Table Helpers ────────────────────────────────────────────────────────────

function LoadingRow() {
  return (
    <tr>
      <td colSpan={8} className="px-2 py-4">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </td>
    </tr>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <tr>
      <td colSpan={8} className="px-2 py-12 text-center text-slate-500">
        {text}
      </td>
    </tr>
  );
}

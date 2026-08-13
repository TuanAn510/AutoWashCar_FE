import { Car, CarFront, Eye, Loader2, Pencil, Search, Trash2, User, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
import { queryKeys } from '@/constants/queryKeys';
import { cn } from '@/lib/utils';
import type { ApiVehicle, CarType } from '@/types/vehicle';

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

  const queryClient = useQueryClient();
  const vehiclesQuery = useAdminVehicles({
    page,
    limit: 20,
    keyword: keyword.trim() || undefined,
    carType: carTypeFilter === 'all' ? undefined : carTypeFilter,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const vehicles = useMemo(
    () => vehiclesQuery.data?.vehicles ?? [],
    [vehiclesQuery.data?.vehicles]
  );
  const pagination = vehiclesQuery.data?.pagination;
  const total = vehiclesQuery.data?.total ?? 0;

  const stats = useMemo(() => {
    return {
      total,
      sedan: vehicles.filter((v) => v.carType === 'sedan').length,
      suv: vehicles.filter((v) => v.carType === 'suv').length,
      pickup: vehicles.filter((v) => v.carType === 'pickup').length,
    };
  }, [vehicles, total]);

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

      {/* Table */}
      <PageSection>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-950">
            Danh sách xe
            {!vehiclesQuery.isLoading && (
              <span className="ml-2 text-sm font-normal text-slate-500">({total} xe)</span>
            )}
          </h2>
          {vehiclesQuery.isError && (
            <p className="text-sm text-destructive">Không thể tải danh sách xe.</p>
          )}
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border text-slate-900">
                <th className="px-2 py-3 font-semibold">Biển số</th>
                <th className="px-2 py-3 font-semibold">Hãng - Dòng xe</th>
                <th className="px-2 py-3 font-semibold">Năm SX</th>
                <th className="px-2 py-3 font-semibold">Loại xe</th>
                <th className="px-2 py-3 font-semibold">Chủ xe</th>
                <th className="px-2 py-3 font-semibold">Ngày tạo</th>
                <th className="w-[160px] px-2 py-3 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {vehiclesQuery.isLoading && <LoadingRow />}
              {!vehiclesQuery.isLoading && !vehiclesQuery.isError && !vehicles.length && (
                <EmptyRow text="Không có xe nào phù hợp." />
              )}
              {vehiclesQuery.isError && <EmptyRow text="Đã có lỗi xảy ra khi tải dữ liệu." />}
              {vehicles.map((vehicle) => (
                <tr
                  key={vehicle._id}
                  className="border-b border-border/70 align-middle last:border-0"
                >
                  <td className="px-2 py-3.5">
                    <span className="font-bold text-slate-950">{vehicle.licensePlate}</span>
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
          itemCount={vehicles.length}
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
        <DialogContent className="max-w-[420px] gap-0 rounded-xl border border-[#e5edf6] p-0 shadow-[0_18px_44px_rgba(15,23,42,0.12)]">
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
                  Biển số: {deleteVehicle.licensePlate} · Đời {deleteVehicle.year}
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
      <DialogContent className="max-w-[560px] gap-0 rounded-xl border border-[#e5edf6] p-0 shadow-[0_18px_44px_rgba(15,23,42,0.12)]">
        <DialogHeader className="flex flex-row items-start justify-between border-b border-[#e5edf6] px-6 py-4">
          <div>
            <DialogTitle className="text-lg font-black text-[#15243a]">Chi tiết xe</DialogTitle>
            <DialogDescription className="mt-0.5 text-sm text-[#64748b]">
              Thông tin chi tiết của xe {vehicle.licensePlate}
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
                  src={img.url}
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
            <InfoBlock label="Biển số" value={vehicle.licensePlate} />
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
      <DialogContent className="max-w-[480px] gap-0 rounded-xl border border-[#e5edf6] p-0 shadow-[0_18px_44px_rgba(15,23,42,0.12)]">
        <DialogHeader className="flex flex-row items-start justify-between border-b border-[#e5edf6] px-6 py-4">
          <div>
            <DialogTitle className="text-lg font-black text-[#15243a]">
              Sửa thông tin xe
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-sm text-[#64748b]">
              Cập nhật thông tin xe {vehicle.licensePlate}
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
      <td colSpan={7} className="px-2 py-4">
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
      <td colSpan={7} className="px-2 py-12 text-center text-slate-500">
        {text}
      </td>
    </tr>
  );
}

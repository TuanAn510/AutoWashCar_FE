import { useMemo, useState } from 'react';
import { DollarSign, Ellipsis, Eye, Pencil, Plus, Search, Wrench, XCircle } from 'lucide-react';

import { toApiError } from '@/api/errors';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { PaginationControls } from '@/components/shared/PaginationControls';
import { useActiveServiceCategories } from '@/features/shared/service-categories/hooks/useActiveServiceCategories';
import { CreateServiceDialog } from '@/features/admin/services/components/CreateServiceDialog';
import { UpdateServiceDialog } from '@/features/admin/services/components/UpdateServiceDialog';
import {
  useCreateServiceMutation,
  useUpdateServiceMutation,
} from '@/features/admin/services/hooks/use-service-mutations';
import { useAllServices } from '@/features/admin/services/hooks/useServices';
import { useServiceManagementStore } from '@/features/admin/services/store/useServiceManagementStore';
import {
  buildServiceFilterCategories,
  filterAndSortServices,
  type ServiceNameSortOrder,
  type ServiceStatusFilter,
} from '@/features/admin/services/utils/service-list';
import { cn, formatTime } from '@/lib/utils';
import { useCurrentUser } from '@/features/auth/hooks/use-auth-queries';
import {
  type CreateServicePayload,
  type Service,
  type UpdateServicePayload,
} from '@/types/service';
import type { ServiceCategory } from '@/types/serviceCategory';

const SERVICE_PAGE_SIZE = 10;
const EMPTY_SERVICES: Service[] = [];
const EMPTY_CATEGORIES: ServiceCategory[] = [];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

function buildStats(services: Service[]) {
  const totalServices = services.length;
  const averagePrice =
    totalServices > 0
      ? Math.round(services.reduce((sum, service) => sum + service.price, 0) / totalServices)
      : 0;
  const activeServices = services.filter((service) => service.isActive).length;
  const inactiveServices = totalServices - activeServices;

  return [
    {
      key: 'total',
      label: 'Tổng dịch vụ',
      value: String(totalServices),
      icon: Wrench,
    },
    {
      key: 'averagePrice',
      label: 'Giá trung bình',
      value: formatCurrency(averagePrice),
      icon: DollarSign,
    },
    {
      key: 'active',
      label: 'Đang hoạt động',
      value: String(activeServices),
      icon: Wrench,
    },
    {
      key: 'inactive',
      label: 'Tạm ẩn',
      value: String(inactiveServices),
      icon: XCircle,
    },
  ];
}

function ServiceActionsMenu({
  service,
  onViewDetail,
  onEdit,
}: {
  service: Service;
  onViewDetail: (service: Service) => void;
  onEdit: (service: Service) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="rounded-xl">
          <Ellipsis className="size-4" />
          <span className="sr-only">Mở menu thao tác</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuItem onClick={() => onViewDetail(service)}>
          <Eye className="size-4" />
          Xem chi tiết
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(service)}>
          <Pencil className="size-4" />
          Chỉnh sửa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ServiceDetailDialog({
  service,
  onOpenChange,
}: {
  service: Service | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={!!service} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chi tiết dịch vụ</DialogTitle>
          <DialogDescription>Thông tin dịch vụ đang được quản lý trong hệ thống.</DialogDescription>
        </DialogHeader>
        {service ? (
          <div className="grid gap-3 text-sm">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="font-semibold text-slate-950">{service.name}</p>
              <p className="mt-1 text-slate-500">{service.categoryId.name}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Giá" value={formatCurrency(service.price)} />
              <Info label="Thời lượng" value={formatTime(service.estimatedDuration)} />
              <Info label="Trạng thái" value={service.isActive ? 'Đang hoạt động' : 'Tạm ẩn'} />
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs font-medium text-slate-500">Mô tả</p>
              <p className="mt-1 text-slate-700">
                {service.description?.trim() || 'Chưa có mô tả'}
              </p>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export default function ServicesManagementPage() {
  const userRole = useCurrentUser().data?.role;
  const isAdmin = userRole === 'admin';
  const isCreateDialogOpen = useServiceManagementStore((state) => state.isCreateDialogOpen);
  const openCreateDialog = useServiceManagementStore((state) => state.openCreateDialog);
  const closeCreateDialog = useServiceManagementStore((state) => state.closeCreateDialog);
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [status, setStatus] = useState<ServiceStatusFilter>('all');
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<ServiceNameSortOrder>('asc');
  const [detailService, setDetailService] = useState<Service | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const allServicesQuery = useAllServices();
  const categoriesQuery = useActiveServiceCategories();
  const createServiceMutation = useCreateServiceMutation();
  const updateServiceMutation = useUpdateServiceMutation();

  const allServices = allServicesQuery.data ?? EMPTY_SERVICES;
  const categories = categoriesQuery.data ?? EMPTY_CATEGORIES;
  const stats = useMemo(() => buildStats(allServices), [allServices]);
  const filterCategories = useMemo(
    () => buildServiceFilterCategories(categories, allServices),
    [allServices, categories]
  );
  const filteredServices = useMemo(
    () =>
      filterAndSortServices(allServices, {
        keyword,
        categoryId,
        status,
        sortOrder,
      }),
    [allServices, categoryId, keyword, sortOrder, status]
  );
  const totalPages = Math.max(1, Math.ceil(filteredServices.length / SERVICE_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const services = filteredServices.slice(
    (currentPage - 1) * SERVICE_PAGE_SIZE,
    currentPage * SERVICE_PAGE_SIZE
  );
  const pagination = {
    page: currentPage,
    limit: SERVICE_PAGE_SIZE,
    total: filteredServices.length,
    totalPages,
  };

  const handleCreateService = (payload: CreateServicePayload) => {
    createServiceMutation.mutate(payload);
  };

  const handleUpdateService = async (payload: UpdateServicePayload) => {
    if (!editingService) return;
    try {
      await updateServiceMutation.mutateAsync({ serviceId: editingService._id, payload });
      setEditingService(null);
    } catch (error) {
      if (toApiError(error).status === 409) {
        setEditingService(null);
      }
    }
  };

  return (
    <main className="min-h-[calc(100vh-81px)] bg-[#f8fafc] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1540px] space-y-6">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
              Quản lý dịch vụ
            </h1>
            <p className="mt-2 text-base text-slate-500">
              Quản lý dịch vụ, thời lượng và bảng giá. Dịch vụ đang hoạt động sẽ xuất hiện tại bước
              Dịch vụ khi khách hàng đặt lịch.
            </p>
          </div>
          {isAdmin && (
            <Button
              className="h-10 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
              onClick={openCreateDialog}
            >
              <Plus className="size-4" />
              Thêm dịch vụ
            </Button>
          )}
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.key}
              title={stat.label}
              value={stat.value}
              icon={stat.icon}
              loading={allServicesQuery.isLoading}
              className={
                stat.key === 'averagePrice'
                  ? '[&_.card-value]:whitespace-nowrap [&_.card-value]:text-lg xl:[&_.card-value]:text-xl'
                  : undefined
              }
            />
          ))}
        </section>

        <section className="rounded-lg border border-border/80 bg-white p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(280px,1fr)_150px_220px_190px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="h-10 rounded-md border-0 bg-slate-100 pl-10 text-sm shadow-none focus-visible:ring-1"
                placeholder="Tìm kiếm dịch vụ..."
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            <select
              aria-label="Sắp xếp theo tên"
              className="h-10 rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-700/10"
              value={sortOrder}
              onChange={(event) => {
                setSortOrder(event.target.value as ServiceNameSortOrder);
                setPage(1);
              }}
            >
              <option value="asc">Tên A-Z</option>
              <option value="desc">Tên Z-A</option>
            </select>
            <select
              aria-label="Danh mục"
              className="h-10 rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-700/10"
              value={categoryId}
              onChange={(event) => {
                setCategoryId(event.target.value);
                setPage(1);
              }}
            >
              <option value="all">Tất cả danh mục</option>
              {filterCategories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Trạng thái"
              className="h-10 rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-700/10"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as ServiceStatusFilter);
                setPage(1);
              }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Tạm ẩn</option>
            </select>
          </div>
        </section>

        <section className="rounded-lg border border-border/80 bg-white p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold tracking-normal text-slate-950">
              Danh sách dịch vụ
            </h2>
            {allServicesQuery.isError && (
              <p className="text-sm text-destructive">
                Không thể tải dữ liệu dịch vụ. Vui lòng kiểm tra đăng nhập hoặc thử lại.
              </p>
            )}
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[880px] table-fixed border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border text-slate-900">
                  <th className="w-[220px] px-2 py-3 font-semibold">Tên dịch vụ</th>
                  <th className="w-[240px] px-2 py-3 font-semibold">Mô tả</th>
                  <th className="w-[150px] px-2 py-3 font-semibold">Danh mục</th>
                  <th className="w-[130px] px-2 py-3 text-right font-semibold">Giá</th>
                  <th className="w-[110px] px-2 py-3 font-semibold">Thời lượng</th>
                  <th className="w-[130px] px-2 py-3 font-semibold">Trạng thái</th>
                  <th className="w-[80px] px-2 py-3 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {allServicesQuery.isLoading && (
                  <tr>
                    <td colSpan={7} className="px-2 py-8 text-center text-slate-500">
                      Đang tải dữ liệu dịch vụ...
                    </td>
                  </tr>
                )}
                {!allServicesQuery.isLoading && !allServicesQuery.isError && !services.length && (
                  <tr>
                    <td colSpan={7} className="px-2 py-8 text-center text-slate-500">
                      Không có dịch vụ phù hợp.
                    </td>
                  </tr>
                )}
                {services.map((service) => (
                  <tr key={service._id} className="border-b border-border/70 last:border-0">
                    <td className="px-2 py-3">
                      <div className="space-y-1">
                        <p
                          className="line-clamp-2 font-semibold text-slate-900"
                          title={service.name}
                        >
                          {service.name}
                        </p>
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <p className="line-clamp-2 text-slate-600" title={service.description}>
                        {service.description?.trim() || 'Chưa có mô tả'}
                      </p>
                    </td>
                    <td className="px-2 py-3">
                      <span className="inline-flex max-w-[140px] rounded-md border border-border bg-white px-3 py-1 text-xs font-semibold text-slate-900">
                        <span className="truncate">{service.categoryId.name}</span>
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-2 py-3 text-right font-semibold text-slate-900">
                      {formatCurrency(service.price)}
                    </td>
                    <td className="px-2 py-3 text-slate-900">
                      {formatTime(service.estimatedDuration)}
                    </td>
                    <td className="px-2 py-3">
                      <span
                        className={cn(
                          'rounded-md px-3 py-1 text-xs font-semibold',
                          service.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        )}
                      >
                        {service.isActive ? 'Đang hoạt động' : 'Tạm ẩn'}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-right">
                      <ServiceActionsMenu
                        service={service}
                        onViewDetail={setDetailService}
                        onEdit={setEditingService}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationControls
            pagination={pagination}
            itemCount={services.length}
            onPageChange={setPage}
          />
        </section>
      </div>

      <CreateServiceDialog
        categories={categories}
        isOpen={isCreateDialogOpen}
        isSubmitting={createServiceMutation.isPending || categoriesQuery.isLoading}
        onOpenChange={(open) => {
          if (open) {
            openCreateDialog();
            return;
          }

          closeCreateDialog();
        }}
        onSubmit={handleCreateService}
      />
      <ServiceDetailDialog
        service={detailService}
        onOpenChange={(open) => {
          if (!open) setDetailService(null);
        }}
      />
      <UpdateServiceDialog
        service={editingService}
        categories={categories}
        isSubmitting={updateServiceMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setEditingService(null);
        }}
        onSubmit={handleUpdateService}
      />
    </main>
  );
}

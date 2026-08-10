import { useMemo, useState } from 'react';
import {
  Ellipsis,
  Eye,
  FolderKanban,
  Pencil,
  Plus,
  Search,
  Tags,
  Wrench,
  XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { PaginationControls } from '@/components/shared/PaginationControls';
import {
  useAllServiceCategories,
  useServiceCategories,
} from '@/features/admin/service-categories/hooks/useActiveServiceCategories';
import { useCreateServiceCategory } from '@/features/admin/service-categories/hooks/useCreateServiceCategory';
import { UpdateServiceCategoryDialog } from '@/features/admin/service-categories/components/UpdateServiceCategoryDialog';
import { CategoryServicesDialog } from '@/features/admin/service-categories/components/CategoryServicesDialog';
import { useUpdateServiceCategory } from '@/features/admin/service-categories/hooks/useCreateServiceCategory';
import { useServiceCategoryFormStore } from '@/features/admin/service-categories/stores/serviceCategoryFormStore';
import { CreateServiceCategoryModal } from '@/features/admin/services/components/CreateServiceCategoryModal';
import { useAllServices } from '@/features/admin/services/hooks/useServices';
import {
  useCreateServiceMutation,
  useDeleteServiceMutation,
  useUpdateServiceMutation,
} from '@/features/admin/services/hooks/use-service-mutations';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/features/auth/hooks/use-auth-queries';
import type { CreateServicePayload, Service, UpdateServicePayload } from '@/types/service';
import type { ServiceCategory, UpdateServiceCategoryPayload } from '@/types/serviceCategory';

type StatusFilter = 'all' | 'active' | 'inactive';

const EMPTY_CATEGORIES: ServiceCategory[] = [];
const EMPTY_SERVICES: Service[] = [];

interface CategorySummary {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  services: number;
  totalPrice: number;
  createdAt?: string;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

function buildCategorySummaries(
  categories: ServiceCategory[],
  services: Service[]
): CategorySummary[] {
  const serviceStatsByCategory = new Map<string, { services: number; totalPrice: number }>();

  services.forEach((service) => {
    const current = serviceStatsByCategory.get(service.categoryId._id);

    if (current) {
      current.services += 1;
      current.totalPrice += service.price;
      return;
    }

    serviceStatsByCategory.set(service.categoryId._id, {
      services: 1,
      totalPrice: service.price,
    });
  });

  return categories.map((category) => {
    const stats = serviceStatsByCategory.get(category._id);

    return {
      _id: category._id,
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      services: stats?.services ?? 0,
      totalPrice: stats?.totalPrice ?? 0,
      createdAt: category.createdAt,
    };
  });
}

function CategoryActionsMenu({
  category,
  onViewDetail,
  onEdit,
}: {
  category: CategorySummary;
  onViewDetail: (category: CategorySummary) => void;
  onEdit: (category: CategorySummary) => void;
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
        <DropdownMenuItem onClick={() => onViewDetail(category)}>
          <Eye className="size-4" />
          Xem chi tiết
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(category)}>
          <Pencil className="size-4" />
          Chỉnh sửa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function ServiceCategoriesManagementPage() {
  const userRole = useCurrentUser().data?.role;
  const isAdmin = userRole === 'admin';
  const isCreateCategoryModalOpen = useServiceCategoryFormStore((state) => state.isModalOpen);
  const openCreateCategoryModal = useServiceCategoryFormStore((state) => state.openModal);
  const closeCreateCategoryModal = useServiceCategoryFormStore((state) => state.closeModal);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [detailCategory, setDetailCategory] = useState<CategorySummary | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategorySummary | null>(null);

  const categoriesQuery = useServiceCategories({
    page,
    limit: 10,
    ...(keyword.trim() ? { search: keyword.trim() } : {}),
    ...(status !== 'all' ? { isActive: status === 'active' } : {}),
  });
  const allCategoriesQuery = useAllServiceCategories();
  const servicesQuery = useAllServices();
  const createCategoryMutation = useCreateServiceCategory();
  const updateCategoryMutation = useUpdateServiceCategory();
  const createServiceMutation = useCreateServiceMutation();
  const updateServiceMutation = useUpdateServiceMutation();
  const deleteServiceMutation = useDeleteServiceMutation();

  const categories = categoriesQuery.data?.items ?? EMPTY_CATEGORIES;
  const allCategories = allCategoriesQuery.data ?? [];
  const services = servicesQuery.data ?? EMPTY_SERVICES;
  const categorySummaries = useMemo(
    () => buildCategorySummaries(categories, services),
    [categories, services]
  );
  const totalAssignedServices = services.length;

  const handleCreateServiceCategory = (payload: { name: string; description?: string }) => {
    createCategoryMutation.mutate(payload);
  };

  const handleUpdateServiceCategory = async (payload: UpdateServiceCategoryPayload) => {
    if (!editingCategory) return;
    await updateCategoryMutation.mutateAsync({ categoryId: editingCategory._id, payload });
    setEditingCategory(null);
  };

  const handleCreateService = async (payload: CreateServicePayload) => {
    await createServiceMutation.mutateAsync(payload);
  };

  const handleUpdateService = async (serviceId: string, payload: UpdateServicePayload) => {
    await updateServiceMutation.mutateAsync({ serviceId, payload });
  };

  const handleDeleteService = async (serviceId: string) => {
    await deleteServiceMutation.mutateAsync(serviceId);
  };

  return (
    <main className="min-h-[calc(100vh-81px)] bg-[#f8fafc] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1540px] space-y-6">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
              Quản lý danh mục dịch vụ
            </h1>
            <p className="mt-2 text-base text-slate-500">
              Quản lý nhóm dịch vụ để phân loại bảng giá và quy trình chăm sóc xe.
            </p>
          </div>
          {isAdmin && (
            <Button
              className="h-10 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
              onClick={openCreateCategoryModal}
            >
              <Plus className="size-4" />
              Thêm danh mục
            </Button>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Tổng danh mục"
            value={allCategoriesQuery.isLoading ? '--' : String(allCategories.length)}
            icon={FolderKanban}
          />
          <SummaryCard
            label="Đang hoạt động"
            value={
              allCategoriesQuery.isLoading
                ? '--'
                : String(allCategories.filter((item) => item.isActive).length)
            }
            icon={Tags}
          />
          <SummaryCard
            label="Tạm ẩn"
            value={
              allCategoriesQuery.isLoading
                ? '--'
                : String(allCategories.filter((item) => !item.isActive).length)
            }
            icon={XCircle}
          />
          <SummaryCard
            label="Dịch vụ đã gắn"
            value={servicesQuery.isLoading ? '--' : String(totalAssignedServices)}
            icon={Wrench}
          />
        </section>

        <section className="rounded-lg border border-border/80 bg-white p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_190px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="h-10 rounded-md border-0 bg-slate-100 pl-10 text-sm shadow-none focus-visible:ring-1"
                placeholder="Tìm kiếm danh mục..."
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            <select
              aria-label="Trạng thái"
              className="h-10 rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-700/10"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as StatusFilter);
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
              Danh sách danh mục
            </h2>
            {(categoriesQuery.isError || allCategoriesQuery.isError || servicesQuery.isError) && (
              <p className="text-sm text-destructive">
                Không thể tải đầy đủ dữ liệu danh mục hoặc dịch vụ.
              </p>
            )}
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[840px] table-fixed border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border text-slate-900">
                  <th className="w-[220px] px-2 py-3 font-semibold">Tên danh mục</th>
                  <th className="px-2 py-3 font-semibold">Mô tả</th>
                  <th className="w-[130px] px-2 py-3 font-semibold">Số dịch vụ</th>
                  <th className="w-[170px] px-2 py-3 text-right font-semibold">
                    Tổng giá niêm yết
                  </th>
                  <th className="w-[130px] px-2 py-3 font-semibold">Trạng thái</th>
                  <th className="w-[80px] px-2 py-3 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {categoriesQuery.isLoading && (
                  <tr>
                    <td colSpan={6} className="px-2 py-8 text-center text-slate-500">
                      Đang tải danh mục dịch vụ...
                    </td>
                  </tr>
                )}
                {!categoriesQuery.isLoading &&
                  !categoriesQuery.isError &&
                  !categorySummaries.length && (
                    <tr>
                      <td colSpan={6} className="px-2 py-8 text-center text-slate-500">
                        Không có danh mục dịch vụ phù hợp.
                      </td>
                    </tr>
                  )}
                {categorySummaries.map((category) => (
                  <tr key={category._id} className="border-b border-border/70 last:border-0">
                    <td className="px-2 py-3">
                      <p className="truncate font-semibold text-slate-900" title={category.name}>
                        {category.name}
                      </p>
                    </td>
                    <td className="px-2 py-3">
                      {category.description?.trim() ? (
                        <p className="line-clamp-2 text-slate-600" title={category.description}>
                          {category.description}
                        </p>
                      ) : (
                        <span className="text-sm italic text-slate-400">Chưa có mô tả</span>
                      )}
                    </td>
                    <td className="px-2 py-3 font-semibold text-slate-900">
                      {category.services} dịch vụ
                    </td>
                    <td className="whitespace-nowrap px-2 py-3 text-right font-semibold text-slate-900">
                      {formatCurrency(category.totalPrice)}
                    </td>
                    <td className="px-2 py-3">
                      <span
                        className={cn(
                          'rounded-md px-3 py-1 text-xs font-semibold',
                          category.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        )}
                      >
                        {category.isActive ? 'Đang hoạt động' : 'Tạm ẩn'}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-right">
                      <CategoryActionsMenu
                        category={category}
                        onViewDetail={setDetailCategory}
                        onEdit={setEditingCategory}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationControls
            pagination={categoriesQuery.data?.pagination}
            itemCount={categorySummaries.length}
            onPageChange={setPage}
          />
        </section>
      </div>

      <CreateServiceCategoryModal
        isOpen={isCreateCategoryModalOpen}
        isSubmitting={createCategoryMutation.isPending}
        onOpenChange={(open) => {
          if (open) {
            openCreateCategoryModal();
            return;
          }

          closeCreateCategoryModal();
        }}
        onSubmit={handleCreateServiceCategory}
      />
      <CategoryServicesDialog
        category={detailCategory}
        services={services}
        isAdmin={isAdmin}
        isCreating={createServiceMutation.isPending}
        isUpdating={updateServiceMutation.isPending}
        isDeleting={deleteServiceMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setDetailCategory(null);
        }}
        onCreate={handleCreateService}
        onUpdate={handleUpdateService}
        onDelete={handleDeleteService}
      />
      <UpdateServiceCategoryDialog
        category={editingCategory}
        isSubmitting={updateCategoryMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setEditingCategory(null);
        }}
        onSubmit={handleUpdateServiceCategory}
      />
    </main>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: typeof FolderKanban;
}) {
  return <StatCard title={label} value={value} icon={icon} />;
}

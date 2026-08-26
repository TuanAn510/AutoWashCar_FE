import {
  Coins,
  Ellipsis,
  Eye,
  History,
  Loader2,
  RotateCcw,
  Search,
  Users,
  Wallet,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { MembershipTierBadge } from '@/features/shared/loyalty/components/MembershipTierBadge';
import {
  useCustomersWithLoyalty,
  useMembershipTiers,
} from '@/features/shared/loyalty/hooks/use-loyalty';
import type {
  CustomerWithLoyalty,
  LoyaltyCustomer,
} from '@/features/shared/loyalty/types/loyalty.types';
import { formatPoints } from '@/features/shared/loyalty/utils/loyalty-formatters';
import { getAccountTier } from '@/features/shared/loyalty/utils/tier-progress';
import { formatDate } from '@/lib/utils';

const CUSTOMER_LIST_LIMIT = 12;
const primaryButtonClassName =
  'rounded-md bg-slate-950 text-white hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-500';

type PointStatusFilter = 'all' | 'has_points' | 'no_points';

function getCustomerName(customer?: LoyaltyCustomer | null) {
  return customer?.displayName || customer?.phone || 'Khách hàng';
}

function CustomerActionsMenu({ customerId }: { customerId: string }) {
  const navigate = useNavigate();
  const detailPath = `/admin/loyalty/customers/${customerId}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-8 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-950"
        >
          <Ellipsis className="size-4" />
          <span className="sr-only">Mở menu thao tác</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuItem onClick={() => navigate(detailPath)}>
          <Eye className="size-4" />
          Xem chi tiết
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LoyaltyOverviewCards({
  customers,
  totalCustomers,
}: {
  customers: CustomerWithLoyalty[];
  totalCustomers: number;
}) {
  const overview = customers.reduce(
    (acc, item) => {
      const account = item.loyaltyAccount;

      if (account) {
        acc.currentPoints += account.currentPoints;
        acc.earnedPoints += account.totalEarnedPoints;
        acc.redeemedPoints += account.totalRedeemedPoints;
      }

      return acc;
    },
    {
      currentPoints: 0,
      earnedPoints: 0,
      redeemedPoints: 0,
    }
  );

  const cards = [
    {
      label: 'Tổng khách hàng tích điểm',
      value: totalCustomers.toLocaleString('vi-VN'),
      icon: Users,
    },
    {
      label: 'Tổng điểm khả dụng',
      value: formatPoints(overview.currentPoints),
      icon: Wallet,
    },
    {
      label: 'Tổng điểm tích lũy',
      value: formatPoints(overview.earnedPoints),
      icon: Coins,
    },
    {
      label: 'Tổng điểm đã đổi',
      value: formatPoints(overview.redeemedPoints),
      icon: History,
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="flex h-[104px] items-center justify-between rounded-lg border border-border/80 bg-white px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-500">{card.label}</p>
              <p className="mt-2 text-2xl font-bold tracking-normal text-slate-950">{card.value}</p>
            </div>
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-700">
              <Icon className="size-4" />
            </span>
          </div>
        );
      })}
    </section>
  );
}

function CustomerTable({
  customers,
  isLoading,
  tiers,
}: {
  customers: CustomerWithLoyalty[];
  isLoading: boolean;
  tiers: ReturnType<typeof useMembershipTiers>['data'];
}) {
  if (isLoading) {
    return (
      <section className="rounded-lg border border-border/80 bg-white px-6 py-12 text-center">
        <Loader2 className="mx-auto size-7 animate-spin text-slate-400" />
        <p className="mt-4 text-sm text-slate-500">Đang tải danh sách khách hàng tích điểm...</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-border/80 bg-white p-4">
      <h2 className="text-xl font-semibold text-slate-950">Danh sách khách hàng tích điểm</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[880px] table-fixed border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border text-slate-900">
              <th className="w-[32%] px-2 py-3 font-semibold">Khách hàng</th>
              <th className="w-[16%] px-2 py-3 font-semibold">Điểm khả dụng</th>
              <th className="w-[16%] px-2 py-3 font-semibold">Điểm xét hạng quý</th>
              <th className="w-[18%] px-2 py-3 font-semibold">Hạng</th>
              <th className="w-[12%] px-2 py-3 font-semibold">Ngày tham gia</th>
              <th className="w-[6%] px-2 py-3 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {customers.length ? (
              customers.map((item) => {
                const tier = item.loyaltyAccount ? getAccountTier(item.loyaltyAccount) : null;

                return (
                  <tr key={item.customer._id} className="border-b border-border/70 last:border-0">
                    <td className="px-2 py-3">
                      <div className="min-w-0">
                        <div
                          className="truncate font-semibold text-slate-950"
                          title={getCustomerName(item.customer)}
                        >
                          {getCustomerName(item.customer)}
                        </div>
                        <div className="mt-1 truncate text-xs text-slate-500">
                          {item.customer.phone || 'Chưa có số điện thoại'}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3 font-semibold text-slate-950">
                      {formatPoints(item.loyaltyAccount?.currentPoints ?? 0)}
                    </td>
                    <td className="px-2 py-3 text-slate-900">
                      {formatPoints(item.loyaltyAccount?.currentQuarterEarnedPoints ?? 0)}
                    </td>
                    <td className="px-2 py-3">
                      <MembershipTierBadge tier={tier} tiers={tiers} showIcon={false} />
                    </td>
                    <td className="px-2 py-3 text-slate-900">
                      {item.customer.createdAt ? formatDate(item.customer.createdAt) : 'Chưa có'}
                    </td>
                    <td className="px-2 py-3 text-right">
                      <CustomerActionsMenu customerId={item.customer._id} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-2 py-12 text-center text-sm text-slate-500">
                  Không tìm thấy khách hàng phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function AdminLoyaltyPage() {
  const [keyword, setKeyword] = useState('');
  const [submittedKeyword, setSubmittedKeyword] = useState('');
  const [tierId, setTierId] = useState('all');
  const [pointStatus, setPointStatus] = useState<PointStatusFilter>('all');
  const [page, setPage] = useState(1);

  const customersQuery = useCustomersWithLoyalty({
    search: submittedKeyword || undefined,
    page,
    limit: CUSTOMER_LIST_LIMIT,
  });
  const overviewQuery = useCustomersWithLoyalty({
    page: 1,
    limit: 1000,
  });
  const tiersQuery = useMembershipTiers();

  const customers = useMemo(
    () => customersQuery.data?.customers ?? [],
    [customersQuery.data?.customers]
  );

  const filteredCustomers = useMemo(() => {
    return customers.filter((item) => {
      const accountTier = item.loyaltyAccount ? getAccountTier(item.loyaltyAccount) : null;
      const tierMatched = tierId === 'all' || accountTier?._id === tierId;
      const currentPoints = item.loyaltyAccount?.currentPoints ?? 0;
      const pointStatusMatched =
        pointStatus === 'all' ||
        (pointStatus === 'has_points' && currentPoints > 0) ||
        (pointStatus === 'no_points' && currentPoints <= 0);

      return tierMatched && pointStatusMatched;
    });
  }, [customers, pointStatus, tierId]);

  const pagination = customersQuery.data?.pagination;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);
  const overviewCustomers = overviewQuery.data?.customers ?? customers;
  const overviewTotal = overviewQuery.data?.pagination?.total ?? overviewCustomers.length;

  const handleSearch = () => {
    setSubmittedKeyword(keyword.trim());
    setPage(1);
  };

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden bg-[#f8fafc] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1540px] min-w-0 flex-col gap-5">
        <section>
          <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
            Quản lý tích điểm khách hàng
          </h1>
          <p className="mt-2 max-w-3xl text-base text-slate-500">
            Theo dõi tài khoản điểm, hạng thành viên theo quý và lịch sử giao dịch của khách hàng.
          </p>
        </section>

        <LoyaltyOverviewCards customers={overviewCustomers} totalCustomers={overviewTotal} />

        <section className="rounded-lg border border-border/80 bg-white p-4">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm theo tên hoặc số điện thoại..."
                className="h-10 rounded-md border-0 bg-slate-100 pl-10 text-sm shadow-none focus-visible:ring-1"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleSearch();
                }}
              />
            </div>
            <select
              className="h-10 rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-slate-500"
              value={tierId}
              onChange={(event) => setTierId(event.target.value)}
            >
              <option value="all">Tất cả hạng</option>
              {(tiersQuery.data ?? []).map((tier) => (
                <option key={tier._id} value={tier._id}>
                  {tier.name}
                </option>
              ))}
            </select>
            <select
              className="h-10 rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-slate-500"
              value={pointStatus}
              onChange={(event) => setPointStatus(event.target.value as PointStatusFilter)}
            >
              <option value="all">Tất cả tình trạng điểm</option>
              <option value="has_points">Có điểm khả dụng</option>
              <option value="no_points">Chưa có điểm</option>
            </select>
            <Button className={`h-10 ${primaryButtonClassName}`} onClick={handleSearch}>
              <Search className="size-4" />
              Tìm kiếm
            </Button>
          </div>
        </section>

        {customersQuery.isError ? (
          <section className="rounded-lg border border-rose-200 bg-rose-50 px-6 py-12 text-center">
            <h2 className="text-xl font-semibold text-rose-700">
              Không thể tải danh sách khách hàng tích điểm
            </h2>
            <Button
              className={`mt-5 h-10 ${primaryButtonClassName}`}
              onClick={() => customersQuery.refetch()}
            >
              <RotateCcw className="size-4" />
              Thử lại
            </Button>
          </section>
        ) : (
          <CustomerTable
            customers={filteredCustomers}
            isLoading={customersQuery.isLoading}
            tiers={tiersQuery.data}
          />
        )}

        {pagination ? (
          <div className="flex flex-col gap-3 rounded-lg border border-border/80 bg-white p-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Tổng {pagination.total ?? customersQuery.data?.total ?? 0} khách hàng, trang{' '}
              {pagination.page ?? page}/{totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                className={primaryButtonClassName}
                disabled={page <= 1 || customersQuery.isFetching}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Trước
              </Button>
              <Button
                size="sm"
                className={primaryButtonClassName}
                disabled={page >= totalPages || customersQuery.isFetching}
                onClick={() => setPage((current) => current + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

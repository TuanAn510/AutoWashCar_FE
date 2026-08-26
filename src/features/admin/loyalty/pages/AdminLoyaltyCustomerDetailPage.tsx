import { ArrowLeft, Loader2, RotateCcw } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';

import { Button } from '@/components/ui/button';
import { MembershipTierBadge } from '@/features/shared/loyalty/components/MembershipTierBadge';
import { LoyaltyTransactionTable } from '@/features/shared/loyalty/components/LoyaltyTransactionTable';
import {
  useCustomerLoyaltyAccount,
  useCustomerLoyaltyTransactions,
  useMembershipTiers,
} from '@/features/shared/loyalty/hooks/use-loyalty';
import type {
  LoyaltyAccount,
  LoyaltyCustomer,
  MembershipTier,
} from '@/features/shared/loyalty/types/loyalty.types';
import { formatPoints } from '@/features/shared/loyalty/utils/loyalty-formatters';
import { getAccountTier } from '@/features/shared/loyalty/utils/tier-progress';
import { formatDate } from '@/lib/utils';

const primaryButtonClassName =
  'rounded-md bg-slate-950 text-white hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-500';

function getCustomerName(customer?: LoyaltyCustomer | null) {
  return customer?.displayName || customer?.phone || 'Khách hàng';
}

function CustomerHeader({ account, tiers }: { account: LoyaltyAccount; tiers: MembershipTier[] }) {
  const customer = typeof account.customerId === 'object' ? account.customerId : null;
  const tier = getAccountTier(account);

  return (
    <section className="rounded-lg border border-border/80 bg-white p-5">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-bold tracking-normal text-slate-950">
          {getCustomerName(customer)}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span>{customer?.phone || 'Chưa có số điện thoại'}</span>
          <span className="text-slate-300">•</span>
          <MembershipTierBadge tier={tier} tiers={tiers} />
        </div>
      </div>
    </section>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/80 bg-white p-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-normal text-slate-950">{value}</p>
    </div>
  );
}

function CustomerSummary({ account }: { account: LoyaltyAccount }) {
  const tier = getAccountTier(account);

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
      <SummaryTile label="Điểm khả dụng" value={formatPoints(account.currentPoints)} />
      <SummaryTile
        label="Điểm xét hạng quý này"
        value={formatPoints(account.currentQuarterEarnedPoints)}
      />
      <SummaryTile
        label="Reset điểm và hạng"
        value={
          account.nextQuarterResetAt ? formatDate(account.nextQuarterResetAt) : 'Chưa xác định'
        }
      />
      <SummaryTile label="Tổng điểm tích lũy" value={formatPoints(account.totalEarnedPoints)} />
      <SummaryTile label="Đã đổi thưởng" value={formatPoints(account.totalRedeemedPoints)} />
      <SummaryTile label="Đã hết hạn" value={formatPoints(account.totalExpiredPoints)} />
      <SummaryTile
        label="Hạng thành viên"
        value={`${tier?.name ?? 'Chưa có hạng'} (${tier?.discountPercent ?? 0}%)`}
      />
    </section>
  );
}

export default function AdminLoyaltyCustomerDetailPage() {
  const navigate = useNavigate();
  const { customerId = '' } = useParams();
  const accountQuery = useCustomerLoyaltyAccount(customerId);
  const transactionsQuery = useCustomerLoyaltyTransactions(customerId);
  const tiersQuery = useMembershipTiers();

  const transactions = useMemo(
    () =>
      [...(transactionsQuery.data ?? [])].sort((a, b) =>
        (b.createdAt ?? '').localeCompare(a.createdAt ?? '')
      ),
    [transactionsQuery.data]
  );

  useEffect(() => {
    if (!window.location.hash) return;
    const target = document.querySelector(window.location.hash);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [accountQuery.data]);

  const isLoading = accountQuery.isLoading || transactionsQuery.isLoading;
  const isError = accountQuery.isError || transactionsQuery.isError;

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden bg-[#f8fafc] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1440px] min-w-0 flex-col gap-5">
        <div>
          <Button
            className={`h-10 ${primaryButtonClassName}`}
            onClick={() => navigate('/admin/loyalty')}
          >
            <ArrowLeft className="size-4" />
            Quay lại danh sách
          </Button>
        </div>

        {isLoading ? (
          <section className="rounded-lg border border-border/80 bg-white px-6 py-16 text-center">
            <Loader2 className="mx-auto size-8 animate-spin text-slate-400" />
            <p className="mt-4 text-sm text-slate-500">Đang tải thông tin tích điểm...</p>
          </section>
        ) : isError ? (
          <section className="rounded-lg border border-rose-200 bg-rose-50 px-6 py-16 text-center">
            <h2 className="text-xl font-semibold text-rose-700">
              Không thể tải thông tin tích điểm của khách hàng
            </h2>
            <Button
              className={`mt-5 h-10 ${primaryButtonClassName}`}
              onClick={() => {
                accountQuery.refetch();
                transactionsQuery.refetch();
              }}
            >
              <RotateCcw className="size-4" />
              Thử lại
            </Button>
          </section>
        ) : accountQuery.data ? (
          <>
            <CustomerHeader account={accountQuery.data} tiers={tiersQuery.data ?? []} />
            <CustomerSummary account={accountQuery.data} />
            <LoyaltyTransactionTable transactions={transactions} />
          </>
        ) : null}
      </div>
    </main>
  );
}

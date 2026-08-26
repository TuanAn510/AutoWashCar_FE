import { ArrowLeft, Loader2, RotateCcw } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MembershipTierBadge } from '@/features/shared/loyalty/components/MembershipTierBadge';
import {
  useCustomerLoyaltyAccount,
  useCustomerLoyaltyTransactions,
  useMembershipTiers,
} from '@/features/shared/loyalty/hooks/use-loyalty';
import type {
  LoyaltyAccount,
  LoyaltyCustomer,
  LoyaltyTransaction,
  MembershipTier,
} from '@/features/shared/loyalty/types/loyalty.types';
import {
  formatPoints,
  transactionTypeLabels,
} from '@/features/shared/loyalty/utils/loyalty-formatters';
import { getAccountTier } from '@/features/shared/loyalty/utils/tier-progress';
import { cn, formatDate, formatDateTime } from '@/lib/utils';

const primaryButtonClassName =
  'rounded-md bg-slate-950 text-white hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-500';

function getCustomerName(customer?: LoyaltyCustomer | null) {
  return customer?.displayName || customer?.phone || 'Khách hàng';
}

type LoyaltyAppointmentRef = {
  scheduledAt?: string | null;
  completedAt?: string | null;
  code?: string | null;
};

type LoyaltyRewardRedemptionRef = {
  rewardId?: { name?: string | null } | string | null;
};

const objectIdPattern = /\b[a-f\d]{24}\b/gi;

function hasObjectId(value?: string | null) {
  return objectIdPattern.test(value ?? '');
}

function getFriendlyTransactionActor(transaction: LoyaltyTransaction) {
  if (transaction.type === 'earn' || transaction.type === 'expire') return 'Hệ thống';

  const actor = transaction.createdBy;
  if (!actor) return transaction.type === 'adjust' ? 'Quản trị viên' : 'Hệ thống';
  if (typeof actor === 'string')
    return transaction.type === 'adjust' ? 'Quản trị viên' : 'Hệ thống';
  return (
    actor.displayName ||
    actor.phone ||
    (transaction.type === 'adjust' ? 'Quản trị viên' : 'Hệ thống')
  );
}

function getAppointmentReference(transaction: LoyaltyTransaction) {
  const transactionWithRefs = transaction as LoyaltyTransaction & {
    appointmentId?: LoyaltyAppointmentRef | string | null;
  };
  const serviceHistory =
    typeof transaction.serviceHistoryId === 'object' && transaction.serviceHistoryId
      ? (transaction.serviceHistoryId as { appointmentId?: LoyaltyAppointmentRef | string | null })
      : null;
  const appointment =
    typeof transactionWithRefs.appointmentId === 'object' && transactionWithRefs.appointmentId
      ? transactionWithRefs.appointmentId
      : null;
  const nestedAppointment =
    typeof serviceHistory?.appointmentId === 'object' && serviceHistory.appointmentId
      ? serviceHistory.appointmentId
      : null;
  const reference = appointment ?? nestedAppointment;

  if (reference?.code) return `#${reference.code}`;

  const appointmentDate = reference?.completedAt ?? reference?.scheduledAt;
  return appointmentDate ? `ngày ${formatDate(appointmentDate)}` : null;
}

function getRewardName(transaction: LoyaltyTransaction) {
  const redemption =
    typeof transaction.rewardRedemptionId === 'object' && transaction.rewardRedemptionId
      ? (transaction.rewardRedemptionId as LoyaltyRewardRedemptionRef)
      : null;
  const reward = redemption?.rewardId;

  return typeof reward === 'object' && reward ? reward.name : null;
}

function getTransactionContent(transaction: LoyaltyTransaction) {
  const description = transaction.description?.trim();

  if (transaction.type === 'earn') {
    const appointmentReference = getAppointmentReference(transaction);
    return appointmentReference
      ? `Tích điểm từ lịch hẹn ${appointmentReference}`
      : 'Tích điểm từ lịch hẹn hoàn thành';
  }

  if (transaction.type === 'adjust') {
    const safeReason = description && !hasObjectId(description) ? description : 'Không có ghi chú';
    return `Điều chỉnh thủ công: ${safeReason}`;
  }

  if (transaction.type === 'redeem') {
    const rewardName = getRewardName(transaction);
    return rewardName ? `Đổi thưởng: ${rewardName}` : 'Đổi thưởng';
  }

  if (transaction.type === 'expire') {
    return 'Điểm hết hạn theo chính sách hệ thống';
  }

  return description && !hasObjectId(description) ? description : 'Giao dịch loyalty';
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

function TransactionTable({ transactions }: { transactions: LoyaltyTransaction[] }) {
  if (transactions.length === 0) {
    return (
      <section
        id="transactions"
        className="scroll-mt-6 rounded-lg border border-dashed border-slate-300 bg-white px-4 py-12 text-center text-sm text-slate-500"
      >
        Khách hàng này chưa có giao dịch tích điểm.
      </section>
    );
  }

  return (
    <section
      id="transactions"
      className="scroll-mt-6 rounded-lg border border-border/80 bg-white p-5"
    >
      <h2 className="text-xl font-semibold text-slate-950">Lịch sử giao dịch tích điểm</h2>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead>
            <tr className="border-b text-slate-900">
              <th className="px-2 py-3 font-semibold">Loại giao dịch</th>
              <th className="px-2 py-3 font-semibold">Số điểm</th>
              <th className="px-2 py-3 font-semibold">Nội dung</th>
              <th className="px-2 py-3 font-semibold">Ngày tạo</th>
              <th className="px-2 py-3 font-semibold">Người thực hiện</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction._id} className="border-b last:border-0">
                <td className="px-2 py-4">
                  <Badge className="border-slate-200 bg-slate-50 text-slate-700">
                    {transactionTypeLabels[transaction.type] ?? transaction.type}
                  </Badge>
                </td>
                <td
                  className={cn(
                    'px-2 py-4 font-semibold',
                    transaction.points >= 0 ? 'text-slate-950' : 'text-rose-700'
                  )}
                >
                  {formatPoints(transaction.points)}
                </td>
                <td className="px-2 py-4 text-slate-600">{getTransactionContent(transaction)}</td>
                <td className="px-2 py-4">
                  {transaction.createdAt ? formatDateTime(transaction.createdAt) : 'Chưa có'}
                </td>
                <td className="px-2 py-4 text-slate-900">
                  {getFriendlyTransactionActor(transaction)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
            <TransactionTable transactions={transactions} />
          </>
        ) : null}
      </div>
    </main>
  );
}

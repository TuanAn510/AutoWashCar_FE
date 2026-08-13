import { CheckCircle2, Loader2, RotateCcw, Search, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
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
import {
  useCustomerLoyaltyAccount,
  useCustomerLoyaltyTransactions,
  useCustomerRedemptions,
  useCustomersWithLoyalty,
  useMarkRedemptionUsed,
} from '@/features/shared/loyalty/hooks/use-loyalty';
import type {
  CustomerWithLoyalty,
  LoyaltyAccount,
  LoyaltyCustomer,
  LoyaltyTransaction,
  RewardRedemption,
} from '@/features/shared/loyalty/types/loyalty.types';
import {
  formatPoints,
  redemptionStatusLabels,
  transactionTypeLabels,
} from '@/features/shared/loyalty/utils/loyalty-formatters';
import { getAccountTier } from '@/features/shared/loyalty/utils/tier-progress';
import { formatDate, formatDateTime } from '@/lib/utils';

function CustomerSummary({ account }: { account: LoyaltyAccount }) {
  const tier = getAccountTier(account);

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
      <SummaryTile label="Điểm khả dụng" value={formatPoints(account.currentPoints)} highlight />
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
      <SummaryTile label="Đã đổi" value={formatPoints(account.totalRedeemedPoints)} />
      <SummaryTile label="Đã hết hạn" value={formatPoints(account.totalExpiredPoints)} />
      <SummaryTile
        label="Hạng"
        value={`${tier?.name ?? 'Chưa có hạng'} (${tier?.discountPercent ?? 0}%)`}
      />
    </section>
  );
}

function SummaryTile({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border/80 bg-white p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-3 text-xl font-bold ${highlight ? 'text-emerald-600' : 'text-slate-950'}`}>
        {value}
      </p>
    </div>
  );
}

function TransactionTable({ transactions }: { transactions: LoyaltyTransaction[] }) {
  if (transactions.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-12 text-center text-sm text-slate-500">
        Khách hàng này chưa có giao dịch tích điểm.
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-border/80 bg-white p-6">
      <h2 className="text-xl font-semibold text-slate-950">Lịch sử điểm</h2>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[840px] text-left text-sm">
          <thead>
            <tr className="border-b text-slate-900">
              <th className="px-2 py-3 font-semibold">Loại</th>
              <th className="px-2 py-3 font-semibold">Điểm</th>
              <th className="px-2 py-3 font-semibold">Còn lại</th>
              <th className="px-2 py-3 font-semibold">Ghi chú</th>
              <th className="px-2 py-3 font-semibold">Ngày tạo</th>
              <th className="px-2 py-3 font-semibold">Hết hạn</th>
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
                <td className="px-2 py-4 font-semibold text-slate-950">
                  {formatPoints(transaction.points)}
                </td>
                <td className="px-2 py-4">{formatPoints(transaction.remainingPoints)}</td>
                <td className="px-2 py-4 text-slate-600">
                  {transaction.description || 'Không có'}
                </td>
                <td className="px-2 py-4">
                  {transaction.createdAt ? formatDateTime(transaction.createdAt) : 'Chưa có'}
                </td>
                <td className="px-2 py-4">
                  {transaction.expiresAt ? formatDate(transaction.expiresAt) : 'Không có'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function StaffLoyaltyLookupPage() {
  const [keyword, setKeyword] = useState('');
  const [submittedKeyword, setSubmittedKeyword] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState('');
  const [confirmRedemptionId, setConfirmRedemptionId] = useState('');
  const [showResults, setShowResults] = useState(false);

  const customersQuery = useCustomersWithLoyalty({
    search: submittedKeyword || undefined,
    limit: 20,
  });
  const accountQuery = useCustomerLoyaltyAccount(customerId);
  const transactionsQuery = useCustomerLoyaltyTransactions(customerId);
  const redemptionsQuery = useCustomerRedemptions(customerId);
  const markUsedMutation = useMarkRedemptionUsed(customerId);

  const searchResults = useMemo(
    () => customersQuery.data?.customers ?? [],
    [customersQuery.data?.customers]
  );

  const transactions = useMemo(
    () =>
      [...(transactionsQuery.data ?? [])].sort((a, b) =>
        (b.createdAt ?? '').localeCompare(a.createdAt ?? '')
      ),
    [transactionsQuery.data]
  );

  const handleSearch = () => {
    const trimmed = keyword.trim();
    if (trimmed) {
      setSubmittedKeyword(trimmed);
      setShowResults(true);
    }
  };

  const handleSelectCustomer = (customer: LoyaltyCustomer) => {
    setCustomerId(customer._id);
    setSelectedCustomerName(customer.displayName || '');
    setSelectedCustomerPhone(customer.phone || '');
    setShowResults(false);
    setKeyword('');
    setSubmittedKeyword('');
  };

  const handleClearCustomer = () => {
    setCustomerId('');
    setSelectedCustomerName('');
    setSelectedCustomerPhone('');
    setKeyword('');
    setSubmittedKeyword('');
    setShowResults(false);
  };

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden bg-[#f8fafc] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1440px] min-w-0 flex-col gap-6">
        <section>
          <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
            Tra cứu khách hàng thân thiết
          </h1>
          <p className="mt-2 max-w-2xl text-base text-slate-500">
            Kiểm tra điểm thưởng và đánh dấu phần thưởng đã sử dụng khi khách hàng dùng ưu đãi tại
            gara.
          </p>
        </section>

        <section className="rounded-lg border border-border/80 bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Input
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value);
                  setShowResults(false);
                }}
                placeholder="Tìm theo tên hoặc số điện thoại khách hàng..."
                className="h-10"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleSearch();
                }}
              />
              {showResults ? (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                  {customersQuery.isLoading ? (
                    <div className="flex items-center justify-center px-4 py-6">
                      <Loader2 className="size-5 animate-spin text-slate-400" />
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-slate-500">
                      Không tìm thấy khách hàng phù hợp.
                    </div>
                  ) : (
                    searchResults.map((item: CustomerWithLoyalty) => (
                      <button
                        key={item.customer._id}
                        type="button"
                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50"
                        onClick={() => handleSelectCustomer(item.customer)}
                      >
                        <UserRound className="size-4 shrink-0 text-slate-400" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-950">
                            {item.customer.displayName || 'Khách hàng'}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {item.customer.phone || 'Chưa có số điện thoại'} · ID:{' '}
                            {item.customer._id}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              ) : null}
            </div>
            <Button className="h-10 rounded-md" onClick={handleSearch}>
              <Search className="size-4" />
              Tra cứu
            </Button>
          </div>
        </section>

        {customerId ? (
          accountQuery.isLoading || transactionsQuery.isLoading ? (
            <section className="rounded-lg border border-border/80 bg-white px-6 py-16 text-center">
              <Loader2 className="mx-auto size-8 animate-spin text-slate-400" />
              <p className="mt-4 text-sm text-slate-500">
                Đang tải thông tin tích điểm của khách hàng...
              </p>
            </section>
          ) : accountQuery.isError || transactionsQuery.isError ? (
            <section className="rounded-lg border border-rose-200 bg-rose-50 px-6 py-16 text-center">
              <h2 className="text-xl font-semibold text-rose-700">
                Không thể tải thông tin tích điểm của khách hàng
              </h2>
              <Button
                className="mt-5 rounded-md"
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
              <section className="flex items-center justify-between rounded-lg border border-border/80 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-full bg-slate-100">
                    <UserRound className="size-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950">
{selectedCustomerName || 'Khách hàng'}
                    </p>
                    <p className="text-sm text-slate-500">
                      {selectedCustomerPhone ? `${selectedCustomerPhone} · ` : ''}ID: {customerId}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-md"
                  onClick={handleClearCustomer}
                >
                  Đổi khách hàng
                </Button>
              </section>

              <CustomerSummary account={accountQuery.data} />

              <section className="rounded-lg border border-border/80 bg-white p-6">
                <h2 className="text-xl font-semibold text-slate-950">
                  Đánh dấu phần thưởng đã dùng
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Chọn mã đổi thưởng của khách hàng để đánh dấu đã sử dụng.
                </p>
                {redemptionsQuery.isLoading ? (
                  <div className="mt-5 flex items-center justify-center py-6">
                    <Loader2 className="size-5 animate-spin text-slate-400" />
                  </div>
                ) : (redemptionsQuery.data ?? []).length === 0 ? (
                  <div className="mt-5 rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                    Khách hàng này chưa có mã đổi thưởng nào.
                  </div>
                ) : (
                  <div className="mt-5 overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-sm">
                      <thead>
                        <tr className="border-b text-slate-900">
                          <th className="px-2 py-3 font-semibold">Mã đổi thưởng</th>
                          <th className="px-2 py-3 font-semibold">Phần thưởng</th>
                          <th className="px-2 py-3 font-semibold">Điểm đã dùng</th>
                          <th className="px-2 py-3 font-semibold">Trạng thái</th>
                          <th className="px-2 py-3 font-semibold">Ngày đổi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(redemptionsQuery.data ?? []).map((redemption: RewardRedemption) => {
                          const reward =
                            typeof redemption.rewardId === 'object' && redemption.rewardId
                              ? redemption.rewardId
                              : null;
                          const isAvailable = redemption.status === 'available';

                          return (
                            <tr key={redemption._id} className="border-b last:border-0">
                              <td className="px-2 py-4 font-mono text-xs text-slate-600">
                                {redemption.code ?? redemption._id}
                              </td>
                              <td className="px-2 py-4 font-semibold text-slate-950">
                                {reward?.name ?? 'Phần thưởng'}
                              </td>
                              <td className="px-2 py-4 text-slate-900">
                                {formatPoints(redemption.pointsUsed)}
                              </td>
                              <td className="px-2 py-4">
                                {isAvailable ? (
                                  <Button
                                    size="sm"
                                    className="h-8 rounded-md"
                                    disabled={markUsedMutation.isPending}
                                    onClick={() => setConfirmRedemptionId(redemption._id)}
                                  >
                                    <CheckCircle2 className="size-3.5" />
                                    Đã dùng
                                  </Button>
                                ) : (
                                  <Badge className="border-slate-200 bg-slate-50 text-slate-500">
                                    {redemptionStatusLabels[redemption.status] ?? redemption.status}
                                  </Badge>
                                )}
                              </td>
                              <td className="px-2 py-4 text-slate-600">
                                {redemption.redeemedAt
                                  ? formatDate(redemption.redeemedAt)
                                  : 'Chưa có'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <TransactionTable transactions={transactions} />
            </>
          ) : null
        ) : (
          <section className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-12 text-center text-sm text-slate-500">
            Nhập tên hoặc số điện thoại khách hàng để tra cứu.
          </section>
        )}
      </div>

      <Dialog
        open={!!confirmRedemptionId}
        onOpenChange={(open) => !open && setConfirmRedemptionId('')}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận sử dụng phần thưởng</DialogTitle>
            <DialogDescription>
              Thao tác này xác nhận phần thưởng đã được sử dụng. Khách hàng không thể tự thực hiện
              thao tác này.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-slate-50 p-4 text-sm">
            {(() => {
              const redemption = (redemptionsQuery.data ?? []).find(
                (r) => r._id === confirmRedemptionId
              );
              if (!redemption) return <span className="text-slate-500">{confirmRedemptionId}</span>;
              const reward =
                typeof redemption.rewardId === 'object' && redemption.rewardId
                  ? redemption.rewardId
                  : null;
              return (
                <div className="space-y-1.5">
                  <p className="font-semibold text-slate-950">
                    {reward?.name ?? 'Phần thưởng'}
                  </p>
                  <p className="text-slate-500">
                    Mã: {redemption.code ?? redemption._id} · {formatPoints(redemption.pointsUsed)}
                  </p>
                </div>
              );
            })()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRedemptionId('')}>
              Hủy
            </Button>
            <Button
              disabled={markUsedMutation.isPending}
              onClick={async () => {
                await markUsedMutation.mutateAsync(confirmRedemptionId);
                setConfirmRedemptionId('');
                redemptionsQuery.refetch();
              }}
            >
              {markUsedMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

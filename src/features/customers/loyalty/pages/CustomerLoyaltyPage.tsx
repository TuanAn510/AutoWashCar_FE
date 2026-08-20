import {
  AlertCircle,
  Award,
  CalendarClock,
  CheckCircle2,
  CircleHelp,
  Coins,
  Gift,
  History,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomerEmptyState } from '@/features/customers/components/CustomerEmptyState';
import { MembershipTierBadge } from '@/features/shared/loyalty/components/MembershipTierBadge';
import {
  useMembershipTiers,
  useMyLoyaltyAccount,
  useMyLoyaltyTransactions,
  useMyRewardRedemptions,
  useRedeemReward,
  useRewards,
} from '@/features/shared/loyalty/hooks/use-loyalty';
import type {
  LoyaltyAccount,
  LoyaltyTransaction,
  Reward,
  RewardRedemption,
} from '@/features/shared/loyalty/types/loyalty.types';
import {
  formatPoints,
  formatRewardDiscount,
  getRewardRemainingQuantity,
  redemptionStatusLabels,
  transactionStatusLabels,
  transactionTypeLabels,
} from '@/features/shared/loyalty/utils/loyalty-formatters';
import {
  canRedeemReward,
  isRewardExpired,
  isRewardOutOfStock,
} from '@/features/shared/loyalty/utils/reward-guards';
import {
  calculateTierProgress,
  getAccountTier,
} from '@/features/shared/loyalty/utils/tier-progress';
import { cn, formatDate, formatDateTime } from '@/lib/utils';

const getRewardName = (redemption: RewardRedemption) => {
  const reward = redemption.rewardId;
  return typeof reward === 'object' && reward ? reward.name : 'Ưu đãi';
};

function QueryState({
  isLoading,
  isError,
  onRetry,
}: {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  if (isLoading) {
    return (
      <section className="rounded-lg border border-border/80 bg-white p-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-4 h-32 w-full" />
        <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="size-4 animate-spin" />
          Đang chuẩn bị thông tin điểm của bạn...
        </p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-center">
        <AlertCircle className="mx-auto size-8 text-rose-600" />
        <h2 className="mt-3 text-lg font-semibold text-rose-700">Chưa thể tải thông tin điểm</h2>
        <p className="mt-2 text-sm text-rose-600">Vui lòng thử lại sau ít phút.</p>
        <Button className="mt-4 rounded-md" onClick={onRetry}>
          <RotateCcw className="size-4" />
          Thử lại
        </Button>
      </section>
    );
  }

  return null;
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
    <Card size="sm" className="rounded-2xl border border-slate-200 bg-white shadow-sm ring-0">
      <CardContent className="px-4 py-4">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p
          className={cn('mt-2 text-2xl font-bold text-slate-950', highlight && 'text-emerald-600')}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function PolicyItem({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-slate-950">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
          <Icon className="size-4" />
        </span>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{children}</p>
    </article>
  );
}

function LoyaltySummary({
  account,
  tiers,
}: {
  account: LoyaltyAccount;
  tiers: ReturnType<typeof useMembershipTiers>['data'];
}) {
  const tier = getAccountTier(account);

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      <SummaryTile label="Điểm hiện có" value={formatPoints(account.currentPoints)} highlight />
      <SummaryTile
        label="Điểm xét hạng quý này"
        value={formatPoints(account.currentQuarterEarnedPoints)}
      />
      <SummaryTile label="Tổng điểm đã nhận" value={formatPoints(account.totalEarnedPoints)} />
      <SummaryTile label="Điểm đã dùng" value={formatPoints(account.totalRedeemedPoints)} />
      <SummaryTile label="Điểm đã hết hạn" value={formatPoints(account.totalExpiredPoints)} />
      <Card size="sm" className="rounded-2xl border border-slate-200 bg-white shadow-sm ring-0">
        <CardContent className="px-4 py-4">
          <p className="text-sm font-medium text-slate-500">Hạng hiện tại</p>
          <div className="mt-2 flex items-center gap-2">
            <MembershipTierBadge tier={tier} tiers={tiers} className="rounded-full" />
          </div>
          <p className="mt-3 text-sm text-slate-500">Ưu đãi {tier?.discountPercent ?? 0}%</p>
        </CardContent>
      </Card>
    </section>
  );
}

function TierProgress({
  account,
  tiers,
}: {
  account: LoyaltyAccount;
  tiers: ReturnType<typeof useMembershipTiers>['data'];
}) {
  const tier = getAccountTier(account);
  const progress = calculateTierProgress(account.currentQuarterEarnedPoints, tiers ?? [], tier);

  return (
    <section className="rounded-lg border border-border/80 bg-white p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Hành trình lên hạng</h2>
          <p className="mt-1 text-sm text-slate-500">
            Đổi ưu đãi không làm giảm điểm xét hạng. Điểm sẽ được tính lại từ đầu vào{' '}
            {account.nextQuarterResetAt
              ? formatDate(account.nextQuarterResetAt)
              : 'đầu quý tiếp theo'}
            .
          </p>
        </div>
        <MembershipTierBadge tier={progress.currentTier} tiers={tiers} className="rounded-full" />
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-sm text-slate-600">
          <span>{formatPoints(account.currentQuarterEarnedPoints)}</span>
          <span>
            {progress.nextTier
              ? formatPoints(progress.nextTier.minTotalEarnedPoints)
              : 'Hạng cao nhất'}
          </span>
        </div>
        <div className="mt-2 h-3 rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{ width: `${progress.progressPercent}%` }}
          />
        </div>
        <p className="mt-3 text-sm font-medium text-slate-700">
          {progress.nextTier
            ? `Bạn chỉ cần thêm ${formatPoints(progress.pointsToNextTier)} để lên hạng ${progress.nextTier.name}.`
            : 'Chúc mừng! Bạn đã đạt hạng cao nhất.'}
        </p>
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Các mốc hạng thành viên">
          {(tiers ?? []).map((item) => {
            const reached = account.currentQuarterEarnedPoints >= item.minTotalEarnedPoints;
            return (
              <li key={item._id}>
                <Badge variant={reached ? 'success' : 'neutral'} className="rounded-full px-3 py-1">
                  {reached ? <CheckCircle2 className="size-3" /> : null}
                  {item.name} · {formatPoints(item.minTotalEarnedPoints)}
                </Badge>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function RewardList({
  rewards,
  currentPoints,
  onRedeem,
}: {
  rewards: Reward[];
  currentPoints: number;
  onRedeem: (reward: Reward) => void;
}) {
  const activeRewards = rewards.filter((reward) => reward.isActive !== false);

  return (
    <section className="rounded-lg border border-border/80 bg-white p-6">
      <h2 className="text-xl font-semibold text-slate-950">Ưu đãi dành cho bạn</h2>
      {activeRewards.length === 0 ? (
        <CustomerEmptyState
          className="mt-5 bg-slate-50 py-8 shadow-none"
          icon={<Gift />}
          title="Hiện chưa có ưu đãi mới"
          description="Những ưu đãi mới từ AutoWash Pro sẽ được cập nhật tại đây."
        />
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {activeRewards.map((reward) => {
            const remaining = getRewardRemainingQuantity(reward);
            const canRedeem = canRedeemReward(reward, currentPoints);
            const disabledText = reward.hasRedeemed
              ? 'Đã đổi'
              : isRewardExpired(reward)
                ? 'Hết hạn'
                : isRewardOutOfStock(reward)
                  ? 'Tạm hết'
                  : 'Chưa đủ điểm';

            return (
              <Card
                key={reward._id}
                size="sm"
                className="rounded-2xl border border-slate-200 p-5 shadow-sm ring-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-950">{reward.name}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                      {reward.description || 'Ưu đãi dành riêng cho khách hàng thân thiết.'}
                    </p>
                  </div>
                  <Gift className="size-5 text-emerald-600" />
                </div>
                <div className="mt-4 grid gap-2 text-sm text-slate-600">
                  <span>Cần: {formatPoints(reward.requiredPoints)}</span>
                  <span>Giá trị: {formatRewardDiscount(reward)}</span>
                  <span>Còn lại: {remaining ?? 'Không giới hạn'}</span>
                  {reward.expiredAt ? (
                    <span>Dùng trước: {formatDate(reward.expiredAt)}</span>
                  ) : null}
                </div>
                <Button
                  className="mt-5 w-full rounded-md"
                  disabled={!canRedeem}
                  onClick={() => onRedeem(reward)}
                >
                  {canRedeem ? 'Đổi ưu đãi' : disabledText}
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}

function MyRedemptions({ redemptions }: { redemptions: RewardRedemption[] }) {
  return (
    <section className="rounded-lg border border-border/80 bg-white p-6">
      <h2 className="text-xl font-semibold text-slate-950">Ưu đãi của bạn</h2>
      {redemptions.length === 0 ? (
        <CustomerEmptyState
          className="mt-5 bg-slate-50 py-8 shadow-none"
          icon={<Gift />}
          title="Bạn chưa đổi ưu đãi nào"
          description="Ưu đãi bạn đổi bằng điểm sẽ được lưu tại đây để tiện theo dõi."
        />
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b text-slate-900">
                <th className="px-2 py-3 font-semibold">Ưu đãi</th>
                <th className="px-2 py-3 font-semibold">Điểm đã dùng</th>
                <th className="px-2 py-3 font-semibold">Trạng thái</th>
                <th className="px-2 py-3 font-semibold">Ngày đổi</th>
                <th className="px-2 py-3 font-semibold">Ngày dùng</th>
              </tr>
            </thead>
            <tbody>
              {redemptions.map((redemption) => (
                <tr key={redemption._id} className="border-b last:border-0">
                  <td className="px-2 py-4 font-medium text-slate-950">
                    {getRewardName(redemption)}
                  </td>
                  <td className="px-2 py-4">{formatPoints(redemption.pointsUsed)}</td>
                  <td className="px-2 py-4">
                    <Badge variant="neutral" className="rounded-full">
                      {redemptionStatusLabels[redemption.status] ?? redemption.status}
                    </Badge>
                  </td>
                  <td className="px-2 py-4">
                    {redemption.redeemedAt ? formatDateTime(redemption.redeemedAt) : 'Chưa có'}
                  </td>
                  <td className="px-2 py-4">
                    {redemption.usedAt ? formatDateTime(redemption.usedAt) : 'Chưa sử dụng'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function TransactionHistory({ transactions }: { transactions: LoyaltyTransaction[] }) {
  return (
    <section className="rounded-lg border border-border/80 bg-white p-6">
      <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-950">
        <History className="size-5" />
        Lịch sử điểm
      </h2>
      {transactions.length === 0 ? (
        <CustomerEmptyState
          className="mt-5 bg-slate-50 py-8 shadow-none"
          icon={<History />}
          title="Chưa có hoạt động điểm"
          description="Các lần nhận, sử dụng hoặc hết hạn điểm sẽ được lưu tại đây."
        />
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead>
              <tr className="border-b text-slate-900">
                <th className="px-2 py-3 font-semibold">Hoạt động</th>
                <th className="px-2 py-3 font-semibold">Trạng thái</th>
                <th className="px-2 py-3 font-semibold">Điểm</th>
                <th className="px-2 py-3 font-semibold">Nội dung</th>
                <th className="px-2 py-3 font-semibold">Thời gian</th>
                <th className="px-2 py-3 font-semibold">Hạn sử dụng</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => {
                const transactionStatus = transaction.status ?? 'posted';
                return (
                  <tr key={transaction._id} className="border-b last:border-0">
                    <td className="px-2 py-4">
                      <Badge variant="neutral" className="rounded-full">
                        {transactionTypeLabels[transaction.type] ?? transaction.type}
                      </Badge>
                    </td>
                    <td className="px-2 py-4">
                      <Badge variant="neutral" className="rounded-full">
                        {transactionStatusLabels[transactionStatus]}
                      </Badge>
                    </td>
                    <td
                      className={cn(
                        'px-2 py-4 font-semibold',
                        transactionStatus !== 'posted'
                          ? 'text-slate-500 line-through'
                          : transaction.points >= 0
                            ? 'text-emerald-600'
                            : 'text-amber-600'
                      )}
                    >
                      {transaction.points > 0 ? '+' : ''}
                      {formatPoints(transaction.points)}
                    </td>
                    <td className="px-2 py-4 text-slate-600">
                      {transaction.description || 'Không có ghi chú'}
                    </td>
                    <td className="px-2 py-4">
                      {transaction.createdAt ? formatDateTime(transaction.createdAt) : 'Chưa có'}
                    </td>
                    <td className="px-2 py-4">
                      {transaction.expiresAt
                        ? formatDate(transaction.expiresAt)
                        : transactionStatus === 'pending'
                          ? 'Bắt đầu khi hoàn thành'
                          : 'Không áp dụng'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function CustomerLoyaltyPage() {
  const [confirmReward, setConfirmReward] = useState<Reward | null>(null);
  const accountQuery = useMyLoyaltyAccount();
  const transactionsQuery = useMyLoyaltyTransactions();
  const tiersQuery = useMembershipTiers();
  const rewardsQuery = useRewards();
  const redemptionsQuery = useMyRewardRedemptions();
  const redeemMutation = useRedeemReward();

  const isLoading =
    accountQuery.isLoading ||
    transactionsQuery.isLoading ||
    tiersQuery.isLoading ||
    rewardsQuery.isLoading ||
    redemptionsQuery.isLoading;
  const isError =
    accountQuery.isError ||
    transactionsQuery.isError ||
    tiersQuery.isError ||
    rewardsQuery.isError ||
    redemptionsQuery.isError;

  const transactions = useMemo(
    () =>
      [...(transactionsQuery.data ?? [])].sort((a, b) =>
        (b.createdAt ?? '').localeCompare(a.createdAt ?? '')
      ),
    [transactionsQuery.data]
  );

  const retryAll = () => {
    accountQuery.refetch();
    transactionsQuery.refetch();
    tiersQuery.refetch();
    rewardsQuery.refetch();
    redemptionsQuery.refetch();
  };

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden bg-[#f8fafc] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1440px] min-w-0 flex-col gap-6">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
              Khách hàng thân thiết
            </h1>
            <p className="mt-2 max-w-2xl text-base text-slate-500">
              Theo dõi điểm, hạng thành viên và chọn ưu đãi phù hợp với bạn.
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-10 w-full shrink-0 rounded-xl sm:w-auto">
                <CircleHelp className="size-4" />
                Chính sách tích điểm
              </Button>
            </DialogTrigger>
            <DialogContent className="gap-0 overflow-x-hidden p-0 sm:max-w-2xl sm:overflow-y-hidden">
              <DialogHeader className="border-b border-slate-200 px-5 py-5 pr-12">
                <DialogTitle className="text-xl font-semibold text-slate-950">
                  Tích điểm tại AutoWash Pro
                </DialogTitle>
                <DialogDescription>
                  Cách nhận điểm, nâng hạng và đổi ưu đãi dành cho bạn.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-3 px-5 pb-2 sm:grid-cols-2">
                <PolicyItem icon={Coins} title="Cách tích điểm">
                  Cứ mỗi 10.000₫ giá dịch vụ được 1 điểm cơ bản (phần lẻ được làm tròn xuống), sau
                  đó áp dụng hệ số riêng của dịch vụ. Tổng điểm được hiển thị khi đặt lịch và tự
                  động cộng sau khi dịch vụ hoàn tất.
                </PolicyItem>
                <PolicyItem icon={CalendarClock} title="Điểm có thời hạn bao lâu?">
                  Điểm chưa sử dụng có hiệu lực trong 12 tháng. Kỳ xét hạng mới bắt đầu vào ngày
                  01/01, 01/04, 01/07 và 01/10 theo giờ Việt Nam.
                </PolicyItem>
                <PolicyItem icon={Award} title="Cách nâng hạng">
                  Hạng thành viên dựa trên điểm bạn nhận được trong quý. Đổi ưu đãi không làm giảm
                  tiến độ. Điểm xét hạng được tính lại khi quý mới bắt đầu.
                </PolicyItem>
                <PolicyItem icon={Gift} title="Cách đổi ưu đãi">
                  Chọn ưu đãi bạn thích và dùng điểm hiện có để đổi. Hệ thống sẽ ưu tiên dùng những
                  điểm gần hết hạn trước.
                </PolicyItem>
              </div>

              <div className="mx-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                <p className="font-semibold">Kỳ điểm tiếp theo</p>
                <p className="mt-1">
                  Điểm hiện có sẽ hết hạn và điểm xét hạng sẽ được tính lại vào{' '}
                  {accountQuery.data?.nextQuarterResetAt
                    ? formatDate(accountQuery.data.nextQuarterResetAt)
                    : 'đầu quý tiếp theo'}
                  . Lịch sử nhận điểm và đổi ưu đãi của bạn vẫn được lưu lại.
                </p>
              </div>

              <DialogFooter className="mx-0 mb-0 mt-2">
                <DialogClose asChild>
                  <Button className="h-10 w-full rounded-xl sm:w-32">Đã hiểu</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </section>

        <QueryState isLoading={isLoading} isError={isError} onRetry={retryAll} />

        {!isLoading && !isError && accountQuery.data ? (
          <>
            <LoyaltySummary account={accountQuery.data} tiers={tiersQuery.data} />
            <TierProgress account={accountQuery.data} tiers={tiersQuery.data} />
            <RewardList
              rewards={rewardsQuery.data ?? []}
              currentPoints={accountQuery.data.currentPoints}
              onRedeem={setConfirmReward}
            />
            <MyRedemptions redemptions={redemptionsQuery.data ?? []} />
            <TransactionHistory transactions={transactions} />
          </>
        ) : null}
      </div>

      <Dialog open={!!confirmReward} onOpenChange={(open) => !open && setConfirmReward(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận đổi ưu đãi</DialogTitle>
            <DialogDescription>
              Kiểm tra ưu đãi và số điểm cần dùng trước khi xác nhận.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-950">{confirmReward?.name}</p>
            <p className="mt-2">Bạn sẽ dùng: {formatPoints(confirmReward?.requiredPoints)}</p>
          </div>
          <DialogFooter className="[&_[data-slot=button]]:h-10 [&_[data-slot=button]]:rounded-xl">
            <Button
              variant="outline"
              className="w-full sm:w-36"
              onClick={() => setConfirmReward(null)}
            >
              Để sau
            </Button>
            <Button
              className="w-full sm:w-36"
              disabled={!confirmReward || redeemMutation.isPending}
              onClick={async () => {
                if (!confirmReward) return;
                await redeemMutation.mutateAsync(confirmReward._id);
                setConfirmReward(null);
              }}
            >
              {redeemMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              Đổi ưu đãi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

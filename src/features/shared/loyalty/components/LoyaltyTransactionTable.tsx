import { Badge } from '@/components/ui/badge';
import type { LoyaltyTransaction } from '@/features/shared/loyalty/types/loyalty.types';
import {
  formatPoints,
  transactionTypeLabels,
} from '@/features/shared/loyalty/utils/loyalty-formatters';
import { cn, formatDate, formatDateTime } from '@/lib/utils';

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

export function LoyaltyTransactionTable({ transactions }: { transactions: LoyaltyTransaction[] }) {
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

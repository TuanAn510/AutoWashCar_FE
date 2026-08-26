import type { ServiceHistoryItem } from '@/types/serviceHistory';
import { CustomerServiceHistoryCard } from '@/features/customers/service-histories/components/CustomerServiceHistoryCard';

export function CustomerServiceHistoryList({
  serviceHistories,
  onViewDetail,
}: {
  serviceHistories: ServiceHistoryItem[];
  onViewDetail: (serviceHistory: ServiceHistoryItem) => void;
}) {
  return (
    <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
      {serviceHistories.map((serviceHistory) => (
        <CustomerServiceHistoryCard
          key={serviceHistory._id}
          serviceHistory={serviceHistory}
          onViewDetail={onViewDetail}
        />
      ))}
    </div>
  );
}

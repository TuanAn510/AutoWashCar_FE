import type { ApiVehicle } from '@/types/vehicle';

interface CustomerServiceHistoryFiltersProps {
  keyword: string;
  selectedVehicleId: string;
  vehicles: ApiVehicle[];
  onKeywordChange: (value: string) => void;
  onVehicleChange: (value: string) => void;
}

export function CustomerServiceHistoryFilters({
  keyword,
  selectedVehicleId,
  vehicles,
  onKeywordChange,
  onVehicleChange,
}: CustomerServiceHistoryFiltersProps) {
  return (
    <section className="grid gap-3 rounded-xl border border-[#e5edf6] bg-white p-4 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
        <input
          className="h-[46px] w-full rounded-md border border-[#d8e2ef] bg-white px-3 text-sm font-semibold text-[#64748b] outline-none transition focus:border-[#0b67c2]"
          placeholder="Tìm theo dịch vụ, biển số, ghi chú..."
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
        />

        <select
          className="h-[46px] w-full rounded-md border border-[#d8e2ef] bg-white px-3 text-sm font-semibold text-[#64748b] outline-none transition focus:border-[#0b67c2]"
          value={selectedVehicleId}
          onChange={(event) => onVehicleChange(event.target.value)}
        >
          <option value="">Tất cả xe</option>
          {vehicles.map((vehicle) => (
            <option key={vehicle._id} value={vehicle._id}>
              {vehicle.brand} {vehicle.model} - {vehicle.licensePlate}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}

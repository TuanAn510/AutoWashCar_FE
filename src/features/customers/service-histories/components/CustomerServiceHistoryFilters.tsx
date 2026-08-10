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
    <section className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
        <input
          className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-slate-400"
          placeholder="Tìm theo dịch vụ, biển số, ghi chú..."
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
        />

        <select
          className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-slate-400"
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

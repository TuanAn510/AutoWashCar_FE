import { CarFront } from 'lucide-react';

export function EmptyCustomerServiceHistoriesState() {
  return (
    <section className="rounded-xl border border-dashed border-[#e5edf6] bg-white px-6 py-16 text-center shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-slate-100 text-[#0b67c2]">
        <CarFront className="size-6" />
      </div>
      <h2 className="mt-5 text-xl font-black text-[#15243a]">Bạn chưa có lịch sử dịch vụ nào</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#64748b]">
        Sau khi lịch hẹn hoàn thành, lịch sử dịch vụ sẽ xuất hiện tại đây.
      </p>
    </section>
  );
}

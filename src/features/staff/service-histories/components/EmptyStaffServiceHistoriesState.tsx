import { Wrench } from 'lucide-react';

export function EmptyStaffServiceHistoriesState() {
  return (
    <section className="rounded-[28px] border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Wrench className="size-6" />
      </div>
      <h2 className="mt-5 text-xl font-semibold text-slate-950">
        Bạn chưa có lịch sử dịch vụ nào đã xử lý
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
        Các dịch vụ hoàn thành do bạn xử lý sẽ xuất hiện tại đây.
      </p>
    </section>
  );
}

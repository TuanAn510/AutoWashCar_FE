import { CalendarDays } from 'lucide-react';

export function EmptyStaffAppointmentsState() {
  return (
    <section className="rounded-[32px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-slate-100 text-slate-600">
        <CalendarDays className="size-8" />
      </div>
      <h2 className="mt-5 text-2xl font-semibold text-slate-950">
        Chưa có lịch hẹn nào được phân công
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
        Các lịch hẹn mới sẽ xuất hiện tại đây khi admin phân công cho bạn.
      </p>
    </section>
  );
}

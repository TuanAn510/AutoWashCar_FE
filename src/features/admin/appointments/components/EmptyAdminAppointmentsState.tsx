import { CalendarRange } from 'lucide-react';

export function EmptyAdminAppointmentsState({
  title = 'Chưa có lịch hẹn nào',
  description = 'Các lịch hẹn mới từ khách hàng sẽ xuất hiện tại đây.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-slate-100 text-slate-600">
        <CalendarRange className="size-8" />
      </div>
      <h2 className="mt-5 text-2xl font-semibold text-slate-950">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
    </section>
  );
}

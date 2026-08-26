import { Camera, CheckCircle2, LogIn } from 'lucide-react';

import type { AppointmentItem } from '@/types/appointment';
import { resolveImageUrl } from '@/lib/image-url';

export function AppointmentEvidenceImages({ appointment }: { appointment: AppointmentItem }) {
  const images = [
    {
      label: 'Ảnh check-in',
      description: 'Tình trạng xe khi nhân viên tiếp nhận.',
      url: appointment.checkInImageUrl,
      icon: LogIn,
    },
    {
      label: 'Ảnh hoàn thành',
      description: 'Kết quả sau khi hoàn thành dịch vụ.',
      url: appointment.completionImageUrl,
      icon: CheckCircle2,
    },
  ].filter((item) => item.url);

  if (!images.length) {
    return (
      <section className="rounded-xl border border-dashed border-[#d9e5f2] bg-white p-4 sm:p-5">
        <div className="flex items-center gap-2 text-sm font-black text-[#15243a]">
          <Camera className="size-4" />
          Hình ảnh xác nhận
        </div>
        <p className="mt-2 text-sm leading-6 text-[#64748b]">
          Chưa có hình ảnh check-in hoặc hình ảnh hoàn thành cho lịch hẹn này.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-[#e5edf6] bg-white p-4 sm:p-5">
      <div className="flex items-center gap-2 text-sm font-black text-[#15243a]">
        <Camera className="size-4" />
        Hình ảnh xác nhận
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {images.map(({ description, icon: Icon, label, url }) => (
          <a
            key={label}
            href={resolveImageUrl(url)}
            target="_blank"
            rel="noreferrer"
            className="group overflow-hidden rounded-xl border border-[#e5edf6] bg-slate-50"
          >
            <div className="aspect-video overflow-hidden bg-slate-100">
              <img
                src={resolveImageUrl(url)}
                alt={label}
                className="size-full object-cover transition group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="p-3">
              <p className="flex items-center gap-2 text-sm font-black text-[#15243a]">
                <Icon className="size-4 text-[#0b67c2]" />
                {label}
              </p>
              <p className="mt-1 text-xs leading-5 text-[#64748b]">{description}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

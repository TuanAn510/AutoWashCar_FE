import { Camera, CheckCircle2, LogIn } from 'lucide-react';

import type { AppointmentItem } from '@/types/appointment';
import { resolveImageUrl } from '@/lib/image-url';

export function AppointmentEvidenceImages({ appointment }: { appointment: AppointmentItem }) {
  const images = [
    {
      label: '\u1ea2nh check-in',
      description: 'T\u00ecnh tr\u1ea1ng xe khi nh\u00e2n vi\u00ean ti\u1ebfp nh\u1eadn.',
      url: appointment.checkInImageUrl,
      icon: LogIn,
    },
    {
      label: '\u1ea2nh ho\u00e0n th\u00e0nh',
      description: 'K\u1ebft qu\u1ea3 sau khi ho\u00e0n th\u00e0nh d\u1ecbch v\u1ee5.',
      url: appointment.completionImageUrl,
      icon: CheckCircle2,
    },
  ].filter((item) => item.url);

  if (!images.length) {
    return (
      <section className="rounded-xl border border-dashed border-[#d9e5f2] bg-white p-4 sm:p-5">
        <div className="flex items-center gap-2 text-sm font-black text-[#15243a]">
          <Camera className="size-4" />
          H\u00ecnh \u1ea3nh x\u00e1c nh\u1eadn
        </div>
        <p className="mt-2 text-sm leading-6 text-[#64748b]">
          Ch\u01b0a c\u00f3 h\u00ecnh \u1ea3nh check-in ho\u1eb7c h\u00ecnh \u1ea3nh ho\u00e0n
          th\u00e0nh cho l\u1ecbch h\u1eb9n n\u00e0y.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-[#e5edf6] bg-white p-4 sm:p-5">
      <div className="flex items-center gap-2 text-sm font-black text-[#15243a]">
        <Camera className="size-4" />
        H\u00ecnh \u1ea3nh x\u00e1c nh\u1eadn
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

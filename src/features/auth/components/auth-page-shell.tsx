import { ArrowLeft, BadgeCheck, CarFront, Clock3, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

interface AuthPageShellProps {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}

const trustPoints = [
  { icon: Clock3, label: 'Đặt lịch nhanh chóng' },
  { icon: ShieldCheck, label: 'Thông tin được bảo mật' },
  { icon: BadgeCheck, label: 'Dịch vụ minh bạch' },
];

export function AuthPageShell({ children, eyebrow, title, description }: AuthPageShellProps) {
  return (
    <main className="min-h-svh bg-[#eef3f8] p-3 sm:p-5 lg:p-7">
      <div className="mx-auto grid min-h-[calc(100svh-24px)] w-full max-w-[1240px] overflow-hidden rounded-xl bg-white shadow-[0_28px_80px_rgba(15,35,60,0.16)] ring-1 ring-slate-200 sm:min-h-[calc(100svh-40px)] lg:grid-cols-[minmax(440px,0.92fr)_minmax(0,1.08fr)]">
        <section className="relative isolate order-2 hidden min-h-full overflow-hidden bg-[#061022] text-white lg:flex lg:flex-col lg:justify-between">
          <img
            src="/images/bg/bg3.jpg"
            alt="Chuyên viên AutoWash Pro chăm sóc ô tô"
            className="absolute inset-0 -z-20 h-full w-full object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(110deg,rgba(6,16,34,0.94)_0%,rgba(6,16,34,0.79)_50%,rgba(6,16,34,0.36)_100%)]" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_30%,rgba(11,103,194,0.34),transparent_38%)]" />

          <Link
            to="/"
            className="m-9 inline-flex w-fit items-center gap-3 rounded-lg text-white transition-opacity hover:opacity-85"
          >
            <span className="grid size-11 place-items-center rounded-lg bg-[#0b67c2] shadow-lg shadow-blue-950/30">
              <CarFront className="size-6" />
            </span>
            <span>
              <span className="block text-lg font-black leading-none">AutoWash Pro</span>
              <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
                Garage CRM
              </span>
            </span>
          </Link>

          <div className="max-w-[620px] p-9 xl:p-12">
            <span className="inline-flex border-l-4 border-[#ff7a1a] pl-3 text-xs font-black uppercase tracking-[0.2em] text-white/80">
              {eyebrow}
            </span>
            <h1 className="mt-5 max-w-[580px] text-4xl font-black leading-[1.08] tracking-tight xl:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-[530px] text-base leading-7 text-white/72">{description}</p>

            <div className="mt-9 grid gap-3 sm:grid-cols-3">
              {trustPoints.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 rounded-lg border border-white/12 bg-white/8 px-3 py-3 text-sm font-semibold backdrop-blur-sm"
                >
                  <Icon className="size-4 shrink-0 text-[#55a9ff]" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="order-1 flex min-w-0 flex-col bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <Link to="/" className="inline-flex items-center gap-2.5 font-black text-slate-950 lg:hidden">
              <span className="grid size-9 place-items-center rounded-lg bg-[#0b67c2] text-white">
                <CarFront className="size-5" />
              </span>
              AutoWash Pro
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#0b67c2]"
            >
              <ArrowLeft className="size-4" />
              Trang chủ
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-10 lg:px-12 lg:py-10 xl:px-16">
            <div className="w-full max-w-[460px]">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}

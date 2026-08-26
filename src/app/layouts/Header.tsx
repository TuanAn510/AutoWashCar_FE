import { CarFront, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router';

import { Button } from '@/components/ui/button';
import type { HeaderLink } from '@/features/home/types';
import { cn } from '@/lib/utils';

interface HeaderProps {
  links: HeaderLink[];
}

function isActiveLink(href: string, pathname: string, hash: string) {
  if (href.startsWith('#')) {
    return pathname === '/' && hash === href;
  }

  return pathname === href && hash === '';
}

export function Header({ links }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const { pathname, hash } = useLocation();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm shadow-slate-950/5 backdrop-blur-xl supports-backdrop-filter:bg-white/85">
      <div className="mx-auto w-[min(1160px,calc(100%-32px))]">
        <div className="flex min-h-19 items-center justify-between gap-6">
          <Link
            to="/"
            className="inline-flex items-center gap-3 rounded-lg text-slate-900 transition-opacity hover:opacity-85"
            onClick={() => setOpen(false)}
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#0b67c2] text-white shadow-sm">
              <CarFront className="size-5" />
            </span>
            <span className="text-base font-bold">AutoWash Pro</span>
          </Link>

          <nav className="hidden items-center rounded-full border border-slate-200 bg-slate-50 p-1 md:flex">
            {links.map((link) => {
              const active = isActiveLink(link.href, pathname, hash);

              return (
                <a
                  key={link.label}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-all hover:bg-white hover:text-[#0b67c2]',
                    active && 'bg-white text-[#0b67c2] shadow-sm ring-1 ring-slate-200'
                  )}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 md:flex">
              <Button
                asChild
                className="h-11 rounded-md bg-[#0b67c2] px-6 text-[0.95rem] font-bold text-white shadow-lg shadow-blue-700/20 hover:bg-[#0959aa]"
              >
                <a href="/login">Đặt lịch ngay</a>
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              className="rounded-md border-slate-200 md:hidden"
              onClick={() => setOpen((value) => !value)}
              aria-label="Mở menu"
              aria-expanded={open}
            >
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {open ? (
          <div className="grid gap-2 border-t border-slate-200 py-4 md:hidden">
            {links.map((link) => {
              const active = isActiveLink(link.href, pathname, hash);

              return (
                <a
                  key={link.label}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#0b67c2]',
                    active && 'bg-slate-100 text-[#0b67c2]'
                  )}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              );
            })}
            <Button
              asChild
              className="mt-3 h-11 rounded-md bg-[#0b67c2] px-5 text-[0.95rem] font-bold text-white shadow-lg shadow-blue-700/20 hover:bg-[#0959aa]"
            >
              <a href="/login" onClick={() => setOpen(false)}>
                Đặt lịch ngay
              </a>
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  );
}

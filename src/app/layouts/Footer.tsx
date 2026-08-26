import { CarFront, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router';

import type { HeaderLink } from '@/features/home/types';

interface FooterProps {
  links: HeaderLink[];
}

const services = ['Rửa xe toàn diện', 'Vệ sinh nội thất', 'Phủ ceramic', 'Detailing & Đánh bóng'];

export function Footer({ links }: FooterProps) {
  return (
    <footer className="bg-[#06101f] text-white">
      <div className="mx-auto grid w-[min(1160px,calc(100%-32px))] gap-10 py-14 md:grid-cols-[1.25fr_0.8fr_0.8fr_1fr]">
        <div>
          <Link to="/" className="inline-flex items-center gap-3 font-bold text-white">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#0b67c2] text-sm text-white">
              <CarFront className="size-5" />
            </span>
            <span className="text-base">AutoWash Pro</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-7 text-white/68">
            Nền tảng đặt lịch rửa xe và chăm sóc khách hàng thân thiết, giúp quy trình tiếp nhận và
            tích điểm thành viên rõ ràng hơn.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase text-white">Liên kết nhanh</h3>
          <nav className="grid gap-3">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-white/68 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase text-white">Dịch vụ nổi bật</h3>
          <div className="grid gap-3">
            {services.map((service) => (
              <span key={service} className="text-sm font-medium text-white/68">
                {service}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase text-white">Thông tin liên hệ</h3>
          <div className="grid gap-3 text-sm text-white/68">
            <span className="inline-flex items-center gap-2">
              <Phone size={16} /> 0900 000 000
            </span>
            <span className="inline-flex items-center gap-2">
              <Mail size={16} /> support@autowash.vn
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin size={16} /> TP. Hồ Chí Minh
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-[min(1160px,calc(100%-32px))] flex-col gap-2 py-5 text-sm text-white/55 md:flex-row md:items-center md:justify-between">
          <span>Copyright 2026 AutoWash Pro. All rights reserved.</span>
          <span>Hệ thống rửa xe & chăm sóc khách hàng thân thiết cho gara hiện đại.</span>
        </div>
      </div>
    </footer>
  );
}

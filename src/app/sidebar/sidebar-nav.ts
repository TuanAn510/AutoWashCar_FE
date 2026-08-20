import {
  BarChart3,
  BadgePercent,
  CalendarDays,
  Car,
  Coins,
  CreditCard,
  History,
  Megaphone,
  ShieldCheck,
  Trophy,
  UserCog,
  Users,
  Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { User } from '@/types/user';

type AuthUser = User | null;
type UserRole = NonNullable<NonNullable<AuthUser>['role']>;

export interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
  roles: UserRole[];
}

export const sidebarNav: NavItem[] = [
  {
    label: 'Lịch hẹn',
    icon: CalendarDays,
    href: '/appointments',
    roles: ['admin', 'staff', 'customer'],
  },
  { label: 'Quản lý dịch vụ', icon: Wrench, href: '/services', roles: ['admin'] },
  { label: 'Xe', icon: Car, href: '/vehicles', roles: ['customer', 'admin'] },
  { label: 'Lịch sử', icon: History, href: '/service-histories', roles: ['staff'] },
  { label: 'Tích điểm', icon: Coins, href: '/loyalty', roles: ['admin', 'staff', 'customer'] },
  { label: 'Khách hàng', icon: Users, href: '/customers', roles: ['admin'] },
  { label: 'Quản lý staff', icon: UserCog, href: '/staff', roles: ['admin'] },
  { label: 'Xác minh xe', icon: ShieldCheck, href: '/vehicle-access-requests', roles: ['admin'] },
  {
    label: 'Chương trình thành viên',
    icon: BadgePercent,
    href: '/membership-programs',
    roles: ['admin'],
  },
  { label: 'Phần thưởng', icon: Trophy, href: '/rewards', roles: ['admin'] },
  { label: 'Khuyến mãi', icon: Megaphone, href: '/promotions', roles: ['admin'] },
  { label: 'Thu ngân', icon: CreditCard, href: '/payments', roles: ['admin'] },
  { label: 'Báo cáo & Thống kê', icon: BarChart3, href: '/reports', roles: ['admin'] },
];

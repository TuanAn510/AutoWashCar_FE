import type { User } from '@/types/user';

export type UserRole = NonNullable<User['role']>;

export const roleHomePath: Record<UserRole, string> = {
  admin: '/admin/appointments',
  staff: '/staff/appointments',
  customer: '/customer/appointments',
};

export const getRoleHomePath = (role?: User['role']) => roleHomePath[role ?? 'customer'];

export const toRolePath = (href: string, role: UserRole) =>
  href.startsWith('/') ? `/${role}${href}` : `/${role}/${href}`;

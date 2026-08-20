import { describe, expect, it } from 'vitest';

import { toRolePath } from '@/app/routes/role-paths';
import { sidebarNav } from '@/app/sidebar/sidebar-nav';

describe('sidebar service management navigation', () => {
  const serviceManagementItem = sidebarNav.find((item) => item.href === '/services');

  it('shows service management only to admins', () => {
    expect(serviceManagementItem).toMatchObject({
      label: 'Quản lý dịch vụ',
      roles: ['admin'],
    });
  });

  it('resolves to the protected admin service route', () => {
    expect(serviceManagementItem).toBeDefined();
    expect(toRolePath(serviceManagementItem!.href, 'admin')).toBe('/admin/services');
  });
});

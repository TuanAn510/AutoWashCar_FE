import { Outlet } from 'react-router';

import { getRoleHomePath, toRolePath } from '@/app/routes/role-paths';
import { AppSidebar } from '@/app/sidebar/app-sidebar';
import { sidebarNav } from '@/app/sidebar/sidebar-nav';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useCurrentUser } from '@/features/auth/hooks/use-auth-queries';

export function AppLayout() {
  const user = useCurrentUser().data;
  const role = user?.role ?? 'customer';
  const navItems = sidebarNav
    .filter((item) => item.roles.includes(role))
    .map((item) => ({ ...item, href: toRolePath(item.href, role) }));

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar items={navItems} user={user} homeHref={getRoleHomePath(role)} />
      <SidebarInset className="min-h-screen min-w-0 overflow-x-hidden bg-white text-slate-900">
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}

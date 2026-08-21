import { Outlet } from 'react-router';

import { getRoleHomePath, toRolePath } from '@/app/routes/role-paths';
import { AppSidebar } from '@/app/sidebar/app-sidebar';
import { sidebarNav } from '@/app/sidebar/sidebar-nav';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useCurrentUser } from '@/features/auth/hooks/use-auth-queries';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';

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
        <div className="pointer-events-none fixed right-4 top-4 z-50 flex justify-end sm:right-6 sm:top-5">
          <div className="pointer-events-auto rounded-2xl border border-white/70 bg-white/90 p-1 shadow-lg shadow-slate-900/10 backdrop-blur-md">
            <NotificationBell user={user} />
          </div>
        </div>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}

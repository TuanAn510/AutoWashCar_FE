import { Outlet } from 'react-router';

import { getRoleHomePath, toRolePath } from '@/app/routes/role-paths';
import { AppSidebar } from '@/app/sidebar/app-sidebar';
import { sidebarNav } from '@/app/sidebar/sidebar-nav';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
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
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
          <div className="flex items-center">
            <NotificationBell user={user} />
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}

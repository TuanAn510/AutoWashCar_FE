import { NavLink, useLocation } from 'react-router';

import type { NavItem } from '@/app/sidebar/sidebar-nav';
import { cn } from '@/lib/utils';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function NavMain({ items }: { items: NavItem[] }) {
  const { pathname } = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarMenu className="gap-1">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                tooltip={item.label}
                isActive={isActive}
                className={cn(
                  'relative h-10 rounded-lg px-3 font-medium text-sidebar-foreground/75',
                  'hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground',
                  isActive &&
                    'bg-primary-light pl-4 text-sidebar-primary before:absolute before:left-1.5 before:top-1/2 before:h-5 before:w-1 before:-translate-y-1/2 before:rounded-full before:bg-sidebar-primary hover:bg-primary-light hover:text-sidebar-primary data-[active=true]:bg-primary-light data-[active=true]:text-sidebar-primary dark:bg-primary/20 dark:hover:bg-primary/20 dark:data-[active=true]:bg-primary/20 [&_svg]:text-sidebar-primary'
                )}
              >
                <NavLink to={item.href} end={false}>
                  <item.icon />
                  <span>{item.label}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

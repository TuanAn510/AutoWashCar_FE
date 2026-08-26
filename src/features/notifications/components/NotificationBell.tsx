import { useEffect, useRef, useState } from 'react';

import { Bell, CheckCheck, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useNotificationMutations,
  useNotifications,
  useUnreadNotificationCount,
} from '@/features/notifications/hooks/useNotifications';
import { cn, formatDateTimeVi } from '@/lib/utils';
import type { NotificationItem } from '@/services/notificationService';

export function NotificationBell() {
  const [page, setPage] = useState(0);
  const notificationsQuery = useNotifications(page);
  const unreadCountQuery = useUnreadNotificationCount();
  const { markRead, markAllRead } = useNotificationMutations();

  const pageData = notificationsQuery.data;
  const allNotifications = pageData?.content ?? [];
  const totalElements = pageData?.totalElements ?? 0;
  const totalPages = pageData?.totalPages ?? 0;
  const unreadCount = unreadCountQuery.data?.count ?? 0;

  const knownNotificationIdsRef = useRef<Set<number> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [previewNotification, setPreviewNotification] = useState<NotificationItem | null>(null);

  useEffect(() => {
    if (!notificationsQuery.isSuccess) return;
    const currentIds = new Set(allNotifications.map((n) => n.id));
    if (!knownNotificationIdsRef.current) {
      knownNotificationIdsRef.current = currentIds;
      return;
    }
    const newNotification = allNotifications.find(
      (n) => !knownNotificationIdsRef.current?.has(n.id),
    );
    knownNotificationIdsRef.current = currentIds;
    if (!newNotification) return;
    setPreviewNotification(newNotification);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setPreviewNotification(null);
      toastTimerRef.current = null;
    }, 3000);
  }, [allNotifications, notificationsQuery.isSuccess]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleMarkAsRead = (notification: NotificationItem) => {
    if (!notification.read) {
      markRead.mutate(notification.id);
    }
  };

  return (
    <div className="relative">
      {previewNotification ? (
        <div className="absolute right-0 top-12 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-blue-100 bg-white p-4 shadow-2xl shadow-blue-950/15 animate-in fade-in-0 slide-in-from-top-2">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
            <span className="size-2 rounded-full bg-blue-600" />
            Thông báo mới
          </div>
          <p className="line-clamp-1 text-sm font-semibold text-slate-950">
            {previewNotification.title}
          </p>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">
            {previewNotification.message}
          </p>
        </div>
      ) : null}
      <DropdownMenu
        onOpenChange={(open) => {
          if (open) {
            setPreviewNotification(null);
            setPage(0);
          }
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative rounded-xl" aria-label="Thông báo">
            <Bell className="size-5" />
            {unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-rose-600 px-1 text-[11px] font-bold leading-5 text-white shadow-sm shadow-rose-900/20">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : null}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          side="bottom"
          sideOffset={12}
          className="w-[32rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border-slate-200 p-0 shadow-2xl shadow-slate-950/15"
        >
          <div className="flex items-center justify-between gap-3 bg-slate-50/80 px-5 py-4">
            <DropdownMenuLabel className="p-0 text-sm font-semibold text-slate-950">
              Thông báo
              {totalElements > 0 ? (
                <span className="ml-2 text-xs font-normal text-slate-400">
                  ({totalElements})
                </span>
              ) : null}
            </DropdownMenuLabel>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 rounded-md px-2 text-xs"
              disabled={unreadCount === 0 || markAllRead.isPending}
              onPointerDown={(e) => {
                e.preventDefault();
                markAllRead.mutate();
              }}
            >
              {markAllRead.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <CheckCheck className="size-3.5" />
              )}
              Đọc tất cả
            </Button>
          </div>
          <DropdownMenuSeparator className="m-0" />
          <div className="max-h-[620px] overflow-y-auto p-2">
            {notificationsQuery.isLoading ? (
              <p className="px-3 py-8 text-center text-sm text-slate-500">
                Đang tải thông báo...
              </p>
            ) : allNotifications.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-slate-500">
                Chưa có thông báo.
              </p>
            ) : (
              <>
                {allNotifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="items-start gap-3 rounded-xl px-4 py-4"
                    onSelect={(event) => {
                      event.preventDefault();
                      handleMarkAsRead(notification);
                    }}
                  >
                    <span
                      className={cn(
                        'mt-1 size-2 shrink-0 rounded-full',
                        notification.read ? 'bg-slate-300' : 'bg-blue-600',
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-slate-950">
                        {notification.title}
                      </span>
                      <span className="mt-1 line-clamp-3 block text-sm leading-5 text-slate-600">
                        {notification.message}
                      </span>
                      <span className="mt-1 block text-[11px] text-slate-400">
                        {formatDateTimeVi(notification.createdAt)}
                      </span>
                    </span>
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </div>
          {totalPages > 1 ? (
            <>
              <DropdownMenuSeparator className="m-0" />
              <div className="flex items-center justify-between px-4 py-2.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  disabled={page === 0}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.max(0, p - 1));
                  }}
                >
                  <ChevronLeft className="size-3.5" />
                  Trước
                </Button>
                <span className="text-xs text-slate-500">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  disabled={page >= totalPages - 1}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.min(totalPages - 1, p + 1));
                  }}
                >
                  Sau
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

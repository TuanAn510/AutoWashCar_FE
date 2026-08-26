import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { notificationApi, type NotificationPage } from '@/services/notificationService';

const POLLING_INTERVAL_MS = 5_000;
const DEFAULT_PAGE_SIZE = 10;
const COLLAPSED_INITIAL_COUNT = 6;

export function useNotifications(page = 0, size = DEFAULT_PAGE_SIZE) {
  return useQuery({
    queryKey: [...queryKeys.notifications.list(), page, size] as const,
    queryFn: ({ signal }) => notificationApi.getNotifications(page, size, signal),
    refetchInterval: POLLING_INTERVAL_MS,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: ({ signal }) => notificationApi.getUnreadCount(signal),
    refetchInterval: POLLING_INTERVAL_MS,
  });
}

export function useNotificationMutations() {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() }),
    ]);
  };

  return {
    markRead: useMutation({
      mutationFn: notificationApi.markRead,
      onSuccess: invalidate,
    }),
    markAllRead: useMutation({
      mutationFn: notificationApi.markAllRead,
      onSuccess: async (data) => {
        await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });
        queryClient.setQueryData(queryKeys.notifications.unreadCount(), data);
        // Mark every notification in every page cache as read
        queryClient.setQueriesData(
          { queryKey: queryKeys.notifications.list() },
          (old: NotificationPage | undefined) =>
            old
              ? { ...old, content: old.content.map((n) => ({ ...n, read: true })) }
              : old,
        );
        await invalidate();
      },
    }),
  };
}

export { COLLAPSED_INITIAL_COUNT, DEFAULT_PAGE_SIZE };

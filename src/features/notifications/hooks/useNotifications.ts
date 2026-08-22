import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { notificationApi } from '@/services/notificationService';

const POLLING_INTERVAL_MS = 5_000;

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: ({ signal }) => notificationApi.getNotifications(signal),
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
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() }),
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
      onSuccess: invalidate,
    }),
  };
}

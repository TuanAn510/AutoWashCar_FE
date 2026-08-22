import api from '@/api/client';
import type { ApiEnvelope, PaginatedEnvelope } from '@/types/api';

export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  targetType?: string | null;
  targetId?: number | null;
  read: boolean;
  createdAt: string;
}

export interface UnreadCountResponse {
  count: number;
}

export const notificationApi = {
  async getNotifications(signal?: AbortSignal) {
    const response = await api.get<PaginatedEnvelope<NotificationItem>>('/notifications', { signal });
    return response.data.data;
  },

  async getUnreadCount(signal?: AbortSignal) {
    const response = await api.get<ApiEnvelope<UnreadCountResponse>>('/notifications/unread-count', {
      signal,
    });
    return response.data.data;
  },

  async markRead(id: number) {
    const response = await api.patch<ApiEnvelope<NotificationItem>>(`/notifications/${id}/read`);
    return response.data.data;
  },

  async markAllRead() {
    const response = await api.patch<ApiEnvelope<UnreadCountResponse>>('/notifications/read-all');
    return response.data.data;
  },
};

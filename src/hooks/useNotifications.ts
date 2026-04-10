import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Notification,
  CreateNotificationData,
  createNotification,
  getNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
} from '@/services/notifications';

const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (userId: string) => [...notificationKeys.lists(), userId] as const,
  unread: (userId: string) => [...notificationKeys.all, 'unread', userId] as const,
  count: (userId: string) => [...notificationKeys.all, 'count', userId] as const,
};

export function useNotifications(userId: string) {
  return useQuery({
    queryKey: notificationKeys.list(userId),
    queryFn: () => getNotifications(userId),
    enabled: !!userId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useUnreadNotifications(userId: string) {
  return useQuery({
    queryKey: notificationKeys.unread(userId),
    queryFn: () => getUnreadNotifications(userId),
    enabled: !!userId,
    refetchInterval: 10000, // Refetch every 10 seconds for unread
  });
}

export function useUnreadCount(userId: string) {
  return useQuery({
    queryKey: notificationKeys.count(userId),
    queryFn: () => getUnreadCount(userId),
    enabled: !!userId,
    refetchInterval: 10000,
  });
}

export function useCreateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNotificationData) => createNotification(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list(variables.userId) });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread(variables.userId) });
      queryClient.invalidateQueries({ queryKey: notificationKeys.count(variables.userId) });
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ notificationId, userId }: { notificationId: string; userId: string }) =>
      markNotificationAsRead(notificationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list(variables.userId) });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread(variables.userId) });
      queryClient.invalidateQueries({ queryKey: notificationKeys.count(variables.userId) });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => markAllNotificationsAsRead(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list(userId) });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread(userId) });
      queryClient.invalidateQueries({ queryKey: notificationKeys.count(userId) });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ notificationId, userId }: { notificationId: string; userId: string }) =>
      deleteNotification(notificationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list(variables.userId) });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread(variables.userId) });
      queryClient.invalidateQueries({ queryKey: notificationKeys.count(variables.userId) });
    },
  });
}

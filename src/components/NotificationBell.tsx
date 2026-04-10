'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, ExternalLink, Trash2, X } from 'lucide-react';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '@/hooks/useNotifications';
import { Notification } from '@/services/notifications';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NotificationBellProps {
  userId: string;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { data: notifications } = useNotifications(userId);
  const { data: unreadCount } = useUnreadCount(userId);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead.mutate({ notificationId: notification.$id, userId });
    }
    if (notification.link) {
      router.push(notification.link);
    }
    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'application':
        return '📝';
      case 'new_application':
        return '📨';
      case 'application_accepted':
        return '✅';
      case 'application_rejected':
        return '❌';
      case 'application_reviewed':
        return '👁️';
      case 'job':
        return '💼';
      case 'message':
        return '💬';
      case 'company':
        return '🏢';
      case 'system':
        return '🔍';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'application':
        return 'bg-blue-50 text-blue-600';
      case 'new_application':
        return 'bg-blue-50 text-blue-600';
      case 'application_accepted':
        return 'bg-green-50 text-green-600';
      case 'application_rejected':
        return 'bg-red-50 text-red-600';
      case 'application_reviewed':
        return 'bg-yellow-50 text-yellow-600';
      case 'job':
        return 'bg-green-50 text-green-600';
      case 'message':
        return 'bg-purple-50 text-purple-600';
      case 'company':
        return 'bg-orange-50 text-orange-600';
      case 'system':
        return 'bg-indigo-50 text-indigo-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-gray-600 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all cursor-pointer"
      >
        <Bell className="w-6 h-6" />
        {(unreadCount ?? 0) > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white"
          >
            {(unreadCount ?? 0) > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Notification Panel */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                <h3 className="font-semibold flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                  {(unreadCount ?? 0) > 0 && (
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                      {unreadCount} new
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-1">
                  {(unreadCount ?? 0) > 0 && (
                    <button
                      onClick={() => markAllAsRead.mutate(userId)}
                      className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                      title="Mark all as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div className="max-h-96 overflow-y-auto">
                {!notifications || notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <Bell className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No notifications yet</p>
                    <p className="text-gray-400 text-sm mt-1">
                      We'll notify you when something important happens
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.$id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`group relative p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !notification.isRead ? 'bg-blue-50/30' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${getNotificationColor(notification.type)}`}>
                            {getNotificationIcon(notification.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`font-medium text-sm ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                                {notification.title}
                              </p>
                              {!notification.isRead && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-400">
                                {new Date(notification.$createdAt).toLocaleDateString()}
                              </span>
                              {notification.link && (
                                <ExternalLink className="w-3 h-3 text-gray-400" />
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead.mutate({ notificationId: notification.$id, userId });
                                }}
                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification.mutate({ notificationId: notification.$id, userId });
                              }}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

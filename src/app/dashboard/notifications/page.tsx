'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  ArrowLeft,
  Filter,
  Inbox,
  Briefcase,
  MessageSquare,
  Building2,
  Megaphone,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { Notification } from '@/services/notifications';

const notificationTypes = [
  { id: 'all', label: 'All', icon: Inbox },
  { id: 'application', label: 'Applications', icon: Briefcase },
  { id: 'job', label: 'Jobs', icon: Building2 },
  { id: 'message', label: 'Messages', icon: MessageSquare },
  { id: 'system', label: 'System', icon: Megaphone },
];

export default function NotificationsPage() {
  const { user } = useAuth();
  const { data: notifications, isLoading } = useNotifications(user?.$id || '');
  const { data: unreadCount } = useUnreadCount(user?.$id || '');
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();
  const [filter, setFilter] = useState('all');

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to view notifications</p>
          <Link 
            href="/login" 
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const filteredNotifications = notifications?.filter(n => 
    filter === 'all' || n.type === filter
  ) || [];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'application': return Briefcase;
      case 'job': return Building2;
      case 'message': return MessageSquare;
      case 'company': return Building2;
      default: return Megaphone;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'application': return 'bg-blue-100 text-blue-600';
      case 'job': return 'bg-green-100 text-green-600';
      case 'message': return 'bg-purple-100 text-purple-600';
      case 'company': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                  {(unreadCount ?? 0) > 0 && (
                    <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full text-sm">
                      {unreadCount} new
                    </span>
                  )}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(unreadCount ?? 0) > 0 && (
                <button
                  onClick={() => markAllAsRead.mutate(user.$id)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            {notificationTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setFilter(type.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    filter === type.id
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full"
            />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No notifications
            </h3>
            <p className="text-gray-500 max-w-md">
              {filter === 'all' 
                ? "You're all caught up! We'll notify you when something important happens."
                : `No ${filter} notifications yet.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification, index) => {
              const Icon = getNotificationIcon(notification.type);
              return (
                <motion.div
                  key={notification.$id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`group bg-white rounded-xl border p-4 transition-all hover:shadow-md ${
                    notification.isRead 
                      ? 'border-gray-200' 
                      : 'border-indigo-200 bg-indigo-50/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getNotificationColor(notification.type)}`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`font-semibold ${notification.isRead ? 'text-gray-900' : 'text-gray-900'}`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1">
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                          )}
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {new Date(notification.$createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mt-1">
                        {notification.message}
                      </p>
                      {notification.link && (
                        <Link
                          href={notification.link}
                          className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 mt-2 font-medium"
                        >
                          View details
                        </Link>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead.mutate({ notificationId: notification.$id, userId: user.$id })}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Mark as read"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification.mutate({ notificationId: notification.$id, userId: user.$id })}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

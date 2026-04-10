import { databases } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const NOTIFICATIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_NOTIFICATIONS || 'notifications';

export interface Notification {
  $id: string;
  $createdAt: string;
  userId: string;
  title: string;
  message: string;
  type: 'application' | 'application_accepted' | 'application_rejected' | 'application_reviewed' | 'new_application' | 'job' | 'message' | 'system' | 'company';
  isRead: boolean;
  link?: string;
  metadata?: Record<string, any>;
}

export interface CreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type: 'application' | 'application_accepted' | 'application_rejected' | 'application_reviewed' | 'new_application' | 'job' | 'message' | 'system' | 'company';
  link?: string;
  metadata?: Record<string, any>;
}

export async function createNotification(data: CreateNotificationData): Promise<Notification | null> {
  try {
    const response = await databases.createDocument(
      DATABASE_ID,
      NOTIFICATIONS_COLLECTION_ID,
      ID.unique(),
      {
        ...data,
        isRead: false,
      }
    );
    return response as unknown as Notification;
  } catch (error: any) {
    if (error?.code === 404 || error?.response?.code === 404) {
      console.warn('Notifications collection not found. Please create it in Appwrite console.');
      return null;
    }
    throw error;
  }
}

export async function getNotifications(userId: string, limit = 50): Promise<Notification[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      NOTIFICATIONS_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.orderDesc('$createdAt'),
        Query.limit(limit),
      ]
    );
    return response.documents as unknown as Notification[];
  } catch (error: any) {
    if (error?.code === 404 || error?.response?.code === 404) {
      console.warn('Notifications collection not found. Please create it in Appwrite console.');
      return [];
    }
    throw error;
  }
}

export async function getUnreadNotifications(userId: string): Promise<Notification[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      NOTIFICATIONS_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.equal('isRead', false),
        Query.orderDesc('$createdAt'),
      ]
    );
    return response.documents as unknown as Notification[];
  } catch (error: any) {
    if (error?.code === 404 || error?.response?.code === 404) {
      return [];
    }
    throw error;
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    await databases.updateDocument(
      DATABASE_ID,
      NOTIFICATIONS_COLLECTION_ID,
      notificationId,
      { isRead: true }
    );
  } catch (error: any) {
    if (error?.code === 404 || error?.response?.code === 404) {
      console.warn('Notifications collection not found.');
      return;
    }
    throw error;
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const unread = await getUnreadNotifications(userId);
    await Promise.all(unread.map(n => markNotificationAsRead(n.$id)));
  } catch (error: any) {
    console.error('Failed to mark all notifications as read:', error);
  }
}

export async function deleteNotification(notificationId: string): Promise<void> {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      NOTIFICATIONS_COLLECTION_ID,
      notificationId
    );
  } catch (error: any) {
    if (error?.code === 404 || error?.response?.code === 404) {
      console.warn('Notifications collection not found.');
      return;
    }
    throw error;
  }
}

// Helper function to get unread count
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const unread = await getUnreadNotifications(userId);
    return unread.length;
  } catch {
    return 0;
  }
}

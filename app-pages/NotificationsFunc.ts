/**
 * Business logic for the Notifications route
 */
import { useEffect, useState } from 'react';

import { t } from '@/i18n';
import { supabaseClient } from '@/api/supabase-client';
import {
  readAllNotifications,
  countUnreadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  dismissNotification,
} from '@shared/planet-notif-db';
import { requestToJoin } from '@shared/planet-group-db';
import { toUuidStr, type NotificationType, type NotificationV1, type uuidstr } from '@shared/generated-db-types';
import { NotificationsProps } from '@/app/notifications';

// ── Types ──

export type { NotificationType };

export interface NotificationItemData {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: string;
  isRead: boolean;
  groupId?: string;
  activityId?: string;
  mergeRequestId?: string;
}

export interface NotificationGroup {
  title: string;
  data: NotificationItemData[];
}

export interface NotificationsFunc {
  isLoading: boolean;
  groupedNotifications: NotificationGroup[];
  unreadCount: number;
  isRefreshing: boolean;
  hasNotifications: boolean;
  onRefresh: () => void;
  onMarkAllRead: () => void;
  onDismissNotification: (notificationId: string) => void;
  onNotificationPress: (notification: NotificationItemData) => void;
  activeMergeRequestId?: string;
  onViewMerge: (mergeRequestId: string) => void;
  onCloseMergeScreen: () => void;
  joinRequestGroupId?: string;
  joinRequestGroupName?: string;
  onJoinNow: (notification: NotificationItemData) => void;
  onCloseJoinSheet: () => void;
  onSendJoinRequest: (groupId: string, message: string) => void;
}

// ── Constants ──

const MS_PER_MINUTE = 60000;
const MS_PER_HOUR = 3600000;
const MS_PER_DAY = 86400000;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;

// ── Helpers ──

function formatRelativeTime(isoTimestamp: string): string {
  const nowInMs = Date.now();
  const thenInMs = new Date(isoTimestamp).getTime();
  const diffInMs = nowInMs - thenInMs;
  const diffInMinutes = Math.floor(diffInMs / MS_PER_MINUTE);

  if (diffInMinutes < 1) {
    return t('notifications.justNow');
  }
  if (diffInMinutes < MINUTES_PER_HOUR) {
    return t('notifications.minutesAgo', { count: diffInMinutes });
  }
  const diffInHours = Math.floor(diffInMinutes / MINUTES_PER_HOUR);
  if (diffInHours < HOURS_PER_DAY) {
    return t('notifications.hoursAgo', { count: diffInHours });
  }
  const diffInDays = Math.floor(diffInHours / HOURS_PER_DAY);
  return t('notifications.daysAgo', { count: diffInDays });
}

function getDateGroupTitle(isoTimestamp: string): string {
  const now = new Date();
  const date = new Date(isoTimestamp);

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - MS_PER_DAY;
  const dateInMs = date.getTime();

  if (dateInMs >= todayStart) {
    return t('notifications.today');
  }
  if (dateInMs >= yesterdayStart) {
    return t('notifications.yesterday');
  }
  return t('notifications.earlier');
}

function groupNotificationsByDate(notifications: NotificationItemData[]): NotificationGroup[] {
  const groupMap = new Map<string, NotificationItemData[]>();
  const groupOrder = [
    t('notifications.today'),
    t('notifications.yesterday'),
    t('notifications.earlier'),
  ];

  for (const notification of notifications) {
    const groupTitle = getDateGroupTitle(notification.createdAt);
    const existing = groupMap.get(groupTitle);
    if (existing != null) {
      existing.push(notification);
    } else {
      groupMap.set(groupTitle, [notification]);
    }
  }

  const groups: NotificationGroup[] = [];
  for (const title of groupOrder) {
    const data = groupMap.get(title);
    if (data != null && data.length > 0) {
      groups.push({ title, data });
    }
  }

  return groups;
}

function isUrgentNotification(type: NotificationType): boolean {
  return type === 'BATTLE_STARTED' || type === 'DEAL_EXPIRING';
}

function extractOrbitGroupName(title: string): string {
  const suffix = ' picked a plan!';
  if (title.endsWith(suffix)) {
    return title.slice(0, -suffix.length);
  }
  return title;
}

// ── Mapping ──

function mapNotificationToItem(notification: NotificationV1): NotificationItemData {
  return {
    id: notification.id,
    type: notification.type ?? 'GROUP_ACTIVITY',
    title: notification.title ?? '',
    description: notification.body ?? '',
    createdAt: notification.createdAt,
    isRead: notification.isRead,
    groupId: notification.linkedGroupId ?? undefined,
    activityId: notification.linkedActivityId ?? undefined,
    mergeRequestId: notification.linkedMergeRequestId ?? undefined,
  };
}

// ── Hook ──

export function useNotifications(props: NotificationsProps): NotificationsFunc {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItemData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeMergeRequestId, setActiveMergeRequestId] = useState<string | undefined>(undefined);
  const [joinRequestGroupId, setJoinRequestGroupId] = useState<string | undefined>(undefined);
  const [joinRequestGroupName, setJoinRequestGroupName] = useState<string | undefined>(undefined);

  const groupedNotifications = groupNotificationsByDate(notifications);
  const hasNotifications = notifications.length > 0;

  function fetchNotificationsAsync(): Promise<void> {
    return Promise.all([
      readAllNotifications(supabaseClient),
      countUnreadNotifications(supabaseClient),
    ]).then(([notifData, unread]) => {
      setNotifications(notifData.map(mapNotificationToItem));
      setUnreadCount(unread);
    }).catch((err) => {
      console.error('Failed to fetch notifications:', err);
    });
  }

  useEffect(() => {
    setIsLoading(true);
    fetchNotificationsAsync().finally(() => {
      setIsLoading(false);
    });
  }, []);

  function onRefresh(): void {
    setIsRefreshing(true);
    fetchNotificationsAsync().finally(() => {
      setIsRefreshing(false);
    });
  }

  function onMarkAllRead(): void {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    markAllNotificationsRead(supabaseClient).catch((err) => {
      console.error('Failed to mark all notifications read:', err);
    });
  }

  function onDismissNotification(notificationId: string): void {
    const dismissed = notifications.find((n) => n.id === notificationId);
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    if (dismissed != null && !dismissed.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    dismissNotification(supabaseClient, toUuidStr(notificationId)).catch((err) => {
      console.error('Failed to dismiss notification:', err);
    });
  }

  function onNotificationPress(notification: NotificationItemData): void {
    // Mark as read on tap
    if (!notification.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      markNotificationRead(supabaseClient, toUuidStr(notification.id)).catch((err) => {
        console.error('Failed to mark notification read:', err);
      });
    }

    // Merge notifications open MergePlanetsScreen inline
    if (
      (notification.type === 'MERGE_REQUEST' || notification.type === 'MERGE_INITIATED') &&
      notification.mergeRequestId != null
    ) {
      setActiveMergeRequestId(notification.mergeRequestId);
      return;
    }

    // Orbit notifications open the join request sheet
    if (notification.type === 'ORBIT_ACTIVITY' && notification.groupId != null) {
      setJoinRequestGroupId(notification.groupId);
      setJoinRequestGroupName(extractOrbitGroupName(notification.title));
      return;
    }

    // Navigate based on notification type
    if (notification.groupId != null) {
      if (notification.type === 'BATTLE_STARTED') {
        props.onNavigateToBattle({ groupId: notification.groupId });
        return;
      }
      props.onNavigateToGroupDetail({ groupId: notification.groupId });
      return;
    }

    // For notifications without a group (e.g. FRIEND_JOINED), go back
    props.onGoBack();
  }

  function onViewMerge(mergeRequestId: string): void {
    setActiveMergeRequestId(mergeRequestId);
  }

  function onCloseMergeScreen(): void {
    setActiveMergeRequestId(undefined);
  }

  function onJoinNow(notification: NotificationItemData): void {
    if (!notification.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      markNotificationRead(supabaseClient, toUuidStr(notification.id)).catch((err) => {
        console.error('onJoinNow markNotificationRead error:', err);
      });
    }
    if (notification.groupId != null) {
      setJoinRequestGroupId(notification.groupId);
      setJoinRequestGroupName(extractOrbitGroupName(notification.title));
    }
  }

  function onCloseJoinSheet(): void {
    setJoinRequestGroupId(undefined);
    setJoinRequestGroupName(undefined);
  }

  function onSendJoinRequest(groupId: string, message: string): void {
    sendJoinRequestAsync(groupId, message).catch((err) => {
      console.error('onSendJoinRequest error:', err);
    });
    onCloseJoinSheet();
  }

  async function sendJoinRequestAsync(groupId: string, message: string): Promise<void> {
    await requestToJoin(supabaseClient, groupId as uuidstr, message);
  }

  return {
    isLoading,
    groupedNotifications,
    unreadCount,
    isRefreshing,
    hasNotifications,
    onRefresh,
    onMarkAllRead,
    onDismissNotification,
    onNotificationPress,
    activeMergeRequestId,
    onViewMerge,
    onCloseMergeScreen,
    joinRequestGroupId,
    joinRequestGroupName,
    onJoinNow,
    onCloseJoinSheet,
    onSendJoinRequest,
  };
}

export { isUrgentNotification, formatRelativeTime };

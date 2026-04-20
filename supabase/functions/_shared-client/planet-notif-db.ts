import { SupabaseClient } from '@supabase/supabase-js';

import { toIntNum, toUuidStr, type Database, type NotificationType, type NotificationV1, type uuidstr } from './generated-db-types.ts';

export async function readAllNotifications(
  supabaseClient: SupabaseClient<Database>,
  params?: {
    limitCount?: number
    offsetCount?: number
  },
): Promise<NotificationV1[]> {
  const res = await supabaseClient.rpc('app:planetNotif:readAll', {
    limitCount: toIntNum(params?.limitCount ?? 50),
    offsetCount: toIntNum(params?.offsetCount ?? 0),
  });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? [];
}

export async function countUnreadNotifications(
  supabaseClient: SupabaseClient<Database>,
): Promise<number> {
  const res = await supabaseClient.rpc('app:planetNotif:countUnread');
  if (res.error) {
    throw res.error;
  }
  return res.data ?? 0;
}

export async function markNotificationRead(
  supabaseClient: SupabaseClient<Database>,
  notificationId: uuidstr,
): Promise<boolean> {
  const res = await supabaseClient.rpc('app:planetNotif:markRead', { notificationId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? false;
}

export async function dismissNotification(
  supabaseClient: SupabaseClient<Database>,
  notificationId: uuidstr,
): Promise<boolean> {
  const res = await supabaseClient.rpc('app:planetNotif:dismiss', { notificationId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? false;
}

export async function markAllNotificationsRead(
  supabaseClient: SupabaseClient<Database>,
): Promise<number> {
  const res = await supabaseClient.rpc('app:planetNotif:markAllRead');
  if (res.error) {
    throw res.error;
  }
  return res.data ?? 0;
}

export async function adminCreateNotification(
  supabaseAdminClient: SupabaseClient<Database>,
  params: {
    userId: uuidstr
    type: NotificationType
    title: string
    body: string
    linkedGroupId?: uuidstr
    linkedActivityId?: uuidstr
    linkedBattleId?: uuidstr
  },
): Promise<NotificationV1> {
  const res = await supabaseAdminClient.rpc('admin:planetNotif:create', {
    userId: params.userId,
    type: params.type,
    title: params.title,
    body: params.body,
    linkedGroupId: params.linkedGroupId ?? null,
    linkedActivityId: params.linkedActivityId ?? null,
    linkedBattleId: params.linkedBattleId ?? null,
  });
  if (res.error) {
    throw res.error;
  }
  return res.data;
}

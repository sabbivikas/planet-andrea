import { SupabaseClient } from '@supabase/supabase-js';

import { toIntNum, type Database, type SwipeAction, type SwipeV1, type SwipeWithActivityV1, type uuidstr } from './generated-db-types.ts';

export async function createSwipe(
  supabaseClient: SupabaseClient<Database>,
  activityId: uuidstr,
  action: SwipeAction,
  groupId?: uuidstr,
): Promise<SwipeV1> {
  const res = await supabaseClient.rpc('app:planetSwipe:create', {
    activityId,
    action,
    groupId: groupId ?? null,
  });
  if (res.error) {
    throw res.error;
  }
  return res.data;
}

export async function readAllSwipesByUser(
  supabaseClient: SupabaseClient<Database>,
  params?: {
    limitCount?: number
    offsetCount?: number
  },
): Promise<SwipeV1[]> {
  const res = await supabaseClient.rpc('app:planetSwipe:readAllByUser', {
    limitCount: toIntNum(params?.limitCount ?? 100),
    offsetCount: toIntNum(params?.offsetCount ?? 0),
  });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? [];
}

export async function readAllSwipesByGroup(
  supabaseClient: SupabaseClient<Database>,
  groupId: uuidstr,
): Promise<SwipeV1[]> {
  const res = await supabaseClient.rpc('app:planetSwipe:readAllByGroup', { groupId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? [];
}

export async function readRecentSwipesWithActivity(
  supabaseClient: SupabaseClient<Database>,
  limitCount?: number,
): Promise<SwipeWithActivityV1[]> {
  const res = await supabaseClient.rpc('app:planetSwipe:readRecentWithActivity', {
    limitCount: toIntNum(limitCount ?? 20),
  });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? [];
}

export async function undoLastSwipe(
  supabaseClient: SupabaseClient<Database>,
): Promise<boolean> {
  const res = await supabaseClient.rpc('app:planetSwipe:undoLast');
  if (res.error) {
    throw res.error;
  }
  return res.data ?? false;
}

export async function adminDeleteAllSwipes(
  supabaseAdminClient: SupabaseClient<Database>,
): Promise<number> {
  const res = await supabaseAdminClient.rpc('admin:planetSwipe:deleteAll');
  if (res.error) {
    throw res.error;
  }
  return (res.data as number) ?? 0;
}

export async function deleteSwipesByCurrentUser(
  supabaseClient: SupabaseClient<Database>,
): Promise<number> {
  const res = await supabaseClient.rpc('app:planetSwipe:deleteByUser');
  if (res.error) {
    throw res.error;
  }
  return (res.data as number) ?? 0;
}

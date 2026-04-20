import { SupabaseClient } from '@supabase/supabase-js';

import {
  toDoubleNum,
  toIntNum,
  type Database,
  type GroupChatDataV1,
  type GroupChatMessageV1,
  type GroupChatPreviewV1,
  type GroupMemberV1,
  type GroupMemberWithProfileV1,
  type GroupRankedActivityV1,
  type GroupSwipeActivityV1,
  type GroupVisibility,
  type InviteV1,
  type InviteWithProfileV1,
  type Json,
  type MemberReadinessV1,
  type OpenPlanetCardV1,
  type PlanetGroupDetailV1,
  type PlanetGroupSummaryV1,
  type PlanetGroupV1,
  type PlanetGroupWithMembersV1,
  type timestamptzstr,
  type uuidstr,
} from './generated-db-types.ts';

// ── Groups ──

export async function readAllGroupsWithSummary(
  supabaseClient: SupabaseClient<Database>,
): Promise<PlanetGroupSummaryV1[]> {
  const res = await supabaseClient.rpc('app:planetGroup:readAllWithSummary');
  if (res.error) {
    throw res.error;
  }
  return res.data ?? [];
}

export async function readAllGroups(
  supabaseClient: SupabaseClient<Database>,
): Promise<PlanetGroupV1[]> {
  const res = await supabaseClient.rpc('app:planetGroup:readAll');
  if (res.error) {
    throw res.error;
  }
  return res.data ?? [];
}

export async function readGroupWithMembers(
  supabaseClient: SupabaseClient<Database>,
  groupId: uuidstr,
): Promise<PlanetGroupWithMembersV1 | undefined> {
  const res = await supabaseClient.rpc('app:planetGroup:readWithMembers', { groupId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? undefined;
}

export async function createGroup(
  supabaseClient: SupabaseClient<Database>,
  params: {
    name: string
    photoUrl?: string
    isOpenToStrangers?: boolean
    maxGroupSize?: number
    visibility?: GroupVisibility
  },
): Promise<PlanetGroupV1> {
  const res = await supabaseClient.rpc('app:planetGroup:create', {
    name: params.name,
    photoUrl: params.photoUrl ?? null,
    isOpenToStrangers: params.isOpenToStrangers ?? false,
    maxGroupSize: toIntNum(params.maxGroupSize ?? 10),
    visibility: params.visibility ?? 'PRIVATE',
  });
  if (res.error) {
    throw res.error;
  }
  return res.data;
}

export async function updateGroup(
  supabaseClient: SupabaseClient<Database>,
  groupId: uuidstr,
  params: {
    name?: string
    photoUrl?: string
    isOpenToStrangers?: boolean
    maxGroupSize?: number
    visibility?: GroupVisibility
  },
): Promise<PlanetGroupV1> {
  const res = await supabaseClient.rpc('app:planetGroup:update', {
    groupId,
    name: params.name ?? null,
    photoUrl: params.photoUrl ?? '___UNSET___',
    isOpenToStrangers: params.isOpenToStrangers ?? null,
    maxGroupSize: params.maxGroupSize != null ? toIntNum(params.maxGroupSize) : null,
    visibility: params.visibility ?? null,
  });
  if (res.error) {
    throw res.error;
  }
  return res.data;
}

export async function deleteGroup(
  supabaseClient: SupabaseClient<Database>,
  groupId: uuidstr,
): Promise<boolean> {
  const res = await supabaseClient.rpc('app:planetGroup:delete', { groupId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? false;
}

export async function leaveGroup(
  supabaseClient: SupabaseClient<Database>,
  groupId: uuidstr,
): Promise<boolean> {
  const res = await supabaseClient.rpc('app:planetGroup:leave', { groupId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? false;
}

export async function readAllGroupMembers(
  supabaseClient: SupabaseClient<Database>,
  groupId: uuidstr,
): Promise<GroupMemberV1[]> {
  const res = await supabaseClient.rpc('app:planetGroup:member:readAll', { groupId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? [];
}

export async function readGroupDetailWithMembers(
  supabaseClient: SupabaseClient<Database>,
  groupId: uuidstr,
): Promise<PlanetGroupDetailV1 | undefined> {
  const res = await supabaseClient.rpc('app:planetGroup:readDetailWithMembers', { groupId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? undefined;
}

export async function readGroupSwipeActivity(
  supabaseClient: SupabaseClient<Database>,
  groupId: uuidstr,
  limitCount?: number,
): Promise<GroupSwipeActivityV1[]> {
  const res = await supabaseClient.rpc('app:planetGroup:readSwipeActivity', {
    groupId,
    limitCount: toIntNum(limitCount ?? 10),
  });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? [];
}

export async function readGroupRankedActivities(
  supabaseClient: SupabaseClient<Database>,
  groupId: uuidstr,
  limitCount?: number,
): Promise<GroupRankedActivityV1[]> {
  const res = await supabaseClient.rpc('app:planetGroup:readRankedActivities', {
    groupId,
    limitCount: toIntNum(limitCount ?? 10),
  });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? [];
}

export async function readGroupChatPreview(
  supabaseClient: SupabaseClient<Database>,
  groupId: uuidstr,
): Promise<GroupChatPreviewV1 | undefined> {
  const res = await supabaseClient.rpc('app:planetGroup:readChatPreview', { groupId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? undefined;
}

// ── Group Chat ──

export async function readGroupChatData(
  supabaseClient: SupabaseClient<Database>,
  groupId: uuidstr,
): Promise<GroupChatDataV1 | undefined> {
  const res = await supabaseClient.rpc('app:planetGroup:readChatData', { groupId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? undefined;
}

export async function sendGroupChatMessage(
  supabaseClient: SupabaseClient<Database>,
  groupId: uuidstr,
  contentText: string,
  context?: Json,
): Promise<GroupChatMessageV1 | undefined> {
  const res = await supabaseClient.rpc('app:planetGroup:chat:sendMessage', {
    groupId,
    contentText,
    context: context ?? null,
  });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? undefined;
}

export async function shareActivityInGroupChat(
  supabaseClient: SupabaseClient<Database>,
  groupId: uuidstr,
  activityId: uuidstr,
  contentText?: string,
): Promise<GroupChatMessageV1 | undefined> {
  const res = await supabaseClient.rpc('app:planetGroup:chat:shareActivity', {
    groupId,
    activityId,
    contentText: contentText ?? null,
  });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? undefined;
}

export async function addGroupChatReaction(
  supabaseClient: SupabaseClient<Database>,
  messageId: uuidstr,
  emoji: string,
): Promise<boolean> {
  const res = await supabaseClient.rpc('app:planetGroup:chat:addReaction', {
    messageId,
    emoji,
  });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? false;
}

export async function removeGroupChatReaction(
  supabaseClient: SupabaseClient<Database>,
  messageId: uuidstr,
  emoji: string,
): Promise<boolean> {
  const res = await supabaseClient.rpc('app:planetGroup:chat:removeReaction', {
    messageId,
    emoji,
  });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? false;
}

// ── Invites ──

export async function createInvite(
  supabaseClient: SupabaseClient<Database>,
  params: {
    groupId: uuidstr
    inviteCode: string
    invitedUserId?: uuidstr
    expiresAt?: timestamptzstr
  },
): Promise<InviteV1> {
  const res = await supabaseClient.rpc('app:planetInvite:create', {
    groupId: params.groupId,
    inviteCode: params.inviteCode,
    invitedUserId: params.invitedUserId ?? null,
    expiresAt: params.expiresAt ?? null,
  });
  if (res.error) {
    throw res.error;
  }
  return res.data;
}

export async function acceptInvite(
  supabaseClient: SupabaseClient<Database>,
  inviteCode: string,
): Promise<GroupMemberV1 | undefined> {
  const res = await supabaseClient.rpc('app:planetInvite:accept', { inviteCode });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? undefined;
}

export async function countPendingInvites(
  supabaseClient: SupabaseClient<Database>,
): Promise<number> {
  const res = await supabaseClient.rpc('app:planetInvite:countPending');
  if (res.error) {
    throw res.error;
  }
  return res.data ?? 0;
}

export async function readAllInvitesByGroup(
  supabaseClient: SupabaseClient<Database>,
  groupId: uuidstr,
): Promise<InviteV1[]> {
  const res = await supabaseClient.rpc('app:planetInvite:readAllByGroup', { groupId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? [];
}

export async function readAllInvitesByGroupWithProfile(
  supabaseClient: SupabaseClient<Database>,
  groupId: uuidstr,
): Promise<InviteWithProfileV1[]> {
  const res = await supabaseClient.rpc('app:planetInvite:readAllByGroupWithProfile', { groupId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? [];
}

export async function updateGroupNextPlanAt(
  supabaseClient: SupabaseClient<Database>,
  groupId: uuidstr,
  nextPlanAt: timestamptzstr,
): Promise<boolean> {
  const res = await supabaseClient.rpc('app:planetGroup:updateNextPlanAt', { groupId, nextPlanAt });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? false;
}

export async function ensureGroupChat(
  supabaseClient: SupabaseClient<Database>,
  groupId: uuidstr,
): Promise<boolean> {
  const res = await supabaseClient.rpc('app:planetGroup:ensureChat', { groupId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? false;
}

export async function rescheduleGroupPlan(
  supabaseClient: SupabaseClient<Database>,
  groupId: uuidstr,
  nextPlanAt: timestamptzstr,
  dateLabel: string,
): Promise<boolean> {
  const res = await supabaseClient.rpc('app:planetGroup:reschedule', { groupId, nextPlanAt, dateLabel });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? false;
}

export async function scheduleGroupPlan(
  supabaseClient: SupabaseClient<Database>,
  groupId: uuidstr,
  nextPlanAt: timestamptzstr,
  dateLabel: string,
): Promise<boolean> {
  const res = await supabaseClient.rpc('app:planetGroup:schedulePlan', { groupId, nextPlanAt, dateLabel });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? false;
}

export async function nudgeAllGroupMembers(
  supabaseClient: SupabaseClient<Database>,
  groupId: uuidstr,
): Promise<number> {
  const res = await supabaseClient.rpc('app:planetGroup:nudgeAll', { groupId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? 0;
}

// ── Open Planets ──

export async function readOpenPlanets(
  supabaseClient: SupabaseClient<Database>,
  userLatitude?: number,
  userLongitude?: number,
): Promise<OpenPlanetCardV1[]> {
  const res = await supabaseClient.rpc('app:planetGroup:readOpenPlanets', {
    userLatitude: userLatitude != null ? toDoubleNum(userLatitude) : null,
    userLongitude: userLongitude != null ? toDoubleNum(userLongitude) : null,
  });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? [];
}

export async function removeGroupMember(
  supabaseClient: SupabaseClient<Database>,
  groupId: uuidstr,
  targetUserId: uuidstr,
): Promise<boolean> {
  const res = await supabaseClient.rpc('app:planetGroup:member:remove', {
    groupId,
    targetUserId,
  });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? false;
}

export async function toggleOrbit(
  supabaseClient: SupabaseClient<Database>,
  groupId: uuidstr,
): Promise<boolean> {
  const res = await supabaseClient.rpc('app:planetGroup:toggleOrbit', { groupId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? false;
}

export async function requestToJoin(
  supabaseClient: SupabaseClient<Database>,
  groupId: uuidstr,
  message?: string,
): Promise<boolean> {
  const res = await supabaseClient.rpc('app:planetGroup:requestToJoin', {
    groupId,
    message: message ?? null,
  });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? false;
}

// ── Crew Readiness ──

export async function readGroupMemberReadiness(
  supabaseClient: SupabaseClient<Database>,
  groupId: uuidstr,
): Promise<MemberReadinessV1[]> {
  const res = await supabaseClient.rpc('app:planetGroup:readMemberReadiness', { groupId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? [];
}

export async function nudgeGroupMember(
  supabaseClient: SupabaseClient<Database>,
  groupId: uuidstr,
  recipientId: uuidstr,
): Promise<boolean> {
  const res = await supabaseClient.rpc('app:planetGroup:nudgeMember', { groupId, recipientId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? false;
}

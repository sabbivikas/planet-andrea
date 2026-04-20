import { SupabaseClient } from '@supabase/supabase-js';

import {
  type Database,
  type MergeOpportunityV1,
  type MergeRequestStatus,
  type MergeRequestV1,
  type MergeScreenDataV1,
  type OrbitChatMessageV1,
  type OrbitScreenDataV1,
  toIntNum,
  type uuidstr,
} from './generated-db-types.ts';

export async function createMergeRequest(
  supabaseClient: SupabaseClient<Database>,
  otherGroupId: uuidstr,
): Promise<MergeRequestV1 | undefined> {
  const res = await supabaseClient.rpc('app:planetMerge:create', { otherGroupId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? undefined;
}

export async function readMergeScreenData(
  supabaseClient: SupabaseClient<Database>,
  mergeRequestId: uuidstr,
): Promise<MergeScreenDataV1 | undefined> {
  const res = await supabaseClient.rpc('app:planetMerge:readScreenData', { mergeRequestId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? undefined;
}

export async function updateMergeRequestStatus(
  supabaseClient: SupabaseClient<Database>,
  mergeRequestId: uuidstr,
  newStatus: MergeRequestStatus,
): Promise<MergeRequestV1 | undefined> {
  const res = await supabaseClient.rpc('app:planetMerge:updateStatus', {
    mergeRequestId,
    newStatus,
  });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? undefined;
}

export async function readPendingMergeByGroup(
  supabaseClient: SupabaseClient<Database>,
  groupId: uuidstr,
): Promise<MergeOpportunityV1 | undefined> {
  const res = await supabaseClient.rpc('app:planetMerge:readPendingByGroup', { groupId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? undefined;
}

export async function readOrbitData(
  supabaseClient: SupabaseClient<Database>,
  orbitChannelId: uuidstr,
): Promise<OrbitScreenDataV1 | undefined> {
  const res = await supabaseClient.rpc('app:planetMerge:readOrbitData', { orbitChannelId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? undefined;
}

export async function readOrbitByMergeRequest(
  supabaseClient: SupabaseClient<Database>,
  mergeRequestId: uuidstr,
): Promise<OrbitScreenDataV1 | undefined> {
  const res = await supabaseClient.rpc('app:planetMerge:readOrbitByMergeRequest', {
    mergeRequestId,
  });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? undefined;
}

export async function sendOrbitChatMessage(
  supabaseClient: SupabaseClient<Database>,
  orbitChannelId: uuidstr,
  contentText: string,
): Promise<OrbitChatMessageV1 | undefined> {
  const res = await supabaseClient.rpc('app:planetOrbit:chat:sendMessage', {
    orbitChannelId,
    contentText,
  });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? undefined;
}

export async function readOrbitChatMessages(
  supabaseClient: SupabaseClient<Database>,
  orbitChannelId: uuidstr,
  limitCount?: number,
): Promise<OrbitChatMessageV1[]> {
  const res = await supabaseClient.rpc('app:planetOrbit:chat:readMessages', {
    orbitChannelId,
    limitCount: toIntNum(limitCount ?? 50),
  });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? [];
}

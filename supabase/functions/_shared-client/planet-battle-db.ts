import { SupabaseClient } from '@supabase/supabase-js';

import {
  toIntNum,
  type BattleDetailV1,
  type BattleMemberStatusV1,
  type BattleMiniGameResultV1,
  type BattlePhase,
  type BattleResultsV1,
  type BattleV1,
  type BattleWithFinalistsV1,
  type Database,
  type VoteV1,
  type uuidstr,
} from './generated-db-types.ts';

// ── Battles ──

export async function countActiveBattles(
  supabaseClient: SupabaseClient<Database>,
): Promise<number> {
  const res = await supabaseClient.rpc('app:planetBattle:countActive');
  if (res.error) {
    throw res.error;
  }
  return res.data ?? 0;
}

export async function createBattle(
  supabaseClient: SupabaseClient<Database>,
  groupId: uuidstr,
  activityIds: uuidstr[],
  durationInMin?: number,
): Promise<BattleWithFinalistsV1 | undefined> {
  const res = await supabaseClient.rpc('app:planetBattle:create', {
    groupId,
    durationInMin: toIntNum(durationInMin ?? 3),
    activityIds,
  });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? undefined;
}

export async function readBattleWithFinalists(
  supabaseClient: SupabaseClient<Database>,
  battleId: uuidstr,
): Promise<BattleWithFinalistsV1 | undefined> {
  const res = await supabaseClient.rpc('app:planetBattle:readWithFinalists', { battleId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? undefined;
}

export async function readAllActiveBattles(
  supabaseClient: SupabaseClient<Database>,
): Promise<BattleWithFinalistsV1[]> {
  const res = await supabaseClient.rpc('app:planetBattle:readAllActive');
  if (res.error) {
    throw res.error;
  }
  return res.data ?? [];
}

export async function readAllActiveBattlesWithDetails(
  supabaseClient: SupabaseClient<Database>,
): Promise<BattleDetailV1[]> {
  const res = await supabaseClient.rpc('app:planetBattle:readAllActiveWithDetails');
  if (res.error) {
    throw res.error;
  }
  return res.data ?? [];
}

export async function readAllRecentBattlesWithDetails(
  supabaseClient: SupabaseClient<Database>,
  sinceHours?: number,
): Promise<BattleDetailV1[]> {
  const res = await supabaseClient.rpc('app:planetBattle:readAllRecentWithDetails', {
    sinceHours: toIntNum(sinceHours ?? 48),
  });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? [];
}

export async function readAllRecentBattles(
  supabaseClient: SupabaseClient<Database>,
  sinceHours?: number,
): Promise<BattleWithFinalistsV1[]> {
  const res = await supabaseClient.rpc('app:planetBattle:readAllRecent', {
    sinceHours: toIntNum(sinceHours ?? 48),
  });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? [];
}

export async function updateBattlePhase(
  supabaseClient: SupabaseClient<Database>,
  battleId: uuidstr,
  phase: BattlePhase,
  winningActivityId?: uuidstr,
): Promise<BattleV1> {
  const res = await supabaseClient.rpc('app:planetBattle:updatePhase', {
    battleId,
    phase,
    winningActivityId: winningActivityId ?? null,
  });
  if (res.error) {
    throw res.error;
  }
  return res.data;
}

export async function readActiveBattleByGroup(
  supabaseClient: SupabaseClient<Database>,
  groupId: uuidstr,
): Promise<BattleDetailV1 | undefined> {
  const res = await supabaseClient.rpc('app:planetBattle:readActiveByGroup', { groupId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? undefined;
}

export async function readBattleMemberStatuses(
  supabaseClient: SupabaseClient<Database>,
  battleId: uuidstr,
): Promise<BattleMemberStatusV1[]> {
  const res = await supabaseClient.rpc('app:planetBattle:readMemberStatuses', { battleId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? [];
}

export async function lockInVotes(
  supabaseClient: SupabaseClient<Database>,
  battleId: uuidstr,
  activityIds: uuidstr[],
): Promise<VoteV1[]> {
  const res = await supabaseClient.rpc('app:planetBattle:lockInVotes', {
    battleId,
    activityIds,
  });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? [];
}

export async function readBattleResultsByGroup(
  supabaseClient: SupabaseClient<Database>,
  groupId: uuidstr,
): Promise<BattleResultsV1 | undefined> {
  const res = await supabaseClient.rpc('app:planetBattle:readResultsByGroup', { groupId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? undefined;
}

// ── Votes ──

export async function createVote(
  supabaseClient: SupabaseClient<Database>,
  battleId: uuidstr,
  activityId: uuidstr,
  rank?: number,
): Promise<VoteV1 | undefined> {
  const res = await supabaseClient.rpc('app:planetVote:create', {
    battleId,
    activityId,
    rank: rank != null ? toIntNum(rank) : null,
  });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? undefined;
}

export async function readAllVotesByBattle(
  supabaseClient: SupabaseClient<Database>,
  battleId: uuidstr,
): Promise<VoteV1[]> {
  const res = await supabaseClient.rpc('app:planetVote:readAllByBattle', { battleId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? [];
}

// ── Mini Games ──

export async function startMiniGame(
  supabaseClient: SupabaseClient<Database>,
  battleId: uuidstr,
  gameType: string,
): Promise<boolean> {
  const res = await supabaseClient.rpc('app:planetBattle:startMiniGame', {
    battleId,
    gameType,
  });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? false;
}

export async function completeMiniGame(
  supabaseClient: SupabaseClient<Database>,
  battleId: uuidstr,
  won: boolean,
  reactionTimeInMs?: number,
): Promise<boolean> {
  const res = await supabaseClient.rpc('app:planetBattle:completeMiniGame', {
    battleId,
    won,
    reactionTimeInMs: reactionTimeInMs != null ? toIntNum(reactionTimeInMs) : null,
  });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? false;
}

export async function readMiniGameResults(
  supabaseClient: SupabaseClient<Database>,
  battleId: uuidstr,
): Promise<BattleMiniGameResultV1[]> {
  const res = await supabaseClient.rpc('app:planetBattle:readMiniGameResults', { battleId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? [];
}

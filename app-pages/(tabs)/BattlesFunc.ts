/**
 * Business logic for the Battles route
 */
import { useEffect, useRef, useState } from 'react';

import { t } from '@/i18n';
import { supabaseClient } from '@/api/supabase-client';
import { readAllActiveBattlesWithDetails, readAllRecentBattlesWithDetails } from '@shared/planet-battle-db';
import { countUnreadNotifications } from '@shared/planet-notif-db';
import type { BattleDetailV1 } from '@shared/generated-db-types';
import { type BattlesProps } from '@/app/(tabs)/battles';

// ── Types ──

export interface BattleContender {
  activityId: string;
  title: string;
  thumbnailUrl: string;
  voteCount: number;
}

export interface ActiveBattleCardData {
  id: string;
  groupId: string;
  groupName: string;
  endsAt: string;
  timeRemainingLabel: string;
  totalParticipants: number;
  votedParticipants: number;
  contenders: BattleContender[];
}

export interface RecentResultCardData {
  id: string;
  groupId: string;
  groupName: string;
  winnerTitle: string;
  winnerImageUrl: string;
  completedAtLabel: string;
}

export interface BattlesFunc {
  isLoading: boolean;
  error?: Error;
  activeBattles: ActiveBattleCardData[];
  recentResults: RecentResultCardData[];
  unreadNotificationCount: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  onActiveBattlePress: (groupId: string) => void;
  onRecentResultPress: (groupId: string) => void;
  onNotificationsPress: () => void;
}

// ── Constants ──

const TIMER_TICK_INTERVAL_IN_MS = 1000;
const MINUTES_PER_HOUR = 60;
const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const MS_PER_MINUTE = 60000;
const MS_PER_HOUR = 3600000;
const HOURS_PER_DAY = 24;

// ── Helpers ──

function formatTimeRemaining(endsAtIso: string): string {
  const nowInMs = Date.now();
  const endsAtInMs = new Date(endsAtIso).getTime();
  const diffInMs = Math.max(0, endsAtInMs - nowInMs);
  const diffInSeconds = Math.floor(diffInMs / MS_PER_SECOND);
  const hours = Math.floor(diffInSeconds / SECONDS_PER_HOUR);
  const minutes = Math.floor((diffInSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const seconds = diffInSeconds % SECONDS_PER_MINUTE;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

function formatRelativeCompletion(isoTimestamp: string): string {
  const nowInMs = Date.now();
  const thenInMs = new Date(isoTimestamp).getTime();
  const diffInMs = nowInMs - thenInMs;
  const diffInMinutes = Math.floor(diffInMs / MS_PER_MINUTE);

  if (diffInMinutes < 1) {
    return t('battles.completedAt', { time: 'just now' });
  }
  if (diffInMinutes < MINUTES_PER_HOUR) {
    return t('battles.completedAt', { time: `${diffInMinutes}m ago` });
  }
  const diffInHours = Math.floor(diffInMinutes / MINUTES_PER_HOUR);
  if (diffInHours < HOURS_PER_DAY) {
    return t('battles.completedAt', { time: `${diffInHours}h ago` });
  }
  const diffInDays = Math.floor(diffInHours / HOURS_PER_DAY);
  return t('battles.completedAt', { time: `${diffInDays}d ago` });
}


// ── Mappers ──

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800';

function mapActiveBattleDetail(detail: BattleDetailV1): ActiveBattleCardData | undefined {
  const battle = detail.battle;
  if (battle == null) return undefined;
  return {
    id: battle.id,
    groupId: battle.groupId,
    groupName: detail.groupName ?? '',
    endsAt: battle.endsAt,
    timeRemainingLabel: formatTimeRemaining(battle.endsAt),
    totalParticipants: detail.totalParticipants ?? 0,
    votedParticipants: detail.votedParticipants ?? 0,
    contenders: (detail.finalists ?? []).map((f) => ({
      activityId: f.activityId,
      title: f.title ?? '',
      thumbnailUrl: f.primaryImageUrl ?? PLACEHOLDER_IMAGE,
      voteCount: f.voteCount ?? 0,
    })),
  };
}

function mapRecentResultDetail(detail: BattleDetailV1): RecentResultCardData | undefined {
  const battle = detail.battle;
  if (battle == null) return undefined;
  return {
    id: battle.id,
    groupId: battle.groupId,
    groupName: detail.groupName ?? '',
    winnerTitle: detail.winnerTitle ?? '',
    winnerImageUrl: detail.winnerImageUrl ?? PLACEHOLDER_IMAGE,
    completedAtLabel: formatRelativeCompletion(battle.endsAt),
  };
}

// ── Hook ──

export function useBattles(props: BattlesProps): BattlesFunc {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tickCount, setTickCount] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const isMountedRef = useRef(true);

  const [activeBattleDetails, setActiveBattleDetails] = useState<BattleDetailV1[]>([]);
  const [recentResultDetails, setRecentResultDetails] = useState<BattleDetailV1[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // Initial data load
  useEffect(() => {
    isMountedRef.current = true;
    fetchData();
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  function fetchData(): void {
    fetchDataAsync().catch((err) => {
      console.error('useBattles fetchData error:', err);
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
        setIsRefreshing(false);
      }
    });
  }

  async function fetchDataAsync(): Promise<void> {
    const [activeRes, recentRes, unreadRes] = await Promise.all([
      readAllActiveBattlesWithDetails(supabaseClient),
      readAllRecentBattlesWithDetails(supabaseClient),
      countUnreadNotifications(supabaseClient),
    ]);

    if (!isMountedRef.current) return;

    setActiveBattleDetails(activeRes);
    setRecentResultDetails(recentRes);
    setUnreadNotificationCount(unreadRes);
    setError(undefined);
    setIsLoading(false);
    setIsRefreshing(false);
  }

  // Tick the timer every second so countdowns update live
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setTickCount((prev) => prev + 1);
    }, TIMER_TICK_INTERVAL_IN_MS);

    return () => {
      if (tickRef.current != null) {
        clearInterval(tickRef.current);
      }
    };
  }, []);

  // Recompute display data each tick
  const activeBattles: ActiveBattleCardData[] = activeBattleDetails
    .map(mapActiveBattleDetail)
    .filter((b): b is ActiveBattleCardData => b != null);

  const recentResults: RecentResultCardData[] = recentResultDetails
    .map(mapRecentResultDetail)
    .filter((r): r is RecentResultCardData => r != null);

  // Suppress unused-var lint — tickCount drives re-renders for live countdowns
  void tickCount;

  function onRefresh(): void {
    setIsRefreshing(true);
    fetchData();
  }

  function onActiveBattlePress(groupId: string): void {
    props.onNavigateToGroupBattle({ groupId });
  }

  function onRecentResultPress(groupId: string): void {
    props.onNavigateToGroupResults({ groupId });
  }

  function onNotificationsPress(): void {
    props.onNavigateToNotifications();
  }

  return {
    isLoading,
    error,
    activeBattles,
    recentResults,
    unreadNotificationCount,
    isRefreshing,
    onRefresh,
    onActiveBattlePress,
    onRecentResultPress,
    onNotificationsPress,
  };
}

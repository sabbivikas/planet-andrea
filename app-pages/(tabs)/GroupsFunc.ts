import { useEffect, useState, useRef } from 'react';

import { t } from '@/i18n';
import { supabaseClient } from '@/api/supabase-client';
import { readAllGroupsWithSummary, readOpenPlanets, toggleOrbit, requestToJoin } from '@shared/planet-group-db';
import { countUnreadNotifications } from '@shared/planet-notif-db';
import { toUuidStr, type uuidstr, type OpenPlanetCardV1, type PlanetGroupSummaryV1 } from '@shared/generated-db-types';
import { GroupsProps } from '@/app/(tabs)/groups';

// ── Types ──

export type GroupStatus = 'BATTLE_ACTIVE' | 'DECIDING' | 'IDLE';
export type GroupsTab = 'MY_CREWS' | 'OPEN_PLANETS';

export interface GroupCardData {
  id: string;
  name: string;
  photoUrl?: string;
  memberCount: number;
  memberAvatarInitials: string[];
  status: GroupStatus;
  lastActivityAt: string;
  lastActivityLabel: string;
}

export interface GroupsFunc {
  isLoading: boolean;
  error?: Error;
  groups: GroupCardData[];
  unreadNotificationCount: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  onGroupPress: (groupId: string) => void;
  onCreateGroup: () => void;
  onNotificationsPress: () => void;
  activeTab: GroupsTab;
  onTabChange: (tab: GroupsTab) => void;
  openPlanets: OpenPlanetCardV1[];
  isOpenPlanetsLoading: boolean;
  toastMessage?: string;
  joinRequestGroupId?: string;
  onOrbit: (groupId: string, groupName: string) => void;
  onRequestToJoin: (groupId: string) => void;
  onCloseJoinSheet: () => void;
  onSendJoinRequest: (groupId: string, message: string) => void;
  mergePlanetTargetGroupId?: string;
  onMergePlanet: (groupId: string) => void;
  onCloseMergeScreen: () => void;
  isHowItWorksSheetVisible: boolean;
  onOpenHowItWorks: () => void;
  onCloseHowItWorks: () => void;
}

// ── Constants ──

const VALID_STATUSES: readonly GroupStatus[] = ['BATTLE_ACTIVE', 'DECIDING', 'IDLE'] as const;
const DEFAULT_STATUS: GroupStatus = 'IDLE';

// ── Helpers ──

function formatRelativeTime(isoTimestamp: string): string {
  const now = Date.now();
  const then = new Date(isoTimestamp).getTime();
  const diffInMs = now - then;
  const diffInMinutes = Math.floor(diffInMs / 60000);

  if (diffInMinutes < 1) {
    return t('groups.justNow');
  }
  if (diffInMinutes < 60) {
    return t('groups.minutesAgo', { count: diffInMinutes });
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return t('groups.hoursAgo', { count: diffInHours });
  }
  const diffInDays = Math.floor(diffInHours / 24);
  return t('groups.daysAgo', { count: diffInDays });
}

function getStatusLabel(status: GroupStatus): string {
  switch (status) {
    case 'BATTLE_ACTIVE':
      return t('groups.statusBattle');
    case 'DECIDING':
      return t('groups.statusDeciding');
    case 'IDLE':
      return t('groups.statusIdle');
  }
}

function parseGroupStatus(raw: string | undefined): GroupStatus {
  if (raw != null && (VALID_STATUSES as readonly string[]).includes(raw)) {
    return raw as GroupStatus;
  }
  return DEFAULT_STATUS;
}

function mapSummaryToCardData(summary: PlanetGroupSummaryV1): GroupCardData {
  const lastActivityAt = summary.lastActivityAt ?? new Date(0).toISOString();
  return {
    id: summary.group?.id ?? '',
    name: summary.group?.name ?? '',
    photoUrl: summary.group?.photoUrl ?? undefined,
    memberCount: summary.memberCount ?? 0,
    memberAvatarInitials: summary.memberInitials ?? [],
    status: parseGroupStatus(summary.status ?? undefined),
    lastActivityAt,
    lastActivityLabel: formatRelativeTime(lastActivityAt),
  };
}

const TOAST_DISMISS_DELAY_IN_MS = 2000;

// ── Hook ──

export function useGroups(props: GroupsProps): GroupsFunc {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [groups, setGroups] = useState<GroupCardData[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<GroupsTab>('MY_CREWS');
  const [openPlanets, setOpenPlanets] = useState<OpenPlanetCardV1[]>([]);
  const [isOpenPlanetsLoading, setIsOpenPlanetsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | undefined>(undefined);
  const [joinRequestGroupId, setJoinRequestGroupId] = useState<string | undefined>(undefined);
  const [mergePlanetTargetGroupId, setMergePlanetTargetGroupId] = useState<string | undefined>(undefined);
  const [isHowItWorksSheetVisible, setIsHowItWorksSheetVisible] = useState(false);
  const isMountedRef = useRef(true);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    isMountedRef.current = true;
    fetchData();
    return () => {
      isMountedRef.current = false;
      if (toastTimerRef.current != null) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  function fetchData(): void {
    fetchDataAsync().catch((err) => {
      console.error('useGroups fetchData error:', err);
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
        setIsRefreshing(false);
      }
    });
  }

  async function fetchDataAsync(): Promise<void> {
    const [summaries, unreadCount] = await Promise.all([
      readAllGroupsWithSummary(supabaseClient),
      countUnreadNotifications(supabaseClient),
    ]);

    if (!isMountedRef.current) return;

    setGroups(summaries.map(mapSummaryToCardData));
    setUnreadNotificationCount(unreadCount);
    setError(undefined);
    setIsLoading(false);
    setIsRefreshing(false);
  }

  function fetchOpenPlanets(): void {
    fetchOpenPlanetsAsync().catch((err) => {
      console.error('useGroups fetchOpenPlanets error:', err);
      if (isMountedRef.current) {
        setIsOpenPlanetsLoading(false);
      }
    });
  }

  async function fetchOpenPlanetsAsync(): Promise<void> {
    setIsOpenPlanetsLoading(true);
    const planets = await readOpenPlanets(supabaseClient);
    if (!isMountedRef.current) return;
    setOpenPlanets(planets);
    setIsOpenPlanetsLoading(false);
  }

  function showToast(message: string): void {
    if (toastTimerRef.current != null) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setToastMessage(undefined);
      }
    }, TOAST_DISMISS_DELAY_IN_MS);
  }

  function onRefresh(): void {
    setIsRefreshing(true);
    fetchData();
  }

  function onGroupPress(groupId: string): void {
    props.onNavigateToGroupDetail({ groupId });
  }

  function onCreateGroup(): void {
    props.onNavigateToCreateGroup();
  }

  function onNotificationsPress(): void {
    props.onNavigateToNotifications();
  }

  function onTabChange(tab: GroupsTab): void {
    setActiveTab(tab);
    if (tab === 'OPEN_PLANETS' && openPlanets.length === 0) {
      fetchOpenPlanets();
    }
  }

  function onOrbit(groupId: string, groupName: string): void {
    toggleOrbitAsync(groupId, groupName).catch((err) => {
      console.error('useGroups onOrbit error:', err);
    });
  }

  async function toggleOrbitAsync(groupId: string, groupName: string): Promise<void> {
    await toggleOrbit(supabaseClient, groupId as uuidstr);
    if (!isMountedRef.current) return;
    setOpenPlanets((prev) =>
      prev.map((p) =>
        p.id === groupId ? { ...p, hasOrbited: !p.hasOrbited } : p,
      ),
    );
    showToast(`You are now orbiting ${groupName} 🪐`);
  }

  function onRequestToJoin(groupId: string): void {
    setJoinRequestGroupId(groupId);
  }

  function onCloseJoinSheet(): void {
    setJoinRequestGroupId(undefined);
  }

  function onSendJoinRequest(groupId: string, message: string): void {
    sendJoinRequestAsync(groupId, message).catch((err) => {
      console.error('useGroups onSendJoinRequest error:', err);
    });
  }

  async function sendJoinRequestAsync(groupId: string, message: string): Promise<void> {
    await requestToJoin(supabaseClient, groupId as uuidstr, message);
    if (!isMountedRef.current) return;
    setOpenPlanets((prev) =>
      prev.map((p) =>
        p.id === groupId ? { ...p, hasRequestedToJoin: true } : p,
      ),
    );
    setJoinRequestGroupId(undefined);
    showToast('Request sent! 🚀');
  }

  function onMergePlanet(groupId: string): void {
    setMergePlanetTargetGroupId(groupId);
  }

  function onCloseMergeScreen(): void {
    setMergePlanetTargetGroupId(undefined);
  }

  function onOpenHowItWorks(): void {
    setIsHowItWorksSheetVisible(true);
  }

  function onCloseHowItWorks(): void {
    setIsHowItWorksSheetVisible(false);
  }

  return {
    isLoading,
    error,
    groups,
    unreadNotificationCount,
    isRefreshing,
    onRefresh,
    onGroupPress,
    onCreateGroup,
    onNotificationsPress,
    activeTab,
    onTabChange,
    openPlanets,
    isOpenPlanetsLoading,
    toastMessage,
    joinRequestGroupId,
    onOrbit,
    onRequestToJoin,
    onCloseJoinSheet,
    onSendJoinRequest,
    mergePlanetTargetGroupId,
    onMergePlanet,
    onCloseMergeScreen,
    isHowItWorksSheetVisible,
    onOpenHowItWorks,
    onCloseHowItWorks,
  };
}

export { getStatusLabel };

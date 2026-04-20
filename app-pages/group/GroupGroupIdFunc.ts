/**
 * Business logic for the GroupGroupId route
 */
import { useState, useEffect, useRef } from 'react';
import { useSession } from '@supabase/auth-helpers-react';

import { t } from '@/i18n';
import { supabaseClient } from '@/api/supabase-client';
import { readGroupDetailWithMembers, readGroupSwipeActivity, readGroupRankedActivities, readGroupChatPreview, updateGroupNextPlanAt, updateGroup, removeGroupMember, rescheduleGroupPlan, scheduleGroupPlan, nudgeAllGroupMembers, ensureGroupChat, readGroupMemberReadiness, nudgeGroupMember } from '@shared/planet-group-db';
import { readActiveBattleByGroup, readBattleMemberStatuses } from '@shared/planet-battle-db';
import { readPendingMergeByGroup } from '@shared/planet-merge-db';
import type { GroupChatPreviewV1, GroupMemberWithProfileV1, GroupRankedActivityV1, GroupSwipeActivityV1, MemberReadinessV1, BattleMemberStatusV1, PlanetGroupDetailV1, BattleDetailV1, MergeOpportunityV1, uuidstr } from '@shared/generated-db-types';
import { PLANET_AVATAR_URLS, isPlanetAvatarUrl, getPlanetAvatarType, type PlanetAvatarType } from '@/comp-app/PlanetAvatar';
import { uploadProfileImage, type BaseImagePickerAsset } from '@/api/asset-api';
import { useImagePicker } from '@/comp-lib/assets/useImagePicker';

export type { PlanetAvatarType };
import { toUuidStr, toTimestamptzStr } from '@shared/generated-db-types';
import { GroupGroupIdProps } from '@/app/group/[groupId]';

// ── Constants ──

const TIMER_TICK_INTERVAL_IN_MS = 1000;
const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const SWIPE_ACTIVITY_LIMIT = 10;
const RANKED_ACTIVITIES_LIMIT = 10;
const RECENT_TIMESTAMP_THRESHOLD_IN_MS = 60 * MS_PER_SECOND;
const REMOVE_TOAST_DURATION_IN_MS = 2000;
const READINESS_SWIPE_THRESHOLD = 3;
const READINESS_POLL_INTERVAL_IN_MS = 30 * MS_PER_SECOND;

// ── Types ──

export interface GroupMember {
  id: string;
  displayName: string;
  avatarInitial: string;
  avatarUrl?: string;
  isOnline: boolean;
  isVerified: boolean;
  isOwner: boolean;
  isCurrentUser: boolean;
}

export type SwipeActionType = 'SWIPING' | 'LIKED' | 'SUPER_LIKED';

export interface SwipeActivityItem {
  id: string;
  memberName: string;
  memberInitial: string;
  action: SwipeActionType;
  activityTitle: string;
  activityThumbnailUrl: string;
  timestampLabel: string;
}

export interface RankedActivityItem {
  id: string;
  rank: number;
  title: string;
  thumbnailUrl: string;
  swipeCount: number;
  hasDeal: boolean;
}

export interface BattleStatusData {
  isActive: boolean;
  endsAt?: string;
  timeRemainingLabel: string;
  totalParticipants: number;
  votedParticipants: number;
  hasWinner: boolean;
}

export interface CrewReadinessMember {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  avatarInitial: string;
  isReady: boolean;
  wasNudgedRecently: boolean;
}

export interface ChatPreviewData {
  senderName: string;
  lastMessage: string;
  timestampLabel: string;
}

export type OverflowMenuAction = 'EDIT' | 'LEAVE' | 'DELETE';

export interface GroupDetailData {
  name: string;
  photoUrl: string;
  memberCount: number;
}

/**
 * Interface for the return value of the useGroupGroupId hook
 */
export interface GroupGroupIdFunc {
  isLoading: boolean;
  error?: Error;
  groupDetail: GroupDetailData;
  members: GroupMember[];
  swipeActivity: SwipeActivityItem[];
  rankedActivities: RankedActivityItem[];
  battleStatus: BattleStatusData;
  chatPreview: ChatPreviewData;
  isOverflowMenuVisible: boolean;
  isCurrentUserOwner: boolean;
  isRescheduleSheetVisible: boolean;
  hasPlanScheduled: boolean;
  rescheduleDate: Date;
  isEditSheetVisible: boolean;
  editGroupName: string;
  editSelectedPlanetAvatar: PlanetAvatarType;
  editIsUploadSelected: boolean;
  editUploadedPhotoUri?: string;
  isSavingEdit: boolean;
  isSwipeGateSheetVisible: boolean;
  onGoBack: () => void;
  onStartOrJoinBattle: () => void;
  onInviteFriends: () => void;
  onOpenChat: () => void;
  onMemberPress: (memberId: string) => void;
  onActivityPress: (activityId: string) => void;
  onToggleOverflowMenu: () => void;
  onOverflowMenuAction: (action: OverflowMenuAction) => void;
  onReschedule: () => void;
  onRescheduleDateChange: (date: Date) => void;
  onConfirmReschedule: () => void;
  onDismissRescheduleSheet: () => void;
  onViewResults: () => void;
  mergeOpportunity?: MergeOpportunityV1;
  activeMergePlanetRequestId?: string;
  onOpenMergeScreen: () => void;
  onCloseMergeScreen: () => void;
  onEditGroupNameChange: (text: string) => void;
  onEditSelectPlanetAvatar: (type: PlanetAvatarType) => void;
  onEditSelectUpload: () => void;
  onSaveEdit: () => void;
  onDismissEditSheet: () => void;
  removeMemberCandidate?: GroupMember;
  showRemoveToast: boolean;
  onRemoveMember: (member: GroupMember) => void;
  onConfirmRemoveMember: () => void;
  onDismissRemoveSheet: () => void;
  crewReadiness: CrewReadinessMember[];
  crewReadyCount: number;
  crewReadyThreshold: number;
  crewNeededCount: number;
  isBattleButtonLocked: boolean;
  nudgeCandidate?: CrewReadinessMember;
  isSendingNudge: boolean;
  onNudgeMemberPress: (userId: string) => void;
  onConfirmNudge: () => void;
  onDismissNudgeSheet: () => void;
  onDismissSwipeGateSheet: () => void;
  onNudgeAll: () => void;
}

// ── Helpers ──

function formatTimeRemaining(endsAtIso: string): string {
  const nowInMs = Date.now();
  const endsAtInMs = new Date(endsAtIso).getTime();
  const diffInMs = Math.max(0, endsAtInMs - nowInMs);
  const diffInSeconds = Math.floor(diffInMs / MS_PER_SECOND);
  const minutes = Math.floor(diffInSeconds / SECONDS_PER_MINUTE);
  const seconds = diffInSeconds % SECONDS_PER_MINUTE;

  if (minutes > 0) {
    return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
  }
  return `${seconds}s`;
}

function getSwipeActionLabel(action: SwipeActionType): string {
  switch (action) {
    case 'SWIPING':
      return t('groupDetail.swiping');
    case 'LIKED':
      return t('groupDetail.liked');
    case 'SUPER_LIKED':
      return t('groupDetail.superLiked');
  }
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDateForSystemMessage(date: Date): string {
  const dayName = DAY_NAMES[date.getDay()];
  const monthName = MONTH_NAMES[date.getMonth()];
  const dayNum = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const amPm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = String(minutes).padStart(2, '0');
  return `${dayName}, ${monthName} ${dayNum} at ${displayHours}:${displayMinutes} ${amPm}`;
}

function formatTimestampLabel(createdAt: string): string {
  const diffInMs = Date.now() - new Date(createdAt).getTime();
  if (diffInMs < RECENT_TIMESTAMP_THRESHOLD_IN_MS) {
    return 'now';
  }
  const diffInMinutes = Math.floor(diffInMs / (SECONDS_PER_MINUTE * MS_PER_SECOND));
  if (diffInMinutes < SECONDS_PER_MINUTE) {
    return `${diffInMinutes}m`;
  }
  const diffInHours = Math.floor(diffInMinutes / SECONDS_PER_MINUTE);
  return `${diffInHours}h`;
}

function mapSwipeActionToUiAction(action: string | null): SwipeActionType {
  switch (action) {
    case 'LIKE':
      return 'LIKED';
    case 'SUPER_LIKE':
      return 'SUPER_LIKED';
    default:
      return 'SWIPING';
  }
}

function mapMemberWithProfile(memberWithProfile: GroupMemberWithProfileV1, currentUserId?: string): GroupMember {
  const member = memberWithProfile.member;
  const displayName = memberWithProfile.displayName ?? 'User';
  const memberId = member?.userId ?? '';
  return {
    id: memberId,
    displayName,
    avatarInitial: displayName.charAt(0).toUpperCase(),
    avatarUrl: memberWithProfile.avatarUrl ?? undefined,
    isOnline: member?.isOnline ?? false,
    isVerified: memberWithProfile.isVerified,
    isOwner: member?.isOwner ?? false,
    isCurrentUser: currentUserId != null && memberId !== '' && toUuidStr(memberId) === toUuidStr(currentUserId),
  };
}

function mapSwipeActivity(item: GroupSwipeActivityV1): SwipeActivityItem {
  return {
    id: item.id,
    memberName: item.memberName ?? 'User',
    memberInitial: item.memberInitial ?? 'U',
    action: mapSwipeActionToUiAction(item.action),
    activityTitle: item.activityTitle ?? '',
    activityThumbnailUrl: item.activityThumbnailUrl ?? '',
    timestampLabel: formatTimestampLabel(item.createdAt),
  };
}

function mapRankedActivity(item: GroupRankedActivityV1, rank: number): RankedActivityItem {
  return {
    id: item.activityId,
    rank,
    title: item.title ?? '',
    thumbnailUrl: item.thumbnailUrl ?? '',
    swipeCount: item.swipeCount,
    hasDeal: item.hasDeal,
  };
}

function mapBattleStatus(battleDetail?: BattleDetailV1): BattleStatusData {
  if (battleDetail?.battle == null) {
    return {
      isActive: false,
      timeRemainingLabel: '',
      totalParticipants: 0,
      votedParticipants: 0,
      hasWinner: false,
    };
  }
  const battle = battleDetail.battle;
  return {
    isActive: true,
    endsAt: battle.endsAt,
    timeRemainingLabel: formatTimeRemaining(battle.endsAt),
    totalParticipants: battleDetail.totalParticipants,
    votedParticipants: battleDetail.votedParticipants,
    hasWinner: battleDetail.winnerTitle != null,
  };
}

function mapChatPreview(preview?: GroupChatPreviewV1): ChatPreviewData {
  if (preview?.lastMessage == null) {
    return {
      senderName: '',
      lastMessage: '',
      timestampLabel: '',
    };
  }
  return {
    senderName: preview.senderName ?? 'User',
    lastMessage: preview.lastMessage,
    timestampLabel: preview.sentAt != null ? formatTimestampLabel(preview.sentAt) : '',
  };
}

// ── Default values ──

const DEFAULT_GROUP_DETAIL: GroupDetailData = {
  name: '',
  photoUrl: '',
  memberCount: 0,
};

const DEFAULT_BATTLE_STATUS: BattleStatusData = {
  isActive: false,
  timeRemainingLabel: '',
  totalParticipants: 0,
  votedParticipants: 0,
  hasWinner: false,
};

const DEFAULT_CHAT_PREVIEW: ChatPreviewData = {
  senderName: '',
  lastMessage: '',
  timestampLabel: '',
};

// ── Hook ──

export function useGroupGroupId(props: GroupGroupIdProps): GroupGroupIdFunc {
  const session = useSession();
  const currentUserId = session?.user?.id;
  const groupId = props.urlParams.groupId;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [isOverflowMenuVisible, setIsOverflowMenuVisible] = useState(false);
  const [isRescheduleSheetVisible, setIsRescheduleSheetVisible] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState<Date>(new Date());
  const [tickCount, setTickCount] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Edit sheet state
  const [isEditSheetVisible, setIsEditSheetVisible] = useState(false);
  const [editGroupName, setEditGroupName] = useState('');
  const [editSelectedPlanetAvatar, setEditSelectedPlanetAvatar] = useState<PlanetAvatarType>('A');
  const [editIsUploadSelected, setEditIsUploadSelected] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const { pickImageFromLibrary, currentImage: editCurrentImage } = useImagePicker();

  const [groupDetailData, setGroupDetailData] = useState<PlanetGroupDetailV1 | undefined>(undefined);
  const [swipeActivityData, setSwipeActivityData] = useState<GroupSwipeActivityV1[]>([]);
  const [rankedActivitiesData, setRankedActivitiesData] = useState<GroupRankedActivityV1[]>([]);
  const [battleDetailData, setBattleDetailData] = useState<BattleDetailV1 | undefined>(undefined);
  const [chatPreviewData, setChatPreviewData] = useState<GroupChatPreviewV1 | undefined>(undefined);
  const [mergeOpportunity, setMergeOpportunity] = useState<MergeOpportunityV1 | undefined>(undefined);
  const [activeMergePlanetRequestId, setActiveMergePlanetRequestId] = useState<string | undefined>(undefined);
  const [removeMemberCandidate, setRemoveMemberCandidate] = useState<GroupMember | undefined>(undefined);
  const [showRemoveToast, setShowRemoveToast] = useState(false);
  const [memberReadinessData, setMemberReadinessData] = useState<MemberReadinessV1[]>([]);
  const [battleMemberStatuses, setBattleMemberStatuses] = useState<BattleMemberStatusV1[]>([]);
  const [nudgeCandidate, setNudgeCandidate] = useState<CrewReadinessMember | undefined>(undefined);
  const [isSendingNudge, setIsSendingNudge] = useState(false);
  const [isSwipeGateSheetVisible, setIsSwipeGateSheetVisible] = useState(false);

  // Tick the timer every second so battle countdown updates live
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

  // Suppress unused-var lint — tickCount drives re-renders for live countdowns
  void tickCount;

  // Poll readiness every 30 seconds for live updates
  useEffect(() => {
    if (groupId == null) {
      return undefined;
    }
    const typedGroupId = toUuidStr(groupId);

    async function refreshReadinessAsync(): Promise<void> {
      try {
        const readiness = await readGroupMemberReadiness(supabaseClient, typedGroupId);
        setMemberReadinessData(readiness);
      } catch (err) {
        console.error('refreshReadinessAsync error:', err);
      }
    }

    const intervalId = setInterval(() => {
      refreshReadinessAsync().catch((err) => {
        console.error('readiness poll error:', err);
      });
    }, READINESS_POLL_INTERVAL_IN_MS);

    return () => clearInterval(intervalId);
  }, [groupId]);

  // Fetch battle member voting statuses when active battle changes
  useEffect(() => {
    const battleId = battleDetailData?.battle?.id;
    if (battleId == null) {
      setBattleMemberStatuses([]);
      return;
    }
    const typedBattleId = toUuidStr(battleId);
    readBattleMemberStatuses(supabaseClient, typedBattleId)
      .then(setBattleMemberStatuses)
      .catch((err) => {
        console.error('fetchBattleMemberStatuses error:', err);
      });
  }, [battleDetailData]);

  // Fetch all group data
  useEffect(() => {
    if (groupId == null) {
      return;
    }

    const typedGroupId = toUuidStr(groupId);

    async function fetchGroupDataAsync(): Promise<void> {
      setIsLoading(true);
      setError(undefined);
      try {
        const [detail, swipes, ranked, battle, chat, pendingMerge, , readiness] = await Promise.all([
          readGroupDetailWithMembers(supabaseClient, typedGroupId),
          readGroupSwipeActivity(supabaseClient, typedGroupId, SWIPE_ACTIVITY_LIMIT),
          readGroupRankedActivities(supabaseClient, typedGroupId, RANKED_ACTIVITIES_LIMIT),
          readActiveBattleByGroup(supabaseClient, typedGroupId),
          readGroupChatPreview(supabaseClient, typedGroupId),
          readPendingMergeByGroup(supabaseClient, typedGroupId),
          ensureGroupChat(supabaseClient, typedGroupId),
          readGroupMemberReadiness(supabaseClient, typedGroupId),
        ]);
        setGroupDetailData(detail);
        setSwipeActivityData(swipes);
        setRankedActivitiesData(ranked);
        setBattleDetailData(battle);
        setChatPreviewData(chat);
        setMergeOpportunity(pendingMerge);
        setMemberReadinessData(readiness);
      } catch (err) {
        const fetchError = err instanceof Error ? err : new Error('Failed to load group data');
        setError(fetchError);
        console.error('fetchGroupDataAsync error:', fetchError);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGroupDataAsync().catch((err) => {
      console.error('fetchGroupDataAsync unhandled error:', err);
    });
  }, [groupId]);

  // Map fetched data to UI models
  const group = groupDetailData?.group;
  const groupDetail: GroupDetailData = group != null
    ? {
        name: group.name ?? '',
        photoUrl: group.photoUrl ?? '',
        memberCount: groupDetailData?.members?.length ?? 0,
      }
    : DEFAULT_GROUP_DETAIL;

  const members: GroupMember[] = (groupDetailData?.members ?? []).map((m) => mapMemberWithProfile(m, currentUserId));

  const swipeActivity: SwipeActivityItem[] = swipeActivityData.map(mapSwipeActivity);

  const rankedActivities: RankedActivityItem[] = rankedActivitiesData.map(
    (item, index) => mapRankedActivity(item, index + 1),
  );

  const battleStatus: BattleStatusData = battleDetailData != null
    ? mapBattleStatus(battleDetailData)
    : DEFAULT_BATTLE_STATUS;

  const chatPreview: ChatPreviewData = chatPreviewData != null
    ? mapChatPreview(chatPreviewData)
    : DEFAULT_CHAT_PREVIEW;

  const isCurrentUserOwner = currentUserId != null
    ? members.some((m) => toUuidStr(m.id) === toUuidStr(currentUserId) && m.isOwner)
    : false;

  const hasPlanScheduled = battleStatus.isActive || (group?.nextPlanAt != null);

  // ── Crew Readiness ──

  const crewReadiness: CrewReadinessMember[] = members.map((member) => {
    const readiness = memberReadinessData.find((r) => toUuidStr(r.userId) === toUuidStr(member.id));
    const battleStatus = battleMemberStatuses.find((s) => toUuidStr(s.userId) === toUuidStr(member.id));
    const isReadyFromSwipesOrVotes = readiness?.isReady ?? false;
    const isReadyFromBattleVote = battleStatus?.hasVoted ?? false;
    return {
      userId: member.id,
      displayName: member.displayName,
      avatarUrl: member.avatarUrl,
      avatarInitial: member.avatarInitial,
      isReady: isReadyFromSwipesOrVotes || isReadyFromBattleVote,
      wasNudgedRecently: readiness?.wasNudgedRecently ?? false,
    };
  });

  const crewReadyCount = crewReadiness.filter((m) => m.isReady).length;
  const crewTotalCount = crewReadiness.length;
  const crewReadyThreshold = Math.ceil(crewTotalCount / 2);
  const crewNeededCount = Math.max(0, crewReadyThreshold - crewReadyCount);
  const isBattleButtonLocked = crewTotalCount > 0 && crewReadyCount < crewReadyThreshold;

  function onGoBack(): void {
    props.onGoBack();
  }

  function onStartOrJoinBattle(): void {
    if (isBattleButtonLocked) {
      setIsSwipeGateSheetVisible(true);
      return;
    }
    props.onNavigateToBattle({ groupId: props.urlParams.groupId });
  }

  function onDismissSwipeGateSheet(): void {
    setIsSwipeGateSheetVisible(false);
  }

  function onNudgeAll(): void {
    setIsSwipeGateSheetVisible(false);
    nudgeAllAsync().catch((err) => {
      console.error('onNudgeAll error:', err);
    });
  }

  async function nudgeAllAsync(): Promise<void> {
    const typedGroupId = toUuidStr(groupId);
    try {
      await nudgeAllGroupMembers(supabaseClient, typedGroupId);
      const readiness = await readGroupMemberReadiness(supabaseClient, typedGroupId);
      setMemberReadinessData(readiness);
    } catch (err) {
      console.error('nudgeAllAsync error:', err);
    }
  }

  function onInviteFriends(): void {
    props.onNavigateToInvite({ groupId: props.urlParams.groupId });
  }

  function onOpenChat(): void {
    props.onNavigateToChat({ groupId: props.urlParams.groupId });
  }

  function onMemberPress(memberId: string): void {
    // TODO: Navigate to member profile
    void memberId;
  }

  function onActivityPress(activityId: string): void {
    // TODO: Navigate to activity detail
    void activityId;
  }

  function onToggleOverflowMenu(): void {
    setIsOverflowMenuVisible((prev) => !prev);
  }

  function onOverflowMenuAction(action: OverflowMenuAction): void {
    setIsOverflowMenuVisible(false);
    if (action === 'EDIT') {
      // Pre-populate edit form with current group data
      const currentPhotoUrl = groupDetail.photoUrl;
      setEditGroupName(groupDetail.name);
      if (isPlanetAvatarUrl(currentPhotoUrl) || currentPhotoUrl === '') {
        setEditSelectedPlanetAvatar(getPlanetAvatarType(currentPhotoUrl));
        setEditIsUploadSelected(false);
      } else if (currentPhotoUrl !== '') {
        setEditIsUploadSelected(true);
      } else {
        setEditSelectedPlanetAvatar('A');
        setEditIsUploadSelected(false);
      }
      setIsEditSheetVisible(true);
    }
    // LEAVE and DELETE are not implemented in this scope
  }

  function onEditGroupNameChange(text: string): void {
    setEditGroupName(text);
  }

  function onEditSelectPlanetAvatar(type: PlanetAvatarType): void {
    setEditSelectedPlanetAvatar(type);
    setEditIsUploadSelected(false);
  }

  function onEditSelectUpload(): void {
    setEditIsUploadSelected(true);
    pickImageFromLibrary().catch((err) => {
      console.error('onEditSelectUpload error:', err);
    });
  }

  function onSaveEdit(): void {
    saveEditAsync().catch((err) => {
      console.error('onSaveEdit error:', err);
      setIsSavingEdit(false);
    });
  }

  async function saveEditAsync(): Promise<void> {
    setIsSavingEdit(true);
    try {
      const typedGroupId = toUuidStr(groupId);
      let photoUrl: string;

      if (editCurrentImage != null) {
        const { data: { session: authSession } } = await supabaseClient.auth.getSession();
        const userId = authSession?.user?.id;
        if (userId == null) throw new Error('No authenticated user');
        const imageAsset: BaseImagePickerAsset = {
          uri: editCurrentImage.uri,
          base64: editCurrentImage.base64,
          mimeType: editCurrentImage.mimeType,
          fileName: editCurrentImage.fileName,
          type: editCurrentImage.type ?? undefined,
        };
        const uploadedPath = await uploadProfileImage(supabaseClient, toUuidStr(userId), imageAsset);
        photoUrl = uploadedPath ?? PLANET_AVATAR_URLS[editSelectedPlanetAvatar];
      } else if (editIsUploadSelected && groupDetail.photoUrl !== '' && !isPlanetAvatarUrl(groupDetail.photoUrl)) {
        // Keep existing uploaded photo
        photoUrl = groupDetail.photoUrl;
      } else {
        photoUrl = PLANET_AVATAR_URLS[editSelectedPlanetAvatar];
      }

      await updateGroup(supabaseClient, typedGroupId, {
        name: editGroupName.trim() !== '' ? editGroupName.trim() : undefined,
        photoUrl,
      });
      // Refetch group detail to reflect the saved changes
      const updatedDetail = await readGroupDetailWithMembers(supabaseClient, typedGroupId);
      if (updatedDetail != null) {
        setGroupDetailData(updatedDetail);
      }
      setIsEditSheetVisible(false);
    } finally {
      setIsSavingEdit(false);
    }
  }

  function onDismissEditSheet(): void {
    setIsEditSheetVisible(false);
  }

  function onRemoveMember(member: GroupMember): void {
    setRemoveMemberCandidate(member);
  }

  function onDismissRemoveSheet(): void {
    setRemoveMemberCandidate(undefined);
  }

  function onConfirmRemoveMember(): void {
    confirmRemoveMemberAsync().catch((err) => {
      console.error('onConfirmRemoveMember error:', err);
    });
  }

  async function confirmRemoveMemberAsync(): Promise<void> {
    if (removeMemberCandidate == null) {
      return;
    }
    const typedGroupId = toUuidStr(groupId);
    const typedTargetUserId = toUuidStr(removeMemberCandidate.id);
    const candidateId = removeMemberCandidate.id;
    setRemoveMemberCandidate(undefined);
    const success = await removeGroupMember(supabaseClient, typedGroupId, typedTargetUserId);
    if (success) {
      setGroupDetailData((prev) => {
        if (prev == null) return prev;
        return {
          ...prev,
          members: (prev.members ?? []).filter((m) => m.member?.userId !== candidateId),
        };
      });
      setShowRemoveToast(true);
      setTimeout(() => {
        setShowRemoveToast(false);
      }, REMOVE_TOAST_DURATION_IN_MS);
    }
  }

  function onNudgeMemberPress(userId: string): void {
    const member = crewReadiness.find((m) => m.userId === userId);
    if (member != null && !member.isReady) {
      setNudgeCandidate(member);
    }
  }

  function onDismissNudgeSheet(): void {
    setNudgeCandidate(undefined);
  }

  function onConfirmNudge(): void {
    if (nudgeCandidate == null || isSendingNudge) {
      return;
    }
    sendNudgeAsync().catch((err) => {
      console.error('onConfirmNudge error:', err);
      setIsSendingNudge(false);
    });
  }

  async function sendNudgeAsync(): Promise<void> {
    if (nudgeCandidate == null) {
      return;
    }
    setIsSendingNudge(true);
    const typedGroupId = toUuidStr(groupId);
    const typedRecipientId = toUuidStr(nudgeCandidate.userId);
    const candidateId = nudgeCandidate.userId;
    setNudgeCandidate(undefined);
    try {
      await nudgeGroupMember(supabaseClient, typedGroupId, typedRecipientId);
      // Refresh readiness to update nudged state
      const readiness = await readGroupMemberReadiness(supabaseClient, typedGroupId);
      setMemberReadinessData(readiness);
    } catch (err) {
      console.error('sendNudgeAsync error:', err);
    } finally {
      setIsSendingNudge(false);
      void candidateId;
    }
  }

  function onReschedule(): void {
    setRescheduleDate(new Date());
    setIsRescheduleSheetVisible(true);
  }

  function onRescheduleDateChange(date: Date): void {
    setRescheduleDate(date);
  }

  function onConfirmReschedule(): void {
    setIsRescheduleSheetVisible(false);
    confirmRescheduleAsync().catch((err) => {
      console.error('onConfirmReschedule error:', err);
    });
  }

  async function confirmRescheduleAsync(): Promise<void> {
    const typedGroupId = toUuidStr(groupId);
    const dateLabel = formatDateForSystemMessage(rescheduleDate);
    const nextPlanAt = toTimestamptzStr(rescheduleDate.toISOString());
    if (hasPlanScheduled) {
      await rescheduleGroupPlan(supabaseClient, typedGroupId, nextPlanAt, dateLabel);
    } else {
      await scheduleGroupPlan(supabaseClient, typedGroupId, nextPlanAt, dateLabel);
    }
    // Refresh group detail to reflect updated nextPlanAt
    const updatedDetail = await readGroupDetailWithMembers(supabaseClient, typedGroupId);
    if (updatedDetail != null) {
      setGroupDetailData(updatedDetail);
    }
  }

  function onDismissRescheduleSheet(): void {
    setIsRescheduleSheetVisible(false);
  }

  function onViewResults(): void {
    props.onNavigateToBattle({ groupId: props.urlParams.groupId });
  }

  function onOpenMergeScreen(): void {
    if (mergeOpportunity != null) {
      setActiveMergePlanetRequestId(mergeOpportunity.mergeRequestId);
    }
  }

  function onCloseMergeScreen(): void {
    setActiveMergePlanetRequestId(undefined);
  }

  return {
    isLoading,
    error,
    groupDetail,
    members,
    swipeActivity,
    rankedActivities,
    battleStatus,
    chatPreview,
    isOverflowMenuVisible,
    isCurrentUserOwner,
    isRescheduleSheetVisible,
    hasPlanScheduled,
    rescheduleDate,
    isSwipeGateSheetVisible,
    isEditSheetVisible,
    editGroupName,
    editSelectedPlanetAvatar,
    editIsUploadSelected,
    editUploadedPhotoUri: editCurrentImage?.uri,
    isSavingEdit,
    onGoBack,
    onStartOrJoinBattle,
    onInviteFriends,
    onOpenChat,
    onMemberPress,
    onActivityPress,
    onToggleOverflowMenu,
    onOverflowMenuAction,
    onReschedule,
    onRescheduleDateChange,
    onConfirmReschedule,
    onDismissRescheduleSheet,
    onViewResults,
    mergeOpportunity,
    activeMergePlanetRequestId,
    onOpenMergeScreen,
    onCloseMergeScreen,
    onEditGroupNameChange,
    onEditSelectPlanetAvatar,
    onEditSelectUpload,
    onSaveEdit,
    onDismissEditSheet,
    removeMemberCandidate,
    showRemoveToast,
    onRemoveMember,
    onConfirmRemoveMember,
    onDismissRemoveSheet,
    crewReadiness,
    crewReadyCount,
    crewReadyThreshold,
    crewNeededCount,
    isBattleButtonLocked,
    nudgeCandidate,
    isSendingNudge,
    onNudgeMemberPress,
    onConfirmNudge,
    onDismissNudgeSheet,
    onDismissSwipeGateSheet,
    onNudgeAll,
  };
}

export { getSwipeActionLabel };

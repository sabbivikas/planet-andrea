/**
 * Business logic for the Results route
 */
import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { useSession } from '@supabase/auth-helpers-react';
import { format } from 'date-fns';

import { supabaseClient } from '@/api/supabase-client';
import { readBattleResultsByGroup } from '@shared/planet-battle-db';
import { readGroupDetailWithMembers } from '@shared/planet-group-db';
import { readPendingMergeByGroup } from '@shared/planet-merge-db';
import { type BattleResultsV1, type uuidstr, type DealType, type DealV1 } from '@shared/generated-db-types';
import { ResultsProps } from '@/app/group/[groupId]/results';

// ── Constants ──

const CONFETTI_PARTICLE_COUNT = 24;
const CONFETTI_COLORS = ['#FF5C4D', '#CFFF47', '#FF9A3C', '#FFF5EC', '#FF7669'];
const HAPTIC_DELAY_IN_MS = 300;
const DEFAULT_GROUP_NAME = 'Group';
const DEFAULT_VENUE_NAME = 'Unknown Venue';
const DEFAULT_ACTIVITY_TYPE = 'Activity';
const DEFAULT_DISTANCE = 'Nearby';
const DEFAULT_TIME_INFO = 'Check venue';
const DEFAULT_SCHEDULED_EVENT_TIME = 'Tonight · Time TBD';

// ── Types ──

export interface WinnerActivity {
  id: string;
  venueName: string;
  activityType: string;
  imageUrl: string;
  distance: string;
  timeInfo: string;
  scheduledEventTime: string;
  dealHeadline?: string;
  voteCount: number;
}

export interface RunnerUpActivity {
  id: string;
  venueName: string;
  activityType: string;
  imageUrl: string;
  voteCount: number;
  dealHeadline?: string;
}

export interface MemberVoteResult {
  id: string;
  displayName: string;
  avatarInitial: string;
  votedForWinner: boolean;
}

export interface VenueTimingStep {
  label: string;
  time: string;
}

export interface ConfettiParticle {
  id: number;
  color: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  rotationDeg: number;
  durationInMs: number;
  delayInMs: number;
  size: number;
}

export interface PersonalDealData {
  headline: string;
  discountLabel: string;
  expiryDate: string;
  personalCode: string;
  qrCodeValue: string;
  venueName: string;
}

export interface InviteCardData {
  activityName: string;
  activityImageUrl: string;
  activityType: string;
  address: string;
  eventDate: string;
  eventTime: string;
  isMergeActive: boolean;
  mergeHeadcount: number;
  groupId: string;
}

export interface ResultsFunc {
  isLoading: boolean;
  error?: Error;
  groupName: string;
  winner: WinnerActivity;
  runnerUps: RunnerUpActivity[];
  memberVotes: MemberVoteResult[];
  venueTimeline: VenueTimingStep[];
  confettiParticles: ConfettiParticle[];
  showConfetti: boolean;
  showDealModal: boolean;
  showInviteModal: boolean;
  personalDeal?: PersonalDealData;
  inviteCardData: InviteCardData;
  onGoBack: () => void;
  onViewDetails: () => void;
  onSharePlan: () => void;
  onStartNewBattle: () => void;
  onExportInviteCard: () => void;
  onCloseInviteModal: () => void;
  onOpenDealModal: () => void;
  onCloseDealModal: () => void;
}

// ── Personal Deal Helpers ──

const DEAL_AUTO_SHOW_DELAY_IN_MS = 1400;

function formatDealDiscountLabel(dealType: DealType, percentValue?: number, centsValue?: number): string {
  switch (dealType) {
    case 'PERCENTAGE_OFF':
      return `${percentValue ?? 0}% OFF`;
    case 'FIXED_AMOUNT':
      return `$${((centsValue ?? 0) / 100).toFixed(0)} OFF`;
    case 'BOGO':
      return 'BOGO';
    case 'FREE_ITEM':
      return 'FREE';
    default:
      return 'DEAL';
  }
}

function formatDealExpiryDate(endDate: string): string {
  try {
    return format(new Date(endDate), 'MMM d, yyyy');
  } catch {
    return endDate;
  }
}

function generatePersonalCode(userId: string, memberVotesList: MemberVoteResult[], dealId: string): string {
  const currentMember = memberVotesList.find((m) => m.id === userId);
  let letter1: string;
  let letter2: string;

  if (currentMember?.displayName != null && currentMember.displayName.trim().length > 0) {
    const parts = currentMember.displayName.trim().split(/\s+/);
    letter1 = (parts[0]?.[0] ?? 'X').toUpperCase();
    letter2 = (parts[1]?.[0] ?? parts[0]?.[1] ?? 'X').toUpperCase();
  } else {
    const hex = userId.replace(/-/g, '');
    letter1 = String.fromCharCode(65 + (parseInt(hex[0] ?? '0', 16) % 26));
    letter2 = String.fromCharCode(65 + (parseInt(hex[1] ?? '0', 16) % 26));
  }

  const combined = (userId + dealId).replace(/-/g, '');
  const num = parseInt(combined.slice(0, 8), 16) % 10000;
  const paddedNum = String(num).padStart(4, '0');
  return `${letter1}${letter2}${paddedNum}`;
}

function buildPersonalQrValue(dealId: string, personalCode: string, userId: string): string {
  return `planet://deal/${dealId}/redeem?code=${personalCode}&uid=${userId.slice(0, 8)}`;
}

function mapWinnerDealToPersonalData(
  deal: DealV1,
  personalCode: string,
  userId: string,
  venueName: string,
): PersonalDealData {
  const dealType = deal.dealType ?? 'PERCENTAGE_OFF';
  return {
    headline: deal.headline ?? '',
    discountLabel: formatDealDiscountLabel(
      dealType,
      deal.discountValueInPercent ?? undefined,
      deal.discountValueInCents ?? undefined,
    ),
    expiryDate: formatDealExpiryDate(deal.endDate),
    personalCode,
    qrCodeValue: buildPersonalQrValue(deal.id, personalCode, userId),
    venueName,
  };
}

// ── Confetti Helpers ──

function generateConfettiParticles(): ConfettiParticle[] {
  const particles: ConfettiParticle[] = [];
  for (let i = 0; i < CONFETTI_PARTICLE_COUNT; i++) {
    particles.push({
      id: i,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      startX: Math.random() * 100,
      startY: -10 - Math.random() * 20,
      endX: (Math.random() - 0.5) * 60,
      endY: 100 + Math.random() * 40,
      rotationDeg: Math.random() * 720 - 360,
      durationInMs: 1800 + Math.random() * 1200,
      delayInMs: Math.random() * 600,
      size: 6 + Math.random() * 6,
    });
  }
  return particles;
}

// ── Helpers ──

function formatInviteEventDate(nextPlanAt: string | null | undefined): string {
  if (nextPlanAt == null) return '';
  try {
    return format(new Date(nextPlanAt), 'EEEE MMMM d');
  } catch {
    return '';
  }
}

function formatInviteEventTime(nextPlanAt: string | null | undefined): string {
  if (nextPlanAt == null) return '';
  try {
    return format(new Date(nextPlanAt), 'h:mm a');
  } catch {
    return '';
  }
}

function formatScheduledEventTime(nextPlanAt: string | null | undefined): string {
  if (nextPlanAt == null) {
    return DEFAULT_SCHEDULED_EVENT_TIME;
  }
  try {
    const date = new Date(nextPlanAt);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const amPm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = String(minutes).padStart(2, '0');
    return `Tonight · ${displayHours}:${displayMinutes} ${amPm}`;
  } catch {
    return DEFAULT_SCHEDULED_EVENT_TIME;
  }
}

function formatCategoryLabel(category: string | undefined): string {
  if (category == null) return DEFAULT_ACTIVITY_TYPE;
  return category
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function mapResultsToWinner(results: BattleResultsV1, nextPlanAt?: string | null): WinnerActivity {
  const activity = results.winnerActivity;
  const deal = results.winnerDeal;
  const winningActivityId = results.battle?.winningActivityId;

  const winnerFinalist = results.finalists?.find(
    (f) => f.activityId === winningActivityId,
  );

  return {
    id: activity?.id ?? (winningActivityId as string) ?? '',
    venueName: activity?.title ?? DEFAULT_VENUE_NAME,
    activityType: formatCategoryLabel(activity?.category ?? undefined),
    imageUrl: activity?.primaryImageUrl ?? '',
    distance: activity?.address ?? DEFAULT_DISTANCE,
    timeInfo: activity?.operatingHours ?? DEFAULT_TIME_INFO,
    scheduledEventTime: formatScheduledEventTime(nextPlanAt),
    dealHeadline: deal?.headline ?? undefined,
    voteCount: winnerFinalist?.voteCount ?? 0,
  };
}

function mapResultsToRunnerUps(results: BattleResultsV1): RunnerUpActivity[] {
  const winningActivityId = results.battle?.winningActivityId;
  const finalists = results.finalists ?? [];

  return finalists
    .filter((f) => f.activityId !== winningActivityId)
    .map((f) => ({
      id: f.activityId as string,
      venueName: f.title ?? DEFAULT_VENUE_NAME,
      activityType: DEFAULT_ACTIVITY_TYPE,
      imageUrl: f.primaryImageUrl ?? '',
      voteCount: f.voteCount ?? 0,
      dealHeadline: f.dealHeadline ?? undefined,
    }));
}

function mapResultsToMemberVotes(results: BattleResultsV1): MemberVoteResult[] {
  const winningActivityId = results.battle?.winningActivityId;
  const memberVotes = results.memberVotes ?? [];

  return memberVotes.map((mv) => ({
    id: mv.userId as string,
    displayName: mv.displayName ?? 'User',
    avatarInitial: mv.avatarInitial ?? 'U',
    votedForWinner: mv.votedActivityId === winningActivityId,
  }));
}

// ── Hook ──

export function useResults(props: ResultsProps): ResultsFunc {
  const session = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [battleResults, setBattleResults] = useState<BattleResultsV1 | undefined>(undefined);
  const [groupNextPlanAt, setGroupNextPlanAt] = useState<string | null | undefined>(undefined);
  const [groupMemberCount, setGroupMemberCount] = useState(0);
  const [isMergeActive, setIsMergeActive] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [personalDeal, setPersonalDeal] = useState<PersonalDealData | undefined>(undefined);
  const confettiParticlesRef = useRef<ConfettiParticle[]>(generateConfettiParticles());
  const groupId = props.urlParams.groupId as uuidstr;

  // Fetch battle results on mount
  useEffect(() => {
    async function fetchResultsAsync(): Promise<void> {
      setIsLoading(true);
      try {
        const [data, groupDetail, mergeOpportunity] = await Promise.all([
          readBattleResultsByGroup(supabaseClient, groupId),
          readGroupDetailWithMembers(supabaseClient, groupId),
          readPendingMergeByGroup(supabaseClient, groupId),
        ]);
        setBattleResults(data);
        setGroupNextPlanAt(groupDetail?.group?.nextPlanAt ?? null);
        setGroupMemberCount(groupDetail?.members?.length ?? 0);
        setIsMergeActive(mergeOpportunity != null);
        if (data?.battle != null) {
          setShowConfetti(true);
        }
      } catch (err: unknown) {
        const fetchError = err instanceof Error ? err : new Error('Failed to load battle results');
        setError(fetchError);
        console.error('fetchResults error:', fetchError);
      } finally {
        setIsLoading(false);
      }
    }
    fetchResultsAsync().catch((err) => {
      console.error('fetchResultsAsync unhandled error:', err);
    });
  }, [groupId]);

  // Fire celebration haptic when results load
  useEffect(() => {
    if (!showConfetti || Platform.OS === 'web') {
      return;
    }
    const timeout = setTimeout(() => {
      import('expo-haptics')
        .then((Haptics) => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        })
        .catch(() => {
          // Haptics not available
        });
    }, HAPTIC_DELAY_IN_MS);
    return () => clearTimeout(timeout);
  }, [showConfetti]);

  // Auto-show deal modal when winner has a deal, after confetti plays
  useEffect(() => {
    const userId = session?.user?.id;
    if (battleResults == null || userId == null) {
      return;
    }
    const deal = battleResults.winnerDeal;
    if (deal?.id == null) {
      return;
    }
    const votes = mapResultsToMemberVotes(battleResults);
    const personalCode = generatePersonalCode(userId, votes, deal.id);
    const venueName = battleResults.winnerActivity?.title ?? '';
    setPersonalDeal(mapWinnerDealToPersonalData(deal, personalCode, userId, venueName));
    const timer = setTimeout(() => setShowDealModal(true), DEAL_AUTO_SHOW_DELAY_IN_MS);
    return () => clearTimeout(timer);
  }, [battleResults, session?.user?.id]);

  const groupName = battleResults?.groupName ?? DEFAULT_GROUP_NAME;

  const winner: WinnerActivity = battleResults != null
    ? mapResultsToWinner(battleResults, groupNextPlanAt)
    : { id: '', venueName: DEFAULT_VENUE_NAME, activityType: DEFAULT_ACTIVITY_TYPE, imageUrl: '', distance: DEFAULT_DISTANCE, timeInfo: DEFAULT_TIME_INFO, scheduledEventTime: DEFAULT_SCHEDULED_EVENT_TIME, voteCount: 0 };

  const runnerUps: RunnerUpActivity[] = battleResults != null
    ? mapResultsToRunnerUps(battleResults)
    : [];

  const memberVotes: MemberVoteResult[] = battleResults != null
    ? mapResultsToMemberVotes(battleResults)
    : [];

  // NOTE: Venue timeline requires structured timing data not yet available in the schema
  const venueTimeline: VenueTimingStep[] = [];

  const inviteCardData: InviteCardData = {
    activityName: winner.venueName,
    activityImageUrl: winner.imageUrl,
    activityType: winner.activityType,
    address: winner.distance,
    eventDate: formatInviteEventDate(groupNextPlanAt),
    eventTime: formatInviteEventTime(groupNextPlanAt),
    isMergeActive,
    mergeHeadcount: groupMemberCount,
    groupId: props.urlParams.groupId,
  };

  function onGoBack(): void {
    props.onGoBack();
  }

  function onViewDetails(): void {
    props.onNavigateToActivityDetail({ activityId: winner.id });
  }

  function onSharePlan(): void {
    props.onNavigateToInvite({ groupId: props.urlParams.groupId });
  }

  function onStartNewBattle(): void {
    // TODO: Call API to reset battle state, then navigate back to group detail
    props.onGoBack();
  }

  function onExportInviteCard(): void {
    setShowInviteModal(true);
  }

  function onCloseInviteModal(): void {
    setShowInviteModal(false);
  }

  function onOpenDealModal(): void {
    setShowDealModal(true);
  }

  function onCloseDealModal(): void {
    setShowDealModal(false);
  }

  return {
    isLoading,
    error,
    groupName,
    winner,
    runnerUps,
    memberVotes,
    venueTimeline,
    confettiParticles: confettiParticlesRef.current,
    showConfetti,
    showDealModal,
    showInviteModal,
    personalDeal,
    inviteCardData,
    onGoBack,
    onViewDetails,
    onSharePlan,
    onStartNewBattle,
    onExportInviteCard,
    onCloseInviteModal,
    onOpenDealModal,
    onCloseDealModal,
  };
}

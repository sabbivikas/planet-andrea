/**
 * Business logic for the Battle route — 3-stage voting battle with mini games
 */
import { useState, useEffect, useRef } from 'react';
import { Platform, Share } from 'react-native';

import { supabaseClient } from '@/api/supabase-client';
import {
  type BattleDetailV1,
  type BattleMemberStatusV1,
  type BattleMiniGameResultV1,
  type BattlePhase,
  type intnum,
  toUuidStr,
} from '@shared/generated-db-types';
import {
  readActiveBattleByGroup,
  readBattleMemberStatuses,
  readMiniGameResults,
  lockInVotes,
  startMiniGame,
  completeMiniGame,
  updateBattlePhase,
} from '@shared/planet-battle-db';
import { type BattleProps } from '@/app/group/[groupId]/battle';

// ── Constants ──

const TIMER_TICK_INTERVAL_IN_MS = 1000;
const POLL_INTERVAL_IN_MS = 3000;
const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const DEFAULT_GROUP_NAME = 'Battle';
const TOP_ACTIVITIES_COUNT = 4;
const RPS_TOTAL_ROUNDS = 3;
const RPS_COUNTDOWN_SECONDS = 3;
const RPS_ROUND_TIMEOUT_IN_MS = 3000;
const TRIVIA_TIMEOUT_IN_SECONDS = 10;
const REACTION_MIN_DELAY_IN_MS = 1000;
const REACTION_MAX_DELAY_IN_MS = 4000;
const CONFETTI_DURATION_IN_MS = 3000;
const RESULT_DISPLAY_DELAY_IN_MS = 500;

// 0.00–0.33 → RPS, 0.33–0.66 → Trivia, 0.66–1.00 → Reaction
const RPS_THRESHOLD = 0.33;
const TRIVIA_THRESHOLD = 0.66;

// ── Types ──

// GAME_PICKER is removed — game is randomly assigned when PLAY TO VOTE is tapped
export type BattleStage =
  | 'RANKED_LIST'
  | 'RPS_GAME'
  | 'TRIVIA_GAME'
  | 'REACTION_GAME'
  | 'WIN_SCREEN'
  | 'FORFEIT_SCREEN'
  | 'RESULT';

export type MiniGameType = 'ROCK_PAPER_SCISSORS' | 'TRIVIA' | 'REACTION_TIME';
export type RpsChoice = 'ROCK' | 'PAPER' | 'SCISSORS';
export type RpsRoundResult = 'WIN' | 'LOSE' | 'DRAW';
export type RpsPhase = 'COUNTDOWN' | 'CHOOSING' | 'RESULT' | 'FINAL';
export type ReactionPhase = 'READY' | 'WAITING' | 'TAP_NOW' | 'TOO_EARLY' | 'DONE';
export type MemberGameStatus = 'VOTED' | 'PLAYING' | 'WAITING' | 'FORFEITED';

export interface BattleFinalistCard {
  id: string;
  title: string;
  imageUrl: string;
  venue: string;
  dealHeadline?: string;
  voteCount: number;
}

export interface BattleMemberDisplay {
  id: string;
  displayName: string;
  avatarInitial: string;
  gameStatus: MemberGameStatus;
}

export interface RpsGameState {
  phase: RpsPhase;
  currentRound: number;
  countdown: number;
  userChoice?: RpsChoice;
  appChoice?: RpsChoice;
  roundResults: RpsRoundResult[];
  lastRoundResult?: RpsRoundResult;
}

export interface TriviaGameState {
  questionIndex: number;
  selectedAnswer?: number;
  isCorrect?: boolean;
  timeRemainingInSeconds: number;
}

export interface ReactionGameState {
  phase: ReactionPhase;
  reactionTimeInMs?: number;
  leaderboard: ReactionLeaderboardEntry[];
  isCurrentlyFastest: boolean;
}

export interface ReactionLeaderboardEntry {
  displayName: string;
  reactionTimeInMs: number;
  isCurrentUser: boolean;
}

export interface TriviaQuestion {
  question: string;
  answers: string[];
  correctIndex: number;
}

// Questions updated per spec (Q5 replaced with Planet tagline question)
export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    question: 'Which Minneapolis venue has rooftop views?',
    answers: ['4 Bells Rooftop', "Brit's Pub", 'Acme Comedy Co', "Elsie's Bowling"],
    correctIndex: 0,
  },
  {
    question: 'Which activity is free on Planet?',
    answers: ['Northeast Art Crawl', 'Cosmic Bowling', 'Jazz Night', 'Escape Room'],
    correctIndex: 0,
  },
  {
    question: 'What deal does Indeed Brewing offer?',
    answers: ['Free pint with tour', '$3 tacos', 'First drink free', '10% off groups'],
    correctIndex: 0,
  },
  {
    question: 'Which venue is on the Mississippi river?',
    answers: ["Psycho Suzi's", 'The Dakota', 'Brave New Workshop', 'Conga Latin Bistro'],
    correctIndex: 0,
  },
  {
    question: 'What is the Planet tagline?',
    answers: ['Get on the same planet', 'Find your vibe', 'Make plans tonight', 'Your city your rules'],
    correctIndex: 0,
  },
];

export interface BattleFunc {
  // Stage
  stage: BattleStage;
  isLoading: boolean;

  // Stage 1 data
  groupId: string;
  groupName: string;
  battlePhase: BattlePhase;
  timeRemainingLabel: string;
  isTimerExpired: boolean;
  finalists: BattleFinalistCard[];
  members: BattleMemberDisplay[];
  votedCount: number;
  totalCount: number;
  maxVoteCount: number;
  leaderActivityId?: string;

  // Per-user play tracking (for re-entry without replaying game)
  hasAlreadyPlayedGame: boolean;
  currentUserGameWon?: boolean;  // undefined = not played, true = won, false = forfeited
  currentUserGameType?: string;  // which game the user played
  isCurrentlyFastest: boolean;   // reaction time: current user has lowest time

  // Game states
  rpsState: RpsGameState;
  triviaState: TriviaGameState;
  reactionState: ReactionGameState;

  // Win screen
  selectedVoteActivityId?: string;

  // Stage 3 data
  showConfetti: boolean;
  winnerTitle: string;
  winnerVenue: string;

  // Actions
  onGoBack: () => void;
  onShareInvite: (imageUri?: string) => void;
  onPlayToVote: () => void;
  onRpsChoose: (choice: RpsChoice) => void;
  onTriviaAnswer: (answerIndex: number) => void;
  onReactionTap: () => void;
  onSelectVoteActivity: (activityId: string) => void;
  onConfirmVote: () => void;
  onBackToBattle: () => void;
  onLockInVote: () => void;
}

// ── Helpers ──

function formatTimeRemaining(endsAtIso: string): string {
  const diffInMs = Math.max(0, new Date(endsAtIso).getTime() - Date.now());
  const diffInSeconds = Math.floor(diffInMs / MS_PER_SECOND);
  const hours = Math.floor(diffInSeconds / SECONDS_PER_HOUR);
  const minutes = Math.floor((diffInSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const seconds = diffInSeconds % SECONDS_PER_MINUTE;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }
  return `0:${String(seconds).padStart(2, '0')}`;
}

function getSecondsRemaining(endsAtIso: string): number {
  const diffInMs = Math.max(0, new Date(endsAtIso).getTime() - Date.now());
  return Math.floor(diffInMs / MS_PER_SECOND);
}

function extractVenue(address?: string | null): string {
  if (address == null || address === '') return '';
  const parts = address.split(',');
  return parts[0]?.trim() ?? '';
}

function mapFinalists(detail: BattleDetailV1 | undefined): BattleFinalistCard[] {
  if (detail?.finalists == null) return [];
  return detail.finalists
    .slice(0, TOP_ACTIVITIES_COUNT)
    .map((f) => ({
      id: f.activityId,
      title: f.title ?? 'Activity',
      imageUrl: f.primaryImageUrl ?? '',
      venue: extractVenue(f.address),
      dealHeadline: f.dealHeadline ?? undefined,
      voteCount: f.voteCount ?? 0,
    }));
}

function mapMemberDisplays(
  statuses: BattleMemberStatusV1[],
  gameResults: BattleMiniGameResultV1[],
): BattleMemberDisplay[] {
  return statuses.map((s) => {
    const gameResult = gameResults.find((g) => g.userId === s.userId);
    let gameStatus: MemberGameStatus = 'WAITING';
    if (s.hasVoted) {
      gameStatus = 'VOTED';
    } else if (gameResult != null) {
      if (gameResult.won === false) {
        gameStatus = 'FORFEITED';
      } else if (gameResult.won == null) {
        gameStatus = 'PLAYING';
      }
    }
    return {
      id: s.userId,
      displayName: s.displayName ?? 'User',
      avatarInitial: s.avatarInitial ?? 'U',
      gameStatus,
    };
  });
}

function getRandomRpsChoice(): RpsChoice {
  const choices: RpsChoice[] = ['ROCK', 'PAPER', 'SCISSORS'];
  return choices[Math.floor(Math.random() * choices.length)];
}

function getRpsRoundResult(userChoice: RpsChoice, appChoice: RpsChoice): RpsRoundResult {
  if (userChoice === appChoice) return 'DRAW';
  if (
    (userChoice === 'ROCK' && appChoice === 'SCISSORS') ||
    (userChoice === 'PAPER' && appChoice === 'ROCK') ||
    (userChoice === 'SCISSORS' && appChoice === 'PAPER')
  ) {
    return 'WIN';
  }
  return 'LOSE';
}

function pickRandomGameType(): MiniGameType {
  const roll = Math.random();
  if (roll < RPS_THRESHOLD) return 'ROCK_PAPER_SCISSORS';
  if (roll < TRIVIA_THRESHOLD) return 'TRIVIA';
  return 'REACTION_TIME';
}

// ── Hook ──

export function useBattle(props: BattleProps): BattleFunc {
  const [isLoading, setIsLoading] = useState(true);
  const [battleDetail, setBattleDetail] = useState<BattleDetailV1 | undefined>(undefined);
  const [memberStatusesRaw, setMemberStatusesRaw] = useState<BattleMemberStatusV1[]>([]);
  const [gameResultsRaw, setGameResultsRaw] = useState<BattleMiniGameResultV1[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const [stage, setStage] = useState<BattleStage>('RANKED_LIST');
  const [tickCount, setTickCount] = useState(0);

  // RPS state
  const [rpsState, setRpsState] = useState<RpsGameState>({
    phase: 'COUNTDOWN',
    currentRound: 1,
    countdown: RPS_COUNTDOWN_SECONDS,
    roundResults: [],
  });

  // Trivia state
  const [triviaState, setTriviaState] = useState<TriviaGameState>({
    questionIndex: 0,
    timeRemainingInSeconds: TRIVIA_TIMEOUT_IN_SECONDS,
  });

  // Reaction state
  const [reactionState, setReactionState] = useState<ReactionGameState>({
    phase: 'READY',
    leaderboard: [],
    isCurrentlyFastest: false,
  });

  // Win screen
  const [selectedVoteActivityId, setSelectedVoteActivityId] = useState<string | undefined>(undefined);

  // Result screen
  const [showConfetti, setShowConfetti] = useState(false);

  // Refs
  const tickRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const pollRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const rpsTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const triviaTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const reactionTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reactionStartRef = useRef<number>(0);
  // Reaction time: the ms recorded when the user tapped (persists across renders)
  const reactionTimeRef = useRef<number | undefined>(undefined);
  // Reaction time: true once we've written won=false to DB after being beaten
  const reactionForfeitedRef = useRef<boolean>(false);
  // Authoritative group member count from DB — used to guard allMembersResolved
  const totalGroupMemberCountRef = useRef<number>(0);
  // Hard lock: ensures RESULT stage is entered at most once per battle session
  const hasAdvancedToResult = useRef<boolean>(false);
  // Tracks the battlePhase value seen in the previous poll cycle (Fix 3 stale-value guard)
  const previousBattlePhaseRef = useRef<BattlePhase | undefined>(undefined);

  const groupId = toUuidStr(props.urlParams.groupId);

  // ── Fetch current user ID ──

  useEffect(() => {
    supabaseClient.auth.getUser()
      .then(({ data }) => {
        if (data.user != null) setCurrentUserId(data.user.id);
      })
      .catch(() => {});
  }, []);

  // ── Data fetching ──

  function fetchBattleData(): void {
    fetchBattleDataAsync().catch((err) => {
      console.error('fetchBattleData error:', err);
    });
  }

  async function fetchBattleDataAsync(): Promise<void> {
    console.log('[Battle] fetchBattleData — groupId:', groupId, 'currentBattleId:', battleDetail?.battle?.id);
    try {
      const detail = await readActiveBattleByGroup(supabaseClient, groupId);
      setBattleDetail(detail);
      if (detail?.totalParticipants != null && detail.totalParticipants > 0) {
        totalGroupMemberCountRef.current = detail.totalParticipants;
      }

      if (detail?.battle?.id != null) {
        const [statuses, gameResults] = await Promise.all([
          readBattleMemberStatuses(supabaseClient, detail.battle.id),
          readMiniGameResults(supabaseClient, detail.battle.id),
        ]);
        setMemberStatusesRaw(statuses);
        setGameResultsRaw(gameResults);
      }
    } catch (err) {
      console.error('fetchBattleDataAsync error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchBattleData();
  }, [groupId]);

  // Poll for updates
  useEffect(() => {
    pollRef.current = setInterval(() => {
      fetchBattleData();
    }, POLL_INTERVAL_IN_MS);
    return () => {
      if (pollRef.current != null) clearInterval(pollRef.current);
    };
  }, [groupId]);

  // Timer tick
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setTickCount((prev) => prev + 1);
    }, TIMER_TICK_INTERVAL_IN_MS);
    return () => {
      if (tickRef.current != null) clearInterval(tickRef.current);
    };
  }, []);

  void tickCount;

  // ── Derived state ──

  const battlePhase: BattlePhase = battleDetail?.battle?.phase ?? 'VOTING_OPEN';
  const endsAt = battleDetail?.battle?.endsAt;
  const groupName = battleDetail?.groupName ?? DEFAULT_GROUP_NAME;
  const finalists = mapFinalists(battleDetail);
  const members = mapMemberDisplays(memberStatusesRaw, gameResultsRaw);

  const timeRemainingLabel = endsAt != null ? formatTimeRemaining(endsAt) : '0:00';
  const secondsRemaining = endsAt != null ? getSecondsRemaining(endsAt) : 1;
  // Only treat the timer as expired when we have a real endsAt value from the DB and it has passed.
  // Defaulting to expired when battleDetail is undefined would incorrectly show "Voting has closed".
  const isTimerExpired = endsAt != null && secondsRemaining <= 0;

  const maxVoteCount = finalists.reduce((max, f) => Math.max(max, f.voteCount), 0);
  const votedCount = members.filter((m) => m.gameStatus === 'VOTED').length;
  const forfeitedCount = members.filter((m) => m.gameStatus === 'FORFEITED').length;
  const totalCount = members.length;
  // Guard: only true when local members array has fully synced to the DB group member count,
  // preventing premature resolution when the members state hasn't caught up yet.
  const allMembersResolved =
    totalGroupMemberCountRef.current > 0 &&
    members.length === totalGroupMemberCountRef.current &&
    (votedCount + forfeitedCount) >= totalGroupMemberCountRef.current;

  const leaderActivityId = finalists.length > 0 && maxVoteCount > 0
    ? finalists.find((f) => f.voteCount === maxVoteCount)?.id
    : undefined;

  const winnerFinalist = finalists.length > 0 ? finalists[0] : undefined;
  const winnerTitle = winnerFinalist?.title ?? '';
  const winnerVenue = winnerFinalist?.venue ?? '';

  // Per-user play tracking
  const currentUserGameResult = currentUserId != null
    ? gameResultsRaw.find((r) => r.userId === currentUserId)
    : undefined;

  // hasAlreadyPlayedGame = game result exists AND is completed (won is not null)
  const hasAlreadyPlayedGame = currentUserGameResult?.won != null;
  const currentUserGameWon: boolean | undefined = currentUserGameResult?.won ?? undefined;
  const currentUserGameType: string | undefined = currentUserGameResult?.gameType ?? undefined;

  // For reaction time: is current user currently fastest?
  const isCurrentlyFastest = (() => {
    if (currentUserGameResult?.reactionTimeInMs == null) return false;
    const validTimes = gameResultsRaw
      .map((r) => r.reactionTimeInMs)
      .filter((t): t is intnum => t != null);
    if (validTimes.length === 0) return false;
    const minTime = Math.min(...validTimes);
    return currentUserGameResult.reactionTimeInMs === minTime;
  })();

  // ── Auto-advance to results when timer expires OR all members resolved ──

  useEffect(() => {
    // Fix 2: ensure we only advance once per battle session
    if (hasAdvancedToResult.current) return;
    // Fix 1: require at least one voted member before advancing
    if (votedCount === 0) return;

    const shouldAdvance =
      (isTimerExpired || allMembersResolved) &&
      stage === 'RANKED_LIST' &&
      battlePhase === 'VOTING_OPEN';

    if (shouldAdvance) {
      const timeout = setTimeout(() => {
        // Fix 5: log every advance attempt with full context
        console.log(`BATTLE ADVANCE TRIGGERED — votedCount: ${votedCount} allMembersResolved: ${allMembersResolved} isTimerExpired: ${isTimerExpired} battlePhase: ${battlePhase}`);
        // Fix 2: set the lock before calling setStage
        hasAdvancedToResult.current = true;
        setStage('RESULT');
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), CONFETTI_DURATION_IN_MS);

        const battleId = battleDetail?.battle?.id;
        if (battleId != null && finalists.length > 0) {
          const winnerId = toUuidStr(finalists[0]?.id ?? '');
          updateBattlePhase(supabaseClient, battleId, 'WINNER_REVEALED', winnerId).catch((err) => {
            console.error('auto updateBattlePhase error:', err);
          });
        }
      }, RESULT_DISPLAY_DELAY_IN_MS);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [isTimerExpired, allMembersResolved, stage, battlePhase, votedCount]);

  // Sync from DB phase — only advance to RESULT if the local user has also finished
  // (allMembersResolved or timer expired). If neither is true, the UI already reflects
  // WINNER_REVEALED via battlePhase (derived from battleDetail) but keeps the user in
  // RANKED_LIST so they can still play their mini game and vote.
  useEffect(() => {
    // Fix 3: record the phase seen in the previous poll cycle, then check if it changed
    const prevPhase = previousBattlePhaseRef.current;
    previousBattlePhaseRef.current = battlePhase;

    // Fix 2: bail out if we already advanced this session
    if (hasAdvancedToResult.current) return;
    // Fix 1: require at least one voted member before advancing
    if (votedCount === 0) return;
    // Phase must actually be WINNER_REVEALED
    if (battlePhase !== 'WINNER_REVEALED') return;
    // Fix 3: phase must have changed in this poll cycle — if it was already
    // WINNER_REVEALED in the previous cycle it is a stale/persisted value, not fresh
    if (prevPhase === 'WINNER_REVEALED') return;
    if (stage !== 'RANKED_LIST') return;
    if (!allMembersResolved && !isTimerExpired) return;

    // Fix 5: log every advance attempt with full context
    console.log(`BATTLE ADVANCE TRIGGERED — votedCount: ${votedCount} allMembersResolved: ${allMembersResolved} isTimerExpired: ${isTimerExpired} battlePhase: ${battlePhase}`);
    // Fix 2: set the lock before calling setStage
    hasAdvancedToResult.current = true;
    setStage('RESULT');
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), CONFETTI_DURATION_IN_MS);
  }, [battlePhase, allMembersResolved, isTimerExpired, stage, votedCount]);

  // ── RPS Game Logic ──

  function startRpsGame(): void {
    setRpsState({
      phase: 'COUNTDOWN',
      currentRound: 1,
      countdown: RPS_COUNTDOWN_SECONDS,
      roundResults: [],
    });
    startRpsCountdown(RPS_COUNTDOWN_SECONDS, 1, []);
  }

  function startRpsCountdown(count: number, round: number, results: RpsRoundResult[]): void {
    if (count <= 0) {
      setRpsState((prev) => ({ ...prev, phase: 'CHOOSING', countdown: 0 }));
      rpsTimerRef.current = setTimeout(() => {
        const appChoice = getRandomRpsChoice();
        const newResults = [...results, 'LOSE' as RpsRoundResult];
        setRpsState((prev) => {
          if (prev.phase === 'CHOOSING') {
            return { ...prev, phase: 'RESULT', appChoice, lastRoundResult: 'LOSE', roundResults: newResults };
          }
          return prev;
        });
        setTimeout(() => advanceRpsRound(round, newResults), MS_PER_SECOND);
      }, RPS_ROUND_TIMEOUT_IN_MS);
      return;
    }
    setRpsState((prev) => ({ ...prev, countdown: count, phase: 'COUNTDOWN', currentRound: round }));
    rpsTimerRef.current = setTimeout(() => {
      startRpsCountdown(count - 1, round, results);
    }, MS_PER_SECOND);
  }

  function advanceRpsRound(currentRound: number, results: RpsRoundResult[]): void {
    const wins = results.filter((r) => r === 'WIN').length;
    const losses = results.filter((r) => r === 'LOSE').length;
    const roundsLeft = RPS_TOTAL_ROUNDS - results.length;

    if (wins >= 2 || losses >= 2 || roundsLeft <= 0) {
      const won = wins >= 2;
      setRpsState((prev) => ({ ...prev, phase: 'FINAL', roundResults: results }));
      handleGameComplete(won);
      return;
    }

    const nextRound = currentRound + 1;
    setTimeout(() => {
      startRpsCountdown(RPS_COUNTDOWN_SECONDS, nextRound, results);
    }, RESULT_DISPLAY_DELAY_IN_MS);
  }

  function onRpsChoose(choice: RpsChoice): void {
    if (rpsState.phase !== 'CHOOSING') return;
    if (rpsTimerRef.current != null) clearTimeout(rpsTimerRef.current);

    const appChoice = getRandomRpsChoice();
    const result = getRpsRoundResult(choice, appChoice);

    if (result === 'DRAW') {
      setRpsState((prev) => ({
        ...prev,
        phase: 'RESULT',
        userChoice: choice,
        appChoice,
        lastRoundResult: 'DRAW',
      }));
      setTimeout(() => {
        startRpsCountdown(RPS_COUNTDOWN_SECONDS, rpsState.currentRound, rpsState.roundResults);
      }, MS_PER_SECOND);
      return;
    }

    const newResults = [...rpsState.roundResults, result];
    setRpsState((prev) => ({
      ...prev,
      phase: 'RESULT',
      userChoice: choice,
      appChoice,
      lastRoundResult: result,
      roundResults: newResults,
    }));

    setTimeout(() => {
      advanceRpsRound(rpsState.currentRound, newResults);
    }, MS_PER_SECOND);
  }

  // ── Trivia Game Logic ──

  function startTriviaGame(): void {
    const qIndex = Math.floor(Math.random() * TRIVIA_QUESTIONS.length);
    setTriviaState({
      questionIndex: qIndex,
      timeRemainingInSeconds: TRIVIA_TIMEOUT_IN_SECONDS,
    });
    triviaTimerRef.current = setInterval(() => {
      setTriviaState((prev) => {
        const newTime = prev.timeRemainingInSeconds - 1;
        if (newTime <= 0) {
          if (triviaTimerRef.current != null) clearInterval(triviaTimerRef.current);
          handleGameComplete(false);
          return { ...prev, timeRemainingInSeconds: 0 };
        }
        return { ...prev, timeRemainingInSeconds: newTime };
      });
    }, MS_PER_SECOND);
  }

  function onTriviaAnswer(answerIndex: number): void {
    if (triviaState.selectedAnswer != null) return;
    if (triviaTimerRef.current != null) clearInterval(triviaTimerRef.current);

    const question = TRIVIA_QUESTIONS[triviaState.questionIndex];
    if (question == null) return;
    const isCorrect = answerIndex === question.correctIndex;

    setTriviaState((prev) => ({ ...prev, selectedAnswer: answerIndex, isCorrect }));

    setTimeout(() => {
      handleGameComplete(isCorrect);
    }, 1500);
  }

  // ── Reaction Game Logic ──

  function startReactionGame(): void {
    reactionTimeRef.current = undefined;
    reactionForfeitedRef.current = false;
    setReactionState({ phase: 'READY', leaderboard: [], isCurrentlyFastest: false });
    setTimeout(() => {
      setReactionState((prev) => ({ ...prev, phase: 'WAITING' }));
      const delay = REACTION_MIN_DELAY_IN_MS + Math.random() * (REACTION_MAX_DELAY_IN_MS - REACTION_MIN_DELAY_IN_MS);
      reactionTimerRef.current = setTimeout(() => {
        reactionStartRef.current = Date.now();
        setReactionState((prev) => ({ ...prev, phase: 'TAP_NOW' }));
      }, delay);
    }, MS_PER_SECOND);
  }

  function onReactionTap(): void {
    if (reactionState.phase === 'WAITING') {
      if (reactionTimerRef.current != null) clearTimeout(reactionTimerRef.current);
      setReactionState((prev) => ({ ...prev, phase: 'TOO_EARLY' }));
      setTimeout(() => handleGameComplete(false), 500);
      return;
    }

    if (reactionState.phase === 'TAP_NOW') {
      const reactionTimeInMs = Date.now() - reactionStartRef.current;
      reactionTimeRef.current = reactionTimeInMs;
      setReactionState((prev) => ({
        ...prev,
        phase: 'DONE',
        reactionTimeInMs,
      }));

      const battleId = battleDetail?.battle?.id;
      if (battleId != null) {
        // Save result as won=true initially (pending fastest determination)
        completeMiniGame(supabaseClient, battleId, true, reactionTimeInMs)
          .then(() => readMiniGameResults(supabaseClient, battleId))
          .then((results) => {
            const myResult = currentUserId != null
              ? results.find((r) => r.userId === currentUserId)
              : undefined;
            const validTimes = results
              .map((r) => r.reactionTimeInMs)
              .filter((t): t is intnum => t != null);
            const minTime = validTimes.length > 0 ? Math.min(...validTimes) : null;
            const fastest = myResult?.reactionTimeInMs != null && myResult.reactionTimeInMs === minTime;

            const leaderboard: ReactionLeaderboardEntry[] = results
              .filter((r): r is typeof r & { reactionTimeInMs: intnum } => r.reactionTimeInMs != null)
              .map((r) => ({
                displayName: r.displayName ?? 'User',
                reactionTimeInMs: r.reactionTimeInMs,
                isCurrentUser: r.userId === currentUserId,
              }));

            setReactionState((prev) => ({
              ...prev,
              leaderboard,
              isCurrentlyFastest: fastest,
            }));
            setGameResultsRaw(results);

            // Immediately mark as forfeited in DB if not the fastest
            if (!fastest && !reactionForfeitedRef.current) {
              reactionForfeitedRef.current = true;
              completeMiniGame(supabaseClient, battleId, false, reactionTimeInMs).catch((err) => {
                console.error('reaction forfeit update error:', err);
              });
            }
          })
          .catch((err) => {
            console.error('reaction save error:', err);
          });
      }
    }
  }

  // ── Sync poll data to reaction leaderboard when in DONE phase ──

  useEffect(() => {
    if (stage !== 'REACTION_GAME' || reactionState.phase !== 'DONE') return;
    if (reactionTimeRef.current == null) return;

    const myResult = currentUserId != null
      ? gameResultsRaw.find((r) => r.userId === currentUserId)
      : undefined;
    const validTimes = gameResultsRaw
      .map((r) => r.reactionTimeInMs)
      .filter((t): t is intnum => t != null);
    const minTime = validTimes.length > 0 ? Math.min(...validTimes) : null;
    const fastest = myResult?.reactionTimeInMs != null && myResult.reactionTimeInMs === minTime;

    const newLeaderboard: ReactionLeaderboardEntry[] = gameResultsRaw
      .filter((r): r is typeof r & { reactionTimeInMs: intnum } => r.reactionTimeInMs != null)
      .map((r) => ({
        displayName: r.displayName ?? 'User',
        reactionTimeInMs: r.reactionTimeInMs,
        isCurrentUser: r.userId === currentUserId,
      }));

    setReactionState((prev) => ({
      ...prev,
      leaderboard: newLeaderboard,
      isCurrentlyFastest: fastest,
    }));

    // Update DB to won=false if user was beaten after initially being fastest
    const battleId = battleDetail?.battle?.id;
    if (!fastest && battleId != null && !reactionForfeitedRef.current && reactionTimeRef.current != null) {
      reactionForfeitedRef.current = true;
      completeMiniGame(supabaseClient, battleId, false, reactionTimeRef.current).catch((err) => {
        console.error('reaction beaten update error:', err);
      });
    }
  }, [gameResultsRaw]);

  // ── Game completion ──

  function handleGameComplete(won: boolean): void {
    const battleId = battleDetail?.battle?.id;
    if (battleId != null) {
      completeMiniGame(supabaseClient, battleId, won).catch((err) => {
        console.error('completeMiniGame error:', err);
      });
    }

    if (won) {
      setStage('WIN_SCREEN');
    } else {
      setStage('FORFEIT_SCREEN');
    }
  }

  // ── Cleanup timers ──

  useEffect(() => {
    return () => {
      if (rpsTimerRef.current != null) clearTimeout(rpsTimerRef.current);
      if (triviaTimerRef.current != null) clearInterval(triviaTimerRef.current);
      if (reactionTimerRef.current != null) clearTimeout(reactionTimerRef.current);
    };
  }, []);

  // Fix 4: reset the advance lock when the user navigates away so a fresh session starts clean
  useEffect(() => {
    return () => {
      hasAdvancedToResult.current = false;
    };
  }, []);

  // ── Actions ──

  function onGoBack(): void {
    props.onGoBack();
  }

  function onShareInvite(imageUri?: string): void {
    // Web Share API is blocked in iframes (preview environment); native only
    if (Platform.OS === 'web') return;

    const venueText = winnerVenue !== '' ? ` at ${winnerVenue}` : '';
    const shareMessage = `Join us for ${winnerTitle}${venueText}! Get on the same planet. 🌍`;
    const shareContent =
      imageUri != null && Platform.OS === 'ios'
        ? { message: shareMessage, url: imageUri }
        : { message: shareMessage };

    Share.share(shareContent).catch((err) => {
      console.error('onShareInvite error:', err);
    });
  }

  function onPlayToVote(): void {
    // Randomly assign one of the three mini games
    const gameType = pickRandomGameType();
    const battleId = battleDetail?.battle?.id;

    if (battleId != null) {
      startMiniGame(supabaseClient, battleId, gameType).catch((err) => {
        console.error('startMiniGame error:', err);
      });
    }

    switch (gameType) {
      case 'ROCK_PAPER_SCISSORS':
        setStage('RPS_GAME');
        startRpsGame();
        break;
      case 'TRIVIA':
        setStage('TRIVIA_GAME');
        startTriviaGame();
        break;
      case 'REACTION_TIME':
        setStage('REACTION_GAME');
        startReactionGame();
        break;
    }
  }

  function onSelectVoteActivity(activityId: string): void {
    setSelectedVoteActivityId(activityId);
  }

  function onConfirmVote(): void {
    if (selectedVoteActivityId == null) return;

    const battleId = battleDetail?.battle?.id;
    if (battleId == null) return;

    const activityIds = [toUuidStr(selectedVoteActivityId)];
    lockInVotes(supabaseClient, battleId, activityIds)
      .then(() => {
        if (Platform.OS !== 'web') {
          import('expo-haptics')
            .then((Haptics) => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            })
            .catch(() => {});
        }
        fetchBattleData();
        setStage('RANKED_LIST');
      })
      .catch((err) => {
        console.error('onConfirmVote error:', err);
      });
  }

  function onBackToBattle(): void {
    setStage('RANKED_LIST');
    fetchBattleData();
  }

  function onLockInVote(): void {
    setStage('WIN_SCREEN');
  }

  return {
    stage,
    isLoading,
    groupId,
    groupName,
    battlePhase,
    timeRemainingLabel,
    isTimerExpired,
    finalists,
    members,
    votedCount,
    totalCount,
    maxVoteCount,
    leaderActivityId,
    hasAlreadyPlayedGame,
    currentUserGameWon,
    currentUserGameType,
    isCurrentlyFastest,
    rpsState,
    triviaState,
    reactionState,
    selectedVoteActivityId,
    showConfetti,
    winnerTitle,
    winnerVenue,
    onGoBack,
    onShareInvite,
    onPlayToVote,
    onRpsChoose,
    onTriviaAnswer,
    onReactionTap,
    onSelectVoteActivity,
    onConfirmVote,
    onBackToBattle,
    onLockInVote,
  };
}

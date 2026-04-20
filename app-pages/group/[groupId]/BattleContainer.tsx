/**
 * Main container for the Battle route — 3-stage voting battle with mini games
 */

import { type ReactNode, useEffect } from 'react';
import 'react-native-reanimated';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Share, View, Pressable, Text, type DimensionValue } from 'react-native';
import { Image } from 'expo-image';
import { ArrowLeft, Clock } from 'lucide-react-native';
import { ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { t } from '@/i18n';
import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import { CustomButton } from '@/comp-lib/core/custom-button/CustomButton';
import { useBattleStyles } from './BattleStyles';
import {
  useBattle,
  TRIVIA_QUESTIONS,
  type BattleFinalistCard,
  type BattleMemberDisplay,
  type RpsChoice,
  type RpsGameState,
  type TriviaGameState,
  type ReactionGameState,
  type MemberGameStatus,
} from './BattleFunc';
import { BattleProps } from '@/app/group/[groupId]/battle';
import {
  type BattleHeaderStyles,
  type MemberStatusStyles,
  type ActivityCardStyles,
  type PlayToVoteButtonStyles,
  type AlreadyPlayedBannerStyles,
  type RpsStyles,
  type TriviaStyles,
  type ReactionStyles,
  type WinScreenStyles,
  type ForfeitScreenStyles,
  type ResultScreenStyles,
} from './BattleStyles';

// ── Constants ──

const VOTE_BAR_MIN_WIDTH_PERCENT = 5;
const VOTE_BAR_MAX_WIDTH_PERCENT = 100;
const PULSE_DURATION_IN_MS = 2000;

// ── Sub-components: Stage 1 ──

interface BattleHeaderProps {
  styles: BattleHeaderStyles;
  groupName: string;
  timeRemainingLabel: string;
  onGoBack: () => void;
}

function BattleHeader(props: BattleHeaderProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <Pressable style={props.styles.backButton} onPress={props.onGoBack}>
        <ArrowLeft size={22} color="#FF5C4D" />
      </Pressable>
      <View style={props.styles.titleArea}>
        <CustomTextField
          styles={props.styles.titleText}
          title={props.groupName}
          numberOfLines={1}
        />
      </View>
      <View style={props.styles.timerContainer}>
        <Clock size={14} color="#CFFF47" />
        <CustomTextField styles={props.styles.timerText} title={props.timeRemainingLabel} />
      </View>
    </View>
  );
}

interface MemberStatusSectionProps {
  styles: MemberStatusStyles;
  members: BattleMemberDisplay[];
  votedCount: number;
  totalCount: number;
}

function MemberStatusSection(props: MemberStatusSectionProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <CustomTextField
        styles={props.styles.votedLabel}
        title={t('voteBattle.votingProgress', { voted: props.votedCount, total: props.totalCount })}
      />
      <View style={props.styles.avatarRow}>
        {props.members.map((member) => (
          <MemberAvatarItem key={member.id} styles={props.styles} member={member} />
        ))}
      </View>
    </View>
  );
}

interface MemberAvatarItemProps {
  styles: MemberStatusStyles;
  member: BattleMemberDisplay;
}

function MemberAvatarItem(props: MemberAvatarItemProps): ReactNode {
  const statusStyle = getStatusTextStyle(props.styles, props.member.gameStatus);
  const statusLabel = getStatusLabel(props.member.gameStatus);

  return (
    <View style={props.styles.avatarWrapper}>
      <View style={[
        props.styles.avatar,
        props.member.gameStatus === 'VOTED' ? { borderColor: '#CFFF47' } : undefined,
        props.member.gameStatus === 'FORFEITED' ? { borderColor: 'rgba(255,92,77,0.4)' } : undefined,
      ]}>
        <CustomTextField styles={props.styles.avatarText} title={props.member.avatarInitial} />
      </View>
      <CustomTextField styles={[props.styles.statusLabel, statusStyle]} title={statusLabel} />
    </View>
  );
}

function getStatusTextStyle(styles: MemberStatusStyles, status: MemberGameStatus): object {
  switch (status) {
    case 'VOTED': return styles.statusVoted;
    case 'PLAYING': return styles.statusPlaying;
    case 'WAITING': return styles.statusWaiting;
    case 'FORFEITED': return styles.statusForfeited;
  }
}

function getStatusLabel(status: MemberGameStatus): string {
  switch (status) {
    case 'VOTED': return 'VOTED';
    case 'PLAYING': return 'PLAYING';
    case 'WAITING': return 'WAITING';
    case 'FORFEITED': return 'FORFEITED';
  }
}

interface ActivityCardComponentProps {
  styles: ActivityCardStyles;
  card: BattleFinalistCard;
  maxVoteCount: number;
  isLeader: boolean;
  index: number;
}

function ActivityCardComponent(props: ActivityCardComponentProps): ReactNode {
  const totalVotes = props.maxVoteCount > 0 ? props.maxVoteCount : 1;
  const voteRatio = props.card.voteCount / totalVotes;
  const barWidthPercent = Math.max(
    VOTE_BAR_MIN_WIDTH_PERCENT,
    Math.round(voteRatio * VOTE_BAR_MAX_WIDTH_PERCENT),
  );
  const barWidth: DimensionValue = `${barWidthPercent}%` as DimensionValue;

  return (
    <Animated.View entering={FadeInDown.delay(props.index * 60).duration(300).springify()}>
      <View style={props.styles.container}>
        <Image
          source={{ uri: props.card.imageUrl }}
          style={props.styles.image}
          contentFit="cover"
          transition={200}
        />
        <View style={props.styles.infoArea}>
          <CustomTextField styles={props.styles.titleText} title={props.card.title} numberOfLines={1} />
          {props.card.venue !== '' && (
            <CustomTextField styles={props.styles.venueText} title={props.card.venue} numberOfLines={1} />
          )}
          <View style={props.styles.progressBarTrack}>
            <View style={[props.styles.progressBarFill, { width: barWidth }]} />
          </View>
          <CustomTextField
            styles={props.styles.voteCountText}
            title={t('voteBattle.votesLabel', { count: props.card.voteCount })}
          />
        </View>
        <View style={[
          props.styles.radioOuter,
          props.isLeader ? props.styles.radioOuterActive : undefined,
        ]}>
          {props.isLeader && <View style={props.styles.radioInner} />}
        </View>
      </View>
    </Animated.View>
  );
}

interface PlayToVoteButtonProps {
  styles: PlayToVoteButtonStyles;
  onPress: () => void;
}

function PlayToVoteButton(props: PlayToVoteButtonProps): ReactNode {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: PULSE_DURATION_IN_MS / 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: PULSE_DURATION_IN_MS / 2, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable style={props.styles.container} onPress={props.onPress}>
        <CustomTextField styles={props.styles.text} title={t('voteBattle.playToVote')} />
      </Pressable>
    </Animated.View>
  );
}

interface AlreadyPlayedBannerProps {
  styles: AlreadyPlayedBannerStyles;
  won?: boolean;
  isCurrentlyFastest: boolean;
  isReactionGame: boolean;
  isExpired?: boolean;
}

function AlreadyPlayedBanner(props: AlreadyPlayedBannerProps): ReactNode {
  let containerStyle: object = props.styles.container;
  let message = '';

  if (props.isExpired === true) {
    containerStyle = { ...props.styles.container, ...props.styles.containerExpired };
    message = 'Voting has closed for this battle.';
  } else if (props.won === false) {
    containerStyle = { ...props.styles.container, ...props.styles.containerForfeited };
    message = 'VOTE FORFEITED';
  } else if (props.isReactionGame) {
    containerStyle = { ...props.styles.container, ...props.styles.containerLocked };
    message = props.isCurrentlyFastest ? 'YOU ARE THE FASTEST ⚡' : 'YOUR VOTE IS LOCKED IN';
  } else {
    containerStyle = { ...props.styles.container, ...props.styles.containerLocked };
    message = 'VOTED ✓';
  }

  return (
    <View style={containerStyle}>
      <CustomTextField styles={props.styles.text} title={message} />
    </View>
  );
}

// ── Sub-components: Stage 2 — Rock Paper Scissors ──

interface RpsGameComponentProps {
  styles: RpsStyles;
  state: RpsGameState;
  onChoose: (choice: RpsChoice) => void;
}

function RpsGameComponent(props: RpsGameComponentProps): ReactNode {
  const { state } = props;

  if (state.phase === 'FINAL') {
    const wins = state.roundResults.filter((r) => r === 'WIN').length;
    const won = wins >= 2;
    return (
      <SafeAreaView style={props.styles.container}>
        <CustomTextField styles={props.styles.gameHeader} title="ROCK PAPER SCISSORS" />
        <CustomTextField styles={props.styles.gameSubtitle} title="Best of 3 — win to unlock your vote" />
        <CustomTextField
          styles={won ? props.styles.resultBanner : [props.styles.resultBanner, props.styles.resultBannerLose]}
          title={won ? 'YOU WIN! 🏆' : 'YOU LOSE 😬'}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={props.styles.container}>
      <CustomTextField styles={props.styles.gameHeader} title="ROCK PAPER SCISSORS" />
      <CustomTextField styles={props.styles.gameSubtitle} title="Best of 3 — win to unlock your vote" />
      <CustomTextField
        styles={props.styles.roundLabel}
        title={`ROUND ${state.currentRound} OF 3`}
      />

      {state.phase === 'COUNTDOWN' && state.countdown > 0 && (
        <Animated.View entering={FadeIn.duration(150)}>
          <CustomTextField styles={props.styles.countdownText} title={String(state.countdown)} />
        </Animated.View>
      )}

      {state.phase === 'CHOOSING' && (
        <Animated.View entering={FadeInDown.duration(300).springify()} style={{ width: '100%' }}>
          <Pressable style={props.styles.choiceButton} onPress={() => props.onChoose('ROCK')}>
            <Text style={props.styles.choiceEmoji}>{'🪨'}</Text>
            <CustomTextField styles={props.styles.choiceLabel} title="ROCK" />
          </Pressable>
          <Pressable style={props.styles.choiceButton} onPress={() => props.onChoose('PAPER')}>
            <Text style={props.styles.choiceEmoji}>{'🖐️'}</Text>
            <CustomTextField styles={props.styles.choiceLabel} title="PAPER" />
          </Pressable>
          <Pressable style={props.styles.choiceButton} onPress={() => props.onChoose('SCISSORS')}>
            <Text style={props.styles.choiceEmoji}>{'✂️'}</Text>
            <CustomTextField styles={props.styles.choiceLabel} title="SCISSORS" />
          </Pressable>
        </Animated.View>
      )}

      {state.phase === 'RESULT' && state.lastRoundResult != null && (
        <Animated.View entering={FadeIn.duration(200)} style={{ alignItems: 'center' }}>
          <CustomTextField
            styles={
              state.lastRoundResult === 'WIN'
                ? props.styles.resultBanner
                : state.lastRoundResult === 'DRAW'
                  ? [props.styles.resultBanner, props.styles.resultBannerDraw]
                  : [props.styles.resultBanner, props.styles.resultBannerLose]
            }
            title={state.lastRoundResult === 'WIN' ? 'WIN!' : state.lastRoundResult === 'DRAW' ? 'DRAW — REPLAY' : 'LOSE!'}
          />
          {state.appChoice != null && (
            <CustomTextField
              styles={props.styles.appChoiceLabel}
              title={`App chose: ${state.appChoice}`}
            />
          )}
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

// ── Sub-components: Stage 2 — Trivia ──

interface TriviaGameComponentProps {
  styles: TriviaStyles;
  state: TriviaGameState;
  onAnswer: (index: number) => void;
}

function TriviaGameComponent(props: TriviaGameComponentProps): ReactNode {
  const { state } = props;
  const question = TRIVIA_QUESTIONS[state.questionIndex];
  if (question == null) return null;

  return (
    <SafeAreaView style={props.styles.container}>
      <CustomTextField styles={props.styles.header} title="PLANET TRIVIA" />
      {state.selectedAnswer == null && (
        <CustomTextField styles={props.styles.timerText} title={String(state.timeRemainingInSeconds)} />
      )}
      <CustomTextField styles={props.styles.questionText} title={question.question} />
      {question.answers.map((answer, index) => {
        const isSelected = state.selectedAnswer === index;
        const isCorrectAnswer = index === question.correctIndex;

        let buttonStyle = props.styles.answerButton;
        let textStyle = props.styles.answerText;

        if (state.selectedAnswer != null) {
          if (isSelected && state.isCorrect === true) {
            buttonStyle = { ...props.styles.answerButton, ...props.styles.answerButtonCorrect };
            textStyle = { ...props.styles.answerText, ...props.styles.answerTextSelected };
          } else if (isSelected && state.isCorrect === false) {
            buttonStyle = { ...props.styles.answerButton, ...props.styles.answerButtonWrong };
            textStyle = { ...props.styles.answerText, ...props.styles.answerTextSelected };
          } else if (!isSelected && isCorrectAnswer && state.isCorrect === false) {
            // Show the correct answer when user got it wrong
            buttonStyle = { ...props.styles.answerButton, ...props.styles.answerButtonCorrect };
            textStyle = { ...props.styles.answerText, ...props.styles.answerTextSelected };
          }
        }

        return (
          <Pressable
            key={index}
            style={buttonStyle}
            onPress={() => props.onAnswer(index)}
            disabled={state.selectedAnswer != null}
          >
            <CustomTextField styles={textStyle} title={answer} />
          </Pressable>
        );
      })}
      {state.selectedAnswer != null && (
        <CustomTextField
          styles={state.isCorrect ? props.styles.resultText : [props.styles.resultText, props.styles.resultTextWrong]}
          title={state.isCorrect ? 'CORRECT! Vote unlocked.' : 'WRONG! Vote forfeited.'}
        />
      )}
    </SafeAreaView>
  );
}

// ── Sub-components: Stage 2 — Reaction Time ──

interface ReactionGameComponentProps {
  styles: ReactionStyles;
  state: ReactionGameState;
  onTap: () => void;
  onLockInVote: () => void;
  onBackToBattle: () => void;
}

function ReactionGameComponent(props: ReactionGameComponentProps): ReactNode {
  const { state } = props;

  if (state.phase === 'TAP_NOW') {
    return (
      <Pressable
        style={[props.styles.container, props.styles.containerGreen]}
        onPress={props.onTap}
      >
        <CustomTextField styles={props.styles.tapNowText} title="TAP NOW!" />
      </Pressable>
    );
  }

  if (state.phase === 'TOO_EARLY') {
    return (
      <SafeAreaView style={[props.styles.container, props.styles.containerRed]}>
        <CustomTextField
          styles={[props.styles.tooEarlyText, { color: '#FFF5EC' }]}
          title="TOO EARLY"
        />
        <CustomTextField
          styles={[props.styles.tooEarlyText, { color: '#FFF5EC', marginTop: 8 }]}
          title="Vote forfeited"
        />
      </SafeAreaView>
    );
  }

  if (state.phase === 'DONE') {
    const timeStr = state.reactionTimeInMs != null
      ? `${(state.reactionTimeInMs / 1000).toFixed(3)}s`
      : '';
    const hasLeaderboard = state.leaderboard.length > 0;
    const isFirst = state.leaderboard.length === 1 && state.leaderboard[0]?.isCurrentUser === true;
    const isFastest = state.isCurrentlyFastest;
    const fastestEntry = state.leaderboard.length > 0 ? state.leaderboard[0] : undefined;

    return (
      <SafeAreaView style={[props.styles.container, { justifyContent: 'flex-start' }]}>
        <View style={[props.styles.resultWrapper, { justifyContent: 'space-between' }]}>
          <View>
            {/* Your time */}
            <CustomTextField styles={props.styles.yourTimeLabel} title="YOUR TIME" />
            <CustomTextField styles={props.styles.yourTimeValue} title={timeStr} />

            {/* Status messaging — shown once leaderboard data is available */}
            {hasLeaderboard && isFastest && isFirst && (
              <>
                <CustomTextField styles={props.styles.statusHeadline} title="YOU'RE FIRST ⚡" />
                <CustomTextField
                  styles={props.styles.statusSubtext}
                  title="Beat by anyone and your vote is gone — defend your time!"
                />
              </>
            )}
            {hasLeaderboard && isFastest && !isFirst && (
              <>
                <CustomTextField styles={props.styles.statusHeadline} title="YOU ARE THE FASTEST ⚡" />
                <CustomTextField
                  styles={props.styles.statusSubtext}
                  title="Hold your position — others are still playing"
                />
              </>
            )}
            {hasLeaderboard && !isFastest && fastestEntry != null && (
              <CustomTextField
                styles={{ fontFamily: 'strenuous', fontSize: 16, color: '#FF5C4D', textAlign: 'center', marginTop: 12 }}
                title={`Not the fastest this time — ${fastestEntry.displayName} holds the record at ${(fastestEntry.reactionTimeInMs / 1000).toFixed(3)}s. Your vote has been forfeited.`}
              />
            )}

            {/* Leaderboard */}
            {hasLeaderboard && (
              <>
                <CustomTextField styles={props.styles.leaderboardLabel} title="GROUP LEADERBOARD" />
                {state.leaderboard.map((entry, index) => (
                  <View
                    key={index}
                    style={[
                      props.styles.leaderboardRow,
                      entry.isCurrentUser ? props.styles.leaderboardRowMe : undefined,
                    ]}
                  >
                    {entry.isCurrentUser && <View style={props.styles.leaderboardLeftBar} />}
                    <View style={props.styles.leaderboardContent}>
                      <CustomTextField
                        styles={props.styles.leaderboardRank}
                        title={String(index + 1)}
                      />
                      <CustomTextField
                        styles={props.styles.leaderboardName}
                        title={entry.displayName}
                        numberOfLines={1}
                      />
                      <CustomTextField
                        styles={props.styles.leaderboardTime}
                        title={`${(entry.reactionTimeInMs / 1000).toFixed(3)}s`}
                      />
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>

          {/* Bottom buttons — pinned to bottom with 40px padding */}
          <View style={props.styles.buttonsArea}>
            {isFastest ? (
              <>
                <Pressable style={props.styles.lockInButton} onPress={props.onLockInVote}>
                  <CustomTextField styles={props.styles.lockInButtonText} title="LOCK IN VOTE 🚀" />
                </Pressable>
                <Pressable onPress={props.onBackToBattle}>
                  <CustomTextField styles={props.styles.secondaryLinkText} title="Back to Battle" />
                </Pressable>
              </>
            ) : (
              <>
                <Pressable style={props.styles.backBattleButton} onPress={props.onBackToBattle}>
                  <CustomTextField styles={props.styles.backBattleButtonText} title="BACK TO BATTLE" />
                </Pressable>
                <CustomTextField styles={props.styles.secondaryLinkText} title="Keep Watching" />
              </>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // READY or WAITING — tap anywhere to register (but tapping WAITING triggers too early)
  return (
    <Pressable
      style={props.styles.container}
      onPress={state.phase === 'WAITING' ? props.onTap : undefined}
    >
      <CustomTextField styles={props.styles.readyText} title="GET READY..." />
      <CustomTextField styles={props.styles.hintText} title="Tap when the screen turns green" />
    </Pressable>
  );
}

// ── Sub-components: Win Screen ──

interface WinScreenComponentProps {
  styles: WinScreenStyles;
  finalists: BattleFinalistCard[];
  selectedActivityId?: string;
  onSelectActivity: (activityId: string) => void;
  onConfirmVote: () => void;
}

function WinScreenComponent(props: WinScreenComponentProps): ReactNode {
  return (
    <SafeAreaView style={props.styles.container}>
      <Text style={props.styles.emoji}>{'🏆'}</Text>
      <CustomTextField styles={props.styles.title} title="VOTE UNLOCKED!" />
      <CustomTextField styles={props.styles.subtitle} title="Now pick your activity" />
      {props.finalists.map((card) => {
        const isSelected = props.selectedActivityId === card.id;
        return (
          <Pressable
            key={card.id}
            style={[
              props.styles.activityCard,
              isSelected ? props.styles.activityCardSelected : undefined,
            ]}
            onPress={() => props.onSelectActivity(card.id)}
          >
            <Image
              source={{ uri: card.imageUrl }}
              style={props.styles.activityImage}
              contentFit="cover"
              transition={200}
            />
            <View style={{ flex: 1, gap: 2 }}>
              <CustomTextField styles={props.styles.activityTitle} title={card.title} numberOfLines={1} />
              {card.venue !== '' && (
                <CustomTextField styles={props.styles.activityVenue} title={card.venue} numberOfLines={1} />
              )}
            </View>
            <View style={[
              props.styles.radioOuter,
              isSelected ? props.styles.radioOuterActive : undefined,
            ]}>
              {isSelected && <View style={props.styles.radioInner} />}
            </View>
          </Pressable>
        );
      })}
      <View style={{ width: '100%' }}>
        <CustomButton
          onPress={props.onConfirmVote}
          title={t('voteBattle.confirmVote')}
          styles={props.styles.confirmButton}
          disabled={props.selectedActivityId == null}
        />
      </View>
    </SafeAreaView>
  );
}

// ── Sub-components: Forfeit Screen ──

interface ForfeitScreenComponentProps {
  styles: ForfeitScreenStyles;
  onBack: () => void;
}

function ForfeitScreenComponent(props: ForfeitScreenComponentProps): ReactNode {
  return (
    <SafeAreaView style={props.styles.container}>
      <Text style={props.styles.emoji}>{'😬'}</Text>
      <CustomTextField styles={props.styles.title} title="VOTE FORFEITED" />
      <CustomTextField styles={props.styles.subtitle} title="Better luck next time" />
      <View style={{ width: '100%', paddingHorizontal: 0 }}>
        <CustomButton
          onPress={props.onBack}
          title={t('voteBattle.backToBattle')}
          styles={props.styles.backButton}
        />
      </View>
    </SafeAreaView>
  );
}

// ── Sub-components: Stage 3 — Result Screen ──

function ConfettiParticle(props: { left: string; color: string; delay: number; size: number }): ReactNode {
  const translateY = useSharedValue(-20);

  useEffect(() => {
    translateY.value = withTiming(320, {
      duration: 2500 + props.delay,
      easing: Easing.out(Easing.quad),
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: props.left as any,
          width: props.size,
          height: props.size,
          borderRadius: props.size / 2,
          backgroundColor: props.color,
        },
        animatedStyle,
      ]}
    />
  );
}

interface ResultScreenComponentProps {
  styles: ResultScreenStyles;
  finalists: BattleFinalistCard[];
  maxVoteCount: number;
  winnerTitle: string;
  winnerVenue: string;
  groupName: string;
  groupId: string;
  showConfetti: boolean;
  onShareInvite: (imageUri?: string) => void;
  onBackToCrew: () => void;
}

function ResultScreenComponent(props: ResultScreenComponentProps): ReactNode {
  const confettiParticles = props.showConfetti
    ? Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        color: i % 2 === 0 ? '#CFFF47' : '#FF5C4D',
        delay: Math.random() * 500,
        size: 4 + Math.random() * 8,
      }))
    : [];

  function handleShareInvite(): void {
    try {
      Share.share({
        title: "Planet — Tonight's Plan",
        message: "We're heading to " + props.winnerTitle + " at " + props.winnerVenue + " tonight! Get on the same planet. 🌍\n\nJoin us: https://planet.app/join/" + props.groupId,
      }).catch((err) => {
        console.error('handleShareInvite error:', err);
      });
    } catch (err) {
      console.error('handleShareInvite error:', err);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1B2A4A' }}>
      {/* Confetti overlay */}
      {props.showConfetti && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 300, overflow: 'hidden', zIndex: 10 }}>
          {confettiParticles.map((p) => (
            <ConfettiParticle key={p.id} left={p.left} color={p.color} delay={p.delay} size={p.size} />
          ))}
        </View>
      )}

      <View style={props.styles.container}>
        <CustomTextField styles={props.styles.winnerTitle} title={props.winnerTitle} />
        {props.winnerVenue !== '' && (
          <CustomTextField styles={props.styles.winnerVenue} title={props.winnerVenue} />
        )}
        <CustomTextField styles={props.styles.planSetText} title={t('voteBattle.tonightsPlanIsSet')} />

        <View style={{ width: '100%' }}>
          {props.finalists.map((card) => {
            const totalVotes = props.maxVoteCount > 0 ? props.maxVoteCount : 1;
            const voteRatio = card.voteCount / totalVotes;
            const barWidthPercent = Math.max(
              VOTE_BAR_MIN_WIDTH_PERCENT,
              Math.round(voteRatio * VOTE_BAR_MAX_WIDTH_PERCENT),
            );
            const barWidth: DimensionValue = `${barWidthPercent}%` as DimensionValue;

            return (
              <View key={card.id} style={props.styles.voteRow}>
                <CustomTextField styles={props.styles.voteRowName} title={card.title} />
                <View style={props.styles.voteBarTrack}>
                  <View style={[props.styles.voteBarFill, { width: barWidth }]} />
                </View>
                <CustomTextField
                  styles={props.styles.voteRowCount}
                  title={t('voteBattle.votesLabel', { count: card.voteCount })}
                />
              </View>
            );
          })}
        </View>

        <LinearGradient
          colors={['#FF5C4D', '#FF9A3C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: '100%', height: 52, borderRadius: 14, marginTop: 24 }}
        >
          <Pressable
            style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
            onPress={handleShareInvite}
          >
            <CustomTextField
              styles={{ fontFamily: 'strenuous', fontWeight: '700', color: '#FFF5EC', fontSize: 16 }}
              title={t('voteBattle.shareInvite')}
            />
          </Pressable>
        </LinearGradient>

        <Pressable onPress={props.onBackToCrew}>
          <CustomTextField styles={props.styles.backLink} title={t('voteBattle.backToCrew')} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ── Main Container ──

export default function BattleContainer(props: BattleProps): ReactNode {
  const {
    styles,
    headerStyles,
    memberStatusStyles,
    activityCardStyles,
    playToVoteButtonStyles,
    alreadyPlayedBannerStyles,
    rpsStyles,
    triviaStyles,
    reactionStyles,
    winScreenStyles,
    forfeitScreenStyles,
    resultScreenStyles,
  } = useBattleStyles();

  const battle = useBattle(props);
  // battle.currentUserGameType used for AlreadyPlayedBanner to detect reaction game

  if (battle.isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
          <ActivityIndicator size="large" color="#FF5C4D" />
        </View>
      </SafeAreaView>
    );
  }

  // ── Stage 3: Result Screen ──
  if (battle.stage === 'RESULT') {
    return (
      <ResultScreenComponent
        styles={resultScreenStyles}
        finalists={battle.finalists}
        maxVoteCount={battle.maxVoteCount}
        winnerTitle={battle.winnerTitle}
        winnerVenue={battle.winnerVenue}
        groupName={battle.groupName}
        groupId={battle.groupId}
        showConfetti={battle.showConfetti}
        onShareInvite={battle.onShareInvite}
        onBackToCrew={battle.onGoBack}
      />
    );
  }

  // ── Stage 2: RPS Game ──
  if (battle.stage === 'RPS_GAME') {
    return (
      <RpsGameComponent
        styles={rpsStyles}
        state={battle.rpsState}
        onChoose={battle.onRpsChoose}
      />
    );
  }

  // ── Stage 2: Trivia Game ──
  if (battle.stage === 'TRIVIA_GAME') {
    return (
      <TriviaGameComponent
        styles={triviaStyles}
        state={battle.triviaState}
        onAnswer={battle.onTriviaAnswer}
      />
    );
  }

  // ── Stage 2: Reaction Time Game ──
  if (battle.stage === 'REACTION_GAME') {
    return (
      <ReactionGameComponent
        styles={reactionStyles}
        state={battle.reactionState}
        onTap={battle.onReactionTap}
        onLockInVote={battle.onLockInVote}
        onBackToBattle={battle.onBackToBattle}
      />
    );
  }

  // ── Win Screen ──
  if (battle.stage === 'WIN_SCREEN') {
    return (
      <WinScreenComponent
        styles={winScreenStyles}
        finalists={battle.finalists}
        selectedActivityId={battle.selectedVoteActivityId}
        onSelectActivity={battle.onSelectVoteActivity}
        onConfirmVote={battle.onConfirmVote}
      />
    );
  }

  // ── Forfeit Screen ──
  if (battle.stage === 'FORFEIT_SCREEN') {
    return (
      <ForfeitScreenComponent
        styles={forfeitScreenStyles}
        onBack={battle.onBackToBattle}
      />
    );
  }

  // ── Stage 1: Ranked List View ──
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <BattleHeader
          styles={headerStyles}
          groupName={battle.groupName}
          timeRemainingLabel={battle.timeRemainingLabel}
          onGoBack={battle.onGoBack}
        />

        <View style={{ height: 12 }} />

        <MemberStatusSection
          styles={memberStatusStyles}
          members={battle.members}
          votedCount={battle.votedCount}
          totalCount={battle.totalCount}
        />

        <View style={{ height: 12 }} />

        {battle.finalists.map((card, index) => (
          <ActivityCardComponent
            key={card.id}
            styles={activityCardStyles}
            card={card}
            maxVoteCount={battle.maxVoteCount}
            isLeader={card.id === battle.leaderActivityId}
            index={index}
          />
        ))}

        <View style={{ flex: 1 }} />

        {/* Bottom CTA — PLAY TO VOTE, already-played status, or expired notice */}
        {battle.hasAlreadyPlayedGame ? (
          <AlreadyPlayedBanner
            styles={alreadyPlayedBannerStyles}
            won={battle.currentUserGameWon}
            isCurrentlyFastest={battle.isCurrentlyFastest}
            isReactionGame={battle.currentUserGameType === 'REACTION_TIME'}
          />
        ) : battle.isTimerExpired ? (
          <AlreadyPlayedBanner
            styles={alreadyPlayedBannerStyles}
            isCurrentlyFastest={false}
            isReactionGame={false}
            isExpired={true}
          />
        ) : (
          <PlayToVoteButton
            styles={playToVoteButtonStyles}
            onPress={battle.onPlayToVote}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

/**
 * Main container for the Results route — Battle results and tonight's plan celebration
 */

import { type ReactNode, useMemo } from 'react';
import 'react-native-reanimated';
import Animated, {
  FadeInDown,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Pressable, ScrollView, useWindowDimensions, type ViewStyle, type TextStyle } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Calendar,
  Globe,
  Eye,
  Share2,
  Swords,
  Trophy,
  PartyPopper,
  Download,
  Loader,
  AlertTriangle,
  Gift,
  X,
} from 'lucide-react-native';

// ── Background images (same as invite card) ──

const BG_SOLO_1 = require('@/assets/images/invite-bg-solo-1.png');
const BG_SOLO_2 = require('@/assets/images/invite-bg-solo-2.png');
const BG_MERGE = require('@/assets/images/invite-bg-merge.png');

import { t } from '@/i18n';
import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import { CustomButton } from '@/comp-lib/core/custom-button/CustomButton';
import { useResultsStyles } from './ResultsStyles';
import {
  useResults,
  type RunnerUpActivity,
  type MemberVoteResult,
  type VenueTimingStep,
  type ConfettiParticle,
  type PersonalDealData,
} from './ResultsFunc';
import { ResultsProps } from '@/app/group/[groupId]/results';
import InviteCardModal from '@/comp-app/InviteCardModal';
import {
  type ResultsHeaderStyles,
  type HeroTitleStyles,
  type WinnerCardStyles,
  type RunnerUpCardStyles,
  type MemberVoteSectionStyles,
  type TimelineSectionStyles,
  type SectionTitleStyles,
  type DealModalStyles,
} from './ResultsStyles';

// ── Constants ──

const STAGGER_DELAY_IN_MS = 80;
const HERO_GRADIENT_COLORS: [string, string] = ['#FF5C4D', '#FF9A3C'];
const HERO_GRADIENT_START = { x: 0, y: 0 };
const HERO_GRADIENT_END = { x: 0.8, y: 0.6 };
const CELEBRATION_EMOJI = '🎉';
const DEFEATED_EMOJI = '😤';
const QR_CODE_SIZE = 200;
const QR_CODE_COLOR = '#1B2A4A';
const HEADER_ICON_COLOR = '#FFF5EC';
const HEADER_ICON_SIZE = 22;
const HERO_ICON_SIZE = 26;
const HERO_ICON_COLOR = '#CFFF47';
const LOADING_ICON_SIZE = 32;
const LOADING_ICON_COLOR = '#FF5C4D';
const ERROR_ICON_SIZE = 32;
const ERROR_ICON_COLOR = '#FF5C4D';
const CENTERED_CONTAINER: ViewStyle = { flex: 1, justifyContent: 'center', alignItems: 'center' };
const ERROR_CONTAINER: ViewStyle = { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 };
const ERROR_ICON_WRAPPER: ViewStyle = { width: ERROR_ICON_SIZE, height: ERROR_ICON_SIZE, marginBottom: 12 };
const ERROR_MESSAGE_TEXT: TextStyle = { textAlign: 'center', fontSize: 16, lineHeight: 22, color: '#FFF5EC' };

// ── Sub-components ──

interface ConfettiPieceProps {
  particle: ConfettiParticle;
  screenWidth: number;
}

function ConfettiPiece(props: ConfettiPieceProps): ReactNode {
  const leftPosition = (props.particle.startX / 100) * props.screenWidth;
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      props.particle.delayInMs,
      withTiming(props.particle.endY, {
        duration: props.particle.durationInMs,
        easing: Easing.out(Easing.quad),
      }),
    );
    translateX.value = withDelay(
      props.particle.delayInMs,
      withTiming(props.particle.endX, {
        duration: props.particle.durationInMs,
        easing: Easing.out(Easing.quad),
      }),
    );
    rotate.value = withDelay(
      props.particle.delayInMs,
      withTiming(props.particle.rotationDeg, {
        duration: props.particle.durationInMs,
        easing: Easing.linear,
      }),
    );
    opacity.value = withDelay(
      props.particle.delayInMs + props.particle.durationInMs * 0.6,
      withTiming(0, { duration: props.particle.durationInMs * 0.4 }),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: leftPosition,
          top: props.particle.startY,
          width: props.particle.size,
          height: props.particle.size,
          borderRadius: props.particle.size > 9 ? 2 : props.particle.size / 2,
          backgroundColor: props.particle.color,
        },
        animatedStyle,
      ]}
    />
  );
}

interface ResultsHeaderProps {
  styles: ResultsHeaderStyles;
  groupName: string;
  onGoBack: () => void;
}

function ResultsHeader(props: ResultsHeaderProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <Pressable style={props.styles.backButton} onPress={props.onGoBack}>
        <View style={props.styles.backIcon}>
          <ArrowLeft size={HEADER_ICON_SIZE} color={HEADER_ICON_COLOR} />
        </View>
      </Pressable>
      <View style={props.styles.titleArea}>
        <CustomTextField
          styles={props.styles.titleText}
          title={props.groupName}
          numberOfLines={1}
        />
      </View>
      <View style={props.styles.placeholder} />
    </View>
  );
}

interface HeroTitleComponentProps {
  styles: HeroTitleStyles;
}

function HeroTitleComponent(props: HeroTitleComponentProps): ReactNode {
  return (
    <Animated.View entering={FadeIn.duration(600)} style={props.styles.container}>
      <View style={props.styles.row}>
        <View style={props.styles.iconWrapper}>
          <Trophy size={HERO_ICON_SIZE} color={HERO_ICON_COLOR} />
        </View>
        <CustomTextField
          styles={props.styles.text}
          title={t('results.tonightsPlan')}
        />
        <View style={props.styles.iconWrapper}>
          <PartyPopper size={HERO_ICON_SIZE} color={HERO_ICON_COLOR} />
        </View>
      </View>
    </Animated.View>
  );
}

interface WinnerCardComponentProps {
  styles: WinnerCardStyles;
  activityName: string;
  activityType: string;
  imageUrl: string;
  location: string;
  eventDate: string;
  scheduledEventTime: string;
  voteCount: number;
  isMergeActive: boolean;
}

const WINNER_CARD_DETAIL_ICON_SIZE = 12;
const WINNER_CARD_ORBIT_ICON_SIZE = 14;

function WinnerCardComponent(props: WinnerCardComponentProps): ReactNode {
  const bgImage = useMemo(() => {
    if (props.isMergeActive) return BG_MERGE;
    return Math.random() < 0.5 ? BG_SOLO_1 : BG_SOLO_2;
  }, [props.isMergeActive]);

  const hasPhoto = props.imageUrl !== '';

  return (
    <Animated.View entering={FadeInDown.duration(500).springify()}>
      {/* Invite-style card */}
      <View style={props.styles.container}>
        {/* Background image */}
        <Image
          source={bgImage}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          contentFit="cover"
        />
        {/* Dark overlay */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
          }}
        />
        {/* WINNER badge — top-left, absolute */}
        <View
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 10,
            backgroundColor: '#CFFF47',
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 4,
          }}
        >
          <CustomTextField
            styles={{
              fontFamily: 'tt-autonomous-mono',
              fontSize: 11,
              fontWeight: '700',
              color: '#2D2D2D',
            }}
            title={t('results.winnerLabel')}
          />
        </View>

        {/* Card content */}
        <View style={{ paddingHorizontal: 12 }}>
          {/* COSMIC YES? */}
          <View style={{ alignItems: 'center', marginTop: 24 }}>
            <CustomTextField
              styles={{
                fontFamily: 'comba',
                fontSize: 28,
                color: '#FFF5EC',
                textAlign: 'center',
                letterSpacing: 1.4,
              }}
              title="COSMIC YES?"
            />
          </View>
          {/* Divider */}
          <View
            style={{ height: 1, backgroundColor: 'rgba(255, 245, 236, 0.3)', marginTop: 10 }}
          />

          {/* Activity photo */}
          <View style={{ marginTop: 12 }}>
            {hasPhoto ? (
              <Image
                source={{ uri: props.imageUrl }}
                style={{ width: '100%', height: 140, borderRadius: 12 }}
                contentFit="cover"
                transition={300}
              />
            ) : (
              <View
                style={{
                  width: '100%',
                  height: 140,
                  borderRadius: 12,
                  backgroundColor: '#FF5C4D',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CustomTextField
                  styles={{
                    fontFamily: 'comba',
                    fontSize: 24,
                    color: '#FFF5EC',
                    textAlign: 'center',
                    paddingHorizontal: 12,
                  }}
                  title={props.activityName}
                  numberOfLines={3}
                />
              </View>
            )}
          </View>

          {/* Activity details */}
          <View style={{ alignItems: 'center', marginTop: 14, gap: 3 }}>
            <CustomTextField
              styles={{
                fontFamily: 'comba',
                fontSize: 22,
                color: '#FFF5EC',
                textAlign: 'center',
                lineHeight: 26,
              }}
              title={props.activityName}
              numberOfLines={2}
            />
            <CustomTextField
              styles={{
                fontFamily: 'strenuous',
                fontSize: 14,
                color: 'rgba(255, 245, 236, 0.8)',
                textAlign: 'center',
              }}
              title={props.activityType}
              numberOfLines={1}
            />
            {props.eventDate !== '' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 }}>
                <Calendar size={WINNER_CARD_DETAIL_ICON_SIZE} color="#CFFF47" />
                <CustomTextField
                  styles={{ fontFamily: 'tt-autonomous-mono', fontSize: 12, color: '#CFFF47' }}
                  title={props.eventDate}
                />
              </View>
            )}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                marginTop: props.eventDate !== '' ? 0 : 4,
              }}
            >
              <Clock size={WINNER_CARD_DETAIL_ICON_SIZE} color="#CFFF47" />
              <CustomTextField
                styles={{ fontFamily: 'tt-autonomous-mono', fontSize: 12, color: '#CFFF47' }}
                title={props.scheduledEventTime}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <MapPin size={WINNER_CARD_DETAIL_ICON_SIZE} color="rgba(255, 245, 236, 0.7)" />
              <CustomTextField
                styles={{
                  fontFamily: 'tt-autonomous-mono',
                  fontSize: 12,
                  color: 'rgba(255, 245, 236, 0.7)',
                }}
                title={props.location}
                numberOfLines={1}
              />
            </View>
          </View>

          {/* Bottom branding */}
          <View style={{ marginTop: 16, marginBottom: 20 }}>
            <View
              style={{ height: 1, backgroundColor: 'rgba(255, 245, 236, 0.3)', marginBottom: 10 }}
            />
            <CustomTextField
              styles={{
                fontFamily: 'strenuous',
                fontSize: 12,
                color: 'rgba(255, 245, 236, 0.6)',
                textAlign: 'center',
                fontStyle: 'italic',
              }}
              title="Get on the same planet."
            />
            <CustomTextField
              styles={{
                fontFamily: 'comba',
                fontSize: 13,
                color: '#FFF5EC',
                textAlign: 'center',
                marginTop: 4,
              }}
              title="Planet"
            />
            <View style={{ alignItems: 'center', marginTop: 4 }}>
              <Globe size={WINNER_CARD_ORBIT_ICON_SIZE} color="#FF5C4D" />
            </View>
          </View>
        </View>
      </View>

      {/* Vote count below card */}
      <CustomTextField
        styles={props.styles.votesText}
        title={t('results.votesLabel', { count: props.voteCount })}
      />
    </Animated.View>
  );
}

interface SectionTitleComponentProps {
  styles: SectionTitleStyles;
  title: string;
}

function SectionTitleComponent(props: SectionTitleComponentProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <CustomTextField styles={props.styles.text} title={props.title} />
    </View>
  );
}

interface RunnerUpCardComponentProps {
  styles: RunnerUpCardStyles;
  activity: RunnerUpActivity;
  rank: number;
  index: number;
}

function RunnerUpCardComponent(props: RunnerUpCardComponentProps): ReactNode {
  return (
    <Animated.View entering={FadeInDown.delay(props.index * STAGGER_DELAY_IN_MS).duration(300).springify()}>
      <View style={props.styles.container}>
        <View style={props.styles.imageContainer}>
          <View style={props.styles.rankBadge}>
            <CustomTextField
              styles={props.styles.rankText}
              title={t('results.rankLabel', { rank: props.rank })}
            />
          </View>
          <Image
            source={{ uri: props.activity.imageUrl }}
            style={props.styles.image}
            contentFit="cover"
            transition={200}
          />
          <View style={props.styles.imageOverlay} />
        </View>

        <View style={props.styles.infoArea}>
          <CustomTextField styles={props.styles.venueName} title={props.activity.venueName} numberOfLines={1} />
          <CustomTextField styles={props.styles.activityType} title={props.activity.activityType} />
          {props.activity.dealHeadline != null && (
            <View style={props.styles.dealBadge}>
              <CustomTextField styles={props.styles.dealBadgeText} title={t('results.dealBadge')} />
            </View>
          )}
        </View>

        <CustomTextField
          styles={props.styles.votesText}
          title={t('results.votesLabel', { count: props.activity.voteCount })}
        />
      </View>
    </Animated.View>
  );
}

interface MemberVoteRowProps {
  styles: MemberVoteSectionStyles;
  member: MemberVoteResult;
  index: number;
}

function MemberVoteRow(props: MemberVoteRowProps): ReactNode {
  const isCelebrated = props.member.votedForWinner;

  return (
    <Animated.View entering={FadeInDown.delay(props.index * STAGGER_DELAY_IN_MS).duration(300)}>
      <View style={props.styles.memberRow}>
        <View style={[props.styles.avatar, isCelebrated ? props.styles.avatarCelebrated : undefined]}>
          <CustomTextField
            styles={[props.styles.avatarText, isCelebrated ? props.styles.avatarTextCelebrated : undefined]}
            title={props.member.avatarInitial}
          />
        </View>
        <View style={props.styles.infoArea}>
          <CustomTextField styles={props.styles.nameText} title={props.member.displayName} />
          <CustomTextField
            styles={[props.styles.statusText, isCelebrated ? props.styles.statusTextCelebrated : undefined]}
            title={isCelebrated ? t('results.celebratedLabel') : t('results.defeatedLabel')}
          />
        </View>
        <CustomTextField
          styles={props.styles.reactionEmoji}
          title={isCelebrated ? CELEBRATION_EMOJI : DEFEATED_EMOJI}
        />
      </View>
    </Animated.View>
  );
}

interface TimelineRowProps {
  styles: TimelineSectionStyles;
  step: VenueTimingStep;
  index: number;
  isLast: boolean;
}

function TimelineRow(props: TimelineRowProps): ReactNode {
  return (
    <Animated.View entering={FadeInDown.delay(props.index * STAGGER_DELAY_IN_MS).duration(300)}>
      <View style={props.styles.row}>
        <View style={props.styles.dot} />
        <CustomTextField styles={props.styles.timeText} title={props.step.time} />
        <CustomTextField styles={props.styles.labelText} title={props.step.label} />
      </View>
      {!props.isLast && <View style={props.styles.line} />}
    </Animated.View>
  );
}

// ── Deal Unlock Modal ──

interface DealUnlockModalProps {
  styles: DealModalStyles;
  deal: PersonalDealData;
  onClose: () => void;
}

function DealUnlockModal(props: DealUnlockModalProps): ReactNode {
  const displayCode = `${props.deal.personalCode.slice(0, 2)}·${props.deal.personalCode.slice(2)}`;

  return (
    <View style={props.styles.container}>
      {/* Header with gradient */}
      <LinearGradient
        colors={HERO_GRADIENT_COLORS}
        start={HERO_GRADIENT_START}
        end={HERO_GRADIENT_END}
        style={props.styles.header}
      >
        <View style={props.styles.badge}>
          <CustomTextField styles={props.styles.badgeText} title={t('results.dealUnlocked')} />
        </View>
        <CustomTextField styles={props.styles.headline} title={props.deal.headline} numberOfLines={2} />
        <CustomTextField styles={props.styles.subtitle} title={props.deal.venueName} numberOfLines={1} />
      </LinearGradient>

      {/* QR code overlapping header */}
      <View style={props.styles.qrWrapper}>
        <View style={props.styles.qrBackground}>
          <QRCode
            value={props.deal.qrCodeValue}
            size={QR_CODE_SIZE}
            color={QR_CODE_COLOR}
            backgroundColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Personal code */}
      <CustomTextField styles={props.styles.codeLabelText} title={t('results.yourCode')} />
      <CustomTextField styles={props.styles.codeText} title={displayCode} />
      <CustomTextField
        styles={props.styles.expiryText}
        title={t('results.validUntil', { date: props.deal.expiryDate })}
      />
      <CustomTextField styles={props.styles.hintText} title={t('results.showStaff')} />

      {/* Close button */}
      <CustomButton
        onPress={props.onClose}
        title={t('results.closeDeal')}
        styles={props.styles.closeButton}
        leftIcon={({ size, color }) => (
          <View style={{ width: size, height: size }}>
            <X size={size ?? 18} color={color as string} />
          </View>
        )}
      />
    </View>
  );
}

// ── Main Container ──

export default function ResultsContainer(props: ResultsProps): ReactNode {
  const {
    styles,
    headerStyles,
    heroTitleStyles,
    winnerCardStyles,
    runnerUpCardStyles,
    memberVoteSectionStyles,
    timelineSectionStyles,
    sectionTitleStyles,
    actionButtonsStyles,
    dealModalStyles,
    viewDetailsButtonStyles,
    sharePlanButtonStyles,
    newBattleButtonStyles,
    claimDealButtonStyles,
  } = useResultsStyles();

  const {
    isLoading,
    error,
    groupName,
    winner,
    runnerUps,
    memberVotes,
    venueTimeline,
    confettiParticles,
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
  } = useResults(props);

  const { width: screenWidth } = useWindowDimensions();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ResultsHeader styles={headerStyles} groupName={groupName} onGoBack={onGoBack} />
          <View style={CENTERED_CONTAINER}>
            <View style={{ width: LOADING_ICON_SIZE, height: LOADING_ICON_SIZE }}>
              <Loader size={LOADING_ICON_SIZE} color={LOADING_ICON_COLOR} />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error != null || winner.id === '') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ResultsHeader styles={headerStyles} groupName={groupName} onGoBack={onGoBack} />
          <View style={ERROR_CONTAINER}>
            <View style={ERROR_ICON_WRAPPER}>
              <AlertTriangle size={ERROR_ICON_SIZE} color={ERROR_ICON_COLOR} />
            </View>
            <CustomTextField
              styles={ERROR_MESSAGE_TEXT}
              title={error?.message ?? 'No battle results found for this group.'}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Confetti overlay */}
        {showConfetti && (
          <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, overflow: 'hidden' }}>
            {confettiParticles.map((particle) => (
              <ConfettiPiece key={particle.id} particle={particle} screenWidth={screenWidth} />
            ))}
          </View>
        )}

        {/* Header */}
        <ResultsHeader
          styles={headerStyles}
          groupName={groupName}
          onGoBack={onGoBack}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Tonight's Plan Title */}
          <HeroTitleComponent styles={heroTitleStyles} />

          {/* Winner Card */}
          <WinnerCardComponent
            styles={winnerCardStyles}
            activityName={winner.venueName}
            activityType={winner.activityType}
            imageUrl={winner.imageUrl}
            location={winner.distance}
            eventDate={inviteCardData.eventDate}
            scheduledEventTime={winner.scheduledEventTime}
            voteCount={winner.voteCount}
            isMergeActive={inviteCardData.isMergeActive}
          />

          {/* Claim Your Deal Button — only shown when winner has a deal */}
          {personalDeal != null && (
            <Animated.View entering={FadeInDown.delay(600).duration(400)}>
              <View style={styles.sectionGap} />
              <CustomButton
                onPress={onOpenDealModal}
                title={t('results.claimDeal')}
                styles={claimDealButtonStyles}
                leftIcon={({ size, color }) => (
                  <View style={{ width: size, height: size }}>
                    <Gift size={size ?? 20} color={color as string} />
                  </View>
                )}
              />
            </Animated.View>
          )}

          <View style={styles.sectionGap} />

          {/* View Details Button */}
          <CustomButton
            onPress={onViewDetails}
            title={t('results.viewDetails')}
            styles={viewDetailsButtonStyles}
            leftIcon={({ size, color }) => (
              <View style={{ width: size, height: size }}>
                <Eye size={size ?? 18} color={color as string} />
              </View>
            )}
          />

          <View style={actionButtonsStyles.gap} />

          {/* Share Plan Button */}
          <CustomButton
            onPress={onSharePlan}
            title={t('results.sharePlan')}
            styles={sharePlanButtonStyles}
            leftIcon={({ size, color }) => (
              <View style={{ width: size, height: size }}>
                <Share2 size={size ?? 18} color={color as string} />
              </View>
            )}
          />

          <View style={styles.sectionGap} />

          {/* Runner-Ups */}
          <SectionTitleComponent styles={sectionTitleStyles} title={t('results.runnerUpsTitle')} />
          {runnerUps.map((activity, index) => (
            <RunnerUpCardComponent
              key={activity.id}
              styles={runnerUpCardStyles}
              activity={activity}
              rank={index + 2}
              index={index}
            />
          ))}

          <View style={styles.sectionGap} />

          {/* Crew Votes */}
          <SectionTitleComponent styles={sectionTitleStyles} title={t('results.crewVotesTitle')} />
          <View style={memberVoteSectionStyles.container}>
            {memberVotes.map((member, index) => (
              <MemberVoteRow
                key={member.id}
                styles={memberVoteSectionStyles}
                member={member}
                index={index}
              />
            ))}
          </View>

          {/* Timeline / Next Steps */}
          {venueTimeline.length > 0 && (
            <>
              <View style={styles.sectionGap} />
              <SectionTitleComponent styles={sectionTitleStyles} title={t('results.nextStepsTitle')} />
              <View style={timelineSectionStyles.container}>
                {venueTimeline.map((step, index) => (
                  <TimelineRow
                    key={step.time}
                    styles={timelineSectionStyles}
                    step={step}
                    index={index}
                    isLast={index === venueTimeline.length - 1}
                  />
                ))}
              </View>
            </>
          )}

          <View style={styles.sectionGap} />

          {/* Export Invite Card */}
          <CustomButton
            onPress={onExportInviteCard}
            title={t('results.exportInvite')}
            styles={sharePlanButtonStyles}
            leftIcon={({ size, color }) => (
              <View style={{ width: size, height: size }}>
                <Download size={size ?? 18} color={color as string} />
              </View>
            )}
          />

          <View style={actionButtonsStyles.gap} />

          {/* Start New Battle */}
          <CustomButton
            onPress={onStartNewBattle}
            title={t('results.startNewBattle')}
            styles={newBattleButtonStyles}
            leftIcon={({ size, color }) => (
              <View style={{ width: size, height: size }}>
                <Swords size={size ?? 18} color={color as string} />
              </View>
            )}
          />
        </ScrollView>

        {/* Deal Unlock Modal */}
        {showDealModal && personalDeal != null && (
          <Animated.View entering={FadeIn.duration(300)} style={dealModalStyles.overlay}>
            <DealUnlockModal
              styles={dealModalStyles}
              deal={personalDeal}
              onClose={onCloseDealModal}
            />
          </Animated.View>
        )}
      </View>

      {/* Invite Card Export Modal */}
      <InviteCardModal
        visible={showInviteModal}
        data={inviteCardData}
        onClose={onCloseInviteModal}
      />
    </SafeAreaView>
  );
}

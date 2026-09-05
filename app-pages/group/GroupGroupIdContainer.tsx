/**
 * Main container for the GroupGroupId route — Group detail and lobby screen
 */

import { type ReactNode, useState, useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolateColor,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Pressable, ScrollView, Modal, Platform, TextInput, ActivityIndicator, type DimensionValue } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  MoreVertical,
  Zap,
  UserPlus,
  MessageCircle,
  Calendar,
  Camera,
  Check,
  Minus,
} from 'lucide-react-native';

import { t } from '@/i18n';
import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import { CustomButton } from '@/comp-lib/core/custom-button/CustomButton';
import { useGroupGroupIdStyles } from './GroupGroupIdStyles';
import {
  useGroupGroupId,
  getSwipeActionLabel,
  type GroupMember,
  type SwipeActivityItem,
  type RankedActivityItem,
  type BattleStatusData,
  type ChatPreviewData,
  type OverflowMenuAction,
  type PlanetAvatarType,
  type CrewReadinessMember,
} from './GroupGroupIdFunc';
import PlanetAvatar, { isPlanetAvatarUrl, getPlanetAvatarType } from '@/comp-app/PlanetAvatar';
import { GroupGroupIdProps } from '@/app/group/[groupId]';
import MergePlanetsScreen from '@/comp-app/MergePlanetsScreen';
import OrbitScreen from '@/comp-app/OrbitScreen';
import type { OrbitScreenDataV1, MergeOpportunityV1 } from '@shared/generated-db-types';
import {
  type GroupDetailHeaderStyles,
  type OverflowMenuStyles,
  type HeroSectionStyles,
  type BattleBannerStyles,
  type ActivityFeedItemStyles,
  type RankedActivityItemStyles,
  type ActionButtonsStyles,
  type ChatPreviewStyles,
  type MemberListStyles,
  type SectionHeaderStyles,
  type CrewReadinessSectionStyles,
  type LockedBattleButtonStyles,
} from './GroupGroupIdStyles';

// ── Constants ──

const PULSE_DURATION_IN_MS = 1000;
const VOTE_PROGRESS_MULTIPLIER = 100;
const STAGGER_DELAY_IN_MS = 80;

// ── Sub-components ──

interface GroupHeaderProps {
  styles: GroupDetailHeaderStyles;
  groupName: string;
  memberCount: number;
  onGoBack: () => void;
  onMenuPress: () => void;
}

function GroupHeader(props: GroupHeaderProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <Pressable style={props.styles.backButton} onPress={props.onGoBack}>
        <View style={props.styles.backIcon}>
          <ArrowLeft size={22} color="#FFF5EC" />
        </View>
      </Pressable>
      <View style={props.styles.titleArea}>
        <CustomTextField styles={props.styles.titleText} title={props.groupName} numberOfLines={1} />
        <CustomTextField
          styles={props.styles.subtitleText}
          title={t('groupDetail.membersCount', { count: props.memberCount })}
        />
      </View>
      <Pressable style={props.styles.menuButton} onPress={props.onMenuPress}>
        <View style={props.styles.menuIcon}>
          <MoreVertical size={22} color="#FFF5EC" />
        </View>
      </Pressable>
    </View>
  );
}

interface OverflowMenuComponentProps {
  styles: OverflowMenuStyles;
  isVisible: boolean;
  isOwner: boolean;
  onAction: (action: OverflowMenuAction) => void;
  onDismiss: () => void;
}

function OverflowMenuComponent(props: OverflowMenuComponentProps): ReactNode {
  if (!props.isVisible) {
    return undefined;
  }

  return (
    <Pressable style={props.styles.overlay} onPress={props.onDismiss}>
      <View style={props.styles.container}>
        <Pressable style={props.styles.menuItem} onPress={() => props.onAction('EDIT')}>
          <CustomTextField styles={props.styles.menuItemText} title={t('groupDetail.menuEdit')} />
        </Pressable>
        <Pressable style={props.styles.menuItem} onPress={() => props.onAction('LEAVE')}>
          <CustomTextField styles={props.styles.menuItemText} title={t('groupDetail.menuLeave')} />
        </Pressable>
        {props.isOwner && (
          <Pressable style={props.styles.menuItemDanger} onPress={() => props.onAction('DELETE')}>
            <CustomTextField styles={props.styles.menuItemDangerText} title={t('groupDetail.menuDelete')} />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const GROUP_DETAIL_AVATAR_SIZE = 80;

interface HeroSectionComponentProps {
  styles: HeroSectionStyles;
  photoUrl: string;
  groupName: string;
  members: GroupMember[];
}

function GroupDetailAvatar(props: { photoUrl: string; size: number }): ReactNode {
  if (isPlanetAvatarUrl(props.photoUrl) || props.photoUrl === '') {
    const planetType = getPlanetAvatarType(props.photoUrl !== '' ? props.photoUrl : undefined);
    return (
      <View style={{ width: props.size, height: props.size, borderRadius: props.size / 2, overflow: 'hidden' }}>
        <PlanetAvatar type={planetType} size={props.size} />
      </View>
    );
  }
  return (
    <Image
      source={{ uri: props.photoUrl }}
      style={{ width: props.size, height: props.size, borderRadius: props.size / 2 }}
      contentFit="cover"
      transition={300}
    />
  );
}

function HeroSectionComponent(props: HeroSectionComponentProps): ReactNode {
  const onlineMembers = props.members.filter((m) => m.isOnline);
  const onlineCount = onlineMembers.length;
  const hasRealPhoto = props.photoUrl !== '' && !isPlanetAvatarUrl(props.photoUrl);

  return (
    <View style={[props.styles.container, { height: undefined, minHeight: 200 }]}>
      {/* Background: real photo or solid dark gradient */}
      {hasRealPhoto ? (
        <Image
          source={{ uri: props.photoUrl }}
          style={[props.styles.image, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }]}
          contentFit="cover"
          transition={300}
        />
      ) : (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#243660' }} />
      )}
      <LinearGradient
        colors={['transparent', 'rgba(27, 42, 74, 0.95)']}
        style={[props.styles.gradient, { height: '100%', paddingTop: 20 }]}
      >
        {/* Group avatar — 80px circle centered */}
        <View style={{ alignItems: 'center', marginBottom: 8 }}>
          <GroupDetailAvatar photoUrl={props.photoUrl} size={GROUP_DETAIL_AVATAR_SIZE} />
        </View>

        {/* Group name */}
        <View style={{ alignItems: 'center', marginBottom: 10 }}>
          <CustomTextField
            styles={{
              fontFamily: 'strenuous',
              fontSize: 20,
              fontWeight: '700',
              color: '#FFF5EC',
              textAlign: 'center',
            }}
            title={props.groupName}
            numberOfLines={1}
          />
        </View>

        {/* Member avatar row */}
        <View style={props.styles.avatarRow}>
          {props.members.slice(0, 5).map((member) => (
            <View key={member.id} style={props.styles.avatarWrapper}>
              <View style={props.styles.avatar}>
                <CustomTextField styles={props.styles.avatarText} title={member.avatarInitial} />
              </View>
              {member.isOnline && <View style={props.styles.onlineDot} />}
            </View>
          ))}
          {onlineCount > 0 && (
            <View style={props.styles.onlineCountBadge}>
              <CustomTextField
                styles={props.styles.onlineCountText}
                title={`${onlineCount} ${t('groupDetail.online')}`}
              />
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

interface PulsingDotProps {
  dotStyle: object;
}

function PulsingDot(props: PulsingDotProps): ReactNode {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.3, { duration: PULSE_DURATION_IN_MS, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    ...(props.dotStyle),
    opacity: opacity.value,
  }));

  return <Animated.View style={animatedStyle} />;
}

interface BattleBannerComponentProps {
  styles: BattleBannerStyles;
  battleStatus: BattleStatusData;
  onJoinBattle: () => void;
  onViewResults: () => void;
}

function BattleBannerComponent(props: BattleBannerComponentProps): ReactNode {
  if (!props.battleStatus.isActive) {
    return undefined;
  }

  const voteRatio =
    props.battleStatus.totalParticipants > 0
      ? props.battleStatus.votedParticipants / props.battleStatus.totalParticipants
      : 0;
  const progressWidth: DimensionValue =
    `${Math.round(voteRatio * VOTE_PROGRESS_MULTIPLIER)}%` as DimensionValue;

  const { hasWinner } = props.battleStatus;

  return (
    <Animated.View entering={FadeInDown.duration(400).springify()}>
      <View style={props.styles.container}>
        <View style={props.styles.accentBar} />
        <View style={props.styles.content}>
          <View style={props.styles.topRow}>
            <View style={props.styles.liveTag}>
              {hasWinner ? (
                <View style={[props.styles.liveTagDot, { backgroundColor: '#CFFF47' }]} />
              ) : (
                <PulsingDot dotStyle={props.styles.liveTagDot} />
              )}
              <CustomTextField
                styles={[props.styles.liveTagText, hasWinner ? { color: '#CFFF47' } : undefined]}
                title={hasWinner ? 'PLAN SET' : t('groupDetail.battleLive')}
              />
            </View>
            {!hasWinner && (
              <CustomTextField
                styles={props.styles.timerText}
                title={t('groupDetail.battleEndsIn', { time: props.battleStatus.timeRemainingLabel })}
              />
            )}
          </View>
          <View style={props.styles.progressRow}>
            <CustomTextField
              styles={props.styles.progressText}
              title={t('groupDetail.votedProgress', {
                voted: props.battleStatus.votedParticipants,
                total: props.battleStatus.totalParticipants,
              })}
            />
            <View style={props.styles.progressBarTrack}>
              <View style={[props.styles.progressBarFill, { width: progressWidth }]} />
            </View>
          </View>
          {hasWinner ? (
            <CustomButton
              onPress={props.onViewResults}
              title="VIEW RESULTS"
              styles={props.styles.viewResultsButton}
            />
          ) : (
            <CustomButton
              onPress={props.onJoinBattle}
              title={t('groupDetail.joinBattle')}
              styles={props.styles.joinButton}
              leftIcon={({ size, color }) => (
                <View style={{ width: size, height: size }}>
                  <Zap size={size ?? 16} color={color as string} />
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Animated.View>
  );
}

interface ActivityFeedItemComponentProps {
  styles: ActivityFeedItemStyles;
  item: SwipeActivityItem;
  index: number;
}

function ActivityFeedItemComponent(props: ActivityFeedItemComponentProps): ReactNode {
  const actionLabel = getSwipeActionLabel(props.item.action);
  const isSwiping = props.item.action === 'SWIPING';

  return (
    <Animated.View entering={FadeInDown.delay(props.index * STAGGER_DELAY_IN_MS).duration(300)}>
      <View style={props.styles.container}>
        <View style={props.styles.avatarCircle}>
          <CustomTextField styles={props.styles.avatarText} title={props.item.memberInitial} />
        </View>
        <View style={props.styles.textArea}>
          <CustomTextField
            styles={props.styles.actionText}
            title={`${props.item.memberName} ${actionLabel}`}
            numberOfLines={1}
          >
            <CustomTextField styles={[props.styles.actionText, props.styles.memberNameText]} title={props.item.memberName} />
            <CustomTextField
              styles={[
                props.styles.actionText,
                isSwiping ? props.styles.swipingText : undefined,
                !isSwiping ? props.styles.boostedText : undefined,
              ]}
              title={` ${actionLabel}`}
            />
          </CustomTextField>
          {!isSwiping && (
            <CustomTextField
              styles={[props.styles.actionText, props.styles.activityNameText]}
              title={props.item.activityTitle}
              numberOfLines={1}
            />
          )}
        </View>
        <Image
          source={{ uri: props.item.activityThumbnailUrl }}
          style={props.styles.thumbnail}
          contentFit="cover"
          transition={200}
        />
        <CustomTextField styles={props.styles.timestampText} title={props.item.timestampLabel} />
      </View>
    </Animated.View>
  );
}

interface RankedActivityItemComponentProps {
  styles: RankedActivityItemStyles;
  item: RankedActivityItem;
  index: number;
  onPress: (activityId: string) => void;
}

function RankedActivityItemComponent(props: RankedActivityItemComponentProps): ReactNode {
  return (
    <Animated.View entering={FadeInDown.delay(props.index * STAGGER_DELAY_IN_MS).duration(300)}>
      <Pressable
        style={props.styles.container}
        onPress={() => props.onPress(props.item.id)}
      >
        <View style={props.styles.rankBadge}>
          <CustomTextField styles={props.styles.rankText} title={String(props.item.rank)} />
        </View>
        <Image
          source={{ uri: props.item.thumbnailUrl }}
          style={props.styles.thumbnail}
          contentFit="cover"
          transition={200}
        />
        <View style={props.styles.infoArea}>
          <CustomTextField styles={props.styles.titleText} title={props.item.title} numberOfLines={1} />
          <CustomTextField
            styles={props.styles.swipeCountText}
            title={t('groupDetail.swipesCount', { count: props.item.swipeCount })}
          />
          {props.item.hasDeal && (
            <View style={props.styles.dealBadge}>
              <CustomTextField styles={props.styles.dealBadgeText} title={t('groupDetail.dealTag')} />
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ── Crew Readiness ──

const CREW_NAME_MAX_CHARS = 6;

interface CrewAvatarProps {
  member: CrewReadinessMember;
  styles: CrewReadinessSectionStyles;
  onPress?: () => void;
}

function CrewAvatar(props: CrewAvatarProps): ReactNode {
  const firstName = props.member.displayName.split(' ')[0] ?? props.member.displayName;
  const truncatedName = firstName.length > CREW_NAME_MAX_CHARS
    ? firstName.slice(0, CREW_NAME_MAX_CHARS)
    : firstName;

  const inner = (
    <View style={{ position: 'relative' }}>
      {props.member.avatarUrl != null ? (
        <Image
          source={{ uri: props.member.avatarUrl }}
          style={props.styles.avatarImage}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={props.styles.avatar}>
          <CustomTextField styles={props.styles.avatarText} title={props.member.avatarInitial} />
        </View>
      )}
      <View style={props.member.isReady ? props.styles.statusDotReady : props.styles.statusDotNotReady} />
    </View>
  );

  return (
    <View style={props.styles.avatarWrapper}>
      {props.onPress != null ? (
        <Pressable onPress={props.onPress} hitSlop={8}>
          {inner}
        </Pressable>
      ) : (
        inner
      )}
      <CustomTextField styles={props.styles.memberNameText} title={truncatedName} />
    </View>
  );
}

interface CrewReadinessSectionProps {
  styles: CrewReadinessSectionStyles;
  members: CrewReadinessMember[];
  readyCount: number;
  threshold: number;
  onNudgeMemberPress: (userId: string) => void;
}

function CrewReadinessSection(props: CrewReadinessSectionProps): ReactNode {
  const totalCount = props.members.length;
  const isMajorityReady = props.readyCount >= props.threshold;
  const fractionLabel = `${props.readyCount}/${totalCount} READY`;

  return (
    <View style={props.styles.container}>
      <CustomTextField styles={props.styles.labelText} title={t('groupDetail.crewReadiness')} />
      <View style={props.styles.row}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}
        >
          {props.members.map((member) => (
            <CrewAvatar
              key={member.userId}
              member={member}
              styles={props.styles}
              onPress={!member.isReady ? () => props.onNudgeMemberPress(member.userId) : undefined}
            />
          ))}
        </ScrollView>
        <CustomTextField
          styles={[
            props.styles.fractionText,
            isMajorityReady ? props.styles.fractionTextMajority : props.styles.fractionTextMinority,
          ]}
          title={fractionLabel}
        />
      </View>
    </View>
  );
}

// ── Nudge Action Sheet ──

interface NudgeActionSheetProps {
  member: CrewReadinessMember;
  onConfirm: () => void;
  onDismiss: () => void;
}

function NudgeActionSheet(props: NudgeActionSheetProps): ReactNode {
  return (
    <Modal
      transparent
      animationType="slide"
      visible
      onRequestClose={props.onDismiss}
    >
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
        onPress={props.onDismiss}
      />
      <View
        style={{
          backgroundColor: '#1a2240',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 40,
        }}
      >
        {props.member.wasNudgedRecently ? (
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            <CustomTextField
              styles={{
                fontFamily: 'tt-autonomous-mono',
                fontSize: 12,
                color: 'rgba(255, 245, 236, 0.4)',
                textAlign: 'center',
              }}
              title={t('groupDetail.alreadyNudgedToday')}
            />
          </View>
        ) : (
          <>
            <Pressable
              style={{
                width: '100%',
                height: 52,
                backgroundColor: '#CFFF47',
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
              onPress={props.onConfirm}
            >
              <CustomTextField
                styles={{
                  fontFamily: 'strenuous',
                  fontWeight: '700',
                  fontSize: 16,
                  color: '#2D2D2D',
                }}
                title={t('groupDetail.nudgeConfirm')}
              />
            </Pressable>
            <Pressable
              style={{ alignItems: 'center', paddingVertical: 12 }}
              onPress={props.onDismiss}
            >
              <CustomTextField
                styles={{
                  fontFamily: 'tt-autonomous-mono',
                  fontSize: 14,
                  color: 'rgba(255, 245, 236, 0.5)',
                }}
                title="Cancel"
              />
            </Pressable>
          </>
        )}
      </View>
    </Modal>
  );
}

// ── Action Buttons with locked state ──

const BATTLE_BUTTON_ANIM_DURATION_IN_MS = 300;

interface ActionButtonsSectionProps {
  styles: ActionButtonsStyles;
  lockedStyles: LockedBattleButtonStyles;
  battleIsActive: boolean;
  isBattleButtonLocked: boolean;
  hasPlanScheduled: boolean;
  crewNeededCount: number;
  onStartOrJoinBattle: () => void;
  onInviteFriends: () => void;
  onReschedule: () => void;
}

function ActionButtonsSection(props: ActionButtonsSectionProps): ReactNode {
  const bgProgress = useSharedValue(props.isBattleButtonLocked ? 0 : 1);

  useEffect(() => {
    bgProgress.value = withTiming(props.isBattleButtonLocked ? 0 : 1, {
      duration: BATTLE_BUTTON_ANIM_DURATION_IN_MS,
    });
  }, [props.isBattleButtonLocked]);

  const animatedBattleContainerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      bgProgress.value,
      [0, 1],
      ['#243660', '#CFFF47'],
    ),
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  }));

  return (
    <View style={props.styles.container}>
      {/* Start Battle — full width on its own row */}
      {!props.battleIsActive && (
        <View style={props.lockedStyles.container}>
          <Animated.View
            style={[
              animatedBattleContainerStyle,
              props.isBattleButtonLocked
                ? { borderWidth: 2, borderColor: '#3a4a6b' }
                : undefined,
            ]}
          >
            <Pressable
              style={{ flex: 1, width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              onPress={props.onStartOrJoinBattle}
            >
              {props.isBattleButtonLocked ? (
                <CustomTextField
                  styles={props.lockedStyles.buttonText}
                  title={t('groupDetail.waitingForCrew')}
                />
              ) : (
                <>
                  <Zap size={20} color="#2D2D2D" />
                  <CustomTextField
                    styles={{
                      fontFamily: 'strenuous',
                      fontWeight: '700',
                      fontSize: 17,
                      lineHeight: 22,
                      color: '#2D2D2D',
                    }}
                    title={t('groupDetail.startBattle')}
                  />
                </>
              )}
            </Pressable>
          </Animated.View>
          {props.isBattleButtonLocked && (
            <CustomTextField
              styles={props.lockedStyles.tooltip}
              title={`Need ${props.crewNeededCount} more ${props.crewNeededCount === 1 ? 'member' : 'members'} to boost activities`}
            />
          )}
        </View>
      )}
      {/* Schedule/Reschedule + Invite Friends — side by side on second row */}
      <View style={props.styles.secondRow}>
        <CustomButton
          onPress={props.onReschedule}
          title={props.hasPlanScheduled ? 'Reschedule' : 'Schedule'}
          styles={props.styles.rescheduleButton}
          leftIcon={({ size }) => (
            <View style={{ width: size, height: size }}>
              <Calendar size={size ?? 18} color="#FFF5EC" />
            </View>
          )}
        />
        <CustomButton
          onPress={props.onInviteFriends}
          title={t('groupDetail.inviteFriends')}
          styles={props.styles.inviteButton}
          leftIcon={({ size, color }) => (
            <View style={{ width: size, height: size }}>
              <UserPlus size={size ?? 18} color={color as string} />
            </View>
          )}
        />
      </View>
    </View>
  );
}

const RESCHEDULE_DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const RESCHEDULE_MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatRescheduleDateRow(date: Date): string {
  return `${RESCHEDULE_DAY_NAMES[date.getDay()]}, ${RESCHEDULE_MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
}

function formatRescheduleTimeRow(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const amPm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = String(minutes).padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${amPm}`;
}

interface RescheduleSheetProps {
  isVisible: boolean;
  isFirstSchedule: boolean;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onConfirm: () => void;
  onDismiss: () => void;
}

function RescheduleSheet(props: RescheduleSheetProps): ReactNode {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  if (!props.isVisible) return undefined;

  return (
    <Modal
      transparent
      animationType="slide"
      visible={props.isVisible}
      onRequestClose={props.onDismiss}
    >
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
        onPress={props.onDismiss}
      />
      <View style={{
        backgroundColor: '#1a2240',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 40,
      }}>
        {/* Title */}
        <CustomTextField
          styles={{
            fontFamily: 'strenuous',
            fontWeight: '700',
            fontSize: 20,
            color: '#FFF5EC',
            marginBottom: 24,
          }}
          title={props.isFirstSchedule ? 'Schedule Plan' : 'Reschedule Plan'}
        />

        {/* Date + Time picker rows */}
        <View style={{
          backgroundColor: '#243660',
          borderRadius: 12,
          marginBottom: 20,
          overflow: 'hidden',
        }}>
          {/* Date row */}
          <Pressable
            onPress={() => { setShowDatePicker(true); setShowTimePicker(false); }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingVertical: 14,
            }}
          >
            <CustomTextField
              styles={{
                fontFamily: 'tt-autonomous-mono',
                fontSize: 13,
                color: 'rgba(255, 245, 236, 0.6)',
              }}
              title="Date"
            />
            <CustomTextField
              styles={{
                fontFamily: 'strenuous',
                fontSize: 15,
                color: '#CFFF47',
              }}
              title={formatRescheduleDateRow(props.selectedDate)}
            />
          </Pressable>

          {/* Separator */}
          <View style={{ height: 1, backgroundColor: '#3a4a6b' }} />

          {/* Time row */}
          <Pressable
            onPress={() => { setShowTimePicker(true); setShowDatePicker(false); }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingVertical: 14,
            }}
          >
            <CustomTextField
              styles={{
                fontFamily: 'tt-autonomous-mono',
                fontSize: 13,
                color: 'rgba(255, 245, 236, 0.6)',
              }}
              title="Time"
            />
            <CustomTextField
              styles={{
                fontFamily: 'strenuous',
                fontSize: 15,
                color: '#CFFF47',
              }}
              title={formatRescheduleTimeRow(props.selectedDate)}
            />
          </Pressable>
        </View>

        {/* Inline date picker (shown when tapping Date row) */}
        {showDatePicker && (
          <View style={{ backgroundColor: '#243660', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
            <DateTimePicker
              value={props.selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_event, date) => {
                if (date != null) {
                  const merged = new Date(props.selectedDate);
                  merged.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                  props.onDateChange(merged);
                }
                if (Platform.OS !== 'ios') {
                  setShowDatePicker(false);
                }
              }}
              minimumDate={new Date()}
              textColor="#FFF5EC"
              accentColor="#CFFF47"
              themeVariant="dark"
              style={{ backgroundColor: '#243660' }}
            />
            {Platform.OS === 'ios' && (
              <Pressable
                onPress={() => setShowDatePicker(false)}
                style={{ paddingVertical: 10, alignItems: 'center' }}
              >
                <CustomTextField
                  styles={{ fontFamily: 'strenuous', fontWeight: '700', fontSize: 14, color: '#CFFF47' }}
                  title="Done"
                />
              </Pressable>
            )}
          </View>
        )}

        {/* Inline time picker (shown when tapping Time row) */}
        {showTimePicker && (
          <View style={{ backgroundColor: '#243660', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
            <DateTimePicker
              value={props.selectedDate}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_event, date) => {
                if (date != null) {
                  const merged = new Date(props.selectedDate);
                  merged.setHours(date.getHours(), date.getMinutes());
                  props.onDateChange(merged);
                }
                if (Platform.OS !== 'ios') {
                  setShowTimePicker(false);
                }
              }}
              textColor="#FFF5EC"
              accentColor="#CFFF47"
              themeVariant="dark"
              style={{ backgroundColor: '#243660' }}
            />
            {Platform.OS === 'ios' && (
              <Pressable
                onPress={() => setShowTimePicker(false)}
                style={{ paddingVertical: 10, alignItems: 'center' }}
              >
                <CustomTextField
                  styles={{ fontFamily: 'strenuous', fontWeight: '700', fontSize: 14, color: '#CFFF47' }}
                  title="Done"
                />
              </Pressable>
            )}
          </View>
        )}

        {/* Confirm button */}
        <Pressable
          style={{
            width: '100%',
            height: 52,
            backgroundColor: '#CFFF47',
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}
          onPress={props.onConfirm}
        >
          <CustomTextField
            styles={{
              fontFamily: 'strenuous',
              fontWeight: '700',
              fontSize: 16,
              color: '#2D2D2D',
            }}
            title="Confirm"
          />
        </Pressable>

        {/* Cancel link */}
        <Pressable onPress={props.onDismiss} style={{ alignItems: 'center' }}>
          <CustomTextField
            styles={{
              fontFamily: 'strenuous',
              fontSize: 14,
              color: '#FF5C4D',
            }}
            title="Cancel"
          />
        </Pressable>
      </View>
    </Modal>
  );
}

interface SwipeGateSheetProps {
  crewNeededCount: number;
  onNudgeAll: () => void;
  onDismiss: () => void;
}

function SwipeGateSheet(props: SwipeGateSheetProps): ReactNode {
  return (
    <Modal
      transparent
      animationType="slide"
      visible
      onRequestClose={props.onDismiss}
    >
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
        onPress={props.onDismiss}
      />
      <View style={{
        backgroundColor: '#1a2240',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 40,
        alignItems: 'center',
      }}>
        <CustomTextField
          styles={{
            fontFamily: 'strenuous',
            fontWeight: '700',
            fontSize: 20,
            color: '#FFF5EC',
            marginBottom: 12,
            textAlign: 'center',
          }}
          title="Not ready yet"
        />
        <CustomTextField
          styles={{
            fontFamily: 'tt-autonomous-mono',
            fontSize: 14,
            color: 'rgba(255, 245, 236, 0.7)',
            textAlign: 'center',
            marginBottom: 24,
            lineHeight: 20,
          }}
          title={`Need ${props.crewNeededCount} more crew ${props.crewNeededCount === 1 ? 'member' : 'members'} to boost activities before voting opens. Nudge them to get swiping!`}
        />
        <Pressable
          style={{
            width: '100%',
            height: 52,
            backgroundColor: '#FF5C4D',
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
          onPress={props.onNudgeAll}
        >
          <CustomTextField
            styles={{
              fontFamily: 'strenuous',
              fontWeight: '700',
              fontSize: 16,
              color: '#FFF5EC',
            }}
            title="NUDGE ALL"
          />
        </Pressable>
        <Pressable onPress={props.onDismiss}>
          <CustomTextField
            styles={{
              fontFamily: 'strenuous',
              fontSize: 14,
              color: '#FF5C4D',
              textAlign: 'center',
            }}
            title="Cancel"
          />
        </Pressable>
      </View>
    </Modal>
  );
}

interface ChatPreviewComponentProps {
  styles: ChatPreviewStyles;
  chatPreview: ChatPreviewData;
  onOpenChat: () => void;
}

function ChatPreviewComponent(props: ChatPreviewComponentProps): ReactNode {
  return (
    <Pressable onPress={props.onOpenChat}>
      <View style={props.styles.container}>
        <View style={props.styles.headerRow}>
          <CustomTextField styles={props.styles.sectionTitle} title={t('groupDetail.chatPreview')} />
          <CustomButton
            onPress={props.onOpenChat}
            title={t('groupDetail.openChat')}
            styles={props.styles.openButton}
            leftIcon={({ size, color }) => (
              <View style={{ width: size, height: size }}>
                <MessageCircle size={size ?? 14} color={color as string} />
              </View>
            )}
          />
        </View>
        <View style={props.styles.messageRow}>
          <CustomTextField styles={props.styles.senderText} title={`${props.chatPreview.senderName}:`} />
          <CustomTextField styles={props.styles.messageText} title={props.chatPreview.lastMessage} numberOfLines={1} />
          <CustomTextField styles={props.styles.timestampText} title={props.chatPreview.timestampLabel} />
        </View>
      </View>
    </Pressable>
  );
}

const REMOVE_BUTTON_SIZE = 24;
const REMOVE_ICON_SIZE = 12;

interface MemberItemProps {
  styles: MemberListStyles;
  member: GroupMember;
  isCurrentUserOwner: boolean;
  isCurrentUser: boolean;
  onPress: (memberId: string) => void;
  onRemove: (member: GroupMember) => void;
}

function MemberItem(props: MemberItemProps): ReactNode {
  const showRemoveButton = props.isCurrentUserOwner && !props.isCurrentUser && !props.member.isOwner;

  return (
    <Pressable style={props.styles.memberRow} onPress={() => props.onPress(props.member.id)}>
      <View style={props.styles.memberAvatar}>
        <CustomTextField styles={props.styles.memberAvatarText} title={props.member.avatarInitial} />
      </View>
      <View style={props.styles.memberInfo}>
        <CustomTextField styles={props.styles.memberName} title={props.member.displayName} />
        <View style={props.styles.badgeRow}>
          {props.member.isVerified && (
            <View style={props.styles.verifiedBadge}>
              <CustomTextField styles={props.styles.verifiedText} title={t('groupDetail.verified')} />
            </View>
          )}
          {props.member.isOwner && (
            <View style={props.styles.ownerBadge}>
              <CustomTextField styles={props.styles.ownerText} title={t('groupDetail.owner')} />
            </View>
          )}
        </View>
      </View>
      <View style={props.member.isOnline ? props.styles.onlineIndicator : props.styles.offlineIndicator} />
      {showRemoveButton && (
        <Pressable
          style={{
            width: REMOVE_BUTTON_SIZE,
            height: REMOVE_BUTTON_SIZE,
            borderRadius: REMOVE_BUTTON_SIZE / 2,
            backgroundColor: '#FF5C4D',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 8,
          }}
          onPress={() => props.onRemove(props.member)}
          hitSlop={8}
        >
          <Minus size={REMOVE_ICON_SIZE} color="#FFF5EC" strokeWidth={2.5} />
        </Pressable>
      )}
    </Pressable>
  );
}

interface SectionTitleProps {
  styles: SectionHeaderStyles;
  title: string;
}

function SectionTitle(props: SectionTitleProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <CustomTextField styles={props.styles.titleText} title={props.title} />
    </View>
  );
}

// ── Merge Opportunity Banner ──

interface MergeOpportunityBannerProps {
  mergeOpportunity: MergeOpportunityV1;
  onMerge: () => void;
}

function MergeOpportunityBanner(props: MergeOpportunityBannerProps): ReactNode {
  const { mergeOpportunity } = props;
  const venueLine = mergeOpportunity.activityName != null
    ? `Another crew is heading to ${mergeOpportunity.activityName} tonight`
    : 'Another crew is going out tonight';

  return (
    <Animated.View
      entering={FadeInDown}
      style={{
        backgroundColor: '#243660',
        borderWidth: 1,
        borderColor: '#CFFF47',
        borderRadius: 12,
        padding: 12,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <CustomTextField
        styles={{ fontSize: 28, lineHeight: 34 }}
        title="🌍"
      />
      <View style={{ flex: 1 }}>
        <CustomTextField
          styles={{
            fontFamily: 'strenuous',
            fontSize: 14,
            lineHeight: 18,
            fontWeight: '700',
            color: '#FFF5EC',
          }}
          title={venueLine}
          numberOfLines={2}
        />
        <CustomTextField
          styles={{
            fontFamily: 'tt-autonomous-mono',
            fontSize: 12,
            lineHeight: 16,
            color: 'rgba(255, 245, 236, 0.6)',
            marginTop: 2,
          }}
          title="Merge planets and meet them there?"
        />
      </View>
      <Pressable
        style={{
          backgroundColor: '#CFFF47',
          borderRadius: 10,
          paddingVertical: 8,
          paddingHorizontal: 12,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={props.onMerge}
      >
        <CustomTextField
          styles={{
            fontFamily: 'strenuous',
            fontSize: 13,
            lineHeight: 17,
            fontWeight: '700',
            color: '#2D2D2D',
          }}
          title="⊕ MERGE"
        />
      </Pressable>
    </Animated.View>
  );
}

// ── Remove Member Sheet ──

const REMOVE_MEMBER_AVATAR_SIZE = 48;

interface RemoveMemberSheetProps {
  member: GroupMember;
  onConfirm: () => void;
  onDismiss: () => void;
}

function RemoveMemberSheet(props: RemoveMemberSheetProps): ReactNode {
  return (
    <Modal
      transparent
      animationType="slide"
      visible
      onRequestClose={props.onDismiss}
    >
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
        onPress={props.onDismiss}
      />
      <View
        style={{
          backgroundColor: '#1a2240',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingHorizontal: 20,
          paddingTop: 28,
          paddingBottom: 40,
          alignItems: 'center',
        }}
      >
        {/* Member avatar */}
        <View
          style={{
            width: REMOVE_MEMBER_AVATAR_SIZE,
            height: REMOVE_MEMBER_AVATAR_SIZE,
            borderRadius: REMOVE_MEMBER_AVATAR_SIZE / 2,
            backgroundColor: '#243660',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}
        >
          <CustomTextField
            styles={{
              fontFamily: 'strenuous',
              fontSize: 20,
              fontWeight: '700',
              color: '#FFF5EC',
            }}
            title={props.member.avatarInitial}
          />
        </View>

        {/* Member name */}
        <CustomTextField
          styles={{
            fontFamily: 'strenuous',
            fontSize: 18,
            fontWeight: '700',
            color: '#FFF5EC',
            textAlign: 'center',
            marginBottom: 8,
          }}
          title={props.member.displayName}
        />

        {/* Confirmation text */}
        <CustomTextField
          styles={{
            fontFamily: 'tt-autonomous-mono',
            fontSize: 13,
            color: 'rgba(255, 245, 236, 0.6)',
            textAlign: 'center',
            marginBottom: 24,
          }}
          title={t('groupDetail.removeFromCrew')}
        />

        {/* Remove button */}
        <Pressable
          style={{
            width: '100%',
            height: 52,
            backgroundColor: '#FF5C4D',
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
          onPress={props.onConfirm}
        >
          <CustomTextField
            styles={{
              fontFamily: 'strenuous',
              fontWeight: '700',
              fontSize: 16,
              color: '#FFF5EC',
            }}
            title={t('groupDetail.removeMemberConfirm')}
          />
        </Pressable>

        {/* Cancel link */}
        <Pressable onPress={props.onDismiss}>
          <CustomTextField
            styles={{
              fontFamily: 'strenuous',
              fontSize: 15,
              color: '#FFF5EC',
              textAlign: 'center',
            }}
            title={t('groupDetail.removeMemberCancel')}
          />
        </Pressable>
      </View>
    </Modal>
  );
}

// ── Remove Toast ──

interface RemoveToastProps {
  isVisible: boolean;
}

function RemoveToast(props: RemoveToastProps): ReactNode {
  if (!props.isVisible) return undefined;

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 60,
        left: 20,
        right: 20,
        backgroundColor: '#243660',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
      }}
    >
      <CustomTextField
        styles={{
          fontFamily: 'strenuous',
          fontSize: 14,
          color: '#FFF5EC',
          textAlign: 'center',
        }}
        title={t('groupDetail.removeMemberToast')}
      />
    </View>
  );
}

// ── Edit Group Sheet ──

const EDIT_AVATAR_OPTION_SIZE = 52;
const EDIT_AVATAR_OPTION_OUTER_SIZE = EDIT_AVATAR_OPTION_SIZE + 4;
const EDIT_CHECKMARK_BADGE_SIZE = 16;
const EDIT_PLANET_AVATAR_TYPES: PlanetAvatarType[] = ['A', 'B', 'C', 'D'];

interface EditAvatarOptionProps {
  isSelected: boolean;
  onPress: () => void;
  children: ReactNode;
}

function EditAvatarOption(props: EditAvatarOptionProps): ReactNode {
  return (
    <Pressable
      onPress={props.onPress}
      style={{
        width: EDIT_AVATAR_OPTION_OUTER_SIZE,
        height: EDIT_AVATAR_OPTION_OUTER_SIZE,
        borderRadius: EDIT_AVATAR_OPTION_OUTER_SIZE / 2,
        borderWidth: 2,
        borderColor: props.isSelected ? '#CFFF47' : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
      }}
    >
      {props.children}
      {props.isSelected && (
        <View
          style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            width: EDIT_CHECKMARK_BADGE_SIZE,
            height: EDIT_CHECKMARK_BADGE_SIZE,
            borderRadius: EDIT_CHECKMARK_BADGE_SIZE / 2,
            backgroundColor: '#CFFF47',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Check size={10} color="#FFFFFF" />
        </View>
      )}
    </Pressable>
  );
}

interface EditGroupSheetProps {
  isVisible: boolean;
  groupName: string;
  selectedPlanetAvatar: PlanetAvatarType;
  isUploadSelected: boolean;
  uploadedPhotoUri?: string;
  currentPhotoUrl: string;
  isSaving: boolean;
  onGroupNameChange: (text: string) => void;
  onSelectPlanetAvatar: (type: PlanetAvatarType) => void;
  onSelectUpload: () => void;
  onSave: () => void;
  onDismiss: () => void;
}

function EditGroupSheet(props: EditGroupSheetProps): ReactNode {
  const isUploadCurrentlySelected =
    props.isUploadSelected ||
    (props.uploadedPhotoUri != null) ||
    (props.currentPhotoUrl !== '' && !isPlanetAvatarUrl(props.currentPhotoUrl) && !props.isUploadSelected && props.uploadedPhotoUri == null);

  // For upload option — show uploaded uri or existing uploaded photo
  const displayUploadUri = props.uploadedPhotoUri ??
    (!isPlanetAvatarUrl(props.currentPhotoUrl) && props.currentPhotoUrl !== '' ? props.currentPhotoUrl : undefined);

  return (
    <Modal
      transparent
      animationType="slide"
      visible={props.isVisible}
      onRequestClose={props.onDismiss}
    >
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}
        onPress={props.onDismiss}
      />
      <View
        style={{
          backgroundColor: '#1a2240',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 40,
        }}
      >
        <CustomTextField
          styles={{
            fontFamily: 'strenuous',
            fontWeight: '700',
            fontSize: 20,
            color: '#FFF5EC',
            marginBottom: 20,
            textAlign: 'center',
          }}
          title="Edit Crew"
        />

        {/* Avatar selector */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            marginBottom: 24,
          }}
        >
          {/* Upload option */}
          <EditAvatarOption
            isSelected={isUploadCurrentlySelected}
            onPress={props.onSelectUpload}
          >
            {displayUploadUri != null ? (
              <Image
                source={{ uri: displayUploadUri }}
                style={{ width: EDIT_AVATAR_OPTION_SIZE, height: EDIT_AVATAR_OPTION_SIZE, borderRadius: EDIT_AVATAR_OPTION_SIZE / 2 }}
                contentFit="cover"
              />
            ) : (
              <View
                style={{
                  width: EDIT_AVATAR_OPTION_SIZE,
                  height: EDIT_AVATAR_OPTION_SIZE,
                  borderRadius: EDIT_AVATAR_OPTION_SIZE / 2,
                  backgroundColor: '#1B2A4A',
                  borderWidth: 2,
                  borderStyle: 'dashed',
                  borderColor: '#FF5C4D',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Camera size={20} color="#FF5C4D" />
                <View style={{ marginTop: 4 }}>
                  <CustomTextField
                    styles={{
                      fontFamily: 'tt-autonomous-mono',
                      fontSize: 9,
                      color: 'rgba(255,245,236,0.8)',
                      letterSpacing: 0.3,
                    }}
                    title="UPLOAD"
                  />
                </View>
              </View>
            )}
          </EditAvatarOption>

          {/* Planet options */}
          {EDIT_PLANET_AVATAR_TYPES.map((type) => (
            <EditAvatarOption
              key={type}
              isSelected={!isUploadCurrentlySelected && props.selectedPlanetAvatar === type}
              onPress={() => props.onSelectPlanetAvatar(type)}
            >
              <PlanetAvatar type={type} size={EDIT_AVATAR_OPTION_SIZE} />
            </EditAvatarOption>
          ))}
        </View>

        {/* Group name input */}
        <TextInput
          style={{
            backgroundColor: 'rgba(255,245,236,0.06)',
            borderWidth: 1,
            borderColor: 'rgba(255,245,236,0.12)',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontFamily: 'tt-autonomous-mono',
            fontSize: 15,
            color: '#FFF5EC',
            marginBottom: 20,
          }}
          value={props.groupName}
          onChangeText={props.onGroupNameChange}
          placeholder="Crew name..."
          placeholderTextColor="rgba(255,245,236,0.3)"
          maxLength={30}
          autoCapitalize="words"
          autoCorrect={false}
        />

        {/* Save button */}
        <Pressable
          style={{
            width: '100%',
            height: 52,
            backgroundColor: props.isSaving ? 'rgba(207,255,71,0.5)' : '#CFFF47',
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
          }}
          onPress={props.onSave}
          disabled={props.isSaving}
        >
          <CustomTextField
            styles={{
              fontFamily: 'strenuous',
              fontWeight: '700',
              fontSize: 16,
              color: '#2D2D2D',
            }}
            title={props.isSaving ? 'SAVING...' : 'SAVE'}
          />
        </Pressable>

        {/* Cancel */}
        <Pressable
          style={{
            paddingVertical: 12,
            alignItems: 'center',
          }}
          onPress={props.onDismiss}
        >
          <CustomTextField
            styles={{
              fontFamily: 'tt-autonomous-mono',
              fontSize: 14,
              color: 'rgba(255,245,236,0.5)',
            }}
            title="Cancel"
          />
        </Pressable>
      </View>
    </Modal>
  );
}

// ── Main Container ──

export default function GroupGroupIdContainer(props: GroupGroupIdProps): ReactNode {
  const {
    styles,
    headerStyles,
    overflowMenuStyles,
    heroStyles,
    battleBannerStyles,
    activityFeedItemStyles,
    rankedActivityItemStyles,
    actionButtonsStyles,
    chatPreviewStyles,
    memberListStyles,
    sectionHeaderStyles,
    crewReadinessStyles,
    lockedBattleButtonStyles,
  } = useGroupGroupIdStyles();

  const {
    isLoading,
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
    isSwipeGateSheetVisible,
    rescheduleDate,
    isEditSheetVisible,
    editGroupName,
    editSelectedPlanetAvatar,
    editIsUploadSelected,
    editUploadedPhotoUri,
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
    onDismissSwipeGateSheet,
    onNudgeAll,
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
  } = useGroupGroupId(props);
  void isSendingNudge;
  const [orbitData, setOrbitData] = useState<OrbitScreenDataV1 | undefined>(undefined);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <GroupHeader
            styles={headerStyles}
            groupName=""
            memberCount={0}
            onGoBack={onGoBack}
            onMenuPress={onToggleOverflowMenu}
          />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <GroupHeader
          styles={headerStyles}
          groupName={groupDetail.name}
          memberCount={groupDetail.memberCount}
          onGoBack={onGoBack}
          onMenuPress={onToggleOverflowMenu}
        />

        {/* Overflow Menu */}
        <OverflowMenuComponent
          styles={overflowMenuStyles}
          isVisible={isOverflowMenuVisible}
          isOwner={isCurrentUserOwner}
          onAction={onOverflowMenuAction}
          onDismiss={onToggleOverflowMenu}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero with group avatar, name, and member avatars */}
          <HeroSectionComponent
            styles={heroStyles}
            photoUrl={groupDetail.photoUrl}
            groupName={groupDetail.name}
            members={members}
          />

          <View style={styles.sectionGap} />

          {/* Battle Banner (if active) */}
          <BattleBannerComponent
            styles={battleBannerStyles}
            battleStatus={battleStatus}
            onJoinBattle={onStartOrJoinBattle}
            onViewResults={onViewResults}
          />

          {battleStatus.isActive && <View style={styles.sectionGap} />}

          {/* Merge Opportunity Banner (shown after battle resolves with a winner) */}
          {battleStatus.hasWinner && mergeOpportunity != null && (
            <MergeOpportunityBanner
              mergeOpportunity={mergeOpportunity}
              onMerge={onOpenMergeScreen}
            />
          )}

          {/* Crew Readiness */}
          {crewReadiness.length > 0 && (
            <CrewReadinessSection
              styles={crewReadinessStyles}
              members={crewReadiness}
              readyCount={crewReadyCount}
              threshold={crewReadyThreshold}
              onNudgeMemberPress={onNudgeMemberPress}
            />
          )}

          {crewReadiness.length > 0 && <View style={styles.sectionGap} />}

          {/* Action Buttons */}
          <ActionButtonsSection
            styles={actionButtonsStyles}
            lockedStyles={lockedBattleButtonStyles}
            battleIsActive={battleStatus.isActive}
            isBattleButtonLocked={isBattleButtonLocked}
            hasPlanScheduled={hasPlanScheduled}
            crewNeededCount={crewNeededCount}
            onStartOrJoinBattle={onStartOrJoinBattle}
            onInviteFriends={onInviteFriends}
            onReschedule={onReschedule}
          />

          <View style={styles.sectionGap} />

          {/* Activity Feed */}
          <SectionTitle styles={sectionHeaderStyles} title={t('groupDetail.activity')} />
          {swipeActivity.map((item, index) => (
            <ActivityFeedItemComponent
              key={item.id}
              styles={activityFeedItemStyles}
              item={item}
              index={index}
            />
          ))}

          <View style={styles.sectionGap} />

          {/* Ranked Activities / Top Picks */}
          <View style={{ paddingHorizontal: 16, gap: 4, marginBottom: 8 }}>
            <CustomTextField
              styles={sectionHeaderStyles.titleText}
              title={t('groupDetail.rankedActivities')}
            />
            <CustomTextField
              styles={{
                fontFamily: 'tt-autonomous-mono',
                fontSize: 11,
                color: 'rgba(255, 245, 236, 0.4)',
              }}
              title={t('groupDetail.topPicksSubtitle')}
            />
          </View>
          {rankedActivities.length === 0 ? (
            <View
              style={{
                marginHorizontal: 16,
                backgroundColor: 'rgba(255, 245, 236, 0.04)',
                borderRadius: 14,
                borderWidth: 1,
                borderColor: 'rgba(255, 245, 236, 0.08)',
                paddingVertical: 32,
                paddingHorizontal: 20,
                alignItems: 'center',
                gap: 8,
              }}
            >
              <CustomTextField
                styles={{ fontSize: 32, lineHeight: 40, color: '#FF5C4D' }}
                title="🪐"
              />
              <CustomTextField
                styles={{
                  fontFamily: 'strenuous',
                  fontSize: 14,
                  fontWeight: '700',
                  color: '#FFF5EC',
                  textAlign: 'center',
                }}
                title={t('groupDetail.topPicksEmpty')}
              />
              <CustomTextField
                styles={{
                  fontFamily: 'tt-autonomous-mono',
                  fontSize: 12,
                  color: 'rgba(255, 245, 236, 0.5)',
                  textAlign: 'center',
                }}
                title={t('groupDetail.topPicksEmptyHint')}
              />
              <Pressable
                style={{
                  marginTop: 8,
                  width: '100%',
                  height: 44,
                  backgroundColor: '#CFFF47',
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={onGoBack}
              >
                <CustomTextField
                  styles={{
                    fontFamily: 'strenuous',
                    fontWeight: '700',
                    fontSize: 15,
                    color: '#2D2D2D',
                  }}
                  title={t('groupDetail.goDiscover')}
                />
              </Pressable>
            </View>
          ) : (
            rankedActivities.map((item, index) => (
              <RankedActivityItemComponent
                key={item.id}
                styles={rankedActivityItemStyles}
                item={item}
                index={index}
                onPress={onActivityPress}
              />
            ))
          )}

          <View style={styles.sectionGap} />

          {/* Chat Preview */}
          {chatPreview.lastMessage !== '' && (
            <ChatPreviewComponent
              styles={chatPreviewStyles}
              chatPreview={chatPreview}
              onOpenChat={onOpenChat}
            />
          )}

          <View style={styles.sectionGap} />

          {/* Members */}
          <View style={memberListStyles.container}>
            <CustomTextField styles={memberListStyles.sectionTitle} title={t('groupDetail.members')} />
            {members.map((member) => (
              <MemberItem
                key={member.id}
                styles={memberListStyles}
                member={member}
                isCurrentUserOwner={isCurrentUserOwner}
                isCurrentUser={member.isCurrentUser}
                onPress={onMemberPress}
                onRemove={onRemoveMember}
              />
            ))}
          </View>
        </ScrollView>
      </View>
      <RescheduleSheet
        isVisible={isRescheduleSheetVisible}
        isFirstSchedule={!hasPlanScheduled}
        selectedDate={rescheduleDate}
        onDateChange={onRescheduleDateChange}
        onConfirm={onConfirmReschedule}
        onDismiss={onDismissRescheduleSheet}
      />

      {/* Swipe Gate Sheet */}
      {isSwipeGateSheetVisible && (
        <SwipeGateSheet
          crewNeededCount={crewNeededCount}
          onNudgeAll={onNudgeAll}
          onDismiss={onDismissSwipeGateSheet}
        />
      )}

      {/* Merge Planets Screen (full screen modal) */}
      <Modal
        visible={activeMergePlanetRequestId != null && orbitData == null}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={onCloseMergeScreen}
      >
        {activeMergePlanetRequestId != null && (
          <MergePlanetsScreen
            mergeRequestId={activeMergePlanetRequestId}
            onClose={onCloseMergeScreen}
            onOrbitApproved={(data) => {
              setOrbitData(data);
            }}
          />
        )}
      </Modal>

      {/* Orbit Screen (full screen modal after merge approved) */}
      <Modal
        visible={orbitData != null}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setOrbitData(undefined)}
      >
        {orbitData != null && (
          <OrbitScreen
            orbitData={orbitData}
            onClose={() => {
              setOrbitData(undefined);
              onCloseMergeScreen();
            }}
          />
        )}
      </Modal>

      {/* Nudge Member Sheet */}
      {nudgeCandidate != null && (
        <NudgeActionSheet
          member={nudgeCandidate}
          onConfirm={onConfirmNudge}
          onDismiss={onDismissNudgeSheet}
        />
      )}

      {/* Remove Member Sheet */}
      {removeMemberCandidate != null && (
        <RemoveMemberSheet
          member={removeMemberCandidate}
          onConfirm={onConfirmRemoveMember}
          onDismiss={onDismissRemoveSheet}
        />
      )}

      {/* Remove Member Toast */}
      <RemoveToast isVisible={showRemoveToast} />

      {/* Edit Group Sheet */}
      <EditGroupSheet
        isVisible={isEditSheetVisible}
        groupName={editGroupName}
        selectedPlanetAvatar={editSelectedPlanetAvatar}
        isUploadSelected={editIsUploadSelected}
        uploadedPhotoUri={editUploadedPhotoUri}
        currentPhotoUrl={groupDetail.photoUrl}
        isSaving={isSavingEdit}
        onGroupNameChange={onEditGroupNameChange}
        onSelectPlanetAvatar={onEditSelectPlanetAvatar}
        onSelectUpload={onEditSelectUpload}
        onSave={onSaveEdit}
        onDismiss={onDismissEditSheet}
      />
    </SafeAreaView>
  );
}

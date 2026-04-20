/**
 * Main container for the Battles route
 */

import { type ReactNode } from 'react';
import 'react-native-reanimated';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Pressable, ScrollView, RefreshControl, type DimensionValue } from 'react-native';
import { Image } from 'expo-image';
import { Bell, Zap, Trophy } from 'lucide-react-native';
import { useEffect } from 'react';

import { t } from '@/i18n';
import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import { CustomButton } from '@/comp-lib/core/custom-button/CustomButton';
import { useBattlesStyles } from './BattlesStyles';
import { useBattles, type ActiveBattleCardData, type RecentResultCardData } from './BattlesFunc';
import { type BattlesProps } from '@/app/(tabs)/battles';
import {
  type BattlesHeaderStyles,
  type SectionHeaderStyles,
  type ActiveBattleCardStyles,
  type RecentResultCardStyles,
  type BattlesEmptyStateStyles,
} from './BattlesStyles';

// ── Constants ──

const PULSE_DURATION_IN_MS = 1000;
const VOTE_PROGRESS_MULTIPLIER = 100;

// ── Sub-components ──

interface BattlesHeaderProps {
  styles: BattlesHeaderStyles;
  unreadCount: number;
  onNotificationsPress: () => void;
}

function BattlesHeader(props: BattlesHeaderProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <CustomTextField styles={props.styles.titleText} title={t('battles.title')} />
      <Pressable style={props.styles.bellContainer} onPress={props.onNotificationsPress}>
        <View style={props.styles.bellIcon}>
          <Bell size={22} color="#FFF5EC" />
        </View>
        {props.unreadCount > 0 && (
          <View style={props.styles.badgeContainer}>
            <CustomTextField styles={props.styles.badgeText} title={String(props.unreadCount)} />
          </View>
        )}
      </Pressable>
    </View>
  );
}

interface BattleSectionHeaderProps {
  styles: SectionHeaderStyles;
  title: string;
  count: number;
}

function BattleSectionHeader(props: BattleSectionHeaderProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <CustomTextField styles={props.styles.titleText} title={props.title} />
      {props.count > 0 && (
        <View style={props.styles.countBadge}>
          <CustomTextField styles={props.styles.countText} title={String(props.count)} />
        </View>
      )}
    </View>
  );
}

interface PulsingTimerDotProps {
  styles: ActiveBattleCardStyles;
}

function PulsingTimerDot(props: PulsingTimerDotProps): ReactNode {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.3, { duration: PULSE_DURATION_IN_MS, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    ...props.styles.timerDot,
    opacity: opacity.value,
  }));

  return <Animated.View style={animatedStyle} />;
}

interface ActiveBattleCardItemProps {
  styles: ActiveBattleCardStyles;
  battle: ActiveBattleCardData;
  onPress: (groupId: string) => void;
}

function ActiveBattleCardItem(props: ActiveBattleCardItemProps): ReactNode {
  const voteProgressRatio =
    props.battle.totalParticipants > 0
      ? props.battle.votedParticipants / props.battle.totalParticipants
      : 0;
  const progressWidthPercent: DimensionValue =
    `${Math.round(voteProgressRatio * VOTE_PROGRESS_MULTIPLIER)}%` as DimensionValue;

  return (
    <Pressable
      style={props.styles.pressable}
      onPress={() => props.onPress(props.battle.groupId)}
    >
      <View style={props.styles.container}>
        <View style={props.styles.accentBar} />
        <View style={props.styles.contentArea}>
          <View style={props.styles.topRow}>
            <CustomTextField
              styles={props.styles.groupName}
              title={props.battle.groupName}
              numberOfLines={1}
            />
            <View style={props.styles.timerContainer}>
              <PulsingTimerDot styles={props.styles} />
              <CustomTextField
                styles={props.styles.timerText}
                title={t('battles.timeRemaining', { time: props.battle.timeRemainingLabel })}
              />
            </View>
          </View>

          <View style={props.styles.voteProgressRow}>
            <CustomTextField
              styles={props.styles.voteProgressText}
              title={t('battles.votedCount', {
                voted: props.battle.votedParticipants,
                total: props.battle.totalParticipants,
              })}
            />
            <View style={props.styles.voteProgressBarTrack}>
              <View
                style={[props.styles.voteProgressBarFill, { width: progressWidthPercent }]}
              />
            </View>
          </View>

          <View style={props.styles.contendersRow}>
            {props.battle.contenders.map((contender) => (
              <Image
                key={contender.activityId}
                source={{ uri: contender.thumbnailUrl }}
                style={props.styles.contenderThumbnail}
                contentFit="cover"
                transition={200}
              />
            ))}
            <View style={props.styles.contenderOverlay}>
              {props.battle.contenders.length > 0 && (
                <CustomTextField
                  styles={props.styles.contenderTitle}
                  title={props.battle.contenders.map((c) => c.title).join(' vs ')}
                  numberOfLines={1}
                />
              )}
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

interface RecentResultCardItemProps {
  styles: RecentResultCardStyles;
  result: RecentResultCardData;
  onPress: (groupId: string) => void;
}

function RecentResultCardItem(props: RecentResultCardItemProps): ReactNode {
  return (
    <Pressable
      style={props.styles.pressable}
      onPress={() => props.onPress(props.result.groupId)}
    >
      <View style={props.styles.container}>
        <Image
          source={{ uri: props.result.winnerImageUrl }}
          style={props.styles.thumbnail}
          contentFit="cover"
          transition={200}
        />
        <View style={props.styles.contentArea}>
          <CustomTextField
            styles={props.styles.groupName}
            title={props.result.groupName}
          />
          <View style={props.styles.winnerRow}>
            <View style={props.styles.winnerBadge}>
              <CustomTextField
                styles={props.styles.winnerBadgeText}
                title={t('battles.winner')}
              />
            </View>
            <CustomTextField
              styles={props.styles.winnerTitle}
              title={props.result.winnerTitle}
              numberOfLines={1}
            />
          </View>
          <View style={props.styles.bottomRow}>
            <CustomTextField
              styles={props.styles.completedText}
              title={props.result.completedAtLabel}
            />
            <CustomButton
              onPress={() => props.onPress(props.result.groupId)}
              title={t('battles.viewPlan')}
              styles={props.styles.viewPlanButton}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

interface BattlesEmptyStateProps {
  styles: BattlesEmptyStateStyles;
  title: string;
  subtitle: string;
  IconComponent: typeof Zap;
}

function BattlesEmptyState(props: BattlesEmptyStateProps): ReactNode {
  const { IconComponent } = props;
  return (
    <View style={props.styles.container}>
      <View style={props.styles.iconContainer}>
        <IconComponent size={36} color="rgba(255, 245, 236, 0.4)" />
      </View>
      <CustomTextField styles={props.styles.title} title={props.title} />
      <CustomTextField styles={props.styles.subtitle} title={props.subtitle} />
    </View>
  );
}

// ── Main Container ──

export default function BattlesContainer(props: BattlesProps): ReactNode {
  const {
    styles,
    headerStyles,
    sectionHeaderStyles,
    activeBattleCardStyles,
    recentResultCardStyles,
    emptyStateStyles,
  } = useBattlesStyles();
  const {
    activeBattles,
    recentResults,
    unreadNotificationCount,
    isRefreshing,
    onRefresh,
    onActiveBattlePress,
    onRecentResultPress,
    onNotificationsPress,
  } = useBattles(props);

  const safeAreaProps = { edges: ['top', 'left', 'right'] as const };

  return (
    <SafeAreaView style={styles.safeArea} {...safeAreaProps}>
      <View style={styles.container}>
        <BattlesHeader
          styles={headerStyles}
          unreadCount={unreadNotificationCount}
          onNotificationsPress={onNotificationsPress}
        />

        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#FFF5EC"
              colors={['#FF5C4D']}
            />
          }
        >
          {/* Active Battles Section */}
          <BattleSectionHeader
            styles={sectionHeaderStyles}
            title={t('battles.sectionActive')}
            count={activeBattles.length}
          />
          {activeBattles.length > 0 ? (
            activeBattles.map((battle) => (
              <ActiveBattleCardItem
                key={battle.id}
                styles={activeBattleCardStyles}
                battle={battle}
                onPress={onActiveBattlePress}
              />
            ))
          ) : (
            <BattlesEmptyState
              styles={emptyStateStyles}
              title={t('battles.emptyActiveTitle')}
              subtitle={t('battles.emptyActiveSubtitle')}
              IconComponent={Zap}
            />
          )}

          <View style={styles.sectionSeparator} />

          {/* Recent Results Section */}
          <BattleSectionHeader
            styles={sectionHeaderStyles}
            title={t('battles.sectionRecent')}
            count={recentResults.length}
          />
          {recentResults.length > 0 ? (
            recentResults.map((result) => (
              <RecentResultCardItem
                key={result.id}
                styles={recentResultCardStyles}
                result={result}
                onPress={onRecentResultPress}
              />
            ))
          ) : (
            <BattlesEmptyState
              styles={emptyStateStyles}
              title={t('battles.emptyRecentTitle')}
              subtitle={t('battles.emptyRecentSubtitle')}
              IconComponent={Trophy}
            />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

import { type ReactNode, useState } from 'react';
import 'react-native-reanimated';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  FadeInDown,
  FadeOutDown,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Pressable,
  FlatList,
  RefreshControl,
  type ListRenderItem,
  Modal,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { Bell, Plus, Users, ShieldCheck } from 'lucide-react-native';
import { useEffect } from 'react';

import { t } from '@/i18n';
import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import { CustomButton } from '@/comp-lib/core/custom-button/CustomButton';
import { useGroupsStyles } from './GroupsStyles';
import { useGroups, getStatusLabel, type GroupCardData, type GroupStatus, type GroupsTab } from './GroupsFunc';
import PlanetAvatar, { isPlanetAvatarUrl, getPlanetAvatarType } from '@/comp-app/PlanetAvatar';
import { GroupsProps } from '@/app/(tabs)/groups';
import type { OpenPlanetCardV1, OrbitScreenDataV1 } from '@shared/generated-db-types';
import MergePlanetsScreen from '@/comp-app/MergePlanetsScreen';
import OrbitScreen from '@/comp-app/OrbitScreen';
import {
  type GroupsHeaderStyles,
  type GroupCardStyles,
  type FabStyles,
  type GroupsEmptyStateStyles,
  type TabBarStyles,
  type OpenPlanetCardStyles,
  type ToastStyles,
  type JoinSheetStyles,
  type HowItWorksSheetStyles,
} from './GroupsStyles';

// ── Constants ──

const MAX_VISIBLE_AVATARS = 4;
const PULSE_DURATION_IN_MS = 1200;
const MAX_OPEN_PLANET_AVATARS = 5;

// ── Sub-components ──

interface GroupsHeaderProps {
  styles: GroupsHeaderStyles;
  unreadCount: number;
  onNotificationsPress: () => void;
}

function GroupsHeader(props: GroupsHeaderProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <CustomTextField styles={props.styles.titleText} title={t('groups.title')} />
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

const GROUP_CARD_AVATAR_SIZE = 52;

interface CompositeAvatarProps {
  styles: GroupCardStyles;
  initials: string[];
  photoUrl?: string;
}

function CompositeAvatar(props: CompositeAvatarProps): ReactNode {
  // Planet avatar: render planet design
  if (isPlanetAvatarUrl(props.photoUrl) || props.photoUrl == null) {
    const planetType = getPlanetAvatarType(props.photoUrl);
    return (
      <View style={props.styles.photoAvatar}>
        <PlanetAvatar type={planetType} size={GROUP_CARD_AVATAR_SIZE} />
      </View>
    );
  }

  // Uploaded photo URL: render image
  return (
    <Image
      source={{ uri: props.photoUrl }}
      style={props.styles.photoAvatar}
      contentFit="cover"
      transition={200}
    />
  );
}

interface StatusBadgeProps {
  styles: GroupCardStyles;
  status: GroupStatus;
}

function StatusBadge(props: StatusBadgeProps): ReactNode {
  const badgeStyleMap: Record<GroupStatus, object> = {
    BATTLE_ACTIVE: props.styles.statusBadgeBattle,
    DECIDING: props.styles.statusBadgeDeciding,
    IDLE: props.styles.statusBadgeIdle,
  };
  const dotStyleMap: Record<GroupStatus, object> = {
    BATTLE_ACTIVE: props.styles.statusDotBattle,
    DECIDING: props.styles.statusDotDeciding,
    IDLE: props.styles.statusDotIdle,
  };
  const textStyleMap: Record<GroupStatus, object> = {
    BATTLE_ACTIVE: props.styles.statusTextBattle,
    DECIDING: props.styles.statusTextDeciding,
    IDLE: props.styles.statusTextIdle,
  };

  return (
    <View style={[props.styles.statusBadge, badgeStyleMap[props.status]]}>
      <View style={[props.styles.statusDot, dotStyleMap[props.status]]} />
      <CustomTextField
        styles={[props.styles.statusText, textStyleMap[props.status]]}
        title={getStatusLabel(props.status)}
      />
    </View>
  );
}

interface PulsingIndicatorProps {
  styles: GroupCardStyles;
}

function PulsingIndicator(props: PulsingIndicatorProps): ReactNode {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.3, { duration: PULSE_DURATION_IN_MS, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    ...props.styles.statusDot,
    ...props.styles.statusDotBattle,
    opacity: opacity.value,
  }));

  return <Animated.View style={animatedStyle} />;
}

interface GroupCardItemProps {
  styles: GroupCardStyles;
  group: GroupCardData;
  onPress: (groupId: string) => void;
}

function GroupCardItem(props: GroupCardItemProps): ReactNode {
  const isBattleActive = props.group.status === 'BATTLE_ACTIVE';

  return (
    <Pressable
      style={props.styles.pressable}
      onPress={() => props.onPress(props.group.id)}
    >
      <View style={props.styles.container}>
        <View style={props.styles.avatarSection}>
          <CompositeAvatar
            styles={props.styles}
            initials={props.group.memberAvatarInitials}
            photoUrl={props.group.photoUrl}
          />
        </View>
        <View style={props.styles.contentSection}>
          <View style={props.styles.topRow}>
            <CustomTextField
              styles={props.styles.groupName}
              title={props.group.name}
              numberOfLines={1}
            />
            <CustomTextField
              styles={props.styles.timestampText}
              title={props.group.lastActivityLabel}
            />
          </View>
          <View style={props.styles.bottomRow}>
            <CustomTextField
              styles={props.styles.memberCountText}
              title={t('groups.memberCount_other', { count: props.group.memberCount })}
            />
            <View style={props.styles.statusRow}>
              {isBattleActive ? (
                <View style={[props.styles.statusBadge, props.styles.statusBadgeBattle]}>
                  <PulsingIndicator styles={props.styles} />
                  <CustomTextField
                    styles={[props.styles.statusText, props.styles.statusTextBattle]}
                    title={getStatusLabel(props.group.status)}
                  />
                </View>
              ) : (
                <StatusBadge styles={props.styles} status={props.group.status} />
              )}
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

interface GroupsFabProps {
  styles: FabStyles;
  onPress: () => void;
}

function GroupsFab(props: GroupsFabProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <CustomButton
        onPress={props.onPress}
        styles={props.styles.button}
        leftIcon={({ size, color }) => (
          <View style={{ width: size, height: size }}>
            <Plus size={size ?? 28} color={color as string} />
          </View>
        )}
      />
    </View>
  );
}

interface GroupsEmptyStateProps {
  styles: GroupsEmptyStateStyles;
  onCreateGroup: () => void;
}

function GroupsEmptyState(props: GroupsEmptyStateProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <View style={props.styles.iconContainer}>
        <Users size={40} color="rgba(255, 245, 236, 0.4)" />
      </View>
      <CustomTextField styles={props.styles.title} title={t('groups.emptyTitle')} />
      <CustomTextField styles={props.styles.subtitle} title={t('groups.emptySubtitle')} />
      <CustomButton
        onPress={props.onCreateGroup}
        title={t('groups.emptyCta')}
        styles={props.styles.ctaButton}
      />
    </View>
  );
}

// ── Tab Bar ──

interface TabBarProps {
  styles: TabBarStyles;
  activeTab: GroupsTab;
  onTabChange: (tab: GroupsTab) => void;
  onInfoPress: () => void;
}

function TabBar(props: TabBarProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <Pressable
        style={props.styles.tab}
        onPress={() => props.onTabChange('MY_CREWS')}
      >
        <CustomTextField
          styles={[
            props.styles.tabText,
            props.activeTab === 'MY_CREWS' ? props.styles.tabTextActive : undefined,
          ]}
          title="MY PLANETS"
        />
        {props.activeTab === 'MY_CREWS' && <View style={props.styles.tabUnderline} />}
      </Pressable>
      <Pressable
        style={props.styles.tab}
        onPress={() => props.onTabChange('OPEN_PLANETS')}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <CustomTextField
            styles={[
              props.styles.tabText,
              props.activeTab === 'OPEN_PLANETS' ? props.styles.tabTextActive : undefined,
            ]}
            title="OPEN PLANETS"
          />
          {props.activeTab === 'OPEN_PLANETS' && (
            <Pressable style={props.styles.infoButton} onPress={props.onInfoPress}>
              <CustomTextField styles={props.styles.infoButtonText} title="i" />
            </Pressable>
          )}
        </View>
        {props.activeTab === 'OPEN_PLANETS' && <View style={props.styles.tabUnderline} />}
      </Pressable>
    </View>
  );
}

// ── Open Planet Card ──

interface OpenPlanetCardProps {
  styles: OpenPlanetCardStyles;
  planet: OpenPlanetCardV1;
  onOrbit: (groupId: string, groupName: string) => void;
  onRequestToJoin: (groupId: string) => void;
  onMergePlanet: (groupId: string) => void;
}

function OpenPlanetCard(props: OpenPlanetCardProps): ReactNode {
  const { planet } = props;
  const spotsOpen = (planet.maxGroupSize ?? 0) - (planet.memberCount ?? 0);
  const initials = planet.memberInitials ?? [];
  const visibleInitials = initials.slice(0, MAX_OPEN_PLANET_AVATARS);
  const hasActivity = planet.featuredActivityName != null;
  const distanceLabel =
    planet.distanceInMiles != null
      ? `${planet.distanceInMiles.toFixed(1)} mi`
      : null;

  return (
    <View style={props.styles.container}>
      {/* Name + distance + merge button */}
      <View style={[props.styles.nameRow, { position: 'relative' }]}>
        <CustomTextField styles={props.styles.nameText} title={planet.name ?? ''} numberOfLines={1} />
        {distanceLabel != null && (
          <View style={props.styles.distancePill}>
            <CustomTextField styles={props.styles.distanceText} title={distanceLabel} />
          </View>
        )}
        <Pressable
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            minWidth: 80,
            height: 32,
            borderRadius: 12,
            backgroundColor: '#243660',
            borderWidth: 1,
            borderColor: '#3a4a6b',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 10,
            gap: 4,
            zIndex: 10,
          }}
          onPress={() => props.onMergePlanet(planet.id ?? '')}
        >
          <CustomTextField
            styles={{ fontFamily: 'tt-autonomous-mono', fontSize: 14, color: '#FFF5EC' }}
            title="⊕"
          />
          <CustomTextField
            styles={{ fontFamily: 'comba', fontSize: 12, color: '#FFF5EC' }}
            title="MERGE?"
          />
        </Pressable>
      </View>

      {/* Avatars + spots */}
      <View style={props.styles.avatarRow}>
        {visibleInitials.map((initial, idx) => (
          <View
            key={`${initial}-${idx}`}
            style={[props.styles.avatar, { marginLeft: idx === 0 ? 0 : -6 }]}
          >
            <CustomTextField styles={props.styles.avatarText} title={initial} />
          </View>
        ))}
        {spotsOpen > 0 && (
          <CustomTextField
            styles={props.styles.spotsText}
            title={`${spotsOpen} spot${spotsOpen !== 1 ? 's' : ''} open`}
          />
        )}
      </View>

      {/* Activity pill */}
      <View
        style={[
          props.styles.activityPill,
          !hasActivity ? props.styles.activityPillVoting : undefined,
        ]}
      >
        <CustomTextField
          styles={[
            props.styles.activityText,
            !hasActivity ? props.styles.activityTextVoting : undefined,
          ]}
          title={planet.featuredActivityName ?? 'Voting now...'}
        />
      </View>

      {/* Trust row */}
      <View style={props.styles.trustRow}>
        <ShieldCheck size={14} color="rgba(255, 245, 236, 0.5)" />
        <CustomTextField styles={props.styles.trustText} title="Avg trust: Verified" />
      </View>

      {/* Buttons */}
      <View style={props.styles.buttonRow}>
        <CustomButton
          styles={planet.hasOrbited ? props.styles.orbitButtonOrbited : props.styles.orbitButton}
          title={planet.hasOrbited ? 'ORBITING' : 'ORBIT'}
          onPress={() => props.onOrbit(planet.id ?? '', planet.name ?? '')}
        />
        <CustomButton
          styles={props.styles.joinButton}
          title={planet.hasRequestedToJoin ? 'REQUESTED' : 'REQUEST TO JOIN'}
          onPress={() => props.onRequestToJoin(planet.id ?? '')}
          disabled={planet.hasRequestedToJoin ?? false}
        />
      </View>
    </View>
  );
}

// ── Toast ──

interface ToastProps {
  styles: ToastStyles;
  message: string;
}

function Toast(props: ToastProps): ReactNode {
  return (
    <Animated.View entering={FadeInDown} exiting={FadeOutDown} style={props.styles.container}>
      <CustomTextField styles={props.styles.text} title={props.message} />
    </Animated.View>
  );
}

// ── Join Request Sheet ──

interface JoinSheetProps {
  styles: JoinSheetStyles;
  groupId: string;
  onSend: (groupId: string, message: string) => void;
  onClose: () => void;
}

function JoinSheet(props: JoinSheetProps): ReactNode {
  const [message, setMessage] = useState('');

  function onPressSend(): void {
    props.onSend(props.groupId, message);
    setMessage('');
  }

  return (
    <Modal transparent animationType="slide" onRequestClose={props.onClose}>
      <View style={props.styles.backdrop}>
        <View style={props.styles.sheet}>
          <CustomTextField styles={props.styles.title} title="Request to Join" />
          <CustomTextField styles={props.styles.label} title="Add a message (optional)" />
          <View style={props.styles.input}>
            <TextInput
              style={props.styles.inputText}
              value={message}
              onChangeText={setMessage}
              placeholder="Introduce yourself..."
              placeholderTextColor="rgba(255, 245, 236, 0.3)"
              multiline
              numberOfLines={3}
            />
          </View>
          <CustomButton styles={props.styles.sendButton} title="SEND REQUEST" onPress={onPressSend} />
          <CustomButton styles={props.styles.cancelButton} title="Cancel" onPress={props.onClose} />
        </View>
      </View>
    </Modal>
  );
}

// ── How It Works Sheet ──

interface HowItWorksSheetProps {
  styles: HowItWorksSheetStyles;
  onClose: () => void;
}

interface HowItWorksRowData {
  icon: string;
  title: string;
  description: string;
}

const HOW_IT_WORKS_ROWS: HowItWorksRowData[] = [
  {
    icon: '🪐',
    title: 'Orbiting',
    description: 'Follow a crew without joining. You can see what they pick and get notified when group openings change and when an activity is selected.',
  },
  {
    icon: '⊕',
    title: 'Merge Planets',
    description: 'Combine your crew with another for a night. Both groups vote to collide and meet at the same venue.',
  },
  {
    icon: '🔓',
    title: 'Open Planets',
    description: 'Groups with open mode on appear here. They\'re accepting orbit requests and potential merges.',
  },
  {
    icon: '✓',
    title: 'Trust Tiers',
    description: 'Members earn verification levels based on activity and social connections. Higher trust = safer meetups.',
  },
];

function HowItWorksSheet(props: HowItWorksSheetProps): ReactNode {
  return (
    <Pressable style={props.styles.backdrop} onPress={props.onClose}>
      <Pressable style={props.styles.sheet} onPress={() => {}}>
        <CustomTextField styles={props.styles.title} title="How it works" />
        {HOW_IT_WORKS_ROWS.map((row, index) => (
          <View key={row.title}>
            {index > 0 && <View style={props.styles.rowSeparator} />}
            <View style={props.styles.row}>
              <View style={props.styles.iconCircle}>
                <CustomTextField styles={props.styles.iconText} title={row.icon} />
              </View>
              <View style={props.styles.rowContent}>
                <CustomTextField styles={props.styles.rowTitle} title={row.title} />
                <CustomTextField styles={props.styles.rowDescription} title={row.description} />
              </View>
            </View>
          </View>
        ))}
        <CustomButton styles={props.styles.gotItButton} title="Got it" onPress={props.onClose} />
      </Pressable>
    </Pressable>
  );
}

// ── Main Container ──

export default function GroupsContainer(props: GroupsProps): ReactNode {
  const {
    styles,
    headerStyles,
    cardStyles,
    fabStyles,
    emptyStateStyles,
    tabBarStyles,
    openPlanetCardStyles,
    toastStyles,
    joinSheetStyles,
    howItWorksSheetStyles,
  } = useGroupsStyles();
  const [orbitData, setOrbitData] = useState<OrbitScreenDataV1 | undefined>(undefined);

  const {
    isLoading,
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
  } = useGroups(props);

  const safeAreaProps = { edges: ['top', 'left', 'right'] as const };

  const renderGroupCard: ListRenderItem<GroupCardData> = (info) => (
    <GroupCardItem
      styles={cardStyles}
      group={info.item}
      onPress={onGroupPress}
    />
  );

  function keyExtractor(item: GroupCardData): string {
    return item.id;
  }

  function keyExtractorPlanet(item: OpenPlanetCardV1): string {
    return item.id ?? '';
  }

  const renderOpenPlanetCard: ListRenderItem<OpenPlanetCardV1> = (info) => (
    <OpenPlanetCard
      styles={openPlanetCardStyles}
      planet={info.item}
      onOrbit={onOrbit}
      onRequestToJoin={onRequestToJoin}
      onMergePlanet={onMergePlanet}
    />
  );

  const hasGroups = groups.length > 0;

  return (
    <SafeAreaView style={styles.safeArea} {...safeAreaProps}>
      <View style={styles.container}>
        <GroupsHeader
          styles={headerStyles}
          unreadCount={unreadNotificationCount}
          onNotificationsPress={onNotificationsPress}
        />

        <TabBar
          styles={tabBarStyles}
          activeTab={activeTab}
          onTabChange={onTabChange}
          onInfoPress={onOpenHowItWorks}
        />

        {activeTab === 'MY_CREWS' ? (
          <>
            {isLoading ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#FF5C4D" />
              </View>
            ) : hasGroups ? (
              <FlatList
                data={groups}
                renderItem={renderGroupCard}
                keyExtractor={keyExtractor}
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
              />
            ) : (
              <GroupsEmptyState styles={emptyStateStyles} onCreateGroup={onCreateGroup} />
            )}
            <GroupsFab styles={fabStyles} onPress={onCreateGroup} />
          </>
        ) : (
          <>
            {isOpenPlanetsLoading ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#FF5C4D" />
              </View>
            ) : (
              <FlatList
                data={openPlanets}
                renderItem={renderOpenPlanetCard}
                keyExtractor={keyExtractorPlanet}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            )}
          </>
        )}

        {toastMessage != null && (
          <Toast styles={toastStyles} message={toastMessage} />
        )}

        {joinRequestGroupId != null && (
          <JoinSheet
            styles={joinSheetStyles}
            groupId={joinRequestGroupId}
            onSend={onSendJoinRequest}
            onClose={onCloseJoinSheet}
          />
        )}
      </View>

      {/* Merge Planets Screen (full screen modal) */}
      <Modal
        visible={mergePlanetTargetGroupId != null && orbitData == null}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={onCloseMergeScreen}
      >
        {mergePlanetTargetGroupId != null && (
          <MergePlanetsScreen
            targetGroupId={mergePlanetTargetGroupId}
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

      {/* How It Works bottom sheet */}
      {isHowItWorksSheetVisible && (
        <Modal
          transparent
          animationType="slide"
          onRequestClose={onCloseHowItWorks}
        >
          <HowItWorksSheet
            styles={howItWorksSheetStyles}
            onClose={onCloseHowItWorks}
          />
        </Modal>
      )}
    </SafeAreaView>
  );
}

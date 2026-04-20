/**
 * Main container for the Notifications route
 */

import { type ReactNode, useState } from 'react';
import 'react-native-reanimated';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Pressable, ScrollView, RefreshControl, Modal, TextInput } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  BellOff,
  Swords,
  Trophy,
  Clock,
  UserPlus,
  Users,
  Trash2,
} from 'lucide-react-native';

import { t } from '@/i18n';
import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import { CustomButton } from '@/comp-lib/core/custom-button/CustomButton';
import { CustomHeader } from '@/comp-lib/custom-header/CustomHeader';
import { useNotificationsStyles } from './NotificationsStyles';
import { type NotificationType, type OrbitScreenDataV1 } from '@shared/generated-db-types';
import {
  useNotifications,
  isUrgentNotification,
  formatRelativeTime,
  type NotificationItemData,
  type NotificationGroup,
} from './NotificationsFunc';
import { NotificationsProps } from '@/app/notifications';
import MergePlanetsScreen from '@/comp-app/MergePlanetsScreen';
import OrbitScreen from '@/comp-app/OrbitScreen';
import {
  type NotificationSectionHeaderStyles,
  type NotificationCardStyles,
  type NotificationsEmptyStateStyles,
  type NotifJoinSheetStyles,
} from './NotificationsStyles';

// ── Constants ──

const SWIPE_DISMISS_THRESHOLD = -80;
const SWIPE_ANIMATION_DURATION_IN_MS = 200;
const DISMISS_ANIMATION_DURATION_IN_MS = 300;
const ICON_SIZE_CARD = 20;
const ICON_SIZE_EMPTY = 40;

// ── Icon Helpers ──

function getNotificationIcon(type: NotificationType, color: string): ReactNode {
  switch (type) {
    case 'GROUP_INVITE':
      return <Users size={ICON_SIZE_CARD} color={color} />;
    case 'BATTLE_STARTED':
      return <Swords size={ICON_SIZE_CARD} color={color} />;
    case 'BATTLE_ENDED':
      return <Trophy size={ICON_SIZE_CARD} color={color} />;
    case 'DEAL_EXPIRING':
      return <Clock size={ICON_SIZE_CARD} color={color} />;
    case 'FRIEND_JOINED':
      return <UserPlus size={ICON_SIZE_CARD} color={color} />;
    default:
      return <Users size={ICON_SIZE_CARD} color={color} />;
  }
}

function getIconColor(_type: NotificationType): string {
  return '#FF5C4D';
}

function getIconContainerStyle(
  type: NotificationType,
  cardStyles: NotificationCardStyles,
): object {
  switch (type) {
    case 'GROUP_INVITE':
      return cardStyles.iconContainerGroupInvite;
    case 'BATTLE_STARTED':
      return cardStyles.iconContainerBattleStarted;
    case 'BATTLE_ENDED':
      return cardStyles.iconContainerBattleEnded;
    case 'DEAL_EXPIRING':
      return cardStyles.iconContainerDealExpiring;
    case 'FRIEND_JOINED':
      return cardStyles.iconContainerFriendJoined;
    default:
      return cardStyles.iconContainerGroupInvite;
  }
}

// ── Sub-components ──

interface NotificationSectionHeaderProps {
  styles: NotificationSectionHeaderStyles;
  title: string;
}

function NotificationSectionHeader(props: NotificationSectionHeaderProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <CustomTextField styles={props.styles.titleText} title={props.title} />
    </View>
  );
}

const MERGE_NOTIFICATION_TYPES: ReadonlySet<NotificationType> = new Set<NotificationType>([
  'MERGE_REQUEST',
  'MERGE_INITIATED',
]);

const ORBIT_NOTIFICATION_TYPES: ReadonlySet<NotificationType> = new Set<NotificationType>([
  'ORBIT_ACTIVITY',
]);

interface NotificationCardProps {
  styles: NotificationCardStyles;
  notification: NotificationItemData;
  onPress: (notification: NotificationItemData) => void;
  onDismiss: (notificationId: string) => void;
  onViewMerge: (mergeRequestId: string) => void;
  onJoinNow: (notification: NotificationItemData) => void;
}

function NotificationCard(props: NotificationCardProps): ReactNode {
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue<number | undefined>(undefined);
  const isUrgent = isUrgentNotification(props.notification.type);
  const isUnread = !props.notification.isRead;
  const isMergeType = MERGE_NOTIFICATION_TYPES.has(props.notification.type);
  const isOrbitType = ORBIT_NOTIFICATION_TYPES.has(props.notification.type);

  function handleDismiss(): void {
    props.onDismiss(props.notification.id);
  }

  function handleViewMerge(): void {
    if (props.notification.mergeRequestId != null) {
      props.onViewMerge(props.notification.mergeRequestId);
    }
  }

  function handleJoinNow(): void {
    props.onJoinNow(props.notification);
  }

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-5, 5])
    .onUpdate((event) => {
      if (event.translationX < 0) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if (event.translationX < SWIPE_DISMISS_THRESHOLD) {
        translateX.value = withTiming(-400, { duration: DISMISS_ANIMATION_DURATION_IN_MS });
        itemHeight.value = withTiming(0, { duration: DISMISS_ANIMATION_DURATION_IN_MS }, () => {
          runOnJS(handleDismiss)();
        });
      } else {
        translateX.value = withTiming(0, { duration: SWIPE_ANIMATION_DURATION_IN_MS });
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedContainerStyle = useAnimatedStyle(() => {
    if (itemHeight.value != null) {
      return { height: itemHeight.value, overflow: 'hidden' as const };
    }
    return {};
  });

  return (
    <Animated.View style={[{ overflow: 'hidden' }, animatedContainerStyle]}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <View style={[props.styles.swipeDeleteContainer, { flex: 1 }]}>
          <View style={{ width: 24, height: 24 }}>
            <Trash2 size={20} color="rgba(255, 245, 236, 0.3)" />
          </View>
        </View>
      </View>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedCardStyle}>
          <Pressable
            style={props.styles.pressable}
            onPress={() => props.onPress(props.notification)}
          >
            <View
              style={[
                props.styles.container,
                isUnread ? props.styles.containerUnread : undefined,
              ]}
            >
              <View
                style={[
                  props.styles.accentBar,
                  isUnread ? props.styles.accentBarUrgent : undefined,
                ]}
              />
              <View style={props.styles.contentRow}>
                <View
                  style={[
                    props.styles.iconContainer,
                    isMergeType
                      ? props.styles.iconContainerMerge
                      : isOrbitType
                        ? props.styles.iconContainerOrbit
                        : getIconContainerStyle(props.notification.type, props.styles),
                  ]}
                >
                  {isMergeType ? (
                    <CustomTextField
                      styles={{ fontSize: ICON_SIZE_CARD + 4, lineHeight: ICON_SIZE_CARD + 8 }}
                      title="🌍"
                    />
                  ) : isOrbitType ? (
                    <CustomTextField
                      styles={{ fontSize: ICON_SIZE_CARD + 4, lineHeight: ICON_SIZE_CARD + 8 }}
                      title="🪐"
                    />
                  ) : (
                    getNotificationIcon(
                      props.notification.type,
                      getIconColor(props.notification.type),
                    )
                  )}
                </View>
                <View style={props.styles.textContent}>
                  <View style={props.styles.titleRow}>
                    <CustomTextField
                      styles={[
                        props.styles.titleText,
                        isMergeType ? { fontSize: 15, fontFamily: 'strenuous', fontWeight: '700' } : undefined,
                    isOrbitType ? { fontSize: 15, fontFamily: 'strenuous', fontWeight: '700', color: '#CFFF47' } : undefined,
                      ]}
                      title={props.notification.title}
                      numberOfLines={1}
                    />
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <CustomTextField
                        styles={props.styles.timestampText}
                        title={formatRelativeTime(props.notification.createdAt)}
                      />
                      {isUnread && <View style={props.styles.unreadDot} />}
                    </View>
                  </View>
                  <CustomTextField
                    styles={props.styles.descriptionText}
                    title={props.notification.description}
                    numberOfLines={2}
                  />
                  {isMergeType && props.notification.mergeRequestId != null && (
                    <View style={{ marginTop: 8, alignSelf: 'flex-start' }}>
                      <Pressable
                        style={{
                          backgroundColor: '#CFFF47',
                          borderRadius: 12,
                          paddingVertical: 6,
                          paddingHorizontal: 12,
                        }}
                        onPress={handleViewMerge}
                      >
                        <CustomTextField
                          styles={{
                            fontFamily: 'tt-autonomous-mono',
                            fontSize: 12,
                            lineHeight: 16,
                            fontWeight: '700',
                            color: '#2D2D2D',
                          }}
                          title="VIEW MERGE"
                        />
                      </Pressable>
                    </View>
                  )}
                  {isOrbitType && props.notification.groupId != null && (
                    <View style={{ marginTop: 8, alignSelf: 'flex-start' }}>
                      <Pressable
                        style={{
                          backgroundColor: '#FF5C4D',
                          borderRadius: 12,
                          paddingVertical: 6,
                          paddingHorizontal: 12,
                        }}
                        onPress={handleJoinNow}
                      >
                        <CustomTextField
                          styles={{
                            fontFamily: 'tt-autonomous-mono',
                            fontSize: 12,
                            lineHeight: 16,
                            fontWeight: '700',
                            color: '#FFF5EC',
                          }}
                          title="JOIN NOW"
                        />
                      </Pressable>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

interface NotificationsEmptyStateProps {
  styles: NotificationsEmptyStateStyles;
}

function NotificationsEmptyState(props: NotificationsEmptyStateProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <View style={props.styles.iconContainer}>
        <BellOff size={ICON_SIZE_EMPTY} color="rgba(255, 245, 236, 0.4)" />
      </View>
      <CustomTextField styles={props.styles.title} title={t('notifications.emptyTitle')} />
      <CustomTextField styles={props.styles.subtitle} title={t('notifications.emptySubtitle')} />
    </View>
  );
}

// ── Join Sheet ──

interface JoinSheetProps {
  styles: NotifJoinSheetStyles;
  groupName?: string;
  groupId: string;
  onSend: (groupId: string, message: string) => void;
  onClose: () => void;
}

function JoinSheet(props: JoinSheetProps): ReactNode {
  const [message, setMessage] = useState('');
  const title = props.groupName != null ? `Request to Join ${props.groupName}` : 'Request to Join';

  function onPressSend(): void {
    props.onSend(props.groupId, message);
    setMessage('');
  }

  return (
    <Modal transparent animationType="slide" onRequestClose={props.onClose}>
      <View style={props.styles.backdrop}>
        <View style={props.styles.sheet}>
          <CustomTextField styles={props.styles.title} title={title} />
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

// ── Main Container ──

export default function NotificationsContainer(props: NotificationsProps): ReactNode {
  const {
    styles,
    headerStyles,
    markAllReadButtonStyles,
    sectionHeaderStyles,
    cardStyles,
    emptyStateStyles,
    joinSheetStyles,
  } = useNotificationsStyles();
  const {
    groupedNotifications,
    unreadCount,
    isRefreshing,
    hasNotifications,
    onRefresh,
    onMarkAllRead,
    onDismissNotification,
    onNotificationPress,
    activeMergeRequestId,
    onViewMerge,
    onCloseMergeScreen,
    joinRequestGroupId,
    joinRequestGroupName,
    onJoinNow,
    onCloseJoinSheet,
    onSendJoinRequest,
  } = useNotifications(props);
  const [orbitData, setOrbitData] = useState<OrbitScreenDataV1 | undefined>(undefined);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <CustomHeader
          showBackButton
          onGoBack={props.onGoBack}
          title={t('notifications.title')}
          customHeaderStyles={headerStyles}
          RightComponent={
            unreadCount > 0 ? (
              <CustomButton
                onPress={onMarkAllRead}
                title={t('notifications.markAllRead')}
                styles={markAllReadButtonStyles}
              />
            ) : undefined
          }
        />

        {hasNotifications ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
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
            {groupedNotifications.map((group: NotificationGroup) => (
              <View key={group.title}>
                <NotificationSectionHeader
                  styles={sectionHeaderStyles}
                  title={group.title}
                />
                <View style={styles.cardList}>
                  {group.data.map((notification: NotificationItemData) => (
                    <NotificationCard
                      key={notification.id}
                      styles={cardStyles}
                      notification={notification}
                      onPress={onNotificationPress}
                      onDismiss={onDismissNotification}
                      onViewMerge={onViewMerge}
                      onJoinNow={onJoinNow}
                    />
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <NotificationsEmptyState styles={emptyStateStyles} />
        )}
      </View>

      {/* Merge Planets Screen (full screen modal) */}
      <Modal
        visible={activeMergeRequestId != null && orbitData == null}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={onCloseMergeScreen}
      >
        {activeMergeRequestId != null && (
          <MergePlanetsScreen
            mergeRequestId={activeMergeRequestId}
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

      {/* Join Sheet (triggered by JOIN NOW on orbit notifications) */}
      {joinRequestGroupId != null && (
        <JoinSheet
          styles={joinSheetStyles}
          groupId={joinRequestGroupId}
          groupName={joinRequestGroupName}
          onSend={onSendJoinRequest}
          onClose={onCloseJoinSheet}
        />
      )}
    </SafeAreaView>
  );
}

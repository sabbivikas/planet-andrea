/**
 * Main container for the Chat route
 */

import { type ReactElement, type ReactNode, useEffect } from 'react';
import { KeyboardAvoidingView, View, Platform, Pressable, Text, type ViewStyle } from 'react-native';
import Animated, {
  FadeInDown,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Send, Users, ChevronDown, MessageCircle } from 'lucide-react-native';

import { t } from '@/i18n';
import { CustomHeader } from '@/comp-lib/custom-header/CustomHeader';
import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import { CustomButton } from '@/comp-lib/core/custom-button/CustomButton';
import { ChatMessageRenderer } from '@/comp-lib/chat/message-renderer/ChatMessageRenderer';
import { ChatInputFooter } from '@/comp-lib/chat/input-footer/ChatInputFooter';
import { useChatStyles } from './ChatStyles';
import {
  useChat,
  type ChatMessageItem,
  type MessageReaction,
  type SharedActivityData,
  type TypingUser,
} from './ChatFunc';
import { ChatProps } from '@/app/chat';
import {
  type SystemMessageStyles,
  type ActivityCardStyles,
  type ReactionBadgeStyles,
  type TypingIndicatorStyles,
  type UnreadBadgeStyles,
  type UnreadBadgeIconStyles,
  type ChatHeaderSubtitleStyles,
  type SendIconStyles,
  type TimestampStyles,
  type DateSeparatorStyles,
  type ReactionPickerStyles,
  type EmptyStateStyles,
} from './ChatStyles';

// ── Constants ──

const TYPING_DOT_COUNT = 3;
const TYPING_DOT_DURATION_IN_MS = 600;
const TYPING_DOT_DELAY_IN_MS = 200;
const STAGGER_DELAY_IN_MS = 50;

// ── Sub-components ──

interface SystemMessageProps {
  styles: SystemMessageStyles;
  text: string;
}

function SystemMessage(props: SystemMessageProps): ReactNode {
  const newlineIndex = props.text.indexOf('\n');
  const mainLine = newlineIndex >= 0 ? props.text.slice(0, newlineIndex) : props.text;
  const subLine = newlineIndex >= 0 ? props.text.slice(newlineIndex + 1) : undefined;
  return (
    <View style={props.styles.container}>
      <View style={props.styles.bubble}>
        <Text style={props.styles.text}>{mainLine}</Text>
        {subLine != null && <Text style={props.styles.subText}>{subLine}</Text>}
      </View>
    </View>
  );
}

interface ActivityCardPreviewProps {
  styles: ActivityCardStyles;
  activity: SharedActivityData;
  onPress: () => void;
}

function ActivityCardPreview(props: ActivityCardPreviewProps): ReactNode {
  return (
    <Pressable onPress={props.onPress}>
      <View style={props.styles.container}>
        <Image
          source={{ uri: props.activity.imageUrl }}
          style={props.styles.image}
          contentFit="cover"
          transition={200}
        />
        <View style={props.styles.overlay}>
          <View style={props.styles.infoArea}>
            <CustomTextField styles={props.styles.title} title={props.activity.title} numberOfLines={1} />
            <CustomTextField styles={props.styles.venue} title={props.activity.venue} numberOfLines={1} />
            {props.activity.dealLabel != null && (
              <View style={props.styles.dealBadge}>
                <CustomTextField styles={props.styles.dealBadgeText} title={props.activity.dealLabel} />
              </View>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

interface ReactionBadgesProps {
  styles: ReactionBadgeStyles;
  reactions: MessageReaction[];
  messageId: string;
  onReaction: (messageId: string, emoji: string) => void;
}

function ReactionBadges(props: ReactionBadgesProps): ReactNode {
  if (props.reactions.length === 0) return undefined;

  return (
    <View style={props.styles.container}>
      {props.reactions.map((reaction) => (
        <Pressable
          key={reaction.emoji}
          onPress={() => props.onReaction(props.messageId, reaction.emoji)}
        >
          <View style={[props.styles.badge, reaction.hasReacted ? props.styles.badgeActive : undefined]}>
            <CustomTextField
              styles={props.styles.text}
              title={`${reaction.emoji} ${reaction.count}`}
            />
          </View>
        </Pressable>
      ))}
    </View>
  );
}

interface TypingDotProps {
  dotStyle: object;
  delayInMs: number;
}

function TypingDot(props: TypingDotProps): ReactNode {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      props.delayInMs,
      withRepeat(
        withTiming(1, { duration: TYPING_DOT_DURATION_IN_MS, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      ),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    ...(props.dotStyle as object),
    opacity: opacity.value,
  }));

  return <Animated.View style={animatedStyle} />;
}

interface TypingIndicatorComponentProps {
  styles: TypingIndicatorStyles;
  typingUsers: TypingUser[];
}

function TypingIndicatorComponent(props: TypingIndicatorComponentProps): ReactNode {
  if (props.typingUsers.length === 0) return undefined;

  const label =
    props.typingUsers.length === 1
      ? t('groupChat.typingOne', { name: props.typingUsers[0].name })
      : t('groupChat.typingMultiple', { count: props.typingUsers.length });

  return (
    <Animated.View entering={FadeInDown.duration(200)} style={props.styles.container}>
      <View style={props.styles.dotRow}>
        {Array.from({ length: TYPING_DOT_COUNT }).map((_, i) => (
          <TypingDot
            key={`dot-${i}`}
            dotStyle={props.styles.dot}
            delayInMs={i * TYPING_DOT_DELAY_IN_MS}
          />
        ))}
      </View>
      <CustomTextField styles={props.styles.text} title={label} />
    </Animated.View>
  );
}

interface UnreadBadgeComponentProps {
  styles: UnreadBadgeStyles;
  iconStyles: UnreadBadgeIconStyles;
  count: number;
  onPress: () => void;
}

function UnreadBadgeComponent(props: UnreadBadgeComponentProps): ReactNode {
  return (
    <Animated.View entering={FadeIn.duration(200)}>
      <Pressable style={props.styles.container} onPress={props.onPress}>
        <View style={props.iconStyles.wrapper}>
          <ChevronDown size={14} color="#FFF5EC" />
        </View>
        <CustomTextField
          styles={props.styles.text}
          title={t('groupChat.unreadMessages', { count: props.count })}
        />
      </Pressable>
    </Animated.View>
  );
}

interface HeaderSubtitleProps {
  styles: ChatHeaderSubtitleStyles;
  memberCount: number;
}

function HeaderSubtitle(props: HeaderSubtitleProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <View style={props.styles.onlineDot} />
      <View style={props.styles.iconWrapper}>
        <Users size={12} color="rgba(255, 245, 236, 0.5)" />
      </View>
      <CustomTextField
        styles={props.styles.text}
        title={t('groupDetail.membersCount', { count: props.memberCount })}
      />
    </View>
  );
}

interface MessageTimestampProps {
  styles: TimestampStyles;
  label: string;
  isCurrentUser: boolean;
}

function MessageTimestamp(props: MessageTimestampProps): ReactNode {
  const alignStyle: ViewStyle = { alignItems: props.isCurrentUser ? 'flex-end' : 'flex-start' };
  return (
    <View style={[props.styles.container, alignStyle]}>
      <CustomTextField styles={props.styles.text} title={props.label} />
    </View>
  );
}

interface DateSeparatorProps {
  styles: DateSeparatorStyles;
  label: string;
}

function DateSeparator(props: DateSeparatorProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <View style={props.styles.line} />
      <View style={props.styles.labelWrapper}>
        <CustomTextField styles={props.styles.text} title={props.label} />
      </View>
      <View style={props.styles.line} />
    </View>
  );
}

interface ReactionPickerComponentProps {
  styles: ReactionPickerStyles;
  emojis: string[];
  messageId: string;
  onReaction: (messageId: string, emoji: string) => void;
  onDismiss: () => void;
}

function ReactionPickerComponent(props: ReactionPickerComponentProps): ReactNode {
  return (
    <Pressable style={props.styles.overlay} onPress={props.onDismiss}>
      <Animated.View entering={FadeIn.duration(150)} style={props.styles.container}>
        {props.emojis.map((emoji) => (
          <Pressable
            key={emoji}
            style={props.styles.emojiButton}
            onPress={() => props.onReaction(props.messageId, emoji)}
          >
            <CustomTextField styles={props.styles.emoji} title={emoji} />
          </Pressable>
        ))}
      </Animated.View>
    </Pressable>
  );
}

interface EmptyStateChatProps {
  styles: EmptyStateStyles;
}

function EmptyStateChat(props: EmptyStateChatProps): ReactNode {
  return (
    <View style={props.styles.container}>
      <View style={props.styles.iconWrapper}>
        <View style={{ width: 28, height: 28 }}>
          <MessageCircle size={28} color="#FF5C4D" />
        </View>
      </View>
      <CustomTextField styles={props.styles.title} title={t('groupChat.emptyTitle')} />
      <CustomTextField styles={props.styles.subtitle} title={t('groupChat.emptySubtitle')} />
    </View>
  );
}

// ── Main Container ──

export default function ChatContainer(props: ChatProps): ReactNode {
  const {
    messages,
    inputText,
    isSendDisabled,
    messagesListRef,
    inputRef,
    multiline,
    keyboardVerticalOffset,
    groupInfo,
    typingUsers,
    hasUnreadMessages,
    unreadCount,
    quickReactionEmojis,
    reactionPickerMessageId,
    setInputText,
    onSend,
    onGoBack,
    onScrollToBottom,
    onScroll,
    onReaction,
    onActivityCardPress,
    onLongPressMessage,
    onDismissReactionPicker,
  } = useChat(props);

  const {
    styles,
    customTextInputStyles,
    chatInputFooterBaseStyles,
    sendButtonStyles,
    chatHeaderStyles,
    chatHeaderSubtitleStyles,
    messageRendererStyles,
    systemMessageStyles,
    activityCardStyles,
    reactionBadgeStyles,
    typingIndicatorStyles,
    unreadBadgeStyles,
    unreadBadgeIconStyles,
    sendIconStyles,
    timestampStyles,
    dateSeparatorStyles,
    reactionPickerStyles,
    emptyStateStyles,
  } = useChatStyles(multiline);

  function renderMessage({ item, index }: { item: ChatMessageItem; index: number }): ReactElement | null {
    const showDateSeparator = item.dateSeparatorLabel != null;

    if (item.messageType === 'SYSTEM') {
      return (
        <Animated.View entering={FadeInDown.delay(index * STAGGER_DELAY_IN_MS).duration(250)}>
          <SystemMessage styles={systemMessageStyles} text={item.contentText} />
          {showDateSeparator && (
            <DateSeparator styles={dateSeparatorStyles} label={item.dateSeparatorLabel!} />
          )}
        </Animated.View>
      );
    }

    const hasActivity = item.messageType === 'ACTIVITY_SHARE' && item.sharedActivity != null;
    const hasReactions = item.reactions != null && item.reactions.length > 0;
    const isPickerTarget = reactionPickerMessageId === item.id;

    return (
      <Animated.View entering={FadeInDown.delay(index * STAGGER_DELAY_IN_MS).duration(250)}>
        <Pressable onLongPress={() => onLongPressMessage(item.id)} delayLongPress={400}>
          {isPickerTarget && (
            <ReactionPickerComponent
              styles={reactionPickerStyles}
              emojis={quickReactionEmojis}
              messageId={item.id}
              onReaction={onReaction}
              onDismiss={onDismissReactionPicker}
            />
          )}
          <ChatMessageRenderer
            messageContentText={item.contentText}
            isUserMessage={item.isCurrentUser}
            avatarInitials={item.senderInitial}
            senderName={item.isCurrentUser ? undefined : item.senderName}
            chatMessageRendererStyles={messageRendererStyles}
            showOnlyCustomMessageComponent={hasActivity && !item.contentText}
            CustomMessageComponent={
              hasActivity ? (
                <ActivityCardPreview
                  styles={activityCardStyles}
                  activity={item.sharedActivity!}
                  onPress={() => onActivityCardPress(item.sharedActivity!.activityId)}
                />
              ) : undefined
            }
            BubbleBellowMessageComponent={
              hasReactions || item.timestampLabel != null ? (
                <View>
                  {hasReactions && (
                    <ReactionBadges
                      styles={reactionBadgeStyles}
                      reactions={item.reactions!}
                      messageId={item.id}
                      onReaction={onReaction}
                    />
                  )}
                  {item.timestampLabel != null && (
                    <MessageTimestamp
                      styles={timestampStyles}
                      label={item.timestampLabel}
                      isCurrentUser={item.isCurrentUser}
                    />
                  )}
                </View>
              ) : undefined
            }
            showOnlyBubbleBellowMessageComponent={false}
          />
        </Pressable>
        {showDateSeparator && (
          <DateSeparator styles={dateSeparatorStyles} label={item.dateSeparatorLabel!} />
        )}
      </Animated.View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <CustomHeader
          showBackButton
          onGoBack={onGoBack}
          title={groupInfo.groupName}
          customHeaderStyles={chatHeaderStyles}
          SubtitleComponent={
            <HeaderSubtitle
              styles={chatHeaderSubtitleStyles}
              memberCount={groupInfo.memberCount}
            />
          }
        />

        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          <View style={styles.subContainer}>
            <Animated.FlatList
              ref={messagesListRef}
              data={[...messages].reverse()}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.chatList}
              keyboardShouldPersistTaps="handled"
              onScroll={onScroll}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={
                <TypingIndicatorComponent
                  styles={typingIndicatorStyles}
                  typingUsers={typingUsers}
                />
              }
              ListEmptyComponent={<EmptyStateChat styles={emptyStateStyles} />}
            />
          </View>

          {hasUnreadMessages && (
            <UnreadBadgeComponent
              styles={unreadBadgeStyles}
              iconStyles={unreadBadgeIconStyles}
              count={unreadCount}
              onPress={onScrollToBottom}
            />
          )}

          <ChatInputFooter
            inputRef={inputRef}
            inputText={inputText}
            multiline={multiline}
            onInputChange={setInputText}
            onSend={onSend}
            isSendDisabled={isSendDisabled}
            chatInputFooterBaseStyles={chatInputFooterBaseStyles}
            customTextInputStyles={customTextInputStyles}
            sendCustomButtonStyles={sendButtonStyles}
            CustomSendButtonIconComponent={
              <View style={sendIconStyles.wrapper}>
                <Send size={18} color="#FFF5EC" />
              </View>
            }
          />
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

/**
 * Business logic for the Chat route
 */

import { useState, useRef, useEffect } from 'react';
import { Platform, FlatList, TextInput, Keyboard, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@/i18n';
import { toTimestamptzStr, toUuidStr, type uuidstr, type GroupChatMessageV1 } from '@shared/generated-db-types';
import {
  readGroupChatData,
  sendGroupChatMessage,
  addGroupChatReaction,
  removeGroupChatReaction,
} from '@shared/planet-group-db';
import { supabaseClient } from '@/api/supabase-client';
import { type BaseChatMessageItem } from '@/comp-lib/chat/message-renderer/ChatMessageRenderer';
import { ChatProps } from '@/app/chat';
import { useChatStyles } from './ChatStyles';
import { DEFAULT_SINGLELINE_INPUT_HEIGHT } from '@/comp-lib/core/custom-text-input/CustomTextInputStyles';

// ── Constants ──

const SCROLL_TO_BOTTOM_DELAY_IN_MS = 100;
const UNREAD_SCROLL_THRESHOLD = 200;
const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;

const QUICK_REACTION_EMOJIS: string[] = ['🔥', '😍', '👍', '😂', '🚀', '❤️'];

// ── Types ──

export type ChatMessageType = 'TEXT' | 'SYSTEM' | 'ACTIVITY_SHARE';

export interface SharedActivityData {
  activityId: string;
  title: string;
  venue: string;
  imageUrl: string;
  dealLabel?: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

export interface ChatMessageItem extends BaseChatMessageItem {
  messageType: ChatMessageType;
  senderName?: string;
  senderInitial?: string;
  senderColor?: string;
  reactions?: MessageReaction[];
  sharedActivity?: SharedActivityData;
  timestampLabel?: string;
  dateSeparatorLabel?: string;
}

export interface TypingUser {
  id: string;
  name: string;
}

export interface GroupChatInfo {
  groupName: string;
  memberCount: number;
}

/**
 * Interface for the return value of the useChat hook
 */
export interface ChatFunc {
  messages: ChatMessageItem[];
  isSending: boolean;
  inputText: string;
  isSendDisabled: boolean;
  messagesListRef: React.RefObject<FlatList<ChatMessageItem> | null>;
  inputRef: React.RefObject<TextInput | null>;
  multiline: boolean;
  keyboardVerticalOffset: number;
  groupInfo: GroupChatInfo;
  typingUsers: TypingUser[];
  hasUnreadMessages: boolean;
  unreadCount: number;
  quickReactionEmojis: string[];
  reactionPickerMessageId: string | undefined;
  onSend: () => void;
  setInputText: (text: string) => void;
  onGoBack: () => void;
  onScrollToBottom: () => void;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onReaction: (messageId: string, emoji: string) => void;
  onActivityCardPress: (activityId: string) => void;
  onLongPressMessage: (messageId: string) => void;
  onDismissReactionPicker: () => void;
}

// ── Helpers ──

function formatMessageTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (MS_PER_SECOND * SECONDS_PER_MINUTE));

  if (diffInMinutes < 1) return 'now';
  if (diffInMinutes < MINUTES_PER_HOUR) return `${diffInMinutes}m`;

  const diffInHours = Math.floor(diffInMinutes / MINUTES_PER_HOUR);
  if (diffInHours < HOURS_PER_DAY) return `${diffInHours}h`;

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const amPm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = String(minutes).padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${amPm}`;
}

function getDateSeparatorLabel(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MS_PER_SECOND);

  if (date >= startOfToday) return t('groupChat.todayLabel');
  if (date >= startOfYesterday) return t('groupChat.yesterdayLabel');

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[date.getMonth()]} ${date.getDate()}`;
}

function isSameDay(a: string, b: string): boolean {
  const dateA = new Date(a);
  const dateB = new Date(b);
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function parseChatMessageType(raw: string | undefined | null): ChatMessageType {
  if (raw === 'SYSTEM') return 'SYSTEM';
  if (raw === 'ACTIVITY_SHARE') return 'ACTIVITY_SHARE';
  return 'TEXT';
}

function mapApiMessageToItem(msg: GroupChatMessageV1): ChatMessageItem {
  const messageType = parseChatMessageType(msg.messageType);
  const hasSharedActivity = messageType === 'ACTIVITY_SHARE' && msg.sharedActivityId != null;

  return {
    id: msg.id,
    contentText: msg.contentText ?? '',
    createdAt: toTimestamptzStr(msg.createdAt),
    isCurrentUser: msg.isCurrentUser,
    messageType,
    senderName: msg.senderName ?? undefined,
    senderInitial: msg.senderInitial ?? undefined,
    senderColor: msg.senderColor ?? undefined,
    reactions: (msg.reactions ?? [])
      .filter((r) => r.emoji != null)
      .map((r) => ({
        emoji: r.emoji!,
        count: r.count,
        hasReacted: r.hasReacted,
      })),
    sharedActivity: hasSharedActivity
      ? {
          activityId: msg.sharedActivityId!,
          title: msg.sharedActivityTitle ?? '',
          venue: msg.sharedActivityVenue ?? '',
          imageUrl: msg.sharedActivityImageUrl ?? '',
          dealLabel: msg.sharedActivityDealLabel ?? undefined,
        }
      : undefined,
  };
}

function attachTimestampsAndSeparators(messages: ChatMessageItem[]): ChatMessageItem[] {
  // Messages are already sorted newest-first from the API.
  // Attach date separators: a message gets a separator when the *next* (older) message
  // is on a different day, or when it is the oldest message in the list.
  return messages.map((msg, index) => {
    const nextMsg = index < messages.length - 1 ? messages[index + 1] : undefined;
    const needsSeparator =
      msg.createdAt != null &&
      (nextMsg?.createdAt == null ||
        !isSameDay(msg.createdAt, nextMsg.createdAt));

    return {
      ...msg,
      timestampLabel: msg.createdAt != null ? formatMessageTimestamp(msg.createdAt) : undefined,
      dateSeparatorLabel:
        needsSeparator && msg.createdAt != null
          ? getDateSeparatorLabel(msg.createdAt)
          : undefined,
    };
  });
}

// ── Hook ──

/**
 * Custom hook that provides business logic for the Chat component
 */
export function useChat(props: ChatProps): ChatFunc {
  const groupId = (props.urlParams?.groupId as string | undefined) ?? undefined;

  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingUsers] = useState<TypingUser[]>([]);
  const [reactionPickerMessageId, setReactionPickerMessageId] = useState<string | undefined>(undefined);
  const [groupInfo, setGroupInfo] = useState<GroupChatInfo>({ groupName: '', memberCount: 0 });

  const messagesListRef = useRef<FlatList<ChatMessageItem>>(null);
  const inputRef = useRef<TextInput>(null);
  const isScrolledUpRef = useRef(false);

  const multiline = true;

  const insets = useSafeAreaInsets();

  const { customTextInputStyles } = useChatStyles(multiline);

  const inputHeightRaw =
    (customTextInputStyles?.container?.minHeight as number) ??
    (customTextInputStyles?.container?.height as number) ??
    DEFAULT_SINGLELINE_INPUT_HEIGHT;

  // Extra offset for devices with notch (top inset > 44)
  const needsExtraOffset = insets.top > 44;
  const extraOffset = needsExtraOffset ? 40 : 0;

  const keyboardVerticalOffset = inputHeightRaw - insets.top + insets.bottom + extraOffset;

  const [isSending, setIsSending] = useState<boolean>(false);

  const isSendDisabled = isSending || !inputText?.trim();

  // Load chat data from backend
  useEffect(() => {
    if (groupId == null) return;

    async function loadChatData(): Promise<void> {
      try {
        const data = await readGroupChatData(supabaseClient, toUuidStr(groupId!));
        if (data == null) return;

        setGroupInfo({
          groupName: data.groupName ?? '',
          memberCount: data.memberCount,
        });

        const apiMessages = (data.messages ?? []).map(mapApiMessageToItem);
        setMessages(attachTimestampsAndSeparators(apiMessages));
      } catch (error) {
        console.error('Error loading chat data:', error);
      }
    }

    loadChatData();
  }, [groupId]);

  async function handleOnSend(): Promise<void> {
    if (!inputText.trim() || groupId == null) return;

    const messageText = inputText.trim();
    setInputText('');
    inputRef.current?.clear();
    setIsSending(true);

    if (Platform.OS !== 'ios') {
      inputRef.current?.blur();
    }

    try {
      const sentMessage = await sendGroupChatMessage(supabaseClient, toUuidStr(groupId), messageText);

      if (sentMessage != null) {
        const newItem = mapApiMessageToItem(sentMessage);
        setMessages((prev) => attachTimestampsAndSeparators([newItem, ...prev]));
      }

      setTimeout(() => {
        messagesListRef.current?.scrollToEnd({ animated: true });
        Keyboard.dismiss();
      }, SCROLL_TO_BOTTOM_DELAY_IN_MS);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  }

  function onSend(): void {
    handleOnSend().catch((error) => {
      console.error('Error sending message:', error);
    });
  }

  function onGoBack(): void {
    props.onGoBack();
  }

  function onScrollToBottom(): void {
    messagesListRef.current?.scrollToEnd({ animated: true });
    setHasUnreadMessages(false);
    setUnreadCount(0);
  }

  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>): void {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - contentOffset.y - layoutMeasurement.height;
    const isUp = distanceFromBottom > UNREAD_SCROLL_THRESHOLD;
    isScrolledUpRef.current = isUp;

    if (!isUp) {
      setHasUnreadMessages(false);
      setUnreadCount(0);
    }

    // Dismiss reaction picker on scroll
    if (reactionPickerMessageId != null) {
      setReactionPickerMessageId(undefined);
    }
  }

  function onActivityCardPress(activityId: string): void {
    // TODO: Navigate to activity detail
    void activityId;
  }

  function onLongPressMessage(messageId: string): void {
    setReactionPickerMessageId(messageId);
  }

  function onDismissReactionPicker(): void {
    setReactionPickerMessageId(undefined);
  }

  function onReaction(messageId: string, emoji: string): void {
    setReactionPickerMessageId(undefined);

    // Optimistic update
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;

        const existingReactions = msg.reactions ?? [];
        const existingIndex = existingReactions.findIndex((r) => r.emoji === emoji);

        let updatedReactions: MessageReaction[];
        let shouldAdd: boolean;

        if (existingIndex >= 0) {
          const existing = existingReactions[existingIndex];
          if (existing.hasReacted) {
            shouldAdd = false;
            updatedReactions = existingReactions
              .map((r, i) =>
                i === existingIndex
                  ? { ...r, count: r.count - 1, hasReacted: false }
                  : r,
              )
              .filter((r) => r.count > 0);
          } else {
            shouldAdd = true;
            updatedReactions = existingReactions.map((r, i) =>
              i === existingIndex
                ? { ...r, count: r.count + 1, hasReacted: true }
                : r,
            );
          }
        } else {
          shouldAdd = true;
          updatedReactions = [...existingReactions, { emoji, count: 1, hasReacted: true }];
        }

        // Fire API call in background
        const apiCall = shouldAdd
          ? addGroupChatReaction(supabaseClient, toUuidStr(messageId), emoji)
          : removeGroupChatReaction(supabaseClient, toUuidStr(messageId), emoji);

        apiCall.catch((error) => {
          console.error('Error toggling reaction:', error);
        });

        return { ...msg, reactions: updatedReactions };
      }),
    );
  }

  return {
    messages,
    isSending,
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
    quickReactionEmojis: QUICK_REACTION_EMOJIS,
    reactionPickerMessageId,
    onSend,
    setInputText,
    onGoBack,
    onScrollToBottom,
    onScroll,
    onReaction,
    onActivityCardPress,
    onLongPressMessage,
    onDismissReactionPicker,
  };
}

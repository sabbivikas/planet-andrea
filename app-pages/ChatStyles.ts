/**
 * Styling for the Chat page
 */

import type { ViewStyle, TextStyle, ImageStyle } from 'react-native';

import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { CustomTextInputStyles } from '@/comp-lib/core/custom-text-input/CustomTextInputStyles';
import { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';
import {
  ChatInputFooterBaseStyles,
  useChatInputFooterStyles,
} from '@/comp-lib/chat/input-footer/ChatInputFooterStyles';
import { ChatMessageRendererStyles, useChatMessageRendererStyles } from '@/comp-lib/chat/message-renderer/ChatMessageRendererStyles';
import { CustomHeaderStyles, useCustomHeaderStyles } from '@/comp-lib/custom-header/CustomHeaderStyles';

// ── Sub-component style interfaces ──

export interface ChatHeaderSubtitleStyles {
  container: ViewStyle;
  text: TextStyle;
  iconWrapper: ViewStyle;
  onlineDot: ViewStyle;
}

export interface ChatHeaderStyles extends CustomHeaderStyles {}

export interface SystemMessageStyles {
  container: ViewStyle;
  bubble: ViewStyle;
  text: TextStyle;
  subText: TextStyle;
}

export interface ActivityCardStyles {
  container: ViewStyle;
  image: ImageStyle;
  overlay: ViewStyle;
  infoArea: ViewStyle;
  title: TextStyle;
  venue: TextStyle;
  dealBadge: ViewStyle;
  dealBadgeText: TextStyle;
  viewButton: CustomButtonStyles;
}

export interface ReactionBadgeStyles {
  container: ViewStyle;
  badge: ViewStyle;
  badgeActive: ViewStyle;
  text: TextStyle;
}

export interface TypingIndicatorStyles {
  container: ViewStyle;
  dotRow: ViewStyle;
  dot: ViewStyle;
  text: TextStyle;
}

export interface UnreadBadgeStyles {
  container: ViewStyle;
  text: TextStyle;
}

export interface TimestampStyles {
  container: ViewStyle;
  text: TextStyle;
}

export interface DateSeparatorStyles {
  container: ViewStyle;
  line: ViewStyle;
  labelWrapper: ViewStyle;
  text: TextStyle;
}

export interface ReactionPickerStyles {
  overlay: ViewStyle;
  container: ViewStyle;
  emoji: TextStyle;
  emojiButton: ViewStyle;
}

export interface EmptyStateStyles {
  container: ViewStyle;
  iconWrapper: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
}

/** Interface for base styles of the useChatStyles hook */
export interface ChatBaseStyles {
  safeArea: ViewStyle;
  container: ViewStyle;
  keyboardAvoidingView: ViewStyle;
  subContainer: ViewStyle;
  chatList: ViewStyle;
}

export interface UnreadBadgeIconStyles {
  wrapper: ViewStyle;
}

/**
 * Interface for the return value of the useChatStyles hook
 */
export interface SendIconStyles {
  wrapper: ViewStyle;
}

export interface ChatStyles {
  styles: ChatBaseStyles;
  customTextInputStyles: CustomTextInputStyles;
  chatInputFooterBaseStyles: ChatInputFooterBaseStyles;
  sendButtonStyles: CustomButtonStyles;
  chatHeaderStyles: ChatHeaderStyles;
  chatHeaderSubtitleStyles: ChatHeaderSubtitleStyles;
  messageRendererStyles: ChatMessageRendererStyles;
  systemMessageStyles: SystemMessageStyles;
  activityCardStyles: ActivityCardStyles;
  reactionBadgeStyles: ReactionBadgeStyles;
  typingIndicatorStyles: TypingIndicatorStyles;
  unreadBadgeStyles: UnreadBadgeStyles;
  unreadBadgeIconStyles: UnreadBadgeIconStyles;
  sendIconStyles: SendIconStyles;
  timestampStyles: TimestampStyles;
  dateSeparatorStyles: DateSeparatorStyles;
  reactionPickerStyles: ReactionPickerStyles;
  emptyStateStyles: EmptyStateStyles;
}

export function useChatStyles(multiline: boolean): ChatStyles {
  const {
    createAppPageStyles,
    overrideStyles,
    colors,
    spacingPresets,
    borderRadiusPresets,
    typographyPresets,
    buttonPresets,
  } = useStyleContext();

  const styles: ChatBaseStyles = {
    safeArea: {
      flex: 1,
      backgroundColor: colors.customColors.deepNavy,
    },
    container: {
      flex: 1,
      backgroundColor: colors.customColors.deepNavy,
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    subContainer: {
      flex: 1,
      paddingHorizontal: spacingPresets.md1,
    },
    chatList: {
      flexGrow: 1,
      paddingTop: spacingPresets.sm,
      paddingBottom: spacingPresets.sm,
    },
  };

  // ── Header ──

  const defaultHeaderStyles = useCustomHeaderStyles();
  const chatHeaderStyles: ChatHeaderStyles = overrideStyles(defaultHeaderStyles, {
    container: {
      backgroundColor: colors.customColors.deepNavy,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 245, 236, 0.06)',
      paddingHorizontal: spacingPresets.md1,
      paddingVertical: spacingPresets.xs,
    },
    mainContainer: {
      height: 48,
    },
    title: {
      ...typographyPresets.Label,
      color: colors.customColors.cream,
      fontWeight: '700',
      fontSize: 17,
      lineHeight: 22,
    },
    backCustomButtonStyles: overrideStyles(buttonPresets.Tertiary, {
      iconOnlyContainer: {
        marginLeft: -4,
        height: '100%',
        width: '100%',
        borderRadius: 0,
        justifyContent: 'flex-start',
      },
      text: {
        fontSize: spacingPresets.lg1,
        color: colors.customColors.cream,
      },
    }),
  });

  // ── Message Renderer ──

  const defaultMessageRendererStyles = useChatMessageRendererStyles();
  const messageRendererStyles: ChatMessageRendererStyles = overrideStyles(defaultMessageRendererStyles, {
    container: {
      marginBottom: spacingPresets.xxs,
    },
    avatarMessageContainerLeft: {
      paddingRight: spacingPresets.xl,
    },
    avatarMessageContainerRight: {
      paddingLeft: spacingPresets.xl,
    },
    avatar: {
      width: 30,
      height: 30,
      borderRadius: 15,
    },
    avatarLeft: {
      backgroundColor: colors.tertiaryBackground,
    },
    avatarLeftText: {
      color: colors.customColors.cream,
      fontWeight: '700',
      fontSize: 12,
      lineHeight: 16,
    },
    avatarRight: {
      backgroundColor: colors.primaryAccent,
    },
    avatarRightText: {
      color: colors.customColors.cream,
      fontWeight: '700',
      fontSize: 12,
      lineHeight: 16,
    },
    senderNameText: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.5)',
      fontSize: 11,
      lineHeight: 15,
      fontWeight: '600',
      marginBottom: spacingPresets.xxs,
    },
    rightBubble: {
      backgroundColor: colors.primaryAccent,
      borderRadius: borderRadiusPresets.components + 2,
      borderBottomRightRadius: spacingPresets.xs,
      paddingHorizontal: spacingPresets.md1,
      paddingVertical: spacingPresets.sm + 1,
      shadowColor: '#FF5C4D',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    leftBubble: {
      backgroundColor: 'rgba(255, 245, 236, 0.07)',
      borderRadius: borderRadiusPresets.components + 2,
      borderBottomLeftRadius: spacingPresets.xs,
      paddingHorizontal: spacingPresets.md1,
      paddingVertical: spacingPresets.sm + 1,
      borderWidth: 1,
      borderColor: 'rgba(255, 245, 236, 0.06)',
    },
    rightBubbleText: {
      ...typographyPresets.Body,
      color: colors.customColors.cream,
      fontSize: 15,
      lineHeight: 21,
    },
    leftBubbleText: {
      ...typographyPresets.Body,
      color: colors.customColors.cream,
      fontSize: 15,
      lineHeight: 21,
    },
  });

  // ── System Message ──

  const systemMessageStyles: SystemMessageStyles = {
    container: {
      alignItems: 'center',
      paddingVertical: spacingPresets.sm + 2,
      paddingHorizontal: spacingPresets.lg1,
    },
    bubble: {
      backgroundColor: '#243660',
      borderWidth: 1,
      borderColor: '#CFFF47',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 10,
      alignItems: 'center',
      gap: 4,
    },
    text: {
      fontFamily: 'tt-autonomous-mono',
      color: '#CFFF47',
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '700',
      textAlign: 'center',
    },
    subText: {
      fontFamily: 'tt-autonomous-mono',
      color: 'rgba(255, 245, 236, 0.5)',
      fontSize: 11,
      lineHeight: 15,
      textAlign: 'center',
    },
  };

  // ── Activity Card ──

  const ACTIVITY_CARD_HEIGHT = 150;
  const ACTIVITY_CARD_WIDTH = 230;

  const activityCardStyles: ActivityCardStyles = {
    container: {
      borderRadius: borderRadiusPresets.components,
      overflow: 'hidden',
      marginTop: spacingPresets.xs,
      width: ACTIVITY_CARD_WIDTH,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 6,
      borderWidth: 1,
      borderColor: 'rgba(255, 245, 236, 0.08)',
    },
    image: {
      width: '100%',
      height: ACTIVITY_CARD_HEIGHT,
    },
    overlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: spacingPresets.md1,
      paddingVertical: spacingPresets.sm,
      backgroundColor: 'rgba(27, 42, 74, 0.9)',
    },
    infoArea: {
      gap: spacingPresets.xxs,
    },
    title: {
      ...typographyPresets.Label,
      color: colors.customColors.cream,
      fontWeight: '700',
      fontSize: 14,
      lineHeight: 18,
    },
    venue: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.6)',
      fontSize: 11,
      lineHeight: 15,
    },
    dealBadge: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(207, 255, 71, 0.2)',
      paddingHorizontal: spacingPresets.xs + 2,
      paddingVertical: 2,
      borderRadius: 6,
      marginTop: spacingPresets.xxs,
    },
    dealBadgeText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.customColors.voltGreen,
      fontWeight: '900',
      fontSize: 9,
      lineHeight: 13,
      letterSpacing: 0.8,
    },
    viewButton: overrideStyles(buttonPresets.Tertiary, {
      container: {
        alignSelf: 'flex-start',
        paddingHorizontal: 0,
        paddingVertical: 0,
        marginTop: spacingPresets.xxs,
      },
      text: {
        color: colors.primaryAccent,
        fontWeight: '700',
        fontSize: 12,
        lineHeight: 16,
      },
    }),
  };

  // ── Reaction Badge ──

  const reactionBadgeStyles: ReactionBadgeStyles = {
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacingPresets.xs,
      marginTop: spacingPresets.xs,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 245, 236, 0.06)',
      borderRadius: 14,
      paddingHorizontal: spacingPresets.sm + 2,
      paddingVertical: spacingPresets.xxs + 1,
      borderWidth: 1,
      borderColor: 'rgba(255, 245, 236, 0.1)',
      gap: spacingPresets.xxs,
    },
    badgeActive: {
      backgroundColor: 'rgba(255, 92, 77, 0.12)',
      borderColor: 'rgba(255, 92, 77, 0.35)',
    },
    text: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.75)',
      fontSize: 13,
      lineHeight: 17,
    },
  };

  // ── Typing Indicator ──

  const TYPING_DOT_SIZE = 7;

  const typingIndicatorStyles: TypingIndicatorStyles = {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacingPresets.md1,
      paddingVertical: spacingPresets.sm,
      gap: spacingPresets.sm,
    },
    dotRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacingPresets.xs,
      backgroundColor: 'rgba(255, 245, 236, 0.06)',
      paddingHorizontal: spacingPresets.md1,
      paddingVertical: spacingPresets.sm + 2,
      borderRadius: borderRadiusPresets.components,
      borderWidth: 1,
      borderColor: 'rgba(255, 245, 236, 0.06)',
    },
    dot: {
      width: TYPING_DOT_SIZE,
      height: TYPING_DOT_SIZE,
      borderRadius: TYPING_DOT_SIZE / 2,
      backgroundColor: 'rgba(255, 245, 236, 0.45)',
    },
    text: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.45)',
      fontSize: 12,
      lineHeight: 16,
      fontStyle: 'italic',
    },
  };

  // ── Unread Badge ──

  const unreadBadgeStyles: UnreadBadgeStyles = {
    container: {
      position: 'absolute',
      bottom: spacingPresets.xl + spacingPresets.lg2,
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacingPresets.xs,
      backgroundColor: colors.primaryAccent,
      paddingHorizontal: spacingPresets.md2,
      paddingVertical: spacingPresets.sm,
      borderRadius: 20,
      shadowColor: '#FF5C4D',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 6,
      zIndex: 10,
    },
    text: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.customColors.cream,
      fontWeight: '800',
      fontSize: 13,
      lineHeight: 17,
    },
  };

  // ── Header Subtitle ──

  const SUBTITLE_ICON_SIZE = 12;

  const chatHeaderSubtitleStyles: ChatHeaderSubtitleStyles = {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacingPresets.xs,
    },
    text: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.5)',
      fontSize: 12,
      lineHeight: 16,
    },
    iconWrapper: {
      width: SUBTITLE_ICON_SIZE,
      height: SUBTITLE_ICON_SIZE,
    },
    onlineDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#34D399',
    },
  };

  // ── Send Icon ──

  const SEND_ICON_SIZE = 18;

  const sendIconStyles: SendIconStyles = {
    wrapper: {
      width: SEND_ICON_SIZE,
      height: SEND_ICON_SIZE,
    },
  };

  // ── Input Footer ──

  const { styles: defaultChatInputFooterBaseStyles, customTextInputStyles: defaultCustomTextInputStyles } =
    useChatInputFooterStyles(multiline);

  const chatInputFooterBaseStyles: ChatInputFooterBaseStyles = overrideStyles(defaultChatInputFooterBaseStyles, {
    container: {
      backgroundColor: colors.customColors.deepNavy,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 245, 236, 0.06)',
      paddingHorizontal: spacingPresets.md1,
      paddingVertical: spacingPresets.sm + 2,
    },
  });

  const customTextInputStyles: CustomTextInputStyles = overrideStyles(defaultCustomTextInputStyles, {
    container: {
      backgroundColor: '#1a2240',
      borderRadius: 24,
      borderWidth: 1,
      borderColor: '#3a4a6b',
      height: 48,
    },
    focused: {
      borderColor: 'rgba(255, 92, 77, 0.35)',
      backgroundColor: '#1a2240',
    },
    input: {
      color: '#FFF5EC',
      fontSize: 15,
      lineHeight: 21,
    },
    placeholderTextColor: 'rgba(255, 245, 236, 0.4)',
  });

  // ── Timestamp ──

  const timestampStyles: TimestampStyles = {
    container: {
      paddingHorizontal: spacingPresets.xs,
      paddingTop: spacingPresets.xxs,
    },
    text: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: 'rgba(255, 245, 236, 0.3)',
      fontSize: 10,
      lineHeight: 14,
    },
  };

  // ── Date Separator ──

  const dateSeparatorStyles: DateSeparatorStyles = {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacingPresets.md2,
      paddingVertical: spacingPresets.md1,
    },
    line: {
      flex: 1,
      height: 1,
      backgroundColor: 'rgba(255, 245, 236, 0.08)',
    },
    labelWrapper: {
      paddingHorizontal: spacingPresets.md1,
    },
    text: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: 'rgba(255, 245, 236, 0.35)',
      fontSize: 11,
      lineHeight: 15,
      fontWeight: '700',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
  };

  // ── Reaction Picker ──

  const REACTION_PICKER_EMOJI_SIZE = 44;

  const reactionPickerStyles: ReactionPickerStyles = {
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 50,
    },
    container: {
      flexDirection: 'row',
      alignSelf: 'center',
      backgroundColor: colors.tertiaryBackground,
      borderRadius: borderRadiusPresets.components + 8,
      paddingHorizontal: spacingPresets.sm,
      paddingVertical: spacingPresets.xs,
      gap: spacingPresets.xxs,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 10,
      borderWidth: 1,
      borderColor: 'rgba(255, 245, 236, 0.1)',
    },
    emojiButton: {
      width: REACTION_PICKER_EMOJI_SIZE,
      height: REACTION_PICKER_EMOJI_SIZE,
      borderRadius: REACTION_PICKER_EMOJI_SIZE / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emoji: {
      fontSize: 24,
      lineHeight: 30,
    },
  };

  // ── Empty State ──

  const emptyStateStyles: EmptyStateStyles = {
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacingPresets.lg2,
      gap: spacingPresets.md1,
    },
    iconWrapper: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: 'rgba(255, 92, 77, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacingPresets.sm,
    },
    title: {
      ...typographyPresets.Title,
      color: colors.customColors.cream,
      fontWeight: '700',
      fontSize: 18,
      lineHeight: 24,
      textAlign: 'center',
    },
    subtitle: {
      ...typographyPresets.Body,
      color: 'rgba(255, 245, 236, 0.45)',
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'center',
    },
  };

  // ── Unread Badge Icon ──

  const UNREAD_BADGE_ICON_SIZE = 14;

  const unreadBadgeIconStyles: UnreadBadgeIconStyles = {
    wrapper: {
      width: UNREAD_BADGE_ICON_SIZE,
      height: UNREAD_BADGE_ICON_SIZE,
    },
  };

  const SEND_BUTTON_SIZE = 36;

  const sendButtonStyles: CustomButtonStyles = overrideStyles(buttonPresets.Primary, {
    container: {
      backgroundColor: '#FF5C4D',
      borderRadius: SEND_BUTTON_SIZE / 2,
      width: SEND_BUTTON_SIZE,
      height: SEND_BUTTON_SIZE,
      shadowColor: '#FF5C4D',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 4,
    },
    pressedContainer: {
      backgroundColor: '#e04b3d',
    },
    disabledContainer: {
      backgroundColor: 'rgba(255, 92, 77, 0.2)',
      shadowOpacity: 0,
      elevation: 0,
    },
    text: {
      color: '#FFF5EC',
    },
  });

  return createAppPageStyles<ChatStyles>({
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
  });
}

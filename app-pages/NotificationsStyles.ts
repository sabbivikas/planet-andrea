/**
 * Styling for the Notifications page
 */
import { ViewStyle, TextStyle } from 'react-native';

import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';
import { CustomHeaderStyles, useCustomHeaderStyles } from '@/comp-lib/custom-header/CustomHeaderStyles';

// ── Sub-component style interfaces ──

export interface NotificationSectionHeaderStyles {
  container: ViewStyle;
  titleText: TextStyle;
}

export interface NotificationCardStyles {
  pressable: ViewStyle;
  container: ViewStyle;
  containerUnread: ViewStyle;
  accentBar: ViewStyle;
  accentBarUrgent: ViewStyle;
  contentRow: ViewStyle;
  iconContainer: ViewStyle;
  iconContainerGroupInvite: ViewStyle;
  iconContainerBattleStarted: ViewStyle;
  iconContainerBattleEnded: ViewStyle;
  iconContainerDealExpiring: ViewStyle;
  iconContainerFriendJoined: ViewStyle;
  iconContainerMerge: ViewStyle;
  iconContainerOrbit: ViewStyle;
  textContent: ViewStyle;
  titleRow: ViewStyle;
  titleText: TextStyle;
  timestampText: TextStyle;
  descriptionText: TextStyle;
  unreadDot: ViewStyle;
  swipeDeleteContainer: ViewStyle;
  swipeDeleteText: TextStyle;
  mergeActionButton: CustomButtonStyles;
}

export interface NotifJoinSheetStyles {
  backdrop: ViewStyle;
  sheet: ViewStyle;
  title: TextStyle;
  label: TextStyle;
  input: ViewStyle;
  inputText: TextStyle;
  sendButton: CustomButtonStyles;
  cancelButton: CustomButtonStyles;
}

export interface NotificationsEmptyStateStyles {
  container: ViewStyle;
  iconContainer: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
}

// ── Main styles interface ──

export interface NotificationsBaseStyles {
  safeArea: ViewStyle;
  container: ViewStyle;
  scrollContent: ViewStyle;
  cardList: ViewStyle;
}

export interface NotificationsStyles {
  styles: NotificationsBaseStyles;
  headerStyles: CustomHeaderStyles;
  markAllReadButtonStyles: CustomButtonStyles;
  sectionHeaderStyles: NotificationSectionHeaderStyles;
  cardStyles: NotificationCardStyles;
  emptyStateStyles: NotificationsEmptyStateStyles;
  joinSheetStyles: NotifJoinSheetStyles;
}

/**
 * Custom hook that provides styles for the Notifications component
 */
export function useNotificationsStyles(): NotificationsStyles {
  const {
    createAppPageStyles,
    colors,
    typographyPresets,
    buttonPresets,
    spacingPresets,
    borderRadiusPresets,
    overrideStyles,
  } = useStyleContext();

  const defaultHeaderStyles = useCustomHeaderStyles();

  // ── Base page styles ──

  const styles: NotificationsBaseStyles = {
    safeArea: {
      flex: 1,
      backgroundColor: colors.customColors.deepNavy,
    },
    container: {
      flex: 1,
      backgroundColor: colors.customColors.deepNavy,
    },
    scrollContent: {
      paddingHorizontal: spacingPresets.md2,
      paddingBottom: 80,
    },
    cardList: {
      gap: 12,
    },
  };

  // ── Header ──

  const headerStyles: CustomHeaderStyles = overrideStyles(defaultHeaderStyles, {
    container: {
      backgroundColor: 'transparent',
      paddingHorizontal: spacingPresets.md2,
      paddingTop: spacingPresets.sm,
    },
    mainContainer: {
      height: 48,
    },
    headerLeft: {
      minWidth: 44,
    },
    headerRight: {
      minWidth: 100,
      alignItems: 'flex-end',
    },
    title: {
      ...typographyPresets.Title,
      color: colors.customColors.cream,
      fontWeight: '800',
      fontSize: 20,
      lineHeight: 26,
    },
    backCustomButtonStyles: overrideStyles(defaultHeaderStyles.backCustomButtonStyles, {
      icon: {
        size: 24,
        color: colors.customColors.cream,
      },
    }),
  });

  // ── Mark All Read Button ──

  const markAllReadButtonStyles: CustomButtonStyles = overrideStyles(buttonPresets.Tertiary, {
    container: {
      paddingHorizontal: spacingPresets.sm,
      paddingVertical: spacingPresets.xs,
    },
    text: {
      color: colors.primaryAccent,
      fontWeight: '600',
      fontSize: 13,
      lineHeight: 18,
    },
    pressedText: {
      color: colors.primaryAccentDark,
    },
  });

  // ── Section Header ──

  const sectionHeaderStyles: NotificationSectionHeaderStyles = {
    container: {
      paddingTop: spacingPresets.lg1,
      paddingBottom: spacingPresets.sm,
      paddingLeft: 16,
    },
    titleText: {
      fontFamily: 'tt-autonomous-mono',
      color: 'rgba(255, 245, 236, 0.4)',
      fontSize: 11,
      lineHeight: 16,
    },
  };

  // ── Notification Card ──

  const ICON_CONTAINER_SIZE = 40;

  const cardStyles: NotificationCardStyles = {
    pressable: {
      borderRadius: 12,
    },
    container: {
      flexDirection: 'row',
      backgroundColor: '#243660',
      borderRadius: 12,
      overflow: 'hidden',
    },
    containerUnread: {
      backgroundColor: '#2a3d6b',
    },
    accentBar: {
      width: 3,
      backgroundColor: 'transparent',
    },
    accentBarUrgent: {
      backgroundColor: colors.primaryAccent,
    },
    contentRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacingPresets.md1,
      paddingVertical: spacingPresets.md1,
      gap: spacingPresets.md1,
    },
    iconContainer: {
      width: ICON_CONTAINER_SIZE,
      height: ICON_CONTAINER_SIZE,
      borderRadius: ICON_CONTAINER_SIZE / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconContainerGroupInvite: {
      backgroundColor: '#1B2A4A',
    },
    iconContainerBattleStarted: {
      backgroundColor: '#1B2A4A',
    },
    iconContainerBattleEnded: {
      backgroundColor: '#1B2A4A',
    },
    iconContainerDealExpiring: {
      backgroundColor: '#1B2A4A',
    },
    iconContainerFriendJoined: {
      backgroundColor: '#1B2A4A',
    },
    iconContainerMerge: {
      backgroundColor: 'rgba(207, 255, 71, 0.12)',
    },
    iconContainerOrbit: {
      backgroundColor: '#243660',
      borderWidth: 2,
      borderColor: '#FF5C4D',
    },
    textContent: {
      flex: 1,
      gap: spacingPresets.xxs,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacingPresets.sm,
    },
    titleText: {
      fontFamily: 'strenuous',
      color: '#FFF5EC',
      fontWeight: '700',
      fontSize: 15,
      lineHeight: 20,
      flex: 1,
    },
    timestampText: {
      fontFamily: 'tt-autonomous-mono',
      color: 'rgba(255, 245, 236, 0.4)',
      fontSize: 11,
      lineHeight: 16,
    },
    descriptionText: {
      fontFamily: 'tt-autonomous-mono',
      color: 'rgba(255, 245, 236, 0.7)',
      fontSize: 13,
      lineHeight: 18,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primaryAccent,
      marginLeft: spacingPresets.xs,
    },
    swipeDeleteContainer: {
      backgroundColor: colors.customColors.error,
      justifyContent: 'center',
      alignItems: 'flex-end',
      paddingHorizontal: spacingPresets.lg1,
      borderRadius: borderRadiusPresets.components,
    },
    swipeDeleteText: {
      ...typographyPresets.Label,
      color: colors.customColors.cream,
      fontWeight: '700',
      fontSize: 13,
      lineHeight: 18,
    },
    mergeActionButton: overrideStyles(buttonPresets.Primary, {
      container: {
        backgroundColor: colors.customColors.voltGreen,
        borderRadius: borderRadiusPresets.inputElements,
        paddingVertical: spacingPresets.xs,
        paddingHorizontal: spacingPresets.md1,
        alignSelf: 'flex-start',
      },
      pressedContainer: {
        backgroundColor: '#B8E63E',
      },
      text: {
        color: colors.customColors.inkBlack,
        fontWeight: '800',
        fontSize: 13,
        lineHeight: 17,
      },
    }),
  };

  // ── Empty State ──

  const EMPTY_ICON_SIZE = 88;

  const emptyStateStyles: NotificationsEmptyStateStyles = {
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacingPresets.lg2,
      paddingTop: spacingPresets.xxxl,
      gap: spacingPresets.md1,
    },
    iconContainer: {
      width: EMPTY_ICON_SIZE,
      height: EMPTY_ICON_SIZE,
      borderRadius: EMPTY_ICON_SIZE / 2,
      backgroundColor: 'rgba(255, 245, 236, 0.06)',
      borderWidth: 1,
      borderColor: 'rgba(255, 245, 236, 0.08)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacingPresets.sm,
    },
    title: {
      ...typographyPresets.Title,
      color: colors.customColors.cream,
      textAlign: 'center',
      fontSize: 20,
      lineHeight: 26,
    },
    subtitle: {
      ...typographyPresets.Body,
      color: 'rgba(255, 245, 236, 0.4)',
      textAlign: 'center',
      fontSize: 15,
      lineHeight: 22,
      maxWidth: 280,
    },
  };

  // ── Join Sheet (orbit notification) ──

  const joinSheetStyles: NotifJoinSheetStyles = {
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: '#1a2240',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: spacingPresets.lg1,
      paddingTop: spacingPresets.lg1,
      paddingBottom: 40,
      gap: spacingPresets.md1,
    },
    title: {
      fontFamily: 'SpaceGrotesk',
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '700',
      color: colors.customColors.cream,
    },
    label: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 13,
      lineHeight: 18,
      color: 'rgba(255, 245, 236, 0.5)',
    },
    input: {
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      paddingHorizontal: spacingPresets.md1,
      paddingVertical: spacingPresets.md1,
      minHeight: 80,
    },
    inputText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 14,
      lineHeight: 20,
      color: colors.customColors.cream,
    },
    sendButton: overrideStyles(buttonPresets.Primary, {
      container: {
        backgroundColor: '#CFFF47',
        borderRadius: borderRadiusPresets.inputElements,
        paddingVertical: spacingPresets.md1,
      },
      text: {
        color: '#2D2D2D',
        fontFamily: 'tt-autonomous-mono',
        fontWeight: '700',
        fontSize: 14,
        lineHeight: 20,
      },
    }),
    cancelButton: overrideStyles(buttonPresets.Tertiary, {
      container: {
        paddingVertical: spacingPresets.sm,
      },
      text: {
        color: 'rgba(255, 245, 236, 0.5)',
        fontFamily: 'tt-autonomous-mono',
        fontSize: 14,
        lineHeight: 20,
      },
    }),
  };

  return createAppPageStyles<NotificationsStyles>({
    styles,
    headerStyles,
    markAllReadButtonStyles,
    sectionHeaderStyles,
    cardStyles,
    emptyStateStyles,
    joinSheetStyles,
  });
}

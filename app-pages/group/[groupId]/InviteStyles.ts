/**
 * Styling for the Invite page
 */
import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';
import { CustomTextInputStyles } from '@/comp-lib/core/custom-text-input/CustomTextInputStyles';

// ── Sub-component style interfaces ──

export interface InviteHeaderStyles {
  container: ViewStyle;
  closeButton: ViewStyle;
  closeIcon: ViewStyle;
  titleArea: ViewStyle;
  titleText: TextStyle;
  placeholder: ViewStyle;
}

export interface ShareLinkCardStyles {
  container: ViewStyle;
  gradient: ViewStyle;
  label: TextStyle;
  hint: TextStyle;
  linkRow: ViewStyle;
  linkText: TextStyle;
  copyButton: CustomButtonStyles;
  shareButton: CustomButtonStyles;
  expiryText: TextStyle;
}

export interface SectionHeaderStyles {
  container: ViewStyle;
  titleText: TextStyle;
  hintText: TextStyle;
}

export interface SearchInputStyles {
  container: ViewStyle;
  textInput: CustomTextInputStyles;
}

export interface UserRowStyles {
  container: ViewStyle;
  avatar: ViewStyle;
  avatarText: TextStyle;
  avatarImage: ImageStyle;
  infoArea: ViewStyle;
  nameText: TextStyle;
  subtitleText: TextStyle;
  badgeRow: ViewStyle;
  verifiedBadge: ViewStyle;
  verifiedText: TextStyle;
  inviteButton: CustomButtonStyles;
  invitedButton: CustomButtonStyles;
  distanceText: TextStyle;
}

export interface PendingInviteRowStyles {
  container: ViewStyle;
  avatar: ViewStyle;
  avatarText: TextStyle;
  infoArea: ViewStyle;
  nameText: TextStyle;
  methodText: TextStyle;
  statusBadge: ViewStyle;
  statusBadgePending: ViewStyle;
  statusBadgeAccepted: ViewStyle;
  statusText: TextStyle;
  statusTextAccepted: TextStyle;
  sentText: TextStyle;
}

// ── Main styles interface ──

export interface InviteBaseStyles {
  safeArea: ViewStyle;
  container: ViewStyle;
  scrollContent: ViewStyle;
  sectionGap: ViewStyle;
}

export interface InviteStyles {
  styles: InviteBaseStyles;
  headerStyles: InviteHeaderStyles;
  shareLinkCardStyles: ShareLinkCardStyles;
  sectionHeaderStyles: SectionHeaderStyles;
  searchInputStyles: SearchInputStyles;
  userRowStyles: UserRowStyles;
  pendingInviteRowStyles: PendingInviteRowStyles;
  doneButtonStyles: CustomButtonStyles;
}

/**
 * Custom hook that provides styles for the Invite component
 */
export function useInviteStyles(): InviteStyles {
  const {
    createAppPageStyles,
    colors,
    typographyPresets,
    buttonPresets,
    textInputPresets,
    spacingPresets,
    borderRadiusPresets,
    overrideStyles,
  } = useStyleContext();

  // ── Base page styles ──

  const styles: InviteBaseStyles = {
    safeArea: {
      flex: 1,
      backgroundColor: colors.customColors.deepNavy,
    },
    container: {
      flex: 1,
      backgroundColor: colors.customColors.deepNavy,
    },
    scrollContent: {
      paddingBottom: spacingPresets.xl + spacingPresets.lg2,
    },
    sectionGap: {
      height: spacingPresets.lg1,
    },
  };

  // ── Header ──

  const HEADER_BUTTON_SIZE = 44;

  const headerStyles: InviteHeaderStyles = {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacingPresets.md2,
      paddingVertical: spacingPresets.sm,
      gap: spacingPresets.sm,
    },
    closeButton: {
      width: HEADER_BUTTON_SIZE,
      height: HEADER_BUTTON_SIZE,
      borderRadius: HEADER_BUTTON_SIZE / 2,
      backgroundColor: 'rgba(255, 245, 236, 0.08)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeIcon: {
      width: 22,
      height: 22,
    },
    titleArea: {
      flex: 1,
      alignItems: 'center',
    },
    titleText: {
      ...typographyPresets.Label,
      color: colors.customColors.cream,
      fontWeight: '700',
      fontSize: 17,
      lineHeight: 22,
    },
    placeholder: {
      width: HEADER_BUTTON_SIZE,
      height: HEADER_BUTTON_SIZE,
    },
  };

  // ── Share Link Card ──

  const shareLinkCardStyles: ShareLinkCardStyles = {
    container: {
      marginHorizontal: spacingPresets.md2,
      borderRadius: borderRadiusPresets.components,
      overflow: 'hidden',
      shadowColor: '#FF5C4D',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 6,
    },
    gradient: {
      paddingHorizontal: spacingPresets.md2,
      paddingVertical: spacingPresets.lg1,
      gap: spacingPresets.md1,
    },
    label: {
      ...typographyPresets.Title,
      color: colors.customColors.cream,
      fontWeight: '800',
      fontSize: 20,
      lineHeight: 26,
    },
    hint: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.75)',
      fontSize: 13,
      lineHeight: 18,
    },
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(27, 42, 74, 0.4)',
      borderRadius: borderRadiusPresets.inputElements,
      paddingLeft: spacingPresets.md1,
      paddingRight: spacingPresets.xs,
      paddingVertical: spacingPresets.xs,
      gap: spacingPresets.sm,
    },
    linkText: {
      ...typographyPresets.Caption,
      color: colors.customColors.cream,
      fontSize: 13,
      lineHeight: 18,
      flex: 1,
      fontWeight: '600',
    },
    copyButton: overrideStyles(buttonPresets.Primary, {
      container: {
        backgroundColor: 'rgba(255, 245, 236, 0.2)',
        paddingHorizontal: spacingPresets.md1,
        paddingVertical: spacingPresets.xs + 2,
        borderRadius: spacingPresets.sm,
        minWidth: 64,
      },
      pressedContainer: {
        backgroundColor: 'rgba(255, 245, 236, 0.3)',
      },
      text: {
        color: colors.customColors.cream,
        fontWeight: '700',
        fontSize: 13,
        lineHeight: 18,
      },
    }),
    shareButton: overrideStyles(buttonPresets.Primary, {
      container: {
        backgroundColor: colors.customColors.cream,
        paddingHorizontal: spacingPresets.lg1,
        paddingVertical: spacingPresets.md1,
        borderRadius: borderRadiusPresets.inputElements,
        alignSelf: 'stretch',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
      },
      pressedContainer: {
        backgroundColor: '#F0E6DA',
      },
      text: {
        color: colors.customColors.inkBlack,
        fontWeight: '800',
        fontSize: 16,
        lineHeight: 22,
      },
    }),
    expiryText: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.5)',
      fontSize: 11,
      lineHeight: 15,
      textAlign: 'center',
    },
  };

  // ── Section Header ──

  const sectionHeaderStyles: SectionHeaderStyles = {
    container: {
      paddingHorizontal: spacingPresets.md2,
      paddingBottom: spacingPresets.sm,
      gap: spacingPresets.xxs,
    },
    titleText: {
      ...typographyPresets.Label,
      color: 'rgba(255, 245, 236, 0.6)',
      fontWeight: '700',
      fontSize: 13,
      lineHeight: 18,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    hintText: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.35)',
      fontSize: 12,
      lineHeight: 16,
    },
  };

  // ── Search Input ──

  const searchInputStyles: SearchInputStyles = {
    container: {
      paddingHorizontal: spacingPresets.md2,
      marginBottom: spacingPresets.md1,
    },
    textInput: overrideStyles(textInputPresets.DefaultInput, {
      container: {
        backgroundColor: 'rgba(255, 245, 236, 0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255, 245, 236, 0.1)',
        borderRadius: borderRadiusPresets.inputElements,
        paddingHorizontal: spacingPresets.md1,
      },
      focused: {
        borderColor: colors.primaryAccent,
      },
      input: {
        color: colors.customColors.cream,
        fontSize: 15,
        lineHeight: 20,
      },
      placeholderTextColor: 'rgba(255, 245, 236, 0.35)',
      iconLeftColor: 'rgba(255, 245, 236, 0.4)',
      iconLeftSize: 18,
    }),
  };

  // ── User Row (contacts, search results, nearby) ──

  const USER_AVATAR_SIZE = 44;

  const userRowStyles: UserRowStyles = {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacingPresets.md2,
      paddingVertical: spacingPresets.sm + 2,
      gap: spacingPresets.md1,
    },
    avatar: {
      width: USER_AVATAR_SIZE,
      height: USER_AVATAR_SIZE,
      borderRadius: USER_AVATAR_SIZE / 2,
      backgroundColor: colors.tertiaryBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      ...typographyPresets.Caption,
      color: colors.customColors.cream,
      fontWeight: '700',
      fontSize: 16,
      lineHeight: 20,
    },
    avatarImage: {
      width: USER_AVATAR_SIZE,
      height: USER_AVATAR_SIZE,
      borderRadius: USER_AVATAR_SIZE / 2,
    },
    infoArea: {
      flex: 1,
      gap: spacingPresets.xxs,
    },
    nameText: {
      ...typographyPresets.Label,
      color: colors.customColors.cream,
      fontWeight: '600',
      fontSize: 15,
      lineHeight: 20,
    },
    subtitleText: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.45)',
      fontSize: 13,
      lineHeight: 17,
    },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacingPresets.xs,
    },
    verifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(52, 211, 153, 0.15)',
      paddingHorizontal: spacingPresets.xs + 2,
      paddingVertical: 1,
      borderRadius: 6,
      gap: 3,
    },
    verifiedText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: '#34D399',
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '700',
    },
    inviteButton: overrideStyles(buttonPresets.Primary, {
      container: {
        backgroundColor: colors.primaryAccent,
        paddingHorizontal: spacingPresets.md2,
        paddingVertical: spacingPresets.xs + 2,
        borderRadius: spacingPresets.sm,
        minWidth: 72,
      },
      pressedContainer: {
        backgroundColor: colors.primaryAccentDark,
      },
      text: {
        color: colors.customColors.cream,
        fontWeight: '700',
        fontSize: 13,
        lineHeight: 18,
      },
    }),
    invitedButton: overrideStyles(buttonPresets.Secondary, {
      container: {
        backgroundColor: 'rgba(255, 245, 236, 0.08)',
        paddingHorizontal: spacingPresets.md2,
        paddingVertical: spacingPresets.xs + 2,
        borderRadius: spacingPresets.sm,
        borderWidth: 1,
        borderColor: 'rgba(255, 245, 236, 0.15)',
        minWidth: 72,
      },
      text: {
        color: 'rgba(255, 245, 236, 0.45)',
        fontWeight: '600',
        fontSize: 13,
        lineHeight: 18,
      },
    }),
    distanceText: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.35)',
      fontSize: 11,
      lineHeight: 15,
    },
  };

  // ── Pending Invite Row ──

  const PENDING_AVATAR_SIZE = 36;

  const pendingInviteRowStyles: PendingInviteRowStyles = {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacingPresets.md2,
      paddingVertical: spacingPresets.sm,
      gap: spacingPresets.md1,
    },
    avatar: {
      width: PENDING_AVATAR_SIZE,
      height: PENDING_AVATAR_SIZE,
      borderRadius: PENDING_AVATAR_SIZE / 2,
      backgroundColor: 'rgba(255, 245, 236, 0.08)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.5)',
      fontWeight: '700',
      fontSize: 14,
      lineHeight: 18,
    },
    infoArea: {
      flex: 1,
      gap: spacingPresets.xxs,
    },
    nameText: {
      ...typographyPresets.Label,
      color: colors.customColors.cream,
      fontWeight: '600',
      fontSize: 14,
      lineHeight: 19,
    },
    methodText: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.35)',
      fontSize: 12,
      lineHeight: 16,
    },
    statusBadge: {
      paddingHorizontal: spacingPresets.sm,
      paddingVertical: spacingPresets.xxs + 1,
      borderRadius: 8,
    },
    statusBadgePending: {
      backgroundColor: 'rgba(255, 152, 0, 0.15)',
    },
    statusBadgeAccepted: {
      backgroundColor: 'rgba(52, 211, 153, 0.15)',
    },
    statusText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: '#FF9800',
      fontSize: 11,
      lineHeight: 15,
      fontWeight: '700',
    },
    statusTextAccepted: {
      color: '#34D399',
    },
    sentText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: 'rgba(255, 245, 236, 0.25)',
      fontSize: 11,
      lineHeight: 15,
    },
  };

  // ── Done Button ──

  const doneButtonStyles: CustomButtonStyles = overrideStyles(buttonPresets.Primary, {
    container: {
      backgroundColor: colors.customColors.voltGreen,
      marginHorizontal: spacingPresets.md2,
      paddingVertical: spacingPresets.md1,
      borderRadius: borderRadiusPresets.components,
      shadowColor: colors.customColors.voltGreen,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 14,
      elevation: 6,
    },
    pressedContainer: {
      backgroundColor: '#B8E63E',
    },
    text: {
      color: colors.customColors.inkBlack,
      fontWeight: '800',
      fontSize: 16,
      lineHeight: 22,
    },
  });

  return createAppPageStyles<InviteStyles>({
    styles,
    headerStyles,
    shareLinkCardStyles,
    sectionHeaderStyles,
    searchInputStyles,
    userRowStyles,
    pendingInviteRowStyles,
    doneButtonStyles,
  });
}

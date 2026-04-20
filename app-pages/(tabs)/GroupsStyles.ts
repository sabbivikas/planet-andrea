import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';

// ── Sub-component style interfaces ──

export interface GroupsHeaderStyles {
  container: ViewStyle;
  titleText: TextStyle;
  bellContainer: ViewStyle;
  bellIcon: ViewStyle;
  badgeContainer: ViewStyle;
  badgeText: TextStyle;
}

export interface GroupCardStyles {
  pressable: ViewStyle;
  container: ViewStyle;
  avatarSection: ViewStyle;
  compositeAvatarContainer: ViewStyle;
  compositeAvatar: ViewStyle;
  compositeAvatarText: TextStyle;
  compositeAvatarOverflow: ViewStyle;
  compositeAvatarOverflowText: TextStyle;
  photoAvatar: ImageStyle;
  contentSection: ViewStyle;
  topRow: ViewStyle;
  groupName: TextStyle;
  timestampText: TextStyle;
  bottomRow: ViewStyle;
  memberCountText: TextStyle;
  statusRow: ViewStyle;
  statusBadge: ViewStyle;
  statusBadgeBattle: ViewStyle;
  statusBadgeDeciding: ViewStyle;
  statusBadgeIdle: ViewStyle;
  statusDot: ViewStyle;
  statusDotBattle: ViewStyle;
  statusDotDeciding: ViewStyle;
  statusDotIdle: ViewStyle;
  statusText: TextStyle;
  statusTextBattle: TextStyle;
  statusTextDeciding: TextStyle;
  statusTextIdle: TextStyle;
}

export interface FabStyles {
  container: ViewStyle;
  button: CustomButtonStyles;
}

export interface GroupsEmptyStateStyles {
  container: ViewStyle;
  iconContainer: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  ctaButton: CustomButtonStyles;
}

export interface TabBarStyles {
  container: ViewStyle;
  tab: ViewStyle;
  tabText: TextStyle;
  tabTextActive: TextStyle;
  tabUnderline: ViewStyle;
  infoButton: ViewStyle;
  infoButtonText: TextStyle;
}

export interface HowItWorksSheetStyles {
  backdrop: ViewStyle;
  sheet: ViewStyle;
  title: TextStyle;
  rowSeparator: ViewStyle;
  row: ViewStyle;
  iconCircle: ViewStyle;
  iconText: TextStyle;
  rowContent: ViewStyle;
  rowTitle: TextStyle;
  rowDescription: TextStyle;
  gotItButton: CustomButtonStyles;
}

export interface OpenPlanetCardStyles {
  container: ViewStyle;
  nameRow: ViewStyle;
  nameText: TextStyle;
  distancePill: ViewStyle;
  distanceText: TextStyle;
  avatarRow: ViewStyle;
  avatar: ViewStyle;
  avatarText: TextStyle;
  spotsText: TextStyle;
  activityPill: ViewStyle;
  activityPillVoting: ViewStyle;
  activityText: TextStyle;
  activityTextVoting: TextStyle;
  trustRow: ViewStyle;
  trustText: TextStyle;
  buttonRow: ViewStyle;
  orbitButton: CustomButtonStyles;
  orbitButtonOrbited: CustomButtonStyles;
  joinButton: CustomButtonStyles;
}

export interface ToastStyles {
  container: ViewStyle;
  text: TextStyle;
}

export interface JoinSheetStyles {
  backdrop: ViewStyle;
  sheet: ViewStyle;
  title: TextStyle;
  label: TextStyle;
  input: ViewStyle;
  inputText: TextStyle;
  sendButton: CustomButtonStyles;
  cancelButton: CustomButtonStyles;
}

// ── Main styles interface ──

export interface GroupsBaseStyles {
  safeArea: ViewStyle;
  container: ViewStyle;
  listContent: ViewStyle;
}

export interface GroupsStyles {
  styles: GroupsBaseStyles;
  headerStyles: GroupsHeaderStyles;
  cardStyles: GroupCardStyles;
  fabStyles: FabStyles;
  emptyStateStyles: GroupsEmptyStateStyles;
  tabBarStyles: TabBarStyles;
  openPlanetCardStyles: OpenPlanetCardStyles;
  toastStyles: ToastStyles;
  joinSheetStyles: JoinSheetStyles;
  howItWorksSheetStyles: HowItWorksSheetStyles;
}

export function useGroupsStyles(): GroupsStyles {
  const {
    createAppPageStyles,
    colors,
    typographyPresets,
    buttonPresets,
    spacingPresets,
    borderRadiusPresets,
    overrideStyles,
    dimensions,
  } = useStyleContext();

  // ── Base page styles ──

  const styles: GroupsBaseStyles = {
    safeArea: {
      flex: 1,
      backgroundColor: colors.customColors.deepNavy,
    },
    container: {
      flex: 1,
      backgroundColor: colors.customColors.deepNavy,
    },
    listContent: {
      paddingHorizontal: spacingPresets.md2,
      paddingBottom: 100,
      gap: spacingPresets.md1,
    },
  };

  // ── Header ──

  const headerStyles: GroupsHeaderStyles = {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacingPresets.lg1,
      paddingVertical: spacingPresets.md1,
    },
    titleText: {
      ...typographyPresets.Title,
      color: colors.customColors.cream,
      fontWeight: '800',
      fontSize: 22,
      lineHeight: 28,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    bellContainer: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bellIcon: {
      width: 24,
      height: 24,
    },
    badgeContainer: {
      position: 'absolute',
      top: 6,
      right: 4,
      backgroundColor: colors.primaryAccent,
      borderRadius: 9,
      minWidth: 18,
      height: 18,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    badgeText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.customColors.cream,
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '700',
    },
  };

  // ── Group Card ──

  const AVATAR_SIZE = 52;
  const MINI_AVATAR_SIZE = 24;

  const cardStyles: GroupCardStyles = {
    pressable: {
      borderRadius: borderRadiusPresets.components,
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 245, 236, 0.06)',
      borderRadius: borderRadiusPresets.components,
      paddingHorizontal: spacingPresets.md2,
      paddingVertical: spacingPresets.md1,
      gap: spacingPresets.md1,
      borderWidth: 1,
      borderColor: 'rgba(255, 245, 236, 0.08)',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    avatarSection: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
    },
    compositeAvatarContainer: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    compositeAvatar: {
      width: MINI_AVATAR_SIZE,
      height: MINI_AVATAR_SIZE,
      borderRadius: MINI_AVATAR_SIZE / 2,
      backgroundColor: colors.tertiaryBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    compositeAvatarText: {
      ...typographyPresets.Caption,
      color: colors.customColors.cream,
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '700',
    },
    compositeAvatarOverflow: {
      width: MINI_AVATAR_SIZE,
      height: MINI_AVATAR_SIZE,
      borderRadius: MINI_AVATAR_SIZE / 2,
      backgroundColor: 'rgba(255, 245, 236, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    compositeAvatarOverflowText: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.7)',
      fontSize: 9,
      lineHeight: 13,
      fontWeight: '600',
    },
    photoAvatar: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
    },
    contentSection: {
      flex: 1,
      gap: spacingPresets.xxs,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    groupName: {
      ...typographyPresets.Label,
      color: colors.customColors.cream,
      fontWeight: '700',
      fontSize: 16,
      lineHeight: 22,
      flex: 1,
      marginRight: spacingPresets.sm,
    },
    timestampText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: 'rgba(255, 245, 236, 0.4)',
      fontSize: 12,
      lineHeight: 16,
    },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacingPresets.xxs,
    },
    memberCountText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: 'rgba(255, 245, 236, 0.5)',
      fontSize: 13,
      lineHeight: 18,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacingPresets.sm,
      paddingVertical: spacingPresets.xxs,
      borderRadius: 10,
      gap: spacingPresets.xs,
    },
    statusBadgeBattle: {
      backgroundColor: 'rgba(255, 92, 77, 0.15)',
    },
    statusBadgeDeciding: {
      backgroundColor: 'rgba(207, 255, 71, 0.12)',
    },
    statusBadgeIdle: {
      backgroundColor: 'rgba(255, 245, 236, 0.08)',
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    statusDotBattle: {
      backgroundColor: colors.primaryAccent,
    },
    statusDotDeciding: {
      backgroundColor: colors.customColors.voltGreen,
    },
    statusDotIdle: {
      backgroundColor: 'rgba(255, 245, 236, 0.3)',
    },
    statusText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      fontSize: 11,
      lineHeight: 15,
      fontWeight: '600',
    },
    statusTextBattle: {
      color: colors.primaryAccent,
    },
    statusTextDeciding: {
      color: colors.customColors.voltGreen,
    },
    statusTextIdle: {
      color: 'rgba(255, 245, 236, 0.4)',
    },
  };

  // ── FAB ──

  const FAB_SIZE = 56;

  const fabStyles: FabStyles = {
    container: {
      position: 'absolute',
      bottom: spacingPresets.lg1,
      right: spacingPresets.lg1,
      zIndex: 10,
    },
    button: overrideStyles(buttonPresets.Primary, {
      container: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        borderRadius: FAB_SIZE / 2,
        backgroundColor: colors.customColors.voltGreen,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 0,
        paddingVertical: 0,
        shadowColor: colors.customColors.voltGreen,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 14,
        elevation: 8,
      },
      pressedContainer: {
        backgroundColor: '#B8E63E',
      },
      icon: {
        size: 28,
        color: colors.customColors.inkBlack,
      },
    }),
  };

  // ── Empty State ──

  const emptyStateStyles: GroupsEmptyStateStyles = {
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacingPresets.lg2,
      gap: spacingPresets.md1,
    },
    iconContainer: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: 'rgba(255, 245, 236, 0.08)',
      borderWidth: 1,
      borderColor: 'rgba(255, 245, 236, 0.06)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacingPresets.sm,
    },
    title: {
      ...typographyPresets.Title,
      color: colors.customColors.cream,
      textAlign: 'center',
      fontSize: 22,
      lineHeight: 28,
    },
    subtitle: {
      ...typographyPresets.Body,
      color: 'rgba(255, 245, 236, 0.45)',
      textAlign: 'center',
      fontSize: 15,
      lineHeight: 22,
      maxWidth: 280,
    },
    ctaButton: overrideStyles(buttonPresets.Primary, {
      container: {
        backgroundColor: colors.customColors.voltGreen,
        paddingHorizontal: spacingPresets.lg1,
        paddingVertical: spacingPresets.md1,
        borderRadius: borderRadiusPresets.components,
        marginTop: spacingPresets.sm,
        shadowColor: colors.customColors.voltGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
      },
      pressedContainer: {
        backgroundColor: '#B8E63E',
      },
      text: {
        color: colors.customColors.inkBlack,
        fontWeight: '700',
        fontSize: 16,
        lineHeight: 22,
      },
    }),
  };

  // ── Tab Bar ──

  const tabBarStyles: TabBarStyles = {
    container: {
      flexDirection: 'row',
      paddingHorizontal: spacingPresets.lg1,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 245, 236, 0.08)',
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacingPresets.md1,
      position: 'relative',
    },
    tabText: {
      fontFamily: 'strenuous',
      fontSize: 14,
      lineHeight: 18,
      fontWeight: '700',
      color: 'rgba(255, 245, 236, 0.5)',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    tabTextActive: {
      color: '#FF5C4D',
    },
    tabUnderline: {
      position: 'absolute',
      bottom: 0,
      left: '20%',
      right: '20%',
      height: 2,
      backgroundColor: '#FF5C4D',
      borderRadius: 1,
    },
    infoButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#243660',
      borderWidth: 1,
      borderColor: '#3a4a6b',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 6,
    },
    infoButtonText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 12,
      color: '#FFF5EC',
      lineHeight: 14,
    },
  };

  const howItWorksSheetStyles: HowItWorksSheetStyles = {
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
      fontFamily: 'strenuous',
      fontSize: 20,
      lineHeight: 26,
      fontWeight: '700',
      color: '#FFF5EC',
    },
    rowSeparator: {
      height: 1,
      backgroundColor: '#3a4a6b',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacingPresets.md1,
      paddingVertical: spacingPresets.sm,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#243660',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    iconText: {
      fontSize: 20,
      lineHeight: 24,
    },
    rowContent: {
      flex: 1,
      gap: 2,
    },
    rowTitle: {
      fontFamily: 'strenuous',
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '700',
      color: '#FFF5EC',
    },
    rowDescription: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 13,
      lineHeight: 18,
      color: 'rgba(255, 245, 236, 0.6)',
    },
    gotItButton: overrideStyles(buttonPresets.Primary, {
      container: {
        backgroundColor: '#CFFF47',
        borderRadius: 14,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacingPresets.sm,
      },
      pressedContainer: {
        backgroundColor: '#B8E63E',
      },
      text: {
        fontFamily: 'strenuous',
        fontWeight: '700',
        fontSize: 16,
        lineHeight: 22,
        color: '#2D2D2D',
      },
    }),
  };

  // ── Open Planet Card ──

  const OPEN_PLANET_AVATAR_SIZE = 28;

  const openPlanetCardStyles: OpenPlanetCardStyles = {
    container: {
      backgroundColor: '#243660',
      borderRadius: 20,
      padding: spacingPresets.md2,
      gap: spacingPresets.sm,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    nameText: {
      fontFamily: 'strenuous',
      fontSize: 17,
      lineHeight: 22,
      fontWeight: '700',
      color: colors.customColors.cream,
      flex: 1,
      marginRight: spacingPresets.sm,
    },
    distancePill: {
      backgroundColor: 'rgba(255, 245, 236, 0.1)',
      borderRadius: 10,
      paddingHorizontal: spacingPresets.sm,
      paddingVertical: 3,
    },
    distanceText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 11,
      lineHeight: 16,
      color: 'rgba(255, 245, 236, 0.6)',
    },
    avatarRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatar: {
      width: OPEN_PLANET_AVATAR_SIZE,
      height: OPEN_PLANET_AVATAR_SIZE,
      borderRadius: OPEN_PLANET_AVATAR_SIZE / 2,
      backgroundColor: 'rgba(255, 245, 236, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: '#243660',
    },
    avatarText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '700',
      color: colors.customColors.cream,
    },
    spotsText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 12,
      lineHeight: 16,
      color: '#CFFF47',
      marginLeft: spacingPresets.sm,
    },
    activityPill: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: '#FF5C4D',
      borderRadius: 12,
      paddingHorizontal: spacingPresets.md1,
      paddingVertical: 4,
    },
    activityPillVoting: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: 'rgba(255, 245, 236, 0.2)',
    },
    activityText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '600',
      color: colors.customColors.cream,
    },
    activityTextVoting: {
      color: 'rgba(255, 245, 236, 0.5)',
    },
    trustRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacingPresets.xs,
    },
    trustText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 12,
      lineHeight: 16,
      color: 'rgba(255, 245, 236, 0.5)',
    },
    buttonRow: {
      flexDirection: 'row',
      gap: spacingPresets.sm,
    },
    orbitButton: overrideStyles(buttonPresets.Primary, {
      container: {
        flex: 1,
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: '#FF5C4D',
        borderRadius: borderRadiusPresets.components,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
      },
      pressedContainer: {
        backgroundColor: 'rgba(255, 92, 77, 0.1)',
      },
      text: {
        fontFamily: 'strenuous',
        fontWeight: '700',
        fontSize: 13,
        lineHeight: 18,
        color: '#FF5C4D',
      },
    }),
    orbitButtonOrbited: overrideStyles(buttonPresets.Primary, {
      container: {
        flex: 1,
        backgroundColor: 'rgba(255, 92, 77, 0.15)',
        borderWidth: 1.5,
        borderColor: '#FF5C4D',
        borderRadius: borderRadiusPresets.components,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
      },
      pressedContainer: {
        backgroundColor: 'rgba(255, 92, 77, 0.25)',
      },
      text: {
        fontFamily: 'strenuous',
        fontWeight: '700',
        fontSize: 13,
        lineHeight: 18,
        color: '#FF5C4D',
      },
    }),
    joinButton: overrideStyles(buttonPresets.Primary, {
      container: {
        flex: 1,
        backgroundColor: '#CFFF47',
        borderRadius: borderRadiusPresets.components,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
      },
      pressedContainer: {
        backgroundColor: '#B8E63E',
      },
      text: {
        fontFamily: 'strenuous',
        fontWeight: '700',
        fontSize: 13,
        lineHeight: 18,
        color: '#2D2D2D',
      },
    }),
  };

  // ── Toast ──

  const toastStyles: ToastStyles = {
    container: {
      position: 'absolute',
      bottom: 100,
      left: spacingPresets.lg1,
      right: spacingPresets.lg1,
      backgroundColor: 'rgba(36, 54, 96, 0.95)',
      borderRadius: 14,
      paddingHorizontal: spacingPresets.lg1,
      paddingVertical: spacingPresets.md1,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
      zIndex: 100,
      borderWidth: 1,
      borderColor: 'rgba(207, 255, 71, 0.2)',
    },
    text: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 14,
      lineHeight: 20,
      color: colors.customColors.cream,
      textAlign: 'center',
    },
  };

  // ── Join Sheet ──

  const joinSheetStyles: JoinSheetStyles = {
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
      fontFamily: 'strenuous',
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '700',
      color: colors.customColors.cream,
      textAlign: 'center',
    },
    label: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 13,
      lineHeight: 18,
      color: 'rgba(255, 245, 236, 0.6)',
    },
    input: {
      backgroundColor: 'rgba(255, 245, 236, 0.06)',
      borderWidth: 1,
      borderColor: 'rgba(255, 245, 236, 0.12)',
      borderRadius: 12,
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
        borderRadius: borderRadiusPresets.components,
        paddingVertical: spacingPresets.md1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacingPresets.sm,
      },
      pressedContainer: {
        backgroundColor: '#B8E63E',
      },
      text: {
        fontFamily: 'strenuous',
        fontWeight: '700',
        fontSize: 15,
        lineHeight: 20,
        color: '#2D2D2D',
      },
    }),
    cancelButton: overrideStyles(buttonPresets.Primary, {
      container: {
        backgroundColor: 'transparent',
        paddingVertical: spacingPresets.sm,
        alignItems: 'center',
        justifyContent: 'center',
      },
      pressedContainer: {
        backgroundColor: 'rgba(255, 245, 236, 0.05)',
      },
      text: {
        fontFamily: 'tt-autonomous-mono',
        fontSize: 14,
        lineHeight: 20,
        color: 'rgba(255, 245, 236, 0.5)',
      },
    }),
  };

  return createAppPageStyles<GroupsStyles>({
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
  });
}

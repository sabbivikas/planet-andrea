/**
 * Styling for the GroupGroupId page
 */
import { ViewStyle, TextStyle, ImageStyle, type DimensionValue } from 'react-native';

import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';

// ── Sub-component style interfaces ──

export interface GroupDetailHeaderStyles {
  container: ViewStyle;
  backButton: ViewStyle;
  backIcon: ViewStyle;
  titleArea: ViewStyle;
  titleText: TextStyle;
  subtitleText: TextStyle;
  menuButton: ViewStyle;
  menuIcon: ViewStyle;
}

export interface OverflowMenuStyles {
  overlay: ViewStyle;
  container: ViewStyle;
  menuItem: ViewStyle;
  menuItemText: TextStyle;
  menuItemDanger: ViewStyle;
  menuItemDangerText: TextStyle;
}

export interface HeroSectionStyles {
  container: ViewStyle;
  image: ImageStyle;
  gradient: ViewStyle;
  avatarRow: ViewStyle;
  avatarWrapper: ViewStyle;
  avatar: ViewStyle;
  avatarText: TextStyle;
  avatarImage: ImageStyle;
  onlineDot: ViewStyle;
  onlineCountBadge: ViewStyle;
  onlineCountText: TextStyle;
}

export interface BattleBannerStyles {
  container: ViewStyle;
  accentBar: ViewStyle;
  content: ViewStyle;
  topRow: ViewStyle;
  liveTag: ViewStyle;
  liveTagDot: ViewStyle;
  liveTagText: TextStyle;
  timerText: TextStyle;
  progressRow: ViewStyle;
  progressText: TextStyle;
  progressBarTrack: ViewStyle;
  progressBarFill: ViewStyle & { width?: DimensionValue };
  joinButton: CustomButtonStyles;
  viewResultsButton: CustomButtonStyles;
}

export interface ActivityFeedItemStyles {
  container: ViewStyle;
  avatarCircle: ViewStyle;
  avatarText: TextStyle;
  textArea: ViewStyle;
  actionText: TextStyle;
  memberNameText: TextStyle;
  activityNameText: TextStyle;
  swipingText: TextStyle;
  boostedText: TextStyle;
  thumbnail: ImageStyle;
  timestampText: TextStyle;
}

export interface RankedActivityItemStyles {
  container: ViewStyle;
  rankBadge: ViewStyle;
  rankText: TextStyle;
  thumbnail: ImageStyle;
  infoArea: ViewStyle;
  titleText: TextStyle;
  swipeCountText: TextStyle;
  dealBadge: ViewStyle;
  dealBadgeText: TextStyle;
}

export interface ActionButtonsStyles {
  container: ViewStyle;
  secondRow: ViewStyle;
  battleButton: CustomButtonStyles;
  inviteButton: CustomButtonStyles;
  rescheduleButton: CustomButtonStyles;
}

export interface ChatPreviewStyles {
  container: ViewStyle;
  headerRow: ViewStyle;
  sectionTitle: TextStyle;
  openButton: CustomButtonStyles;
  messageRow: ViewStyle;
  senderText: TextStyle;
  messageText: TextStyle;
  timestampText: TextStyle;
}

export interface MemberListStyles {
  container: ViewStyle;
  sectionTitle: TextStyle;
  memberRow: ViewStyle;
  memberAvatar: ViewStyle;
  memberAvatarText: TextStyle;
  memberInfo: ViewStyle;
  memberName: TextStyle;
  badgeRow: ViewStyle;
  verifiedBadge: ViewStyle;
  verifiedText: TextStyle;
  ownerBadge: ViewStyle;
  ownerText: TextStyle;
  onlineIndicator: ViewStyle;
  offlineIndicator: ViewStyle;
}

export interface SectionHeaderStyles {
  container: ViewStyle;
  titleText: TextStyle;
}

export interface CrewReadinessSectionStyles {
  container: ViewStyle;
  labelText: TextStyle;
  row: ViewStyle;
  avatarWrapper: ViewStyle;
  avatar: ViewStyle;
  avatarText: TextStyle;
  avatarImage: ImageStyle;
  statusDotReady: ViewStyle;
  statusDotNotReady: ViewStyle;
  memberNameText: TextStyle;
  fractionText: TextStyle;
  fractionTextMajority: TextStyle;
  fractionTextMinority: TextStyle;
  nudgedText: TextStyle;
}

export interface LockedBattleButtonStyles {
  container: ViewStyle;
  button: ViewStyle;
  buttonText: TextStyle;
  tooltip: TextStyle;
}

// ── Main styles interface ──

export interface GroupGroupIdBaseStyles {
  safeArea: ViewStyle;
  container: ViewStyle;
  scrollContent: ViewStyle;
  sectionGap: ViewStyle;
}

export interface GroupGroupIdStyles {
  styles: GroupGroupIdBaseStyles;
  headerStyles: GroupDetailHeaderStyles;
  overflowMenuStyles: OverflowMenuStyles;
  heroStyles: HeroSectionStyles;
  battleBannerStyles: BattleBannerStyles;
  activityFeedItemStyles: ActivityFeedItemStyles;
  rankedActivityItemStyles: RankedActivityItemStyles;
  actionButtonsStyles: ActionButtonsStyles;
  chatPreviewStyles: ChatPreviewStyles;
  memberListStyles: MemberListStyles;
  sectionHeaderStyles: SectionHeaderStyles;
  crewReadinessStyles: CrewReadinessSectionStyles;
  lockedBattleButtonStyles: LockedBattleButtonStyles;
}

/**
 * Custom hook that provides styles for the GroupGroupId component
 */
export function useGroupGroupIdStyles(): GroupGroupIdStyles {
  const {
    createAppPageStyles,
    colors,
    typographyPresets,
    buttonPresets,
    spacingPresets,
    borderRadiusPresets,
    overrideStyles,
  } = useStyleContext();

  // ── Base page styles ──

  const styles: GroupGroupIdBaseStyles = {
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

  const headerStyles: GroupDetailHeaderStyles = {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacingPresets.md2,
      paddingVertical: spacingPresets.sm,
      gap: spacingPresets.sm,
    },
    backButton: {
      width: HEADER_BUTTON_SIZE,
      height: HEADER_BUTTON_SIZE,
      borderRadius: HEADER_BUTTON_SIZE / 2,
      backgroundColor: 'rgba(255, 245, 236, 0.08)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    backIcon: {
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
    subtitleText: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.5)',
      fontSize: 12,
      lineHeight: 16,
    },
    menuButton: {
      width: HEADER_BUTTON_SIZE,
      height: HEADER_BUTTON_SIZE,
      borderRadius: HEADER_BUTTON_SIZE / 2,
      backgroundColor: 'rgba(255, 245, 236, 0.08)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuIcon: {
      width: 22,
      height: 22,
    },
  };

  // ── Overflow Menu ──

  const overflowMenuStyles: OverflowMenuStyles = {
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 100,
    },
    container: {
      position: 'absolute',
      top: spacingPresets.xl + spacingPresets.sm,
      right: spacingPresets.md2,
      backgroundColor: colors.tertiaryBackground,
      borderRadius: borderRadiusPresets.components,
      paddingVertical: spacingPresets.xs,
      minWidth: 180,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 8,
      zIndex: 101,
    },
    menuItem: {
      paddingHorizontal: spacingPresets.md2,
      paddingVertical: spacingPresets.md1,
    },
    menuItemText: {
      ...typographyPresets.Label,
      color: colors.customColors.cream,
      fontSize: 15,
      lineHeight: 20,
    },
    menuItemDanger: {
      paddingHorizontal: spacingPresets.md2,
      paddingVertical: spacingPresets.md1,
    },
    menuItemDangerText: {
      ...typographyPresets.Label,
      color: colors.customColors.error,
      fontSize: 15,
      lineHeight: 20,
    },
  };

  // ── Hero Section ──

  const HERO_HEIGHT = 180;
  const HERO_AVATAR_SIZE = 40;

  const heroStyles: HeroSectionStyles = {
    container: {
      height: HERO_HEIGHT,
      marginHorizontal: spacingPresets.md2,
      borderRadius: borderRadiusPresets.components,
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    gradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: HERO_HEIGHT * 0.6,
      justifyContent: 'flex-end',
      paddingHorizontal: spacingPresets.md2,
      paddingBottom: spacingPresets.md1,
    },
    avatarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: -8,
    },
    avatarWrapper: {
      position: 'relative',
    },
    avatar: {
      width: HERO_AVATAR_SIZE,
      height: HERO_AVATAR_SIZE,
      borderRadius: HERO_AVATAR_SIZE / 2,
      backgroundColor: colors.tertiaryBackground,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.customColors.deepNavy,
    },
    avatarText: {
      ...typographyPresets.Caption,
      color: colors.customColors.cream,
      fontWeight: '700',
      fontSize: 14,
      lineHeight: 18,
    },
    avatarImage: {
      width: HERO_AVATAR_SIZE,
      height: HERO_AVATAR_SIZE,
      borderRadius: HERO_AVATAR_SIZE / 2,
      borderWidth: 2,
      borderColor: colors.customColors.deepNavy,
    },
    onlineDot: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#34D399',
      borderWidth: 2,
      borderColor: colors.customColors.deepNavy,
    },
    onlineCountBadge: {
      marginLeft: spacingPresets.md1,
      backgroundColor: 'rgba(52, 211, 153, 0.2)',
      paddingHorizontal: spacingPresets.sm,
      paddingVertical: spacingPresets.xxs,
      borderRadius: 10,
    },
    onlineCountText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: '#34D399',
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '700',
    },
  };

  // ── Battle Banner ──

  const VOTE_PROGRESS_MULTIPLIER = 100;

  const battleBannerStyles: BattleBannerStyles = {
    container: {
      flexDirection: 'row',
      marginHorizontal: spacingPresets.md2,
      backgroundColor: 'rgba(255, 92, 77, 0.1)',
      borderRadius: borderRadiusPresets.components,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255, 92, 77, 0.3)',
      shadowColor: '#FF5C4D',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 5,
    },
    accentBar: {
      width: 4,
      backgroundColor: colors.primaryAccent,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacingPresets.md2,
      paddingVertical: spacingPresets.md1,
      gap: spacingPresets.sm,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    liveTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacingPresets.xs,
    },
    liveTagDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primaryAccent,
    },
    liveTagText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.primaryAccent,
      fontWeight: '900',
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 1,
    },
    timerText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: 'rgba(255, 245, 236, 0.6)',
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '600',
    },
    progressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacingPresets.sm,
    },
    progressText: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.5)',
      fontSize: 12,
      lineHeight: 16,
    },
    progressBarTrack: {
      flex: 1,
      height: 4,
      backgroundColor: 'rgba(255, 245, 236, 0.1)',
      borderRadius: 2,
    },
    progressBarFill: {
      height: 4,
      backgroundColor: colors.customColors.voltGreen,
      borderRadius: 2,
    },
    joinButton: overrideStyles(buttonPresets.Primary, {
      container: {
        backgroundColor: colors.customColors.voltGreen,
        paddingHorizontal: spacingPresets.md2,
        paddingVertical: spacingPresets.sm,
        borderRadius: borderRadiusPresets.inputElements,
        alignSelf: 'flex-start',
        shadowColor: colors.customColors.voltGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
      },
      pressedContainer: {
        backgroundColor: '#B8E63E',
      },
      text: {
        color: colors.customColors.inkBlack,
        fontWeight: '800',
        fontSize: 14,
        lineHeight: 18,
      },
    }),
    viewResultsButton: overrideStyles(buttonPresets.Primary, {
      container: {
        backgroundColor: colors.customColors.voltGreen,
        paddingHorizontal: spacingPresets.md2,
        paddingVertical: spacingPresets.sm,
        borderRadius: borderRadiusPresets.inputElements,
        alignSelf: 'flex-start',
        shadowColor: colors.customColors.voltGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
      },
      pressedContainer: {
        backgroundColor: '#B8E63E',
      },
      text: {
        color: '#2D2D2D',
        fontFamily: 'strenuous',
        fontWeight: '700',
        fontSize: 14,
        lineHeight: 18,
      },
    }),
  };

  // ── Activity Feed Item ──

  const FEED_AVATAR_SIZE = 32;
  const FEED_THUMBNAIL_SIZE = 40;

  const activityFeedItemStyles: ActivityFeedItemStyles = {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacingPresets.md2,
      paddingVertical: spacingPresets.sm,
      gap: spacingPresets.sm,
    },
    avatarCircle: {
      width: FEED_AVATAR_SIZE,
      height: FEED_AVATAR_SIZE,
      borderRadius: FEED_AVATAR_SIZE / 2,
      backgroundColor: colors.tertiaryBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      ...typographyPresets.Caption,
      color: colors.customColors.cream,
      fontWeight: '700',
      fontSize: 13,
      lineHeight: 17,
    },
    textArea: {
      flex: 1,
    },
    actionText: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.6)',
      fontSize: 13,
      lineHeight: 18,
    },
    memberNameText: {
      color: colors.customColors.cream,
      fontWeight: '700',
    },
    activityNameText: {
      color: 'rgba(255, 245, 236, 0.8)',
      fontWeight: '600',
    },
    swipingText: {
      color: colors.customColors.voltGreen,
      fontWeight: '600',
    },
    boostedText: {
      fontFamily: 'tt-autonomous-mono',
      color: colors.primaryAccent,
      fontWeight: '700',
    },
    thumbnail: {
      width: FEED_THUMBNAIL_SIZE,
      height: FEED_THUMBNAIL_SIZE,
      borderRadius: spacingPresets.sm,
    },
    timestampText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: 'rgba(255, 245, 236, 0.3)',
      fontSize: 11,
      lineHeight: 15,
    },
  };

  // ── Ranked Activity Item ──

  const RANKED_THUMBNAIL_SIZE = 56;
  const RANK_BADGE_SIZE = 24;

  const rankedActivityItemStyles: RankedActivityItemStyles = {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: spacingPresets.md2,
      backgroundColor: 'rgba(255, 245, 236, 0.06)',
      borderRadius: borderRadiusPresets.components,
      paddingHorizontal: spacingPresets.md1,
      paddingVertical: spacingPresets.md1,
      gap: spacingPresets.md1,
      borderWidth: 1,
      borderColor: 'rgba(255, 245, 236, 0.08)',
      marginBottom: spacingPresets.sm,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
    },
    rankBadge: {
      width: RANK_BADGE_SIZE,
      height: RANK_BADGE_SIZE,
      borderRadius: RANK_BADGE_SIZE / 2,
      backgroundColor: colors.primaryAccent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rankText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.customColors.cream,
      fontWeight: '900',
      fontSize: 12,
      lineHeight: 16,
    },
    thumbnail: {
      width: RANKED_THUMBNAIL_SIZE,
      height: RANKED_THUMBNAIL_SIZE,
      borderRadius: borderRadiusPresets.inputElements,
    },
    infoArea: {
      flex: 1,
      gap: spacingPresets.xxs,
    },
    titleText: {
      ...typographyPresets.Label,
      color: colors.customColors.cream,
      fontWeight: '700',
      fontSize: 15,
      lineHeight: 20,
    },
    swipeCountText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: 'rgba(255, 245, 236, 0.5)',
      fontSize: 12,
      lineHeight: 16,
    },
    dealBadge: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(207, 255, 71, 0.15)',
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
  };

  // ── Action Buttons ──

  const actionButtonsStyles: ActionButtonsStyles = {
    container: {
      flexDirection: 'column',
      paddingHorizontal: spacingPresets.md2,
      gap: 8,
    },
    secondRow: {
      flexDirection: 'row',
      gap: 8,
    },
    battleButton: overrideStyles(buttonPresets.Primary, {
      container: {
        backgroundColor: colors.customColors.voltGreen,
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
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
        color: '#2D2D2D',
        fontFamily: 'strenuous',
        fontWeight: '700',
        fontSize: 17,
        lineHeight: 22,
      },
    }),
    inviteButton: overrideStyles(buttonPresets.Primary, {
      container: {
        flex: 1,
        backgroundColor: '#FF5C4D',
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        shadowColor: '#FF5C4D',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
      },
      pressedContainer: {
        backgroundColor: '#e04b3d',
      },
      text: {
        color: colors.customColors.cream,
        fontFamily: 'strenuous',
        fontWeight: '700',
        fontSize: 15,
        lineHeight: 20,
      },
    }),
    rescheduleButton: overrideStyles(buttonPresets.Primary, {
      container: {
        flex: 1,
        backgroundColor: '#243660',
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#3a4a6b',
      },
      pressedContainer: {
        backgroundColor: '#2e4070',
      },
      text: {
        color: colors.customColors.cream,
        fontFamily: 'strenuous',
        fontWeight: '700',
        fontSize: 15,
        lineHeight: 20,
      },
    }),
  };

  // ── Chat Preview ──

  const chatPreviewStyles: ChatPreviewStyles = {
    container: {
      marginHorizontal: spacingPresets.md2,
      backgroundColor: 'rgba(255, 245, 236, 0.06)',
      borderRadius: borderRadiusPresets.components,
      paddingHorizontal: spacingPresets.md2,
      paddingVertical: spacingPresets.md1,
      borderWidth: 1,
      borderColor: 'rgba(255, 245, 236, 0.08)',
      gap: spacingPresets.sm,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sectionTitle: {
      ...typographyPresets.Label,
      color: 'rgba(255, 245, 236, 0.6)',
      fontWeight: '700',
      fontSize: 13,
      lineHeight: 18,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    openButton: overrideStyles(buttonPresets.Tertiary, {
      container: {
        paddingHorizontal: spacingPresets.sm,
        paddingVertical: spacingPresets.xxs,
      },
      text: {
        color: colors.primaryAccent,
        fontWeight: '700',
        fontSize: 13,
        lineHeight: 18,
      },
      pressedText: {
        color: colors.primaryAccentDark,
      },
    }),
    messageRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacingPresets.xs,
    },
    senderText: {
      ...typographyPresets.Caption,
      color: colors.customColors.cream,
      fontWeight: '700',
      fontSize: 13,
      lineHeight: 18,
    },
    messageText: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.6)',
      fontSize: 13,
      lineHeight: 18,
      flex: 1,
    },
    timestampText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: 'rgba(255, 245, 236, 0.3)',
      fontSize: 11,
      lineHeight: 15,
    },
  };

  // ── Member List ──

  const MEMBER_AVATAR_SIZE = 40;
  const ONLINE_DOT_SIZE = 10;

  const memberListStyles: MemberListStyles = {
    container: {
      paddingHorizontal: spacingPresets.md2,
      gap: spacingPresets.xs,
    },
    sectionTitle: {
      ...typographyPresets.Label,
      color: 'rgba(255, 245, 236, 0.6)',
      fontWeight: '700',
      fontSize: 13,
      lineHeight: 18,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginBottom: spacingPresets.sm,
    },
    memberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacingPresets.sm,
      gap: spacingPresets.md1,
    },
    memberAvatar: {
      width: MEMBER_AVATAR_SIZE,
      height: MEMBER_AVATAR_SIZE,
      borderRadius: MEMBER_AVATAR_SIZE / 2,
      backgroundColor: colors.tertiaryBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    memberAvatarText: {
      ...typographyPresets.Caption,
      color: colors.customColors.cream,
      fontWeight: '700',
      fontSize: 15,
      lineHeight: 20,
    },
    memberInfo: {
      flex: 1,
      gap: spacingPresets.xxs,
    },
    memberName: {
      ...typographyPresets.Label,
      color: colors.customColors.cream,
      fontWeight: '600',
      fontSize: 15,
      lineHeight: 20,
    },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacingPresets.xs,
    },
    verifiedBadge: {
      backgroundColor: 'rgba(52, 211, 153, 0.15)',
      paddingHorizontal: spacingPresets.xs + 2,
      paddingVertical: 1,
      borderRadius: 6,
    },
    verifiedText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: '#34D399',
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '700',
    },
    ownerBadge: {
      backgroundColor: 'rgba(255, 92, 77, 0.15)',
      paddingHorizontal: spacingPresets.xs + 2,
      paddingVertical: 1,
      borderRadius: 6,
    },
    ownerText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.primaryAccent,
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '700',
    },
    onlineIndicator: {
      width: ONLINE_DOT_SIZE,
      height: ONLINE_DOT_SIZE,
      borderRadius: ONLINE_DOT_SIZE / 2,
      backgroundColor: '#34D399',
    },
    offlineIndicator: {
      width: ONLINE_DOT_SIZE,
      height: ONLINE_DOT_SIZE,
      borderRadius: ONLINE_DOT_SIZE / 2,
      backgroundColor: 'rgba(255, 245, 236, 0.2)',
    },
  };

  // ── Section Header ──

  const sectionHeaderStyles: SectionHeaderStyles = {
    container: {
      paddingHorizontal: spacingPresets.md2,
      paddingBottom: spacingPresets.sm,
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
  };

  // ── Crew Readiness ──

  const CREW_AVATAR_SIZE = 36;
  const CREW_STATUS_DOT_SIZE = 10;

  const crewReadinessStyles: CrewReadinessSectionStyles = {
    container: {
      paddingHorizontal: spacingPresets.md2,
      gap: spacingPresets.sm,
    },
    labelText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 11,
      color: 'rgba(255, 245, 236, 0.4)',
      letterSpacing: 0.1 * 11,
      textTransform: 'uppercase',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'nowrap',
    },
    avatarWrapper: {
      alignItems: 'center',
      gap: 4,
    },
    avatar: {
      width: CREW_AVATAR_SIZE,
      height: CREW_AVATAR_SIZE,
      borderRadius: CREW_AVATAR_SIZE / 2,
      backgroundColor: colors.tertiaryBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 13,
      color: colors.customColors.cream,
      fontWeight: '700',
    },
    avatarImage: {
      width: CREW_AVATAR_SIZE,
      height: CREW_AVATAR_SIZE,
      borderRadius: CREW_AVATAR_SIZE / 2,
    },
    statusDotReady: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: CREW_STATUS_DOT_SIZE,
      height: CREW_STATUS_DOT_SIZE,
      borderRadius: CREW_STATUS_DOT_SIZE / 2,
      backgroundColor: colors.customColors.voltGreen,
      borderWidth: 1.5,
      borderColor: colors.customColors.deepNavy,
    },
    statusDotNotReady: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: CREW_STATUS_DOT_SIZE,
      height: CREW_STATUS_DOT_SIZE,
      borderRadius: CREW_STATUS_DOT_SIZE / 2,
      backgroundColor: '#3a4a6b',
      borderWidth: 1.5,
      borderColor: colors.customColors.deepNavy,
    },
    memberNameText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 9,
      color: 'rgba(255, 245, 236, 0.5)',
      textAlign: 'center',
    },
    fractionText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 12,
      fontWeight: '700',
    },
    fractionTextMajority: {
      color: colors.customColors.voltGreen,
    },
    fractionTextMinority: {
      color: colors.primaryAccent,
    },
    nudgedText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 12,
      color: 'rgba(255, 245, 236, 0.4)',
      textAlign: 'center',
    },
  };

  // ── Locked Battle Button ──

  const lockedBattleButtonStyles: LockedBattleButtonStyles = {
    container: {
      gap: 6,
    },
    button: {
      height: 52,
      borderRadius: 14,
      backgroundColor: '#243660',
      borderWidth: 2,
      borderColor: '#3a4a6b',
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 14,
      color: 'rgba(255, 245, 236, 0.4)',
      textAlign: 'center',
      letterSpacing: 0.5,
    },
    tooltip: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 11,
      color: 'rgba(255, 245, 236, 0.5)',
      textAlign: 'center',
    },
  };

  return createAppPageStyles<GroupGroupIdStyles>({
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
  });
}

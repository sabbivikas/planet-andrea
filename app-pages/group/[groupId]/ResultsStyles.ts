/**
 * Styling for the Results page
 */
import { ViewStyle, TextStyle, ImageStyle, Platform } from 'react-native';

import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';

// ── Sub-component style interfaces ──

export interface ResultsHeaderStyles {
  container: ViewStyle;
  backButton: ViewStyle;
  backIcon: ViewStyle;
  titleArea: ViewStyle;
  titleText: TextStyle;
  placeholder: ViewStyle;
}

export interface HeroTitleStyles {
  container: ViewStyle;
  row: ViewStyle;
  iconWrapper: ViewStyle;
  text: TextStyle;
}

export interface WinnerCardStyles {
  container: ViewStyle;
  votesText: TextStyle;
}

export interface RunnerUpCardStyles {
  container: ViewStyle;
  rankBadge: ViewStyle;
  rankText: TextStyle;
  imageContainer: ViewStyle;
  image: ImageStyle;
  imageOverlay: ViewStyle;
  infoArea: ViewStyle;
  venueName: TextStyle;
  activityType: TextStyle;
  dealBadge: ViewStyle;
  dealBadgeText: TextStyle;
  votesText: TextStyle;
}

export interface MemberVoteSectionStyles {
  container: ViewStyle;
  memberRow: ViewStyle;
  avatar: ViewStyle;
  avatarCelebrated: ViewStyle;
  avatarText: TextStyle;
  avatarTextCelebrated: TextStyle;
  infoArea: ViewStyle;
  nameText: TextStyle;
  statusText: TextStyle;
  statusTextCelebrated: TextStyle;
  reactionEmoji: TextStyle;
}

export interface TimelineSectionStyles {
  container: ViewStyle;
  row: ViewStyle;
  dot: ViewStyle;
  line: ViewStyle;
  timeText: TextStyle;
  labelText: TextStyle;
}

export interface SectionTitleStyles {
  container: ViewStyle;
  text: TextStyle;
}

export interface ActionButtonsStyles {
  gap: ViewStyle;
}

export interface DealModalStyles {
  overlay: ViewStyle;
  container: ViewStyle;
  header: ViewStyle;
  badge: ViewStyle;
  badgeText: TextStyle;
  headline: TextStyle;
  subtitle: TextStyle;
  qrWrapper: ViewStyle;
  qrBackground: ViewStyle;
  codeLabelText: TextStyle;
  codeText: TextStyle;
  expiryText: TextStyle;
  hintText: TextStyle;
  closeButton: CustomButtonStyles;
}

// ── Main styles interface ──

export interface ResultsBaseStyles {
  safeArea: ViewStyle;
  container: ViewStyle;
  scrollContent: ViewStyle;
  sectionGap: ViewStyle;
}

export interface ResultsStyles {
  styles: ResultsBaseStyles;
  headerStyles: ResultsHeaderStyles;
  heroTitleStyles: HeroTitleStyles;
  winnerCardStyles: WinnerCardStyles;
  runnerUpCardStyles: RunnerUpCardStyles;
  memberVoteSectionStyles: MemberVoteSectionStyles;
  timelineSectionStyles: TimelineSectionStyles;
  sectionTitleStyles: SectionTitleStyles;
  actionButtonsStyles: ActionButtonsStyles;
  dealModalStyles: DealModalStyles;
  viewDetailsButtonStyles: CustomButtonStyles;
  sharePlanButtonStyles: CustomButtonStyles;
  newBattleButtonStyles: CustomButtonStyles;
  claimDealButtonStyles: CustomButtonStyles;
}

/**
 * Custom hook that provides styles for the Results component
 */
export function useResultsStyles(): ResultsStyles {
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

  const styles: ResultsBaseStyles = {
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

  const headerStyles: ResultsHeaderStyles = {
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
    placeholder: {
      width: HEADER_BUTTON_SIZE,
      height: HEADER_BUTTON_SIZE,
    },
  };

  // ── Hero Title ──

  const HERO_ICON_SIZE = 26;

  const heroTitleStyles: HeroTitleStyles = {
    container: {
      alignItems: 'center',
      paddingVertical: spacingPresets.md2,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacingPresets.sm,
    },
    iconWrapper: {
      width: HERO_ICON_SIZE,
      height: HERO_ICON_SIZE,
    },
    text: {
      color: colors.customColors.voltGreen,
      fontWeight: '900',
      fontSize: 28,
      lineHeight: 34,
      textAlign: 'center',
      letterSpacing: 0.5,
      fontFamily: 'SpaceGrotesk',
    },
  };

  // ── Winner Card ──

  const winnerCardStyles: WinnerCardStyles = {
    container: {
      marginHorizontal: 12,
      borderRadius: 24,
      overflow: 'hidden',
    },
    votesText: {
      fontFamily: 'tt-autonomous-mono',
      color: 'rgba(255, 245, 236, 0.5)',
      fontSize: 13,
      lineHeight: 17,
      textAlign: 'center',
      marginTop: 8,
    },
  };

  // ── Runner-Up Card ──

  const RUNNER_UP_IMAGE_SIZE = 60;

  const runnerUpCardStyles: RunnerUpCardStyles = {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: spacingPresets.md2,
      backgroundColor: 'rgba(255, 245, 236, 0.06)',
      borderRadius: borderRadiusPresets.components,
      paddingRight: spacingPresets.md1,
      gap: spacingPresets.md1,
      borderWidth: 1,
      borderColor: 'rgba(255, 245, 236, 0.08)',
      marginBottom: spacingPresets.sm,
      overflow: 'hidden',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
    },
    rankBadge: {
      position: 'absolute',
      top: spacingPresets.xs,
      left: spacingPresets.xs,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: 'rgba(27, 42, 74, 0.7)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
    },
    rankText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.customColors.cream,
      fontWeight: '900',
      fontSize: 10,
      lineHeight: 14,
    },
    imageContainer: {
      width: RUNNER_UP_IMAGE_SIZE,
      height: RUNNER_UP_IMAGE_SIZE,
      overflow: 'hidden',
    },
    image: {
      width: RUNNER_UP_IMAGE_SIZE,
      height: RUNNER_UP_IMAGE_SIZE,
    },
    imageOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(27, 42, 74, 0.2)',
    },
    infoArea: {
      flex: 1,
      paddingVertical: spacingPresets.md1,
      gap: spacingPresets.xxs,
    },
    venueName: {
      ...typographyPresets.Label,
      color: colors.customColors.cream,
      fontWeight: '700',
      fontSize: 14,
      lineHeight: 19,
    },
    activityType: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.45)',
      fontSize: 11,
      lineHeight: 15,
    },
    dealBadge: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(207, 255, 71, 0.15)',
      paddingHorizontal: spacingPresets.xs + 2,
      paddingVertical: 2,
      borderRadius: 6,
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
    votesText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: 'rgba(255, 245, 236, 0.35)',
      fontSize: 11,
      lineHeight: 15,
      fontWeight: '600',
    },
  };

  // ── Member Vote Section ──

  const MEMBER_AVATAR_SIZE = 40;

  const memberVoteSectionStyles: MemberVoteSectionStyles = {
    container: {
      paddingHorizontal: spacingPresets.md2,
      gap: spacingPresets.xs,
    },
    memberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacingPresets.xs + 2,
      gap: spacingPresets.md1,
    },
    avatar: {
      width: MEMBER_AVATAR_SIZE,
      height: MEMBER_AVATAR_SIZE,
      borderRadius: MEMBER_AVATAR_SIZE / 2,
      backgroundColor: 'rgba(255, 245, 236, 0.08)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'rgba(255, 245, 236, 0.12)',
    },
    avatarCelebrated: {
      borderColor: colors.customColors.voltGreen,
      backgroundColor: 'rgba(207, 255, 71, 0.1)',
    },
    avatarText: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.5)',
      fontWeight: '700',
      fontSize: 15,
      lineHeight: 19,
    },
    avatarTextCelebrated: {
      color: colors.customColors.voltGreen,
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
    statusText: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.35)',
      fontSize: 12,
      lineHeight: 16,
    },
    statusTextCelebrated: {
      color: colors.customColors.voltGreen,
    },
    reactionEmoji: {
      fontSize: 20,
      lineHeight: 26,
    },
  };

  // ── Timeline Section ──

  const TIMELINE_DOT_SIZE = 10;

  const timelineSectionStyles: TimelineSectionStyles = {
    container: {
      paddingHorizontal: spacingPresets.md2,
      gap: 0,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacingPresets.md1,
      minHeight: 44,
    },
    dot: {
      width: TIMELINE_DOT_SIZE,
      height: TIMELINE_DOT_SIZE,
      borderRadius: TIMELINE_DOT_SIZE / 2,
      backgroundColor: colors.primaryAccent,
      marginTop: spacingPresets.xs,
    },
    line: {
      position: 'absolute',
      left: spacingPresets.md2 + TIMELINE_DOT_SIZE / 2 - 1,
      top: TIMELINE_DOT_SIZE + spacingPresets.xs,
      bottom: 0,
      width: 2,
      backgroundColor: 'rgba(255, 92, 77, 0.2)',
    },
    timeText: {
      ...typographyPresets.Label,
      fontFamily: 'tt-autonomous-mono',
      color: colors.customColors.cream,
      fontWeight: '700',
      fontSize: 13,
      lineHeight: 18,
      minWidth: 72,
    },
    labelText: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.5)',
      fontSize: 13,
      lineHeight: 18,
      flex: 1,
    },
  };

  // ── Section Title ──

  const sectionTitleStyles: SectionTitleStyles = {
    container: {
      paddingHorizontal: spacingPresets.md2,
      paddingBottom: spacingPresets.sm,
    },
    text: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: 'rgba(255, 245, 236, 0.5)',
      fontWeight: '900',
      fontSize: 11,
      lineHeight: 15,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
    },
  };

  // ── Action Buttons ──

  const actionButtonsStyles: ActionButtonsStyles = {
    gap: {
      height: spacingPresets.md1,
    },
  };

  // ── View Details Button (Volt Green) ──

  const viewDetailsButtonStyles: CustomButtonStyles = overrideStyles(buttonPresets.Primary, {
    container: {
      backgroundColor: colors.customColors.voltGreen,
      marginHorizontal: spacingPresets.md2,
      paddingVertical: spacingPresets.md2,
      borderRadius: borderRadiusPresets.components,
      shadowColor: colors.customColors.voltGreen,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
    },
    pressedContainer: {
      backgroundColor: '#B8E63E',
    },
    text: {
      color: colors.customColors.inkBlack,
      fontWeight: '900',
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: 0.5,
      fontFamily: 'SpaceGrotesk',
    },
  });

  // ── Share Plan Button (Coral) ──

  const sharePlanButtonStyles: CustomButtonStyles = overrideStyles(buttonPresets.Primary, {
    container: {
      backgroundColor: colors.primaryAccent,
      marginHorizontal: spacingPresets.md2,
      paddingVertical: spacingPresets.md1,
      borderRadius: borderRadiusPresets.components,
      shadowColor: colors.primaryAccent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    pressedContainer: {
      backgroundColor: colors.primaryAccentDark,
    },
    text: {
      color: colors.customColors.cream,
      fontWeight: '800',
      fontSize: 16,
      lineHeight: 22,
    },
  });

  // ── Deal Modal ──

  const dealModalStyles: DealModalStyles = {
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      zIndex: 100,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacingPresets.lg1,
    },
    container: {
      width: '100%',
      backgroundColor: colors.customColors.deepNavy,
      borderRadius: 24,
      overflow: 'hidden',
      paddingBottom: spacingPresets.lg2,
    },
    header: {
      paddingHorizontal: spacingPresets.lg1,
      paddingTop: spacingPresets.lg1,
      paddingBottom: spacingPresets.xl,
    },
    badge: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 20,
      paddingHorizontal: spacingPresets.md1 - 2,
      paddingVertical: spacingPresets.xxs + 1,
      marginBottom: spacingPresets.sm,
    },
    badgeText: {
      ...typographyPresets.Caption,
      color: '#FFF5EC',
      fontWeight: '700',
      fontSize: 11,
      lineHeight: 15,
      letterSpacing: 1.5,
    },
    headline: {
      ...typographyPresets.Title,
      color: '#FFF5EC',
      fontWeight: '800',
      fontSize: 22,
      lineHeight: 28,
    },
    subtitle: {
      ...typographyPresets.Body,
      color: 'rgba(255, 245, 236, 0.7)',
      marginTop: spacingPresets.xs,
      fontSize: 14,
      lineHeight: 20,
    },
    qrWrapper: {
      alignItems: 'center',
      marginTop: -spacingPresets.lg2,
    },
    qrBackground: {
      backgroundColor: '#FFFFFF',
      borderRadius: borderRadiusPresets.components,
      padding: spacingPresets.md2,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    codeLabelText: {
      ...typographyPresets.Caption,
      color: colors.customColors.cream,
      letterSpacing: 2,
      textAlign: 'center',
      opacity: 0.6,
      marginTop: spacingPresets.md2,
      fontWeight: '700',
      fontSize: 11,
      lineHeight: 15,
    },
    codeText: {
      fontSize: 34,
      fontWeight: '700',
      letterSpacing: 6,
      color: colors.customColors.cream,
      textAlign: 'center',
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      marginTop: spacingPresets.xs,
    },
    expiryText: {
      ...typographyPresets.Caption,
      color: colors.customColors.voltGreen,
      textAlign: 'center',
      marginTop: spacingPresets.sm,
      fontWeight: '600',
      fontSize: 13,
      lineHeight: 18,
    },
    hintText: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.4)',
      textAlign: 'center',
      marginTop: spacingPresets.xs,
      fontSize: 12,
      lineHeight: 16,
    },
    closeButton: overrideStyles(buttonPresets.Secondary, {
      container: {
        marginHorizontal: spacingPresets.lg1,
        marginTop: spacingPresets.md2,
        paddingVertical: spacingPresets.md1,
        borderRadius: borderRadiusPresets.components,
        borderWidth: 1,
        borderColor: 'rgba(255, 245, 236, 0.15)',
        backgroundColor: 'rgba(255, 245, 236, 0.06)',
      },
      pressedContainer: {
        backgroundColor: 'rgba(255, 245, 236, 0.1)',
      },
      text: {
        color: 'rgba(255, 245, 236, 0.7)',
        fontWeight: '700',
        fontSize: 15,
        lineHeight: 20,
      },
    }),
  };

  // ── Claim Deal Button ──

  const claimDealButtonStyles: CustomButtonStyles = overrideStyles(buttonPresets.Primary, {
    container: {
      backgroundColor: colors.customColors.voltGreen,
      marginHorizontal: spacingPresets.md2,
      paddingVertical: spacingPresets.md1,
      borderRadius: borderRadiusPresets.components,
      shadowColor: colors.customColors.voltGreen,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
    },
    pressedContainer: {
      backgroundColor: '#B8E63E',
    },
    text: {
      color: colors.customColors.inkBlack,
      fontWeight: '900',
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: 0.5,
      fontFamily: 'SpaceGrotesk',
    },
    icon: {
      color: colors.customColors.inkBlack,
    },
  });

  // ── Start New Battle Button (Tertiary) ──

  const newBattleButtonStyles: CustomButtonStyles = overrideStyles(buttonPresets.Tertiary, {
    container: {
      marginHorizontal: spacingPresets.md2,
      paddingVertical: spacingPresets.md1,
      borderRadius: borderRadiusPresets.components,
      borderWidth: 1,
      borderColor: 'rgba(255, 245, 236, 0.12)',
    },
    pressedContainer: {
      backgroundColor: 'rgba(255, 245, 236, 0.06)',
    },
    text: {
      color: 'rgba(255, 245, 236, 0.6)',
      fontWeight: '700',
      fontSize: 15,
      lineHeight: 20,
    },
  });

  return createAppPageStyles<ResultsStyles>({
    styles,
    headerStyles,
    heroTitleStyles,
    winnerCardStyles,
    runnerUpCardStyles,
    memberVoteSectionStyles,
    timelineSectionStyles,
    sectionTitleStyles,
    actionButtonsStyles,
    dealModalStyles,
    viewDetailsButtonStyles,
    sharePlanButtonStyles,
    newBattleButtonStyles,
    claimDealButtonStyles,
  });
}

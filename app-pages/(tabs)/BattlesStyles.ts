/**
 * Styling for the Battles page
 */
import { ViewStyle, TextStyle, ImageStyle, type DimensionValue } from 'react-native';

import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';

// ── Sub-component style interfaces ──

export interface BattlesHeaderStyles {
  container: ViewStyle;
  titleText: TextStyle;
  bellContainer: ViewStyle;
  bellIcon: ViewStyle;
  badgeContainer: ViewStyle;
  badgeText: TextStyle;
}

export interface SectionHeaderStyles {
  container: ViewStyle;
  titleText: TextStyle;
  countBadge: ViewStyle;
  countText: TextStyle;
}

export interface ActiveBattleCardStyles {
  pressable: ViewStyle;
  container: ViewStyle;
  accentBar: ViewStyle;
  contentArea: ViewStyle;
  topRow: ViewStyle;
  groupName: TextStyle;
  timerContainer: ViewStyle;
  timerDot: ViewStyle;
  timerText: TextStyle;
  voteProgressRow: ViewStyle;
  voteProgressText: TextStyle;
  voteProgressBarTrack: ViewStyle;
  voteProgressBarFill: ViewStyle & { width?: DimensionValue };
  contendersRow: ViewStyle;
  contenderThumbnail: ImageStyle;
  contenderOverlay: ViewStyle;
  contenderTitle: TextStyle;
}

export interface RecentResultCardStyles {
  pressable: ViewStyle;
  container: ViewStyle;
  thumbnail: ImageStyle;
  contentArea: ViewStyle;
  groupName: TextStyle;
  winnerRow: ViewStyle;
  winnerBadge: ViewStyle;
  winnerBadgeText: TextStyle;
  winnerTitle: TextStyle;
  bottomRow: ViewStyle;
  completedText: TextStyle;
  viewPlanButton: CustomButtonStyles;
}

export interface BattlesEmptyStateStyles {
  container: ViewStyle;
  iconContainer: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
}

// ── Main styles interface ──

export interface BattlesBaseStyles {
  safeArea: ViewStyle;
  container: ViewStyle;
  listContent: ViewStyle;
  sectionSeparator: ViewStyle;
}

export interface BattlesStyles {
  styles: BattlesBaseStyles;
  headerStyles: BattlesHeaderStyles;
  sectionHeaderStyles: SectionHeaderStyles;
  activeBattleCardStyles: ActiveBattleCardStyles;
  recentResultCardStyles: RecentResultCardStyles;
  emptyStateStyles: BattlesEmptyStateStyles;
}

/**
 * Custom hook that provides styles for the Battles component
 */
export function useBattlesStyles(): BattlesStyles {
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

  const styles: BattlesBaseStyles = {
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
      paddingBottom: spacingPresets.lg2 + spacingPresets.xl,
    },
    sectionSeparator: {
      height: spacingPresets.lg1,
    },
  };

  // ── Header ──

  const headerStyles: BattlesHeaderStyles = {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacingPresets.lg1,
      paddingTop: spacingPresets.md1,
      paddingBottom: spacingPresets.sm,
    },
    titleText: {
      ...typographyPresets.PageTitle,
      color: colors.customColors.cream,
      fontWeight: '900',
      fontSize: 26,
      lineHeight: 32,
      letterSpacing: 1.5,
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

  // ── Section Header ──

  const sectionHeaderStyles: SectionHeaderStyles = {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacingPresets.sm,
      paddingBottom: spacingPresets.md1,
      paddingTop: spacingPresets.sm,
    },
    titleText: {
      ...typographyPresets.Label,
      fontFamily: 'tt-autonomous-mono',
      color: 'rgba(255, 245, 236, 0.6)',
      fontWeight: '700',
      fontSize: 13,
      lineHeight: 18,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    countBadge: {
      backgroundColor: 'rgba(255, 92, 77, 0.2)',
      borderRadius: 10,
      minWidth: 22,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacingPresets.xs,
    },
    countText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.primaryAccent,
      fontSize: 11,
      lineHeight: 15,
      fontWeight: '700',
    },
  };

  // ── Active Battle Card ──

  const THUMBNAIL_SIZE = 48;

  const activeBattleCardStyles: ActiveBattleCardStyles = {
    pressable: {
      borderRadius: borderRadiusPresets.components,
      marginBottom: spacingPresets.md1,
    },
    container: {
      flexDirection: 'row',
      backgroundColor: 'rgba(255, 245, 236, 0.07)',
      borderRadius: borderRadiusPresets.components,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255, 92, 77, 0.25)',
      shadowColor: '#FF5C4D',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 5,
    },
    accentBar: {
      width: 4,
      backgroundColor: colors.primaryAccent,
    },
    contentArea: {
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
    groupName: {
      ...typographyPresets.Label,
      color: colors.customColors.cream,
      fontWeight: '700',
      fontSize: 16,
      lineHeight: 22,
      flex: 1,
      marginRight: spacingPresets.sm,
    },
    timerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 92, 77, 0.18)',
      paddingHorizontal: spacingPresets.sm,
      paddingVertical: spacingPresets.xxs + 1,
      borderRadius: 10,
      gap: spacingPresets.xs,
    },
    timerDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primaryAccent,
    },
    timerText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.primaryAccent,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '800',
      letterSpacing: 0.3,
    },
    voteProgressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacingPresets.sm,
    },
    voteProgressText: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.5)',
      fontSize: 12,
      lineHeight: 16,
    },
    voteProgressBarTrack: {
      flex: 1,
      height: 4,
      backgroundColor: 'rgba(255, 245, 236, 0.1)',
      borderRadius: 2,
    },
    voteProgressBarFill: {
      height: 4,
      backgroundColor: colors.customColors.voltGreen,
      borderRadius: 2,
    },
    contendersRow: {
      flexDirection: 'row',
      gap: spacingPresets.sm,
    },
    contenderThumbnail: {
      width: THUMBNAIL_SIZE,
      height: THUMBNAIL_SIZE,
      borderRadius: spacingPresets.sm,
    },
    contenderOverlay: {
      flex: 1,
      justifyContent: 'center',
    },
    contenderTitle: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.7)',
      fontSize: 12,
      lineHeight: 16,
    },
  };

  // ── Recent Result Card ──

  const RESULT_THUMBNAIL_SIZE = 60;

  const recentResultCardStyles: RecentResultCardStyles = {
    pressable: {
      borderRadius: borderRadiusPresets.components,
      marginBottom: spacingPresets.md1,
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
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 3,
    },
    thumbnail: {
      width: RESULT_THUMBNAIL_SIZE,
      height: RESULT_THUMBNAIL_SIZE,
      borderRadius: borderRadiusPresets.inputElements,
    },
    contentArea: {
      flex: 1,
      gap: spacingPresets.xxs,
    },
    groupName: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.5)',
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '600',
    },
    winnerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacingPresets.xs,
    },
    winnerBadge: {
      backgroundColor: 'rgba(207, 255, 71, 0.15)',
      paddingHorizontal: spacingPresets.xs + 2,
      paddingVertical: 2,
      borderRadius: 6,
    },
    winnerBadgeText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.customColors.voltGreen,
      fontSize: 9,
      lineHeight: 13,
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    winnerTitle: {
      ...typographyPresets.Label,
      color: colors.customColors.cream,
      fontWeight: '700',
      fontSize: 15,
      lineHeight: 21,
      flex: 1,
    },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacingPresets.xxs,
    },
    completedText: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.35)',
      fontSize: 11,
      lineHeight: 16,
    },
    viewPlanButton: overrideStyles(buttonPresets.Tertiary, {
      container: {
        paddingHorizontal: spacingPresets.sm,
        paddingVertical: spacingPresets.xxs,
      },
      text: {
        color: colors.primaryAccent,
        fontWeight: '700',
        fontSize: 12,
        lineHeight: 16,
      },
      pressedText: {
        color: colors.primaryAccentDark,
      },
    }),
  };

  // ── Empty State ──

  const EMPTY_ICON_SIZE = 80;

  const emptyStateStyles: BattlesEmptyStateStyles = {
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacingPresets.lg2,
      paddingVertical: spacingPresets.lg2 + spacingPresets.md2,
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
      marginBottom: spacingPresets.xs,
    },
    title: {
      ...typographyPresets.Title,
      color: colors.customColors.cream,
      textAlign: 'center',
      fontSize: 18,
      lineHeight: 24,
    },
    subtitle: {
      ...typographyPresets.Body,
      color: 'rgba(255, 245, 236, 0.4)',
      textAlign: 'center',
      fontSize: 14,
      lineHeight: 20,
      maxWidth: 260,
    },
  };

  return createAppPageStyles<BattlesStyles>({
    styles,
    headerStyles,
    sectionHeaderStyles,
    activeBattleCardStyles,
    recentResultCardStyles,
    emptyStateStyles,
  });
}

/**
 * Styling for the Analytics page
 */
import { ViewStyle, TextStyle } from 'react-native';

import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';
import { CustomHeaderStyles, useCustomHeaderStyles } from '@/comp-lib/custom-header/CustomHeaderStyles';

// ── Sub-component style interfaces ──

export interface TimePeriodPillStyles {
  scrollContainer: ViewStyle;
  pill: ViewStyle;
  pillSelected: ViewStyle;
  pillText: TextStyle;
  pillTextSelected: TextStyle;
}

export interface MetricCardStyles {
  container: ViewStyle;
  value: TextStyle;
  label: TextStyle;
  trendRow: ViewStyle;
  trendIconWrapper: ViewStyle;
  trendTextUp: TextStyle;
  trendTextDown: TextStyle;
  trendTextFlat: TextStyle;
}

export interface ChartSectionStyles {
  container: ViewStyle;
  chartArea: ViewStyle;
  barContainer: ViewStyle;
  bar: ViewStyle;
  barLabel: TextStyle;
  barValueLabel: TextStyle;
  yAxisLabel: TextStyle;
  lineRow: ViewStyle;
  lineDot: ViewStyle;
  lineSegment: ViewStyle;
  lineLabel: TextStyle;
}

export interface ActivityRowStyles {
  headerRow: ViewStyle;
  headerCell: TextStyle;
  headerCellTitle: TextStyle;
  row: ViewStyle;
  titleCell: ViewStyle;
  title: TextStyle;
  cell: TextStyle;
  conversionBadge: ViewStyle;
  conversionText: TextStyle;
}

export interface DealCardStyles {
  container: ViewStyle;
  headline: TextStyle;
  statsRow: ViewStyle;
  statLabel: TextStyle;
  peakLabel: TextStyle;
  progressBarTrack: ViewStyle;
  progressBarFill: ViewStyle;
}

export interface LockedSectionStyles {
  container: ViewStyle;
  iconWrapper: ViewStyle;
  title: TextStyle;
  description: TextStyle;
  iconColor: string;
}

export interface ComparisonToggleStyles {
  container: ViewStyle;
  label: TextStyle;
  switchTrackColor: { false: string; true: string };
  switchThumbColor: string;
  switchIosBackgroundColor: string;
}

/**
 * Interface for base styles of the useAnalyticsStyles hook
 */
export interface AnalyticsBaseStyles {
  safeArea: ViewStyle;
  scrollContent: ViewStyle;
  sectionContainer: ViewStyle;
  sectionTitle: TextStyle;
  metricsGrid: ViewStyle;
  metricsRow: ViewStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
  bottomSpacer: ViewStyle;
}

/**
 * Interface for the return value of the useAnalyticsStyles hook
 */
export interface AnalyticsStyles {
  styles: AnalyticsBaseStyles;
  headerStyles: CustomHeaderStyles;
  timePeriodPillStyles: TimePeriodPillStyles;
  metricCardStyles: MetricCardStyles;
  chartSectionStyles: ChartSectionStyles;
  activityRowStyles: ActivityRowStyles;
  dealCardStyles: DealCardStyles;
  lockedSectionStyles: LockedSectionStyles;
  comparisonToggleStyles: ComparisonToggleStyles;
  exportButtonStyles: CustomButtonStyles;
  upgradeButtonStyles: CustomButtonStyles;
}

// ── Constants ──

const CHART_BAR_WIDTH = 28;
const CHART_HEIGHT = 160;
const PROGRESS_BAR_HEIGHT = 6;
const TREND_ICON_SIZE = 14;
const LOCKED_ICON_SIZE = 40;

/**
 * Custom hook that provides styles for the Analytics component
 */
export function useAnalyticsStyles(): AnalyticsStyles {
  const {
    createAppPageStyles,
    colors,
    typographyPresets,
    buttonPresets,
    spacingPresets,
    borderRadiusPresets,
    overrideStyles,
  } = useStyleContext();

  const styles: AnalyticsBaseStyles = {
    safeArea: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    scrollContent: {
      paddingBottom: spacingPresets.lg2,
    },
    sectionContainer: {
      paddingHorizontal: spacingPresets.lg1,
      marginTop: spacingPresets.lg1,
    },
    sectionTitle: {
      ...typographyPresets.Label,
      color: colors.secondaryForeground,
      letterSpacing: 1.2,
      marginBottom: spacingPresets.md1,
    },
    metricsGrid: {
      paddingHorizontal: spacingPresets.lg1,
      marginTop: spacingPresets.lg1,
    },
    metricsRow: {
      flexDirection: 'row',
      gap: spacingPresets.md1,
      marginBottom: spacingPresets.md1,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryBackground,
    },
    loadingText: {
      ...typographyPresets.Body,
      color: colors.secondaryForeground,
      marginTop: spacingPresets.md1,
    },
    bottomSpacer: {
      height: spacingPresets.lg2,
    },
  };

  const defaultHeaderStyles = useCustomHeaderStyles();
  const headerStyles = overrideStyles(defaultHeaderStyles, {
    container: {
      backgroundColor: 'transparent',
    },
    title: {
      ...typographyPresets.Title,
      color: colors.primaryForeground,
    },
  });

  const timePeriodPillStyles: TimePeriodPillStyles = {
    scrollContainer: {
      paddingHorizontal: spacingPresets.lg1,
      marginTop: spacingPresets.md1,
      flexGrow: 0,
    },
    pill: {
      paddingHorizontal: spacingPresets.md2,
      paddingVertical: spacingPresets.sm,
      borderRadius: 20,
      backgroundColor: colors.secondaryBackground,
      marginRight: spacingPresets.sm,
    },
    pillSelected: {
      backgroundColor: colors.primaryAccent,
    },
    pillText: {
      ...typographyPresets.Label,
      fontFamily: 'tt-autonomous-mono',
      color: colors.secondaryForeground,
      fontSize: 13,
      lineHeight: 18,
    },
    pillTextSelected: {
      ...typographyPresets.Label,
      fontFamily: 'tt-autonomous-mono',
      color: colors.primaryAccentForeground,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '700',
    },
  };

  const metricCardStyles: MetricCardStyles = {
    container: {
      flex: 1,
      backgroundColor: colors.secondaryBackground,
      borderRadius: borderRadiusPresets.components,
      paddingVertical: spacingPresets.md2,
      paddingHorizontal: spacingPresets.md1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    value: {
      ...typographyPresets.PageTitle,
      color: colors.primaryForeground,
      fontSize: 24,
      lineHeight: 30,
    },
    label: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
      marginTop: spacingPresets.xs,
    },
    trendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacingPresets.sm,
      gap: spacingPresets.xxs,
    },
    trendIconWrapper: {
      width: TREND_ICON_SIZE,
      height: TREND_ICON_SIZE,
    },
    trendTextUp: {
      ...typographyPresets.Caption,
      color: colors.customColors.success,
      fontWeight: '700',
    },
    trendTextDown: {
      ...typographyPresets.Caption,
      color: colors.customColors.error,
      fontWeight: '700',
    },
    trendTextFlat: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
    },
  };

  const chartSectionStyles: ChartSectionStyles = {
    container: {
      paddingHorizontal: spacingPresets.lg1,
      marginTop: spacingPresets.lg1,
    },
    chartArea: {
      height: CHART_HEIGHT,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      backgroundColor: colors.secondaryBackground,
      borderRadius: borderRadiusPresets.components,
      paddingHorizontal: spacingPresets.md1,
      paddingTop: spacingPresets.md2,
      paddingBottom: spacingPresets.xl,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    barContainer: {
      alignItems: 'center',
      flex: 1,
    },
    bar: {
      width: CHART_BAR_WIDTH,
      borderRadius: 4,
      backgroundColor: colors.primaryAccent,
      minHeight: 4,
    },
    barLabel: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.secondaryForeground,
      fontSize: 10,
      lineHeight: 14,
      marginTop: spacingPresets.xs,
      position: 'absolute',
      bottom: -spacingPresets.lg1 - spacingPresets.xs,
    },
    barValueLabel: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.primaryForeground,
      fontSize: 9,
      lineHeight: 12,
      marginBottom: spacingPresets.xxs,
      fontWeight: '600',
    },
    yAxisLabel: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.secondaryForeground,
      fontSize: 9,
      lineHeight: 12,
    },
    lineRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      backgroundColor: colors.secondaryBackground,
      borderRadius: borderRadiusPresets.components,
      paddingHorizontal: spacingPresets.md1,
      paddingVertical: spacingPresets.md2,
      height: CHART_HEIGHT,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    lineDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.customColors.voltGreen,
    },
    lineSegment: {
      flex: 1,
      height: 2,
      backgroundColor: colors.customColors.voltGreen,
      opacity: 0.4,
    },
    lineLabel: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
      fontSize: 10,
      lineHeight: 14,
      textAlign: 'center',
    },
  };

  const activityRowStyles: ActivityRowStyles = {
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacingPresets.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.tertiaryBackground,
    },
    headerCell: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
      fontSize: 11,
      lineHeight: 14,
      fontWeight: '600',
      width: 56,
      textAlign: 'right',
    },
    headerCellTitle: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
      fontSize: 11,
      lineHeight: 14,
      fontWeight: '600',
      flex: 1,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacingPresets.md1,
      borderBottomWidth: 1,
      borderBottomColor: colors.tertiaryBackground,
    },
    titleCell: {
      flex: 1,
      paddingRight: spacingPresets.sm,
    },
    title: {
      ...typographyPresets.Caption,
      color: colors.primaryForeground,
      fontSize: 13,
      lineHeight: 18,
    },
    cell: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
      width: 56,
      textAlign: 'right',
    },
    conversionBadge: {
      width: 56,
      alignItems: 'flex-end',
    },
    conversionText: {
      ...typographyPresets.Caption,
      color: colors.customColors.voltGreen,
      fontWeight: '700',
      fontSize: 12,
      lineHeight: 16,
    },
  };

  const dealCardStyles: DealCardStyles = {
    container: {
      backgroundColor: colors.secondaryBackground,
      borderRadius: borderRadiusPresets.components,
      padding: spacingPresets.md2,
      marginBottom: spacingPresets.md1,
      borderLeftWidth: 3,
      borderLeftColor: colors.primaryAccent,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    headline: {
      ...typographyPresets.Label,
      color: colors.primaryForeground,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacingPresets.sm,
    },
    statLabel: {
      ...typographyPresets.Caption,
      color: colors.primaryAccent,
      fontWeight: '600',
    },
    peakLabel: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
    },
    progressBarTrack: {
      height: PROGRESS_BAR_HEIGHT,
      backgroundColor: colors.tertiaryBackground,
      borderRadius: 3,
      marginTop: spacingPresets.sm,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: PROGRESS_BAR_HEIGHT,
      backgroundColor: colors.primaryAccent,
      borderRadius: 3,
    },
  };

  const lockedSectionStyles: LockedSectionStyles = {
    container: {
      backgroundColor: colors.secondaryBackground,
      borderRadius: borderRadiusPresets.components,
      padding: spacingPresets.lg1,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.tertiaryBackground,
      borderStyle: 'dashed',
    },
    iconWrapper: {
      width: LOCKED_ICON_SIZE,
      height: LOCKED_ICON_SIZE,
      borderRadius: LOCKED_ICON_SIZE / 2,
      backgroundColor: 'rgba(255, 92, 77, 0.12)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacingPresets.md1,
    },
    title: {
      ...typographyPresets.Label,
      color: colors.primaryForeground,
      textAlign: 'center',
      marginBottom: spacingPresets.xs,
    },
    description: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
      textAlign: 'center',
      marginBottom: spacingPresets.md2,
    },
    iconColor: colors.primaryAccent,
  };

  const comparisonToggleStyles: ComparisonToggleStyles = {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacingPresets.lg1,
      marginTop: spacingPresets.md1,
    },
    label: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
    },
    switchTrackColor: {
      false: colors.tertiaryBackground,
      true: colors.primaryAccent,
    },
    switchThumbColor: '#FFFFFF',
    switchIosBackgroundColor: colors.tertiaryBackground,
  };

  const exportButtonStyles = overrideStyles(buttonPresets.Secondary, {
    container: {
      borderColor: colors.secondaryForeground,
      borderWidth: 1,
      borderRadius: borderRadiusPresets.inputElements,
      paddingVertical: spacingPresets.md1,
      backgroundColor: 'transparent',
    },
    text: {
      ...typographyPresets.Button,
      color: colors.primaryForeground,
      fontSize: 14,
      lineHeight: 20,
    },
    icon: {
      color: colors.primaryForeground,
    },
  });

  const upgradeButtonStyles = overrideStyles(buttonPresets.Primary, {
    container: {
      backgroundColor: colors.customColors.voltGreen,
      borderRadius: borderRadiusPresets.inputElements,
      paddingVertical: spacingPresets.sm,
      paddingHorizontal: spacingPresets.lg1,
    },
    text: {
      ...typographyPresets.Button,
      color: colors.customColors.inkBlack,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '700',
    },
  });

  return createAppPageStyles<AnalyticsStyles>({
    styles,
    headerStyles,
    timePeriodPillStyles,
    metricCardStyles,
    chartSectionStyles,
    activityRowStyles,
    dealCardStyles,
    lockedSectionStyles,
    comparisonToggleStyles,
    exportButtonStyles,
    upgradeButtonStyles,
  });
}

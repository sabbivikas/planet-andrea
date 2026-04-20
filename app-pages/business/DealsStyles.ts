/**
 * Styling for the Deals page
 */
import { ViewStyle, TextStyle } from 'react-native';

import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';
import { CustomHeaderStyles, useCustomHeaderStyles } from '@/comp-lib/custom-header/CustomHeaderStyles';

// ── Sub-component style interfaces ──

export interface FilterPillStyles {
  container: ViewStyle;
  pill: ViewStyle;
  pillActive: ViewStyle;
  pillText: TextStyle;
  pillTextActive: TextStyle;
}

export interface SortToggleStyles {
  container: ViewStyle;
  option: ViewStyle;
  optionActive: ViewStyle;
  optionText: TextStyle;
  optionTextActive: TextStyle;
}

export interface DealCardStyles {
  container: ViewStyle;
  pressable: ViewStyle;
  discountBadge: ViewStyle;
  discountBadgeText: TextStyle;
  discountLabelText: TextStyle;
  contentContainer: ViewStyle;
  titleRow: ViewStyle;
  headline: TextStyle;
  statusBadge: ViewStyle;
  statusBadgeActive: ViewStyle;
  statusBadgeExpired: ViewStyle;
  statusBadgeScheduled: ViewStyle;
  statusBadgeText: TextStyle;
  statusBadgeTextActive: TextStyle;
  statusBadgeTextExpired: TextStyle;
  statusBadgeTextScheduled: TextStyle;
  metricsRow: ViewStyle;
  metricGroup: ViewStyle;
  metricIconWrapper: ViewStyle;
  metricText: TextStyle;
  linkedBadge: ViewStyle;
  linkedBadgeIconWrapper: ViewStyle;
  linkedBadgeText: TextStyle;
  expiryWarningBadge: ViewStyle;
  expiryWarningIconWrapper: ViewStyle;
  expiryWarningText: TextStyle;
  actionsRow: ViewStyle;
}

export interface CountBadgeStyles {
  container: ViewStyle;
  text: TextStyle;
}

export interface EmptyStateStyles {
  container: ViewStyle;
  iconWrapper: ViewStyle;
  iconColor: string;
  title: TextStyle;
  subtitle: TextStyle;
  tipsContainer: ViewStyle;
  tipRow: ViewStyle;
  tipIconWrapper: ViewStyle;
  tipIconColor: string;
  tipText: TextStyle;
}

/**
 * Interface for base styles of the useDealsStyles hook
 */
export interface DealsBaseStyles {
  safeArea: ViewStyle;
  listContainer: ViewStyle;
  listContent: ViewStyle;
  toolbarContainer: ViewStyle;
  sortContainer: ViewStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
}

/**
 * Interface for the return value of the useDealsStyles hook
 */
export interface DealsStyles {
  styles: DealsBaseStyles;
  headerStyles: CustomHeaderStyles;
  createButtonStyles: CustomButtonStyles;
  filterPillStyles: FilterPillStyles;
  sortToggleStyles: SortToggleStyles;
  dealCardStyles: DealCardStyles;
  emptyStateStyles: EmptyStateStyles;
  emptyCreateButtonStyles: CustomButtonStyles;
  deactivateButtonStyles: CustomButtonStyles;
  duplicateButtonStyles: CustomButtonStyles;
  deleteButtonStyles: CustomButtonStyles;
  countBadgeStyles: CountBadgeStyles;
}

// ── Constants ──

const DISCOUNT_BADGE_SIZE = 64;

/**
 * Custom hook that provides styles for the Deals component
 */
export function useDealsStyles(): DealsStyles {
  const {
    createAppPageStyles,
    colors,
    typographyPresets,
    buttonPresets,
    spacingPresets,
    borderRadiusPresets,
    overrideStyles,
  } = useStyleContext();

  const styles: DealsBaseStyles = {
    safeArea: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    listContainer: {
      marginTop: spacingPresets.sm,
    },
    listContent: {
      paddingHorizontal: spacingPresets.md2,
      paddingBottom: spacingPresets.xl,
    },
    toolbarContainer: {
      paddingHorizontal: spacingPresets.md2,
      marginTop: spacingPresets.md1,
      gap: spacingPresets.sm,
    },
    sortContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: spacingPresets.xs,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryBackground,
      gap: spacingPresets.md1,
    },
    loadingText: {
      ...typographyPresets.Body,
      color: colors.secondaryForeground,
    },
  };

  // ── Header ──

  const defaultHeaderStyles = useCustomHeaderStyles();
  const headerStyles = overrideStyles(defaultHeaderStyles, {
    container: {
      backgroundColor: 'transparent',
      paddingBottom: spacingPresets.xs,
    },
    title: {
      ...typographyPresets.PageTitle,
      color: colors.primaryForeground,
      fontWeight: '900',
      letterSpacing: -0.5,
      textTransform: 'uppercase',
    },
  });

  // ── Create Button ──

  const createButtonStyles = overrideStyles(buttonPresets.Primary, {
    container: {
      backgroundColor: colors.customColors.voltGreen,
      borderRadius: borderRadiusPresets.inputElements,
      marginHorizontal: spacingPresets.md2,
      marginTop: spacingPresets.sm,
      paddingVertical: spacingPresets.md1,
      shadowColor: colors.customColors.voltGreen,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    text: {
      ...typographyPresets.Button,
      color: colors.customColors.inkBlack,
      fontWeight: '800',
    },
    icon: {
      color: colors.customColors.inkBlack,
      size: 20,
    },
  });

  // ── Filter Pills ──

  const filterPillStyles: FilterPillStyles = {
    container: {
      flexDirection: 'row',
      gap: spacingPresets.sm,
      flexGrow: 0,
    },
    pill: {
      paddingHorizontal: spacingPresets.md2,
      paddingVertical: spacingPresets.sm,
      borderRadius: 20,
      backgroundColor: colors.secondaryBackground,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    pillActive: {
      backgroundColor: colors.primaryAccent,
      borderColor: colors.primaryAccent,
      shadowColor: colors.primaryAccent,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 2,
    },
    pillText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.secondaryForeground,
      fontWeight: '600',
      fontSize: 13,
      lineHeight: 18,
    },
    pillTextActive: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 13,
      lineHeight: 18,
    },
  };

  // ── Sort Toggle ──

  const sortToggleStyles: SortToggleStyles = {
    container: {
      flexDirection: 'row',
      backgroundColor: colors.secondaryBackground,
      borderRadius: 8,
      padding: spacingPresets.xxs,
    },
    option: {
      paddingHorizontal: spacingPresets.md1,
      paddingVertical: spacingPresets.xs,
      borderRadius: 6,
    },
    optionActive: {
      backgroundColor: colors.tertiaryBackground,
    },
    optionText: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
      fontSize: 11,
      lineHeight: 16,
    },
    optionTextActive: {
      ...typographyPresets.Caption,
      color: colors.primaryForeground,
      fontWeight: '700',
      fontSize: 11,
      lineHeight: 16,
    },
  };

  // ── Deal Card ──

  const dealCardStyles: DealCardStyles = {
    container: {
      backgroundColor: colors.secondaryBackground,
      borderRadius: borderRadiusPresets.components,
      marginBottom: spacingPresets.md1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.18,
      shadowRadius: 12,
      elevation: 6,
      overflow: 'hidden',
    },
    pressable: {
      flexDirection: 'row',
      padding: spacingPresets.md2,
    },
    discountBadge: {
      width: DISCOUNT_BADGE_SIZE,
      height: DISCOUNT_BADGE_SIZE,
      borderRadius: borderRadiusPresets.inputElements,
      backgroundColor: 'rgba(255, 92, 77, 0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    discountBadgeText: {
      ...typographyPresets.Title,
      color: colors.primaryAccent,
      fontWeight: '900',
      fontSize: 20,
      lineHeight: 24,
    },
    discountLabelText: {
      ...typographyPresets.Caption,
      color: colors.primaryAccent,
      fontWeight: '700',
      fontSize: 9,
      lineHeight: 12,
      letterSpacing: 0.5,
    },
    contentContainer: {
      flex: 1,
      marginLeft: spacingPresets.md1,
      justifyContent: 'center',
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacingPresets.sm,
    },
    headline: {
      ...typographyPresets.Label,
      color: colors.primaryForeground,
      fontWeight: '800',
      flex: 1,
      fontSize: 15,
      lineHeight: 20,
    },
    statusBadge: {
      paddingHorizontal: spacingPresets.sm,
      paddingVertical: spacingPresets.xxs,
      borderRadius: 6,
    },
    statusBadgeActive: {
      backgroundColor: 'rgba(207, 255, 71, 0.2)',
    },
    statusBadgeExpired: {
      backgroundColor: 'rgba(255, 152, 0, 0.18)',
    },
    statusBadgeScheduled: {
      backgroundColor: 'rgba(100, 149, 237, 0.18)',
    },
    statusBadgeText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 9,
      lineHeight: 13,
      letterSpacing: 0.8,
      fontWeight: '800',
    },
    statusBadgeTextActive: {
      color: colors.customColors.voltGreen,
    },
    statusBadgeTextExpired: {
      color: colors.customColors.warning,
    },
    statusBadgeTextScheduled: {
      color: '#6495ED',
    },
    metricsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginTop: spacingPresets.sm,
      gap: spacingPresets.md1,
    },
    metricGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacingPresets.xxs,
    },
    metricIconWrapper: {
      width: 14,
      height: 14,
    },
    metricText: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
      fontSize: 12,
      lineHeight: 16,
    },
    linkedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(207, 255, 71, 0.12)',
      paddingHorizontal: spacingPresets.sm,
      paddingVertical: spacingPresets.xxs,
      borderRadius: 6,
      gap: spacingPresets.xxs,
    },
    linkedBadgeIconWrapper: {
      width: 10,
      height: 10,
    },
    linkedBadgeText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 9,
      lineHeight: 13,
      letterSpacing: 0.8,
      fontWeight: '800',
      color: colors.customColors.voltGreen,
    },
    expiryWarningBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 152, 0, 0.12)',
      paddingHorizontal: spacingPresets.sm,
      paddingVertical: spacingPresets.xxs,
      borderRadius: 6,
      gap: spacingPresets.xxs,
    },
    expiryWarningIconWrapper: {
      width: 10,
      height: 10,
    },
    expiryWarningText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 9,
      lineHeight: 13,
      letterSpacing: 0.8,
      fontWeight: '800',
      color: colors.customColors.warning,
    },
    actionsRow: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: colors.tertiaryBackground,
      backgroundColor: colors.secondaryBackground,
    },
  };

  // ── Empty State ──

  const EMPTY_ICON_WRAPPER_SIZE = 56;

  const emptyStateStyles: EmptyStateStyles = {
    container: {
      alignItems: 'center',
      paddingHorizontal: spacingPresets.lg1,
      paddingTop: spacingPresets.xl,
    },
    iconWrapper: {
      width: EMPTY_ICON_WRAPPER_SIZE,
      height: EMPTY_ICON_WRAPPER_SIZE,
      borderRadius: EMPTY_ICON_WRAPPER_SIZE / 2,
      backgroundColor: 'rgba(255, 92, 77, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacingPresets.md2,
    },
    iconColor: colors.primaryAccent,
    title: {
      ...typographyPresets.Title,
      color: colors.primaryForeground,
      textAlign: 'center',
      fontWeight: '800',
      marginBottom: spacingPresets.sm,
    },
    subtitle: {
      ...typographyPresets.Body,
      color: colors.secondaryForeground,
      textAlign: 'center',
      marginBottom: spacingPresets.lg1,
    },
    tipsContainer: {
      alignSelf: 'stretch',
      backgroundColor: colors.secondaryBackground,
      borderRadius: borderRadiusPresets.components,
      padding: spacingPresets.lg1,
      gap: spacingPresets.md2,
      marginBottom: spacingPresets.lg1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 3,
    },
    tipRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacingPresets.md1,
    },
    tipIconWrapper: {
      width: 18,
      height: 18,
    },
    tipIconColor: colors.customColors.voltGreen,
    tipText: {
      ...typographyPresets.Body,
      color: colors.primaryForeground,
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
    },
  };

  // ── Empty Create Button ──

  const emptyCreateButtonStyles = overrideStyles(buttonPresets.Primary, {
    container: {
      backgroundColor: colors.customColors.voltGreen,
      borderRadius: borderRadiusPresets.inputElements,
      paddingVertical: spacingPresets.md1,
      paddingHorizontal: spacingPresets.lg1,
      shadowColor: colors.customColors.voltGreen,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 4,
    },
    text: {
      ...typographyPresets.Button,
      color: colors.customColors.inkBlack,
      fontWeight: '800',
    },
    icon: {
      color: colors.customColors.inkBlack,
      size: 20,
    },
  });

  // ── Deactivate / Activate Button ──

  const deactivateButtonStyles = overrideStyles(buttonPresets.Tertiary, {
    container: {
      flex: 1,
      paddingVertical: spacingPresets.md1,
      borderRightWidth: 1,
      borderRightColor: colors.tertiaryBackground,
      borderRadius: 0,
    },
    text: {
      ...typographyPresets.Caption,
      color: colors.primaryForeground,
      fontWeight: '700',
      fontSize: 12,
      lineHeight: 16,
    },
    icon: {
      color: colors.primaryForeground,
      size: 14,
    },
  });

  // ── Duplicate Button ──

  const duplicateButtonStyles = overrideStyles(buttonPresets.Tertiary, {
    container: {
      flex: 1,
      paddingVertical: spacingPresets.md1,
      borderRightWidth: 1,
      borderRightColor: colors.tertiaryBackground,
      borderRadius: 0,
    },
    text: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
      fontWeight: '700',
      fontSize: 12,
      lineHeight: 16,
    },
    icon: {
      color: colors.secondaryForeground,
      size: 14,
    },
  });

  // ── Delete Button ──

  const deleteButtonStyles = overrideStyles(buttonPresets.Tertiary, {
    container: {
      flex: 1,
      paddingVertical: spacingPresets.md1,
      borderRadius: 0,
    },
    text: {
      ...typographyPresets.Caption,
      color: colors.customColors.error,
      fontWeight: '700',
      fontSize: 12,
      lineHeight: 16,
    },
    icon: {
      color: colors.customColors.error,
      size: 14,
    },
  });

  // ── Count Badge ──

  const countBadgeStyles: CountBadgeStyles = {
    container: {
      paddingBottom: spacingPresets.md1,
    },
    text: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.secondaryForeground,
      fontWeight: '600',
      fontSize: 13,
      lineHeight: 18,
      letterSpacing: 0.3,
    },
  };

  return createAppPageStyles<DealsStyles>({
    styles,
    headerStyles,
    createButtonStyles,
    filterPillStyles,
    sortToggleStyles,
    dealCardStyles,
    emptyStateStyles,
    emptyCreateButtonStyles,
    deactivateButtonStyles,
    duplicateButtonStyles,
    deleteButtonStyles,
    countBadgeStyles,
  });
}

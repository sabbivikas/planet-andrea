/**
 * Styling for the Activities page
 */
import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

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

export interface ActivityCardStyles {
  container: ViewStyle;
  pressable: ViewStyle;
  thumbnail: ImageStyle;
  contentContainer: ViewStyle;
  titleRow: ViewStyle;
  title: TextStyle;
  statusBadge: ViewStyle;
  statusBadgeActive: ViewStyle;
  statusBadgePaused: ViewStyle;
  statusBadgePending: ViewStyle;
  statusBadgeText: TextStyle;
  statusBadgeTextActive: TextStyle;
  statusBadgeTextPaused: TextStyle;
  statusBadgeTextPending: TextStyle;
  metricsRow: ViewStyle;
  metricGroup: ViewStyle;
  metricIconWrapper: ViewStyle;
  metricText: TextStyle;
  dealBadge: ViewStyle;
  dealIconWrapper: ViewStyle;
  dealBadgeText: TextStyle;
  chevronWrapper: ViewStyle;
  actionsRow: ViewStyle;
}

export interface CountBadgeStyles {
  container: ViewStyle;
  text: TextStyle;
}

export interface BulkActionBarStyles {
  container: ViewStyle;
  selectionInfo: ViewStyle;
  selectionText: TextStyle;
  actionsRow: ViewStyle;
}

export interface SelectionCheckboxStyles {
  container: ViewStyle;
  checkbox: ViewStyle;
  checkboxSelected: ViewStyle;
  checkIcon: { size: number; color: string };
}

export interface EmptyStateStyles {
  container: ViewStyle;
  iconWrapper: ViewStyle;
  iconColor: string;
  title: TextStyle;
  subtitle: TextStyle;
  benefitsContainer: ViewStyle;
  benefitRow: ViewStyle;
  benefitIconWrapper: ViewStyle;
  benefitIconColor: string;
  benefitText: TextStyle;
}

/**
 * Interface for base styles of the useActivitiesStyles hook
 */
export interface ActivitiesBaseStyles {
  safeArea: ViewStyle;
  listContainer: ViewStyle;
  listContent: ViewStyle;
  toolbarContainer: ViewStyle;
  sortContainer: ViewStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
}

/**
 * Interface for the return value of the useActivitiesStyles hook
 */
export interface ActivitiesStyles {
  styles: ActivitiesBaseStyles;
  headerStyles: CustomHeaderStyles;
  createButtonStyles: CustomButtonStyles;
  bulkToggleButtonStyles: CustomButtonStyles;
  filterPillStyles: FilterPillStyles;
  sortToggleStyles: SortToggleStyles;
  activityCardStyles: ActivityCardStyles;
  selectionCheckboxStyles: SelectionCheckboxStyles;
  bulkActionBarStyles: BulkActionBarStyles;
  bulkPauseButtonStyles: CustomButtonStyles;
  bulkActivateButtonStyles: CustomButtonStyles;
  bulkDeleteButtonStyles: CustomButtonStyles;
  emptyStateStyles: EmptyStateStyles;
  emptyCreateButtonStyles: CustomButtonStyles;
  toggleStatusButtonStyles: CustomButtonStyles;
  deleteButtonStyles: CustomButtonStyles;
  countBadgeStyles: CountBadgeStyles;
}

// ── Constants ──

const THUMBNAIL_SIZE = 72;
const METRIC_ICON_SIZE = 14;
const TAG_ICON_SIZE = 10;
const CHEVRON_ICON_SIZE = 18;
const EMPTY_ICON_WRAPPER_SIZE = 56;
const BENEFIT_ICON_SIZE = 18;

/**
 * Custom hook that provides styles for the Activities component
 */
export function useActivitiesStyles(): ActivitiesStyles {
  const {
    createAppPageStyles,
    colors,
    typographyPresets,
    buttonPresets,
    spacingPresets,
    borderRadiusPresets,
    overrideStyles,
  } = useStyleContext();

  const styles: ActivitiesBaseStyles = {
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

  // ── Activity Card ──

  const activityCardStyles: ActivityCardStyles = {
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
    thumbnail: {
      width: THUMBNAIL_SIZE,
      height: THUMBNAIL_SIZE,
      borderRadius: borderRadiusPresets.inputElements,
      backgroundColor: colors.tertiaryBackground,
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
    title: {
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
    statusBadgePaused: {
      backgroundColor: 'rgba(255, 152, 0, 0.18)',
    },
    statusBadgePending: {
      backgroundColor: 'rgba(255, 92, 77, 0.15)',
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
    statusBadgeTextPaused: {
      color: colors.customColors.warning,
    },
    statusBadgeTextPending: {
      color: colors.primaryAccent,
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
      width: METRIC_ICON_SIZE,
      height: METRIC_ICON_SIZE,
    },
    metricText: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
      fontSize: 12,
      lineHeight: 16,
    },
    dealBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 92, 77, 0.12)',
      paddingHorizontal: spacingPresets.sm,
      paddingVertical: spacingPresets.xxs,
      borderRadius: 6,
      gap: spacingPresets.xxs,
    },
    dealIconWrapper: {
      width: TAG_ICON_SIZE,
      height: TAG_ICON_SIZE,
    },
    dealBadgeText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 9,
      lineHeight: 13,
      letterSpacing: 0.8,
      fontWeight: '800',
      color: colors.primaryAccentDark,
    },
    chevronWrapper: {
      width: CHEVRON_ICON_SIZE,
      height: CHEVRON_ICON_SIZE,
      alignSelf: 'center',
      justifyContent: 'center',
      alignItems: 'center',
      opacity: 0.4,
    },
    actionsRow: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: colors.tertiaryBackground,
      backgroundColor: colors.secondaryBackground,
    },
  };

  // ── Empty State ──

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
    benefitsContainer: {
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
    benefitRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacingPresets.md1,
    },
    benefitIconWrapper: {
      width: BENEFIT_ICON_SIZE,
      height: BENEFIT_ICON_SIZE,
    },
    benefitIconColor: colors.customColors.voltGreen,
    benefitText: {
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

  // ── Toggle Status Button ──

  const toggleStatusButtonStyles = overrideStyles(buttonPresets.Tertiary, {
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

  // ── Bulk Toggle Button ──

  const bulkToggleButtonStyles = overrideStyles(buttonPresets.Tertiary, {
    container: {
      paddingVertical: spacingPresets.sm,
      paddingHorizontal: spacingPresets.md1,
      borderRadius: 8,
      backgroundColor: colors.secondaryBackground,
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

  // ── Selection Checkbox ──

  const CHECKBOX_SIZE = 24;

  const selectionCheckboxStyles: SelectionCheckboxStyles = {
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacingPresets.md1,
    },
    checkbox: {
      width: CHECKBOX_SIZE,
      height: CHECKBOX_SIZE,
      borderRadius: CHECKBOX_SIZE / 2,
      borderWidth: 2,
      borderColor: colors.secondaryForeground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxSelected: {
      backgroundColor: colors.customColors.voltGreen,
      borderColor: colors.customColors.voltGreen,
    },
    checkIcon: {
      size: 14,
      color: colors.customColors.inkBlack,
    },
  };

  // ── Bulk Action Bar ──

  const bulkActionBarStyles: BulkActionBarStyles = {
    container: {
      paddingHorizontal: spacingPresets.md2,
      paddingVertical: spacingPresets.md1,
      backgroundColor: colors.secondaryBackground,
      borderRadius: borderRadiusPresets.components,
      marginHorizontal: spacingPresets.md2,
      marginTop: spacingPresets.sm,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    selectionInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacingPresets.sm,
    },
    selectionText: {
      ...typographyPresets.Label,
      color: colors.primaryForeground,
      fontWeight: '700',
    },
    actionsRow: {
      flexDirection: 'row',
      gap: spacingPresets.sm,
    },
  };

  const bulkPauseButtonStyles = overrideStyles(buttonPresets.Secondary, {
    container: {
      flex: 1,
      borderColor: colors.secondaryForeground,
      borderWidth: 1,
      borderRadius: borderRadiusPresets.inputElements,
      paddingVertical: spacingPresets.sm,
      backgroundColor: 'transparent',
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

  const bulkActivateButtonStyles = overrideStyles(buttonPresets.Primary, {
    container: {
      flex: 1,
      backgroundColor: colors.customColors.voltGreen,
      borderRadius: borderRadiusPresets.inputElements,
      paddingVertical: spacingPresets.sm,
    },
    text: {
      ...typographyPresets.Caption,
      color: colors.customColors.inkBlack,
      fontWeight: '700',
      fontSize: 12,
      lineHeight: 16,
    },
    icon: {
      color: colors.customColors.inkBlack,
      size: 14,
    },
  });

  const bulkDeleteButtonStyles = overrideStyles(buttonPresets.Tertiary, {
    container: {
      flex: 1,
      borderRadius: borderRadiusPresets.inputElements,
      paddingVertical: spacingPresets.sm,
      backgroundColor: 'rgba(220, 38, 38, 0.12)',
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

  return createAppPageStyles<ActivitiesStyles>({
    styles,
    headerStyles,
    createButtonStyles,
    bulkToggleButtonStyles,
    filterPillStyles,
    sortToggleStyles,
    activityCardStyles,
    selectionCheckboxStyles,
    bulkActionBarStyles,
    bulkPauseButtonStyles,
    bulkActivateButtonStyles,
    bulkDeleteButtonStyles,
    emptyStateStyles,
    emptyCreateButtonStyles,
    toggleStatusButtonStyles,
    deleteButtonStyles,
    countBadgeStyles,
  });
}

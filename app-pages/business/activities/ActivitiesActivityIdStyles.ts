/**
 * Styling for the ActivitiesActivityId (Edit Activity) page
 */
import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';
import { CustomHeaderStyles, useCustomHeaderStyles } from '@/comp-lib/custom-header/CustomHeaderStyles';
import { CustomTextInputStyles } from '@/comp-lib/core/custom-text-input/CustomTextInputStyles';
import { CustomSwitchStyles } from '@/comp-lib/core/custom-switch/CustomSwitchStyles';

// ── Sub-component style interfaces ──

export interface ImageUploadStyles {
  container: ViewStyle;
  placeholder: ViewStyle;
  placeholderIconWrapper: ViewStyle;
  placeholderIconColor: string;
  placeholderText: TextStyle;
  placeholderSubtext: TextStyle;
  uploadedImage: ImageStyle;
  errorBorder: ViewStyle;
}

export interface CategoryChipStyles {
  scrollContainer: ViewStyle;
  chip: ViewStyle;
  chipActive: ViewStyle;
  chipText: TextStyle;
  chipTextActive: TextStyle;
  errorText: TextStyle;
}

export interface PriceChipStyles {
  container: ViewStyle;
  chip: ViewStyle;
  chipActive: ViewStyle;
  chipText: TextStyle;
  chipTextActive: TextStyle;
}

export interface TagChipStyles {
  container: ViewStyle;
  chip: ViewStyle;
  chipActive: ViewStyle;
  chipText: TextStyle;
  chipTextActive: TextStyle;
}

export interface CharCountStyles {
  container: ViewStyle;
  text: TextStyle;
  textNearLimit: TextStyle;
}

export interface SectionStyles {
  container: ViewStyle;
  header: TextStyle;
}

export interface ValidationErrorStyles {
  text: TextStyle;
}

export interface MetricCardStyles {
  container: ViewStyle;
  valueText: TextStyle;
  labelText: TextStyle;
  trendRow: ViewStyle;
  trendIconWrapper: ViewStyle;
  trendUpText: TextStyle;
  trendDownText: TextStyle;
}

export interface DealSectionStyles {
  container: ViewStyle;
  dealCard: ViewStyle;
  dealHeadlineWrapper: ViewStyle;
  dealHeadline: TextStyle;
  dealType: TextStyle;
  actionsRow: ViewStyle;
  noDealText: TextStyle;
  dealPickerItem: ViewStyle;
  dealPickerItemActive: ViewStyle;
  dealPickerText: TextStyle;
  dealPickerTextActive: TextStyle;
  linkedBadge: ViewStyle;
  linkedBadgeText: TextStyle;
}

export interface BoostStatusStyles {
  container: ViewStyle;
  statusRow: ViewStyle;
  statusBadge: ViewStyle;
  statusBadgeActive: ViewStyle;
  statusBadgeText: TextStyle;
  statusBadgeTextActive: TextStyle;
  tierText: TextStyle;
  budgetRow: ViewStyle;
  budgetText: TextStyle;
  budgetBarTrack: ViewStyle;
  budgetBarFill: ViewStyle;
  impressionsText: TextStyle;
}

export interface PauseToggleStyles {
  container: ViewStyle;
  labelRow: ViewStyle;
  labelText: TextStyle;
  hintText: TextStyle;
  statusBadge: ViewStyle;
  statusBadgeActive: ViewStyle;
  statusText: TextStyle;
  statusTextActive: TextStyle;
}

/**
 * Interface for base styles of the useActivitiesActivityIdStyles hook
 */
export interface ActivitiesActivityIdBaseStyles {
  safeArea: ViewStyle;
  scrollContent: ViewStyle;
  bottomBar: ViewStyle;
  fieldLabel: TextStyle;
  fieldSpacing: ViewStyle;
  metricsRow: ViewStyle;
}

/**
 * Interface for the return value of the useActivitiesActivityIdStyles hook
 */
export interface ActivitiesActivityIdStyles {
  styles: ActivitiesActivityIdBaseStyles;
  headerStyles: CustomHeaderStyles;
  imageUploadStyles: ImageUploadStyles;
  titleInputStyles: CustomTextInputStyles;
  categoryChipStyles: CategoryChipStyles;
  descriptionInputStyles: CustomTextInputStyles;
  charCountStyles: CharCountStyles;
  priceChipStyles: PriceChipStyles;
  operatingHoursInputStyles: CustomTextInputStyles;
  tagChipStyles: TagChipStyles;
  sectionStyles: SectionStyles;
  validationErrorStyles: ValidationErrorStyles;
  metricCardStyles: MetricCardStyles;
  dealSectionStyles: DealSectionStyles;
  boostStatusStyles: BoostStatusStyles;
  pauseToggleStyles: PauseToggleStyles;
  switchStyles: CustomSwitchStyles;
  saveButtonStyles: CustomButtonStyles;
  deleteButtonStyles: CustomButtonStyles;
  dealEditButtonStyles: CustomButtonStyles;
  dealUnlinkButtonStyles: CustomButtonStyles;
  dealLinkButtonStyles: CustomButtonStyles;
}

// ── Constants ──

const IMAGE_UPLOAD_HEIGHT = 200;

/**
 * Custom hook that provides styles for the ActivitiesActivityId (Edit Activity) component
 */
export function useActivitiesActivityIdStyles(): ActivitiesActivityIdStyles {
  const {
    createAppPageStyles,
    colors,
    typographyPresets,
    buttonPresets,
    spacingPresets,
    borderRadiusPresets,
    overrideStyles,
    textInputPresets,
  } = useStyleContext();

  // ── Base styles ──

  const styles: ActivitiesActivityIdBaseStyles = {
    safeArea: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    scrollContent: {
      paddingHorizontal: spacingPresets.md2,
      paddingBottom: spacingPresets.xxxl,
      gap: spacingPresets.lg1,
    },
    bottomBar: {
      flexDirection: 'row',
      paddingHorizontal: spacingPresets.md2,
      paddingVertical: spacingPresets.md1,
      gap: spacingPresets.md1,
      borderTopWidth: 1,
      borderTopColor: colors.secondaryBackground,
      backgroundColor: colors.primaryBackground,
    },
    fieldLabel: {
      ...typographyPresets.Label,
      color: colors.primaryForeground,
      fontWeight: '700',
      marginBottom: spacingPresets.sm,
    },
    fieldSpacing: {
      marginBottom: spacingPresets.md2,
    },
    metricsRow: {
      flexDirection: 'row',
      gap: spacingPresets.sm,
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
      ...typographyPresets.Title,
      color: colors.primaryForeground,
      fontWeight: '900',
      letterSpacing: -0.3,
    },
  });

  // ── Image Upload ──

  const imageUploadStyles: ImageUploadStyles = {
    container: {
      borderRadius: borderRadiusPresets.components,
      overflow: 'hidden',
    },
    placeholder: {
      height: IMAGE_UPLOAD_HEIGHT,
      backgroundColor: colors.secondaryBackground,
      borderRadius: borderRadiusPresets.components,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.tertiaryBackground,
      borderStyle: 'dashed',
    },
    placeholderIconWrapper: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255, 92, 77, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacingPresets.sm,
    },
    placeholderIconColor: colors.primaryAccent,
    placeholderText: {
      ...typographyPresets.Label,
      color: colors.primaryForeground,
      fontWeight: '700',
    },
    placeholderSubtext: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
      marginTop: spacingPresets.xxs,
      fontSize: 12,
      lineHeight: 16,
    },
    uploadedImage: {
      width: '100%',
      height: IMAGE_UPLOAD_HEIGHT,
      borderRadius: borderRadiusPresets.components,
    },
    errorBorder: {
      borderColor: colors.customColors.error,
      borderWidth: 2,
      borderStyle: 'solid',
    },
  };

  // ── Title Input ──

  const titleInputStyles = overrideStyles(textInputPresets.DefaultInput, {
    container: {
      backgroundColor: colors.secondaryBackground,
      borderWidth: 1,
      borderColor: colors.tertiaryBackground,
      borderRadius: borderRadiusPresets.inputElements,
      paddingHorizontal: spacingPresets.md2,
      height: 52,
    },
    focused: {
      borderColor: colors.primaryAccent,
    },
    error: {
      borderColor: colors.customColors.error,
    },
    input: {
      ...typographyPresets.Body,
      color: colors.primaryForeground,
      fontWeight: '600',
    },
    placeholderTextColor: colors.secondaryForeground,
  });

  // ── Category Chips ──

  const categoryChipStyles: CategoryChipStyles = {
    scrollContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacingPresets.sm,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacingPresets.md1,
      paddingVertical: spacingPresets.sm,
      borderRadius: 20,
      backgroundColor: colors.secondaryBackground,
      borderWidth: 1.5,
      borderColor: 'transparent',
      gap: spacingPresets.xs,
    },
    chipActive: {
      backgroundColor: 'rgba(255, 92, 77, 0.15)',
      borderColor: colors.primaryAccent,
    },
    chipText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.secondaryForeground,
      fontWeight: '600',
      fontSize: 13,
      lineHeight: 18,
    },
    chipTextActive: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.primaryAccent,
      fontWeight: '700',
      fontSize: 13,
      lineHeight: 18,
    },
    errorText: {
      ...typographyPresets.Caption,
      color: colors.customColors.error,
      fontSize: 12,
      lineHeight: 16,
      marginTop: spacingPresets.xs,
    },
  };

  // ── Description Input ──

  const descriptionInputStyles = overrideStyles(textInputPresets.MultilineInput, {
    container: {
      backgroundColor: colors.secondaryBackground,
      borderWidth: 1,
      borderColor: colors.tertiaryBackground,
      borderRadius: borderRadiusPresets.inputElements,
      paddingHorizontal: spacingPresets.md2,
      paddingVertical: spacingPresets.md1,
      minHeight: 120,
    },
    focused: {
      borderColor: colors.primaryAccent,
    },
    error: {
      borderColor: colors.customColors.error,
    },
    input: {
      ...typographyPresets.Body,
      color: colors.primaryForeground,
      textAlignVertical: 'top',
    },
    placeholderTextColor: colors.secondaryForeground,
  });

  // ── Char Count ──

  const charCountStyles: CharCountStyles = {
    container: {
      alignItems: 'flex-end',
      marginTop: spacingPresets.xxs,
    },
    text: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.secondaryForeground,
      fontSize: 11,
      lineHeight: 16,
    },
    textNearLimit: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.customColors.warning,
      fontSize: 11,
      lineHeight: 16,
    },
  };

  // ── Price Chips ──

  const priceChipStyles: PriceChipStyles = {
    container: {
      flexDirection: 'row',
      gap: spacingPresets.sm,
    },
    chip: {
      paddingHorizontal: spacingPresets.md2,
      paddingVertical: spacingPresets.sm,
      borderRadius: 20,
      backgroundColor: colors.secondaryBackground,
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    chipActive: {
      backgroundColor: 'rgba(207, 255, 71, 0.15)',
      borderColor: colors.customColors.voltGreen,
    },
    chipText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.secondaryForeground,
      fontWeight: '700',
      fontSize: 14,
      lineHeight: 20,
    },
    chipTextActive: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.customColors.voltGreen,
      fontWeight: '800',
      fontSize: 14,
      lineHeight: 20,
    },
  };

  // ── Operating Hours Input ──

  const operatingHoursInputStyles = overrideStyles(textInputPresets.DefaultInput, {
    container: {
      backgroundColor: colors.secondaryBackground,
      borderWidth: 1,
      borderColor: colors.tertiaryBackground,
      borderRadius: borderRadiusPresets.inputElements,
      paddingHorizontal: spacingPresets.md2,
      height: 48,
    },
    focused: {
      borderColor: colors.primaryAccent,
    },
    input: {
      ...typographyPresets.Body,
      color: colors.primaryForeground,
    },
    placeholderTextColor: colors.secondaryForeground,
  });

  // ── Tag Chips ──

  const tagChipStyles: TagChipStyles = {
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacingPresets.sm,
    },
    chip: {
      paddingHorizontal: spacingPresets.md1,
      paddingVertical: spacingPresets.sm,
      borderRadius: 20,
      backgroundColor: colors.secondaryBackground,
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    chipActive: {
      backgroundColor: 'rgba(255, 92, 77, 0.12)',
      borderColor: colors.primaryAccent,
    },
    chipText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.secondaryForeground,
      fontWeight: '600',
      fontSize: 13,
      lineHeight: 18,
    },
    chipTextActive: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.primaryAccent,
      fontWeight: '700',
      fontSize: 13,
      lineHeight: 18,
    },
  };

  // ── Section ──

  const sectionStyles: SectionStyles = {
    container: {
      backgroundColor: colors.secondaryBackground,
      borderRadius: borderRadiusPresets.components,
      padding: spacingPresets.md2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 3,
    },
    header: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
      fontWeight: '800',
      letterSpacing: 1.2,
      fontSize: 11,
      lineHeight: 16,
      marginBottom: spacingPresets.md2,
    },
  };

  // ── Validation Error ──

  const validationErrorStyles: ValidationErrorStyles = {
    text: {
      ...typographyPresets.Caption,
      color: colors.customColors.error,
      fontSize: 12,
      lineHeight: 16,
      marginTop: spacingPresets.xs,
    },
  };

  // ── Metric Card ──

  const metricCardStyles: MetricCardStyles = {
    container: {
      flex: 1,
      backgroundColor: colors.secondaryBackground,
      borderRadius: borderRadiusPresets.components,
      padding: spacingPresets.md1,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    valueText: {
      ...typographyPresets.Title,
      color: colors.primaryForeground,
      fontWeight: '900',
      fontSize: 20,
      lineHeight: 26,
    },
    labelText: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
      fontWeight: '600',
      fontSize: 11,
      lineHeight: 16,
      marginTop: spacingPresets.xxs,
    },
    trendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      marginTop: spacingPresets.xxs,
    },
    trendIconWrapper: {
      width: 12,
      height: 12,
    },
    trendUpText: {
      ...typographyPresets.Caption,
      color: colors.customColors.success,
      fontWeight: '800',
      fontSize: 11,
      lineHeight: 16,
    },
    trendDownText: {
      ...typographyPresets.Caption,
      color: colors.customColors.error,
      fontWeight: '800',
      fontSize: 11,
      lineHeight: 16,
    },
  };

  // ── Deal Section ──

  const dealSectionStyles: DealSectionStyles = {
    container: {
      gap: spacingPresets.md1,
    },
    dealCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'rgba(207, 255, 71, 0.08)',
      borderRadius: borderRadiusPresets.inputElements,
      borderWidth: 1.5,
      borderColor: colors.customColors.voltGreen,
      paddingHorizontal: spacingPresets.md2,
      paddingVertical: spacingPresets.md1,
    },
    dealHeadlineWrapper: {
      flex: 1,
    },
    dealHeadline: {
      ...typographyPresets.Body,
      color: colors.primaryForeground,
      fontWeight: '700',
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
    },
    dealType: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
      fontSize: 11,
      lineHeight: 16,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: spacingPresets.sm,
    },
    noDealText: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
      fontSize: 13,
      lineHeight: 18,
    },
    dealPickerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacingPresets.md2,
      paddingVertical: spacingPresets.md1,
      borderRadius: borderRadiusPresets.inputElements,
      backgroundColor: colors.tertiaryBackground,
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    dealPickerItemActive: {
      borderColor: colors.customColors.voltGreen,
      backgroundColor: 'rgba(207, 255, 71, 0.08)',
    },
    dealPickerText: {
      ...typographyPresets.Body,
      color: colors.primaryForeground,
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
    },
    dealPickerTextActive: {
      ...typographyPresets.Body,
      color: colors.primaryForeground,
      fontWeight: '700',
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
    },
    linkedBadge: {
      backgroundColor: 'rgba(207, 255, 71, 0.2)',
      paddingHorizontal: spacingPresets.sm,
      paddingVertical: spacingPresets.xxs,
      borderRadius: 6,
    },
    linkedBadgeText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '800',
      color: colors.customColors.voltGreen,
      letterSpacing: 0.5,
    },
  };

  // ── Boost Status ──

  const boostStatusStyles: BoostStatusStyles = {
    container: {
      gap: spacingPresets.md1,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    statusBadge: {
      paddingHorizontal: spacingPresets.sm,
      paddingVertical: spacingPresets.xxs,
      borderRadius: 6,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    statusBadgeActive: {
      backgroundColor: 'rgba(207, 255, 71, 0.2)',
    },
    statusBadgeText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '900',
      color: colors.secondaryForeground,
      letterSpacing: 0.8,
    },
    statusBadgeTextActive: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '900',
      color: colors.customColors.voltGreen,
      letterSpacing: 0.8,
    },
    tierText: {
      ...typographyPresets.Label,
      color: colors.primaryForeground,
      fontWeight: '700',
    },
    budgetRow: {
      gap: spacingPresets.xs,
    },
    budgetText: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
      fontSize: 12,
      lineHeight: 16,
      marginBottom: spacingPresets.xs,
    },
    budgetBarTrack: {
      height: 6,
      borderRadius: 3,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    budgetBarFill: {
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.customColors.voltGreen,
    },
    impressionsText: {
      ...typographyPresets.Caption,
      color: colors.customColors.voltGreen,
      fontWeight: '700',
      fontSize: 12,
      lineHeight: 16,
    },
  };

  // ── Pause Toggle ──

  const pauseToggleStyles: PauseToggleStyles = {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    labelRow: {
      flex: 1,
      marginRight: spacingPresets.md2,
    },
    labelText: {
      ...typographyPresets.Body,
      color: colors.primaryForeground,
      fontWeight: '700',
      fontSize: 15,
      lineHeight: 20,
    },
    hintText: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
      fontSize: 12,
      lineHeight: 16,
      marginTop: spacingPresets.xxs,
    },
    statusBadge: {
      paddingHorizontal: spacingPresets.sm,
      paddingVertical: spacingPresets.xxs,
      borderRadius: 6,
      backgroundColor: 'rgba(207, 255, 71, 0.15)',
      marginRight: spacingPresets.md1,
    },
    statusBadgeActive: {
      backgroundColor: 'rgba(255, 152, 0, 0.15)',
    },
    statusText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '800',
      color: colors.customColors.voltGreen,
      letterSpacing: 0.5,
    },
    statusTextActive: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '800',
      color: colors.customColors.warning,
      letterSpacing: 0.5,
    },
  };

  // ── Switch ──

  const switchStyles: CustomSwitchStyles = {
    switchTrackColor: {
      false: colors.tertiaryBackground,
      true: colors.customColors.warning,
    },
    switchThumbColor: '#FFFFFF',
    switchIosBackgroundColor: colors.tertiaryBackground,
  };

  // ── Buttons ──

  const saveButtonStyles = overrideStyles(buttonPresets.Primary, {
    container: {
      flex: 1,
      backgroundColor: colors.customColors.voltGreen,
      borderRadius: borderRadiusPresets.inputElements,
      paddingVertical: spacingPresets.md1,
      shadowColor: colors.customColors.voltGreen,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 4,
    },
    disabledContainer: {
      opacity: 0.5,
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

  const deleteButtonStyles = overrideStyles(buttonPresets.Tertiary, {
    container: {
      paddingVertical: spacingPresets.md1,
      alignItems: 'center',
    },
    text: {
      ...typographyPresets.Body,
      color: colors.customColors.error,
      fontWeight: '700',
      fontSize: 14,
      lineHeight: 20,
    },
    icon: {
      color: colors.customColors.error,
      size: 18,
    },
  });

  const dealEditButtonStyles = overrideStyles(buttonPresets.Secondary, {
    container: {
      paddingVertical: spacingPresets.xs,
      paddingHorizontal: spacingPresets.md1,
      borderColor: colors.primaryAccent,
      borderWidth: 1.5,
      borderRadius: 8,
      backgroundColor: 'transparent',
    },
    text: {
      ...typographyPresets.Caption,
      color: colors.primaryAccent,
      fontWeight: '700',
      fontSize: 12,
      lineHeight: 16,
    },
  });

  const dealUnlinkButtonStyles = overrideStyles(buttonPresets.Tertiary, {
    container: {
      paddingVertical: spacingPresets.xs,
      paddingHorizontal: spacingPresets.md1,
    },
    text: {
      ...typographyPresets.Caption,
      color: colors.customColors.error,
      fontWeight: '700',
      fontSize: 12,
      lineHeight: 16,
    },
  });

  const dealLinkButtonStyles = overrideStyles(buttonPresets.Secondary, {
    container: {
      borderColor: colors.customColors.voltGreen,
      borderWidth: 1.5,
      borderRadius: borderRadiusPresets.inputElements,
      paddingVertical: spacingPresets.sm,
      paddingHorizontal: spacingPresets.md2,
      backgroundColor: 'transparent',
    },
    text: {
      ...typographyPresets.Caption,
      color: colors.customColors.voltGreen,
      fontWeight: '700',
      fontSize: 13,
      lineHeight: 18,
    },
    icon: {
      color: colors.customColors.voltGreen,
      size: 16,
    },
  });

  return createAppPageStyles<ActivitiesActivityIdStyles>({
    styles,
    headerStyles,
    imageUploadStyles,
    titleInputStyles,
    categoryChipStyles,
    descriptionInputStyles,
    charCountStyles,
    priceChipStyles,
    operatingHoursInputStyles,
    tagChipStyles,
    sectionStyles,
    validationErrorStyles,
    metricCardStyles,
    dealSectionStyles,
    boostStatusStyles,
    pauseToggleStyles,
    switchStyles,
    saveButtonStyles,
    deleteButtonStyles,
    dealEditButtonStyles,
    dealUnlinkButtonStyles,
    dealLinkButtonStyles,
  });
}

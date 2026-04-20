/**
 * Styling for the Create Deal page
 */
import { ViewStyle, TextStyle } from 'react-native';

import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';
import { CustomHeaderStyles, useCustomHeaderStyles } from '@/comp-lib/custom-header/CustomHeaderStyles';
import { CustomTextInputStyles } from '@/comp-lib/core/custom-text-input/CustomTextInputStyles';

// ── Sub-component style interfaces ──

export interface DealTypeChipStyles {
  container: ViewStyle;
  chip: ViewStyle;
  chipActive: ViewStyle;
  chipIcon: TextStyle;
  chipIconActive: TextStyle;
  chipText: TextStyle;
  chipTextActive: TextStyle;
  errorText: TextStyle;
}

export interface DayChipStyles {
  container: ViewStyle;
  chip: ViewStyle;
  chipActive: ViewStyle;
  chipText: TextStyle;
  chipTextActive: TextStyle;
}

export interface ActivityLinkStyles {
  container: ViewStyle;
  item: ViewStyle;
  itemActive: ViewStyle;
  itemContent: ViewStyle;
  itemTitle: TextStyle;
  itemTitleActive: TextStyle;
  itemCategory: TextStyle;
  checkIcon: ViewStyle;
  checkIconColor: string;
  hintText: TextStyle;
  errorText: TextStyle;
  linkedCountText: TextStyle;
}

export interface PreviewModalStyles {
  overlay: ViewStyle;
  card: ViewStyle;
  cardHeader: ViewStyle;
  cardBadge: ViewStyle;
  cardBadgeText: TextStyle;
  cardHeadline: TextStyle;
  cardDivider: ViewStyle;
  cardRow: ViewStyle;
  cardLabel: TextStyle;
  cardValue: TextStyle;
  cardTerms: TextStyle;
  cardTermsLabel: TextStyle;
  cardChipRow: ViewStyle;
  cardChip: ViewStyle;
  cardChipText: TextStyle;
}

export interface SectionStyles {
  container: ViewStyle;
  header: TextStyle;
}

export interface CharCountStyles {
  container: ViewStyle;
  text: TextStyle;
  textNearLimit: TextStyle;
}

export interface ValidationErrorStyles {
  text: TextStyle;
}

export interface DateRowStyles {
  container: ViewStyle;
  field: ViewStyle;
}

export interface RequirementRowStyles {
  container: ViewStyle;
  field: ViewStyle;
}

/**
 * Interface for base styles of the useCreateStyles hook
 */
export interface CreateBaseStyles {
  safeArea: ViewStyle;
  scrollContent: ViewStyle;
  bottomBar: ViewStyle;
  fieldLabel: TextStyle;
}

/**
 * Interface for the return value of the useCreateStyles hook
 */
export interface CreateStyles {
  styles: CreateBaseStyles;
  headerStyles: CustomHeaderStyles;
  headlineInputStyles: CustomTextInputStyles;
  dealTypeChipStyles: DealTypeChipStyles;
  valueInputStyles: CustomTextInputStyles;
  termsInputStyles: CustomTextInputStyles;
  charCountStyles: CharCountStyles;
  groupSizeInputStyles: CustomTextInputStyles;
  spendAmountInputStyles: CustomTextInputStyles;
  dateInputStyles: CustomTextInputStyles;
  timeInputStyles: CustomTextInputStyles;
  dayChipStyles: DayChipStyles;
  limitInputStyles: CustomTextInputStyles;
  activityLinkStyles: ActivityLinkStyles;
  sectionStyles: SectionStyles;
  validationErrorStyles: ValidationErrorStyles;
  dateRowStyles: DateRowStyles;
  requirementRowStyles: RequirementRowStyles;
  previewModalStyles: PreviewModalStyles;
  previewButtonStyles: CustomButtonStyles;
  submitButtonStyles: CustomButtonStyles;
  closePreviewButtonStyles: CustomButtonStyles;
}

/**
 * Custom hook that provides styles for the Create Deal component
 */
export function useCreateStyles(): CreateStyles {
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

  const styles: CreateBaseStyles = {
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

  // ── Headline Input ──

  const headlineInputStyles = overrideStyles(textInputPresets.DefaultInput, {
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

  // ── Deal Type Chips ──

  const dealTypeChipStyles: DealTypeChipStyles = {
    container: {
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
    chipIcon: {
      fontSize: 16,
      lineHeight: 22,
    },
    chipIconActive: {
      fontSize: 16,
      lineHeight: 22,
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

  // ── Value Input ──

  const valueInputStyles = overrideStyles(textInputPresets.DefaultInput, {
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
    error: {
      borderColor: colors.customColors.error,
    },
    input: {
      ...typographyPresets.Body,
      color: colors.primaryForeground,
    },
    placeholderTextColor: colors.secondaryForeground,
  });

  // ── Terms Input ──

  const termsInputStyles = overrideStyles(textInputPresets.MultilineInput, {
    container: {
      backgroundColor: colors.secondaryBackground,
      borderWidth: 1,
      borderColor: colors.tertiaryBackground,
      borderRadius: borderRadiusPresets.inputElements,
      paddingHorizontal: spacingPresets.md2,
      paddingVertical: spacingPresets.md1,
      minHeight: 100,
    },
    focused: {
      borderColor: colors.primaryAccent,
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

  // ── Group Size / Spend Amount Inputs ──

  const smallInputStyles = overrideStyles(textInputPresets.DefaultInput, {
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

  const groupSizeInputStyles = smallInputStyles;
  const spendAmountInputStyles = smallInputStyles;

  // ── Date Input ──

  const dateInputStyles = overrideStyles(textInputPresets.DefaultInput, {
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
    error: {
      borderColor: colors.customColors.error,
    },
    input: {
      ...typographyPresets.Body,
      color: colors.primaryForeground,
    },
    placeholderTextColor: colors.secondaryForeground,
  });

  // ── Time Input ──

  const timeInputStyles = overrideStyles(textInputPresets.DefaultInput, {
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

  // ── Day Chips ──

  const dayChipStyles: DayChipStyles = {
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacingPresets.sm,
    },
    chip: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.secondaryBackground,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    chipActive: {
      backgroundColor: 'rgba(255, 92, 77, 0.15)',
      borderColor: colors.primaryAccent,
    },
    chipText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.secondaryForeground,
      fontWeight: '700',
      fontSize: 11,
      lineHeight: 16,
    },
    chipTextActive: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.primaryAccent,
      fontWeight: '800',
      fontSize: 11,
      lineHeight: 16,
    },
  };

  // ── Limit Input ──

  const limitInputStyles = smallInputStyles;

  // ── Activity Link ──

  const activityLinkStyles: ActivityLinkStyles = {
    container: {
      gap: spacingPresets.sm,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacingPresets.md2,
      paddingVertical: spacingPresets.md1,
      borderRadius: borderRadiusPresets.inputElements,
      backgroundColor: colors.secondaryBackground,
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    itemActive: {
      borderColor: colors.customColors.voltGreen,
      backgroundColor: 'rgba(207, 255, 71, 0.08)',
    },
    itemContent: {
      flex: 1,
    },
    itemTitle: {
      ...typographyPresets.Body,
      color: colors.primaryForeground,
      fontWeight: '600',
      fontSize: 14,
      lineHeight: 20,
    },
    itemTitleActive: {
      ...typographyPresets.Body,
      color: colors.primaryForeground,
      fontWeight: '700',
      fontSize: 14,
      lineHeight: 20,
    },
    itemCategory: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.secondaryForeground,
      fontSize: 12,
      lineHeight: 16,
      marginTop: spacingPresets.xxs,
    },
    checkIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.customColors.voltGreen,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkIconColor: colors.customColors.inkBlack,
    hintText: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
      fontSize: 12,
      lineHeight: 16,
      marginBottom: spacingPresets.sm,
    },
    errorText: {
      ...typographyPresets.Caption,
      color: colors.customColors.error,
      fontSize: 12,
      lineHeight: 16,
      marginTop: spacingPresets.xs,
    },
    linkedCountText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.customColors.voltGreen,
      fontWeight: '700',
      fontSize: 12,
      lineHeight: 16,
      marginTop: spacingPresets.xs,
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

  // ── Date Row ──

  const dateRowStyles: DateRowStyles = {
    container: {
      flexDirection: 'row',
      gap: spacingPresets.md1,
    },
    field: {
      flex: 1,
    },
  };

  // ── Requirement Row ──

  const requirementRowStyles: RequirementRowStyles = {
    container: {
      flexDirection: 'row',
      gap: spacingPresets.md1,
    },
    field: {
      flex: 1,
    },
  };

  // ── Preview Modal ──

  const previewModalStyles: PreviewModalStyles = {
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacingPresets.lg1,
    },
    card: {
      width: '100%',
      borderRadius: borderRadiusPresets.components,
      backgroundColor: colors.secondaryBackground,
      overflow: 'hidden',
      shadowColor: colors.primaryAccent,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
      padding: spacingPresets.lg1,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacingPresets.md2,
    },
    cardBadge: {
      backgroundColor: colors.primaryAccent,
      paddingHorizontal: spacingPresets.sm,
      paddingVertical: spacingPresets.xxs,
      borderRadius: 6,
    },
    cardBadgeText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '900',
      color: '#FFFFFF',
      letterSpacing: 0.8,
    },
    cardHeadline: {
      ...typographyPresets.Title,
      color: colors.primaryForeground,
      fontWeight: '900',
      flex: 1,
      marginRight: spacingPresets.sm,
    },
    cardDivider: {
      height: 1,
      backgroundColor: colors.tertiaryBackground,
      marginVertical: spacingPresets.md1,
    },
    cardRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacingPresets.xs,
    },
    cardLabel: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
      fontWeight: '600',
      fontSize: 12,
      lineHeight: 16,
    },
    cardValue: {
      ...typographyPresets.Body,
      color: colors.primaryForeground,
      fontWeight: '700',
      fontSize: 14,
      lineHeight: 20,
    },
    cardTerms: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
      fontSize: 12,
      lineHeight: 18,
      marginTop: spacingPresets.xs,
    },
    cardTermsLabel: {
      ...typographyPresets.Caption,
      color: colors.primaryAccent,
      fontWeight: '700',
      fontSize: 11,
      lineHeight: 16,
    },
    cardChipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacingPresets.xs,
      marginTop: spacingPresets.sm,
    },
    cardChip: {
      backgroundColor: 'rgba(207, 255, 71, 0.15)',
      paddingHorizontal: spacingPresets.sm,
      paddingVertical: spacingPresets.xxs,
      borderRadius: 6,
    },
    cardChipText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '700',
      color: colors.customColors.voltGreen,
    },
  };

  // ── Buttons ──

  const previewButtonStyles = overrideStyles(buttonPresets.Secondary, {
    container: {
      flex: 1,
      borderColor: colors.secondaryForeground,
      borderWidth: 1.5,
      borderRadius: borderRadiusPresets.inputElements,
      paddingVertical: spacingPresets.md1,
      backgroundColor: 'transparent',
    },
    text: {
      ...typographyPresets.Button,
      color: colors.primaryForeground,
      fontWeight: '700',
    },
    icon: {
      color: colors.primaryForeground,
      size: 18,
    },
  });

  const submitButtonStyles = overrideStyles(buttonPresets.Primary, {
    container: {
      flex: 2,
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

  const closePreviewButtonStyles = overrideStyles(buttonPresets.Secondary, {
    container: {
      marginTop: spacingPresets.md2,
      borderColor: '#FFFFFF',
      borderWidth: 1.5,
      borderRadius: borderRadiusPresets.inputElements,
      paddingVertical: spacingPresets.md1,
      paddingHorizontal: spacingPresets.lg2,
      backgroundColor: 'transparent',
    },
    text: {
      ...typographyPresets.Button,
      color: '#FFFFFF',
      fontWeight: '700',
    },
  });

  return createAppPageStyles<CreateStyles>({
    styles,
    headerStyles,
    headlineInputStyles,
    dealTypeChipStyles,
    valueInputStyles,
    termsInputStyles,
    charCountStyles,
    groupSizeInputStyles,
    spendAmountInputStyles,
    dateInputStyles,
    timeInputStyles,
    dayChipStyles,
    limitInputStyles,
    activityLinkStyles,
    sectionStyles,
    validationErrorStyles,
    dateRowStyles,
    requirementRowStyles,
    previewModalStyles,
    previewButtonStyles,
    submitButtonStyles,
    closePreviewButtonStyles,
  });
}

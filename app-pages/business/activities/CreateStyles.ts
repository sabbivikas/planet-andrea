/**
 * Styling for the Create Activity page
 */
import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';
import { CustomHeaderStyles, useCustomHeaderStyles } from '@/comp-lib/custom-header/CustomHeaderStyles';
import { CustomTextInputStyles } from '@/comp-lib/core/custom-text-input/CustomTextInputStyles';

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

export interface DealLinkStyles {
  container: ViewStyle;
  dealItem: ViewStyle;
  dealItemActive: ViewStyle;
  dealText: TextStyle;
  dealTextActive: TextStyle;
  linkedBadge: ViewStyle;
  linkedBadgeText: TextStyle;
  noDealText: TextStyle;
}

export interface BoostSectionStyles {
  container: ViewStyle;
  tierRow: ViewStyle;
  tierChip: ViewStyle;
  tierChipActive: ViewStyle;
  tierChipText: TextStyle;
  tierChipTextActive: TextStyle;
  sliderContainer: ViewStyle;
  sliderLabel: TextStyle;
  sliderValue: TextStyle;
  estimateText: TextStyle;
}

export interface PreviewModalStyles {
  overlay: ViewStyle;
  card: ViewStyle;
  cardImage: ImageStyle;
  cardOverlay: ViewStyle;
  cardCategoryBadge: ViewStyle;
  cardCategoryText: TextStyle;
  cardTitle: TextStyle;
  cardDescription: TextStyle;
  cardFooter: ViewStyle;
  cardPriceText: TextStyle;
  cardTagsRow: ViewStyle;
  cardTag: ViewStyle;
  cardTagText: TextStyle;
  dealBadge: ViewStyle;
  dealBadgeText: TextStyle;
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

/**
 * Interface for base styles of the useCreateStyles hook
 */
export interface CreateBaseStyles {
  safeArea: ViewStyle;
  scrollContent: ViewStyle;
  bottomBar: ViewStyle;
  sectionLabel: TextStyle;
  fieldLabel: TextStyle;
}

/**
 * Interface for the return value of the useCreateStyles hook
 */
export interface CreateStyles {
  styles: CreateBaseStyles;
  headerStyles: CustomHeaderStyles;
  imageUploadStyles: ImageUploadStyles;
  titleInputStyles: CustomTextInputStyles;
  categoryChipStyles: CategoryChipStyles;
  descriptionInputStyles: CustomTextInputStyles;
  charCountStyles: CharCountStyles;
  priceChipStyles: PriceChipStyles;
  operatingHoursInputStyles: CustomTextInputStyles;
  tagChipStyles: TagChipStyles;
  dealLinkStyles: DealLinkStyles;
  boostSectionStyles: BoostSectionStyles;
  sectionStyles: SectionStyles;
  validationErrorStyles: ValidationErrorStyles;
  previewModalStyles: PreviewModalStyles;
  previewButtonStyles: CustomButtonStyles;
  submitButtonStyles: CustomButtonStyles;
  closePreviewButtonStyles: CustomButtonStyles;
  boostToggleButtonStyles: CustomButtonStyles;
  unlinkDealButtonStyles: CustomButtonStyles;
}

// ── Constants ──

const IMAGE_UPLOAD_HEIGHT = 200;
const PREVIEW_CARD_IMAGE_HEIGHT = 220;
const CATEGORY_CHIP_ICON_SIZE = 18;

/**
 * Custom hook that provides styles for the Create Activity component
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
    sectionLabel: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
      fontWeight: '800',
      letterSpacing: 1.2,
      fontSize: 11,
      lineHeight: 16,
      marginBottom: spacingPresets.md1,
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

  // ── Deal Link ──

  const dealLinkStyles: DealLinkStyles = {
    container: {
      gap: spacingPresets.sm,
    },
    dealItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacingPresets.md2,
      paddingVertical: spacingPresets.md1,
      borderRadius: borderRadiusPresets.inputElements,
      backgroundColor: colors.secondaryBackground,
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    dealItemActive: {
      borderColor: colors.customColors.voltGreen,
      backgroundColor: 'rgba(207, 255, 71, 0.08)',
    },
    dealText: {
      ...typographyPresets.Body,
      color: colors.primaryForeground,
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
    },
    dealTextActive: {
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
    noDealText: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
      fontSize: 13,
      lineHeight: 18,
    },
  };

  // ── Boost Section ──

  const boostSectionStyles: BoostSectionStyles = {
    container: {
      gap: spacingPresets.md1,
    },
    tierRow: {
      flexDirection: 'row',
      gap: spacingPresets.sm,
    },
    tierChip: {
      flex: 1,
      paddingVertical: spacingPresets.md1,
      borderRadius: borderRadiusPresets.inputElements,
      backgroundColor: colors.secondaryBackground,
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    tierChipActive: {
      borderColor: colors.primaryAccent,
      backgroundColor: 'rgba(255, 92, 77, 0.12)',
    },
    tierChipText: {
      ...typographyPresets.Label,
      color: colors.secondaryForeground,
      fontWeight: '700',
    },
    tierChipTextActive: {
      ...typographyPresets.Label,
      color: colors.primaryAccent,
      fontWeight: '800',
    },
    sliderContainer: {
      marginTop: spacingPresets.sm,
    },
    sliderLabel: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
      fontWeight: '600',
      fontSize: 12,
      lineHeight: 16,
    },
    sliderValue: {
      ...typographyPresets.Title,
      color: colors.primaryForeground,
      fontWeight: '900',
      textAlign: 'center',
      marginBottom: spacingPresets.sm,
    },
    estimateText: {
      ...typographyPresets.Caption,
      color: colors.customColors.voltGreen,
      fontWeight: '700',
      textAlign: 'center',
      marginTop: spacingPresets.sm,
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
    },
    cardImage: {
      width: '100%',
      height: PREVIEW_CARD_IMAGE_HEIGHT,
    },
    cardOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: PREVIEW_CARD_IMAGE_HEIGHT,
      justifyContent: 'flex-end',
      padding: spacingPresets.md2,
    },
    cardCategoryBadge: {
      position: 'absolute',
      top: spacingPresets.md1,
      left: spacingPresets.md1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingHorizontal: spacingPresets.sm,
      paddingVertical: spacingPresets.xxs,
      borderRadius: 6,
    },
    cardCategoryText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.5,
    },
    cardTitle: {
      ...typographyPresets.Title,
      color: '#FFFFFF',
      fontWeight: '900',
      textShadowColor: 'rgba(0, 0, 0, 0.6)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    cardDescription: {
      ...typographyPresets.Body,
      color: colors.primaryForeground,
      padding: spacingPresets.md2,
      fontSize: 14,
      lineHeight: 20,
    },
    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacingPresets.md2,
      paddingBottom: spacingPresets.md2,
      gap: spacingPresets.sm,
    },
    cardPriceText: {
      ...typographyPresets.Label,
      color: colors.customColors.voltGreen,
      fontWeight: '800',
    },
    cardTagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacingPresets.xs,
      flex: 1,
    },
    cardTag: {
      backgroundColor: 'rgba(255, 92, 77, 0.12)',
      paddingHorizontal: spacingPresets.sm,
      paddingVertical: spacingPresets.xxs,
      borderRadius: 6,
    },
    cardTagText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '700',
      color: colors.primaryAccent,
    },
    dealBadge: {
      backgroundColor: colors.primaryAccent,
      paddingHorizontal: spacingPresets.sm,
      paddingVertical: spacingPresets.xxs,
      borderRadius: 6,
      position: 'absolute',
      top: spacingPresets.md1,
      right: spacingPresets.md1,
    },
    dealBadgeText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '900',
      color: '#FFFFFF',
      letterSpacing: 0.8,
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

  const boostToggleButtonStyles = overrideStyles(buttonPresets.Secondary, {
    container: {
      borderColor: colors.primaryAccent,
      borderWidth: 1.5,
      borderRadius: borderRadiusPresets.inputElements,
      paddingVertical: spacingPresets.sm,
      paddingHorizontal: spacingPresets.md2,
      backgroundColor: 'transparent',
    },
    text: {
      ...typographyPresets.Caption,
      color: colors.primaryAccent,
      fontWeight: '700',
      fontSize: 13,
      lineHeight: 18,
    },
    icon: {
      color: colors.primaryAccent,
      size: 16,
    },
  });

  const unlinkDealButtonStyles = overrideStyles(buttonPresets.Tertiary, {
    container: {
      paddingVertical: spacingPresets.xs,
      paddingHorizontal: spacingPresets.sm,
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

  return createAppPageStyles<CreateStyles>({
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
    dealLinkStyles,
    boostSectionStyles,
    sectionStyles,
    validationErrorStyles,
    previewModalStyles,
    previewButtonStyles,
    submitButtonStyles,
    closePreviewButtonStyles,
    boostToggleButtonStyles,
    unlinkDealButtonStyles,
  });
}

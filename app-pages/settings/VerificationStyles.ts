/**
 * Styling for the Verification page
 */
import { ImageStyle, ViewStyle, TextStyle } from 'react-native';

import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';
import { CustomHeaderStyles, useCustomHeaderStyles } from '@/comp-lib/custom-header/CustomHeaderStyles';

// ── Constants ──

const STEP_CIRCLE_SIZE = 36;
const STEP_LINE_HEIGHT = 3;
const UPLOAD_PREVIEW_SIZE = 180;
const BADGE_SIZE = 80;

// ── Sub-component style interfaces ──

export interface StepIndicatorStyles {
  container: ViewStyle;
  stepRow: ViewStyle;
  stepItem: ViewStyle;
  stepCircle: ViewStyle;
  stepCircleActive: ViewStyle;
  stepCircleCompleted: ViewStyle;
  stepCircleIconColor: string;
  stepCircleActiveIconColor: string;
  stepCircleCompletedIconColor: string;
  stepLabel: TextStyle;
  stepLabelActive: TextStyle;
  stepLine: ViewStyle;
  stepLineCompleted: ViewStyle;
}

export interface InfoCardStyles {
  container: ViewStyle;
  title: TextStyle;
  description: TextStyle;
  requirementRow: ViewStyle;
  requirementIconContainer: ViewStyle;
  requirementIconColor: string;
  requirementText: TextStyle;
  privacyContainer: ViewStyle;
  privacyIconContainer: ViewStyle;
  privacyIconColor: string;
  privacyText: TextStyle;
}

export interface UploadAreaStyles {
  container: ViewStyle;
  previewContainer: ViewStyle;
  previewImage: ImageStyle;
  placeholderContainer: ViewStyle;
  placeholderIconColor: string;
  placeholderText: TextStyle;
  buttonRow: ViewStyle;
}

export interface StatusCardStyles {
  container: ViewStyle;
  iconContainer: ViewStyle;
  iconColor: string;
  title: TextStyle;
  description: TextStyle;
  etaContainer: ViewStyle;
  etaText: TextStyle;
}

export interface SuccessCardStyles {
  container: ViewStyle;
  badgeContainer: ViewStyle;
  badgeIconColor: string;
  title: TextStyle;
  description: TextStyle;
}

export interface FailureCardStyles {
  container: ViewStyle;
  iconContainer: ViewStyle;
  iconColor: string;
  title: TextStyle;
  description: TextStyle;
}

// ── Base styles ──

export interface VerificationBaseStyles {
  safeArea: ViewStyle;
  container: ViewStyle;
  scrollContent: ViewStyle;
  sectionContainer: ViewStyle;
  stepContentContainer: ViewStyle;
  stepTitle: TextStyle;
  stepHint: TextStyle;
  bottomSection: ViewStyle;
  loadingContainer: ViewStyle;
}

// ── Return type ──

export interface VerificationStyles {
  styles: VerificationBaseStyles;
  headerStyles: CustomHeaderStyles;
  stepIndicatorStyles: StepIndicatorStyles;
  infoCardStyles: InfoCardStyles;
  uploadAreaStyles: UploadAreaStyles;
  statusCardStyles: StatusCardStyles;
  successCardStyles: SuccessCardStyles;
  failureCardStyles: FailureCardStyles;
  primaryButtonStyles: CustomButtonStyles;
  secondaryButtonStyles: CustomButtonStyles;
  uploadButtonStyles: CustomButtonStyles;
}

/**
 * Custom hook that provides styles for the Verification component
 */
export function useVerificationStyles(): VerificationStyles {
  const {
    createAppPageStyles,
    colors,
    typographyPresets,
    buttonPresets,
    spacingPresets,
    borderRadiusPresets,
    overrideStyles,
  } = useStyleContext();

  const defaultHeaderStyles = useCustomHeaderStyles();

  const creamMuted = 'rgba(255, 245, 236, 0.45)';
  const creamSubtle = 'rgba(255, 245, 236, 0.06)';
  const creamDivider = 'rgba(255, 245, 236, 0.08)';
  const creamSoft = 'rgba(255, 245, 236, 0.7)';
  const coralSubtle = 'rgba(255, 92, 77, 0.12)';
  const voltGreenSubtle = 'rgba(207, 255, 71, 0.12)';

  // ── Base page styles ──

  const styles: VerificationBaseStyles = {
    safeArea: {
      flex: 1,
      backgroundColor: colors.customColors.deepNavy,
    },
    container: {
      flex: 1,
      backgroundColor: colors.customColors.deepNavy,
    },
    scrollContent: {
      paddingHorizontal: spacingPresets.md2,
      paddingBottom: spacingPresets.xl + spacingPresets.lg2,
    },
    sectionContainer: {
      marginTop: spacingPresets.lg1,
    },
    stepContentContainer: {
      marginTop: spacingPresets.lg1,
    },
    stepTitle: {
      ...typographyPresets.Title,
      color: colors.customColors.cream,
      fontWeight: '700',
      fontSize: 20,
      lineHeight: 26,
    },
    stepHint: {
      ...typographyPresets.Body,
      color: creamMuted,
      fontSize: 14,
      lineHeight: 20,
      marginTop: spacingPresets.xs,
    },
    bottomSection: {
      marginTop: spacingPresets.lg2,
      gap: spacingPresets.md1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  };

  // ── Header ──

  const headerStyles: CustomHeaderStyles = overrideStyles(defaultHeaderStyles, {
    container: {
      backgroundColor: 'transparent',
      paddingHorizontal: spacingPresets.md2,
      paddingTop: spacingPresets.sm,
    },
    mainContainer: {
      height: 48,
    },
    headerLeft: {
      minWidth: 44,
    },
    headerRight: {
      minWidth: 44,
    },
    title: {
      ...typographyPresets.Title,
      color: colors.customColors.cream,
      fontWeight: '800',
      fontSize: 20,
      lineHeight: 26,
    },
    backCustomButtonStyles: overrideStyles(defaultHeaderStyles.backCustomButtonStyles, {
      icon: {
        size: 24,
        color: colors.customColors.cream,
      },
    }),
  });

  // ── Step Indicator ──

  const stepIndicatorStyles: StepIndicatorStyles = {
    container: {
      paddingVertical: spacingPresets.md2,
    },
    stepRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepItem: {
      alignItems: 'center',
      gap: spacingPresets.xs,
    },
    stepCircle: {
      width: STEP_CIRCLE_SIZE,
      height: STEP_CIRCLE_SIZE,
      borderRadius: STEP_CIRCLE_SIZE / 2,
      backgroundColor: creamSubtle,
      borderWidth: 2,
      borderColor: creamDivider,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepCircleActive: {
      backgroundColor: coralSubtle,
      borderColor: colors.primaryAccent,
    },
    stepCircleCompleted: {
      backgroundColor: colors.primaryAccent,
      borderColor: colors.primaryAccent,
    },
    stepCircleIconColor: creamMuted,
    stepCircleActiveIconColor: colors.primaryAccent,
    stepCircleCompletedIconColor: colors.primaryAccentForeground,
    stepLabel: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: creamMuted,
      fontSize: 11,
      lineHeight: 14,
      textAlign: 'center',
    },
    stepLabelActive: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.primaryAccent,
      fontWeight: '700',
      fontSize: 11,
      lineHeight: 14,
      textAlign: 'center',
    },
    stepLine: {
      width: 40,
      height: STEP_LINE_HEIGHT,
      backgroundColor: creamDivider,
      borderRadius: STEP_LINE_HEIGHT / 2,
      marginHorizontal: spacingPresets.sm,
      marginBottom: spacingPresets.md2,
    },
    stepLineCompleted: {
      backgroundColor: colors.primaryAccent,
    },
  };

  // ── Info Card ──

  const infoCardStyles: InfoCardStyles = {
    container: {
      backgroundColor: creamSubtle,
      borderRadius: borderRadiusPresets.components,
      borderWidth: 1,
      borderColor: creamDivider,
      padding: spacingPresets.md2,
      gap: spacingPresets.md1,
    },
    title: {
      ...typographyPresets.Caption,
      color: creamMuted,
      fontWeight: '700',
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 1,
    },
    description: {
      ...typographyPresets.Body,
      color: creamSoft,
      fontSize: 14,
      lineHeight: 20,
    },
    requirementRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacingPresets.md1,
    },
    requirementIconContainer: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: coralSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    requirementIconColor: colors.primaryAccent,
    requirementText: {
      ...typographyPresets.Body,
      color: colors.customColors.cream,
      fontSize: 14,
      lineHeight: 20,
      flex: 1,
    },
    privacyContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacingPresets.sm,
      backgroundColor: 'rgba(255, 245, 236, 0.03)',
      borderRadius: borderRadiusPresets.inputElements,
      padding: spacingPresets.md1,
      marginTop: spacingPresets.xs,
    },
    privacyIconContainer: {
      width: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 1,
    },
    privacyIconColor: creamMuted,
    privacyText: {
      ...typographyPresets.Caption,
      color: creamMuted,
      fontSize: 12,
      lineHeight: 17,
      flex: 1,
    },
  };

  // ── Upload Area ──

  const uploadAreaStyles: UploadAreaStyles = {
    container: {
      alignItems: 'center',
      gap: spacingPresets.md2,
      marginTop: spacingPresets.md2,
    },
    previewContainer: {
      width: UPLOAD_PREVIEW_SIZE,
      height: UPLOAD_PREVIEW_SIZE,
      borderRadius: borderRadiusPresets.components,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: colors.primaryAccent,
      shadowColor: colors.primaryAccent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 4,
    },
    previewImage: {
      width: UPLOAD_PREVIEW_SIZE,
      height: UPLOAD_PREVIEW_SIZE,
    },
    placeholderContainer: {
      width: UPLOAD_PREVIEW_SIZE,
      height: UPLOAD_PREVIEW_SIZE,
      borderRadius: borderRadiusPresets.components,
      backgroundColor: creamSubtle,
      borderWidth: 2,
      borderColor: creamDivider,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacingPresets.sm,
    },
    placeholderIconColor: creamMuted,
    placeholderText: {
      ...typographyPresets.Caption,
      color: creamMuted,
      fontSize: 13,
      lineHeight: 18,
      textAlign: 'center',
      paddingHorizontal: spacingPresets.md2,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: spacingPresets.md1,
    },
  };

  // ── Status Card (Pending Review) ──

  const statusCardStyles: StatusCardStyles = {
    container: {
      backgroundColor: creamSubtle,
      borderRadius: borderRadiusPresets.components,
      borderWidth: 1,
      borderColor: creamDivider,
      padding: spacingPresets.lg1,
      alignItems: 'center',
      gap: spacingPresets.md2,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: coralSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconColor: colors.primaryAccent,
    title: {
      ...typographyPresets.Title,
      color: colors.customColors.cream,
      fontWeight: '700',
      fontSize: 20,
      lineHeight: 26,
      textAlign: 'center',
    },
    description: {
      ...typographyPresets.Body,
      color: creamSoft,
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'center',
    },
    etaContainer: {
      backgroundColor: 'rgba(255, 245, 236, 0.04)',
      borderRadius: borderRadiusPresets.inputElements,
      paddingVertical: spacingPresets.sm,
      paddingHorizontal: spacingPresets.md2,
    },
    etaText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: creamMuted,
      fontSize: 13,
      lineHeight: 18,
    },
  };

  // ── Success Card ──

  const successCardStyles: SuccessCardStyles = {
    container: {
      backgroundColor: voltGreenSubtle,
      borderRadius: borderRadiusPresets.components,
      borderWidth: 1,
      borderColor: 'rgba(207, 255, 71, 0.2)',
      padding: spacingPresets.lg1,
      alignItems: 'center',
      gap: spacingPresets.md2,
    },
    badgeContainer: {
      width: BADGE_SIZE,
      height: BADGE_SIZE,
      borderRadius: BADGE_SIZE / 2,
      backgroundColor: colors.customColors.voltGreen,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.customColors.voltGreen,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 8,
    },
    badgeIconColor: colors.customColors.inkBlack,
    title: {
      ...typographyPresets.Title,
      color: colors.customColors.voltGreen,
      fontWeight: '800',
      fontSize: 22,
      lineHeight: 28,
      textAlign: 'center',
    },
    description: {
      ...typographyPresets.Body,
      color: creamSoft,
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'center',
    },
  };

  // ── Failure Card ──

  const failureCardStyles: FailureCardStyles = {
    container: {
      backgroundColor: 'rgba(255, 92, 77, 0.06)',
      borderRadius: borderRadiusPresets.components,
      borderWidth: 1,
      borderColor: 'rgba(255, 92, 77, 0.15)',
      padding: spacingPresets.lg1,
      alignItems: 'center',
      gap: spacingPresets.md2,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: 'rgba(255, 92, 77, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconColor: colors.primaryAccent,
    title: {
      ...typographyPresets.Title,
      color: colors.primaryAccent,
      fontWeight: '700',
      fontSize: 20,
      lineHeight: 26,
      textAlign: 'center',
    },
    description: {
      ...typographyPresets.Body,
      color: creamSoft,
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'center',
    },
  };

  // ── Primary Button (Volt Green CTA) ──

  const primaryButtonStyles: CustomButtonStyles = overrideStyles(buttonPresets.Primary, {
    container: {
      alignSelf: 'stretch',
      backgroundColor: colors.customColors.voltGreen,
      borderRadius: borderRadiusPresets.components,
      paddingVertical: spacingPresets.md1,
      minHeight: 56,
      shadowColor: colors.customColors.voltGreen,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 6,
    },
    pressedContainer: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    disabledContainer: {
      backgroundColor: colors.customColors.voltGreen,
      opacity: 0.25,
      shadowOpacity: 0,
    },
    text: {
      ...typographyPresets.Button,
      color: colors.customColors.inkBlack,
      fontWeight: '800',
      fontSize: 17,
      lineHeight: 22,
    },
    pressedText: {
      color: colors.customColors.inkBlack,
    },
    disabledText: {
      color: colors.customColors.inkBlack,
    },
  });

  // ── Secondary Button (Ghost) ──

  const secondaryButtonStyles: CustomButtonStyles = overrideStyles(buttonPresets.Secondary, {
    container: {
      alignSelf: 'stretch',
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: creamMuted,
      borderRadius: borderRadiusPresets.components,
      paddingVertical: spacingPresets.md1,
      minHeight: 56,
    },
    pressedContainer: {
      backgroundColor: 'rgba(255, 245, 236, 0.06)',
    },
    text: {
      ...typographyPresets.Button,
      color: colors.customColors.cream,
      fontWeight: '700',
      fontSize: 16,
      lineHeight: 22,
    },
    pressedText: {
      color: colors.customColors.cream,
    },
  });

  // ── Upload Buttons (Camera / Gallery) ──

  const uploadButtonStyles: CustomButtonStyles = overrideStyles(buttonPresets.Secondary, {
    container: {
      flex: 1,
      backgroundColor: creamSubtle,
      borderWidth: 1,
      borderColor: creamDivider,
      borderRadius: borderRadiusPresets.inputElements,
      paddingVertical: spacingPresets.md1,
      minHeight: 48,
    },
    pressedContainer: {
      backgroundColor: 'rgba(255, 245, 236, 0.1)',
    },
    text: {
      ...typographyPresets.Button,
      color: colors.customColors.cream,
      fontWeight: '600',
      fontSize: 14,
      lineHeight: 20,
    },
    icon: {
      size: 18,
      color: colors.customColors.cream,
    },
  });

  return createAppPageStyles<VerificationStyles>({
    styles,
    headerStyles,
    stepIndicatorStyles,
    infoCardStyles,
    uploadAreaStyles,
    statusCardStyles,
    successCardStyles,
    failureCardStyles,
    primaryButtonStyles,
    secondaryButtonStyles,
    uploadButtonStyles,
  });
}

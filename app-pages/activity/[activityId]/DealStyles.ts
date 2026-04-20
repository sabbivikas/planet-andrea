/**
 * Styling for the Deal page
 */
import { ViewStyle, TextStyle } from 'react-native';

import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';

// ── Sub-component style interfaces ──

export interface DealHeaderStyles {
  container: ViewStyle;
  closeButton: ViewStyle;
  closeIcon: ViewStyle;
  titleArea: ViewStyle;
  titleText: TextStyle;
  placeholder: ViewStyle;
}

export interface DealCardStyles {
  container: ViewStyle;
  gradient: ViewStyle;
  discountBadge: ViewStyle;
  discountBadgeText: TextStyle;
  headline: TextStyle;
  venueName: TextStyle;
  metaRow: ViewStyle;
  metaItem: ViewStyle;
  metaIconWrapper: ViewStyle;
  metaText: TextStyle;
  metaIconColor: string;
  divider: ViewStyle;
  usageRow: ViewStyle;
  usageText: TextStyle;
  usageBarTrack: ViewStyle;
  usageBarFill: ViewStyle;
}

export interface CodeSectionStyles {
  container: ViewStyle;
  qrContainer: ViewStyle;
  qrBackground: ViewStyle;
  codeLabel: TextStyle;
  codeText: TextStyle;
  codeContainer: ViewStyle;
}

export interface InstructionsSectionStyles {
  container: ViewStyle;
  sectionTitle: TextStyle;
  stepRow: ViewStyle;
  stepNumber: ViewStyle;
  stepNumberText: TextStyle;
  stepText: TextStyle;
}

export interface FullScreenOverlayStyles {
  overlay: ViewStyle;
  content: ViewStyle;
  qrBackground: ViewStyle;
  codeText: TextStyle;
  hintText: TextStyle;
}

export interface ConfirmDialogStyles {
  overlay: ViewStyle;
  dialog: ViewStyle;
  title: TextStyle;
  message: TextStyle;
  buttonRow: ViewStyle;
}

export interface SuccessStateStyles {
  container: ViewStyle;
  iconContainer: ViewStyle;
  iconColor: string;
  title: TextStyle;
  subtitle: TextStyle;
}

export interface TermsSectionStyles {
  container: ViewStyle;
  header: ViewStyle;
  sectionTitle: TextStyle;
  chevronWrapper: ViewStyle;
  chevronColor: string;
  termsText: TextStyle;
}

export interface RedeemedBadgeStyles {
  container: ViewStyle;
  text: TextStyle;
}

// ── Main styles interface ──

export interface DealBaseStyles {
  safeArea: ViewStyle;
  container: ViewStyle;
  scrollContent: ViewStyle;
  sectionGap: ViewStyle;
}

export interface DealStyles {
  styles: DealBaseStyles;
  headerStyles: DealHeaderStyles;
  dealCardStyles: DealCardStyles;
  codeSectionStyles: CodeSectionStyles;
  instructionsSectionStyles: InstructionsSectionStyles;
  fullScreenOverlayStyles: FullScreenOverlayStyles;
  confirmDialogStyles: ConfirmDialogStyles;
  successStateStyles: SuccessStateStyles;
  termsSectionStyles: TermsSectionStyles;
  redeemedBadgeStyles: RedeemedBadgeStyles;
  showToStaffButtonStyles: CustomButtonStyles;
  markRedeemedButtonStyles: CustomButtonStyles;
  confirmYesButtonStyles: CustomButtonStyles;
  confirmCancelButtonStyles: CustomButtonStyles;
  backToDiscoverButtonStyles: CustomButtonStyles;
}

/**
 * Custom hook that provides styles for the Deal component
 */
export function useDealStyles(): DealStyles {
  const {
    createAppPageStyles,
    colors,
    typographyPresets,
    buttonPresets,
    spacingPresets,
    borderRadiusPresets,
    overrideStyles,
  } = useStyleContext();

  const HEADER_BUTTON_SIZE = 44;
  const CARD_BORDER_RADIUS = 16;
  const QR_SIZE = 180;
  const FULLSCREEN_QR_SIZE = 260;

  // ── Base page styles ──

  const styles: DealBaseStyles = {
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
      gap: spacingPresets.lg1,
    },
    sectionGap: {
      height: spacingPresets.md2,
    },
  };

  // ── Header ──

  const headerStyles: DealHeaderStyles = {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacingPresets.md2,
      paddingVertical: spacingPresets.sm,
      gap: spacingPresets.sm,
    },
    closeButton: {
      width: HEADER_BUTTON_SIZE,
      height: HEADER_BUTTON_SIZE,
      borderRadius: HEADER_BUTTON_SIZE / 2,
      backgroundColor: 'rgba(255, 245, 236, 0.08)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeIcon: {
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

  // ── Deal Card ──

  const dealCardStyles: DealCardStyles = {
    container: {
      borderRadius: CARD_BORDER_RADIUS + 4,
      overflow: 'hidden',
      shadowColor: '#FF5C4D',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 8,
    },
    gradient: {
      padding: spacingPresets.lg1,
      gap: spacingPresets.md1,
    },
    discountBadge: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(27, 42, 74, 0.5)',
      paddingHorizontal: spacingPresets.md1,
      paddingVertical: spacingPresets.xxs + 2,
      borderRadius: 8,
    },
    discountBadgeText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.customColors.cream,
      fontWeight: '900',
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 1.5,
    },
    headline: {
      ...typographyPresets.Title,
      color: colors.customColors.cream,
      fontWeight: '900',
      fontSize: 26,
      lineHeight: 32,
      fontFamily: 'SpaceGrotesk',
    },
    venueName: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.75)',
      fontWeight: '600',
      fontSize: 14,
      lineHeight: 18,
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacingPresets.md2,
      marginTop: spacingPresets.xs,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacingPresets.xs,
    },
    metaIconWrapper: {
      width: 14,
      height: 14,
    },
    metaText: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.7)',
      fontSize: 13,
      lineHeight: 18,
    },
    metaIconColor: 'rgba(255, 245, 236, 0.6)',
    divider: {
      height: 1,
      backgroundColor: 'rgba(255, 245, 236, 0.15)',
    },
    usageRow: {
      gap: spacingPresets.sm,
    },
    usageText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: 'rgba(255, 245, 236, 0.6)',
      fontSize: 12,
      lineHeight: 16,
    },
    usageBarTrack: {
      height: 4,
      borderRadius: 2,
      backgroundColor: 'rgba(255, 245, 236, 0.2)',
    },
    usageBarFill: {
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.customColors.voltGreen,
    },
  };

  // ── Code Section ──

  const codeSectionStyles: CodeSectionStyles = {
    container: {
      alignItems: 'center',
      gap: spacingPresets.md2,
      backgroundColor: 'rgba(255, 245, 236, 0.06)',
      borderRadius: CARD_BORDER_RADIUS,
      padding: spacingPresets.lg1,
      borderWidth: 1,
      borderColor: 'rgba(255, 245, 236, 0.08)',
    },
    qrContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    qrBackground: {
      backgroundColor: '#FFFFFF',
      borderRadius: borderRadiusPresets.inputElements,
      padding: spacingPresets.md2,
      width: QR_SIZE + spacingPresets.md2 * 2,
      height: QR_SIZE + spacingPresets.md2 * 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    codeLabel: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: 'rgba(255, 245, 236, 0.5)',
      fontWeight: '700',
      fontSize: 11,
      lineHeight: 15,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      textAlign: 'center',
    },
    codeText: {
      ...typographyPresets.Title,
      color: colors.customColors.voltGreen,
      fontWeight: '900',
      fontSize: 28,
      lineHeight: 34,
      letterSpacing: 3,
      textAlign: 'center',
      fontFamily: 'SpaceGrotesk',
    },
    codeContainer: {
      alignItems: 'center',
      gap: spacingPresets.xs,
    },
  };

  // ── Instructions Section ──

  const STEP_NUMBER_SIZE = 28;

  const instructionsSectionStyles: InstructionsSectionStyles = {
    container: {
      gap: spacingPresets.md1,
    },
    sectionTitle: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.5)',
      fontWeight: '700',
      fontSize: 11,
      lineHeight: 15,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
    },
    stepRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacingPresets.md1,
    },
    stepNumber: {
      width: STEP_NUMBER_SIZE,
      height: STEP_NUMBER_SIZE,
      borderRadius: STEP_NUMBER_SIZE / 2,
      backgroundColor: 'rgba(255, 92, 77, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepNumberText: {
      ...typographyPresets.Caption,
      color: colors.primaryAccent,
      fontWeight: '800',
      fontSize: 13,
      lineHeight: 17,
    },
    stepText: {
      ...typographyPresets.Body,
      color: 'rgba(255, 245, 236, 0.75)',
      fontSize: 14,
      lineHeight: 20,
      flex: 1,
    },
  };

  // ── Full Screen Overlay ──

  const fullScreenOverlayStyles: FullScreenOverlayStyles = {
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#FFFFFF',
      zIndex: 100,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacingPresets.lg2,
    },
    content: {
      alignItems: 'center',
      gap: spacingPresets.lg1,
    },
    qrBackground: {
      backgroundColor: '#FFFFFF',
      borderRadius: borderRadiusPresets.inputElements,
      padding: spacingPresets.lg1,
      width: FULLSCREEN_QR_SIZE + spacingPresets.lg1 * 2,
      height: FULLSCREEN_QR_SIZE + spacingPresets.lg1 * 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    codeText: {
      ...typographyPresets.PageTitle,
      color: colors.customColors.inkBlack,
      fontWeight: '900',
      fontSize: 36,
      lineHeight: 42,
      letterSpacing: 4,
      textAlign: 'center',
      fontFamily: 'SpaceGrotesk',
    },
    hintText: {
      ...typographyPresets.Body,
      color: 'rgba(45, 45, 45, 0.5)',
      fontSize: 15,
      lineHeight: 22,
      textAlign: 'center',
    },
  };

  // ── Confirm Dialog ──

  const confirmDialogStyles: ConfirmDialogStyles = {
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(27, 42, 74, 0.85)',
      zIndex: 90,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacingPresets.lg1,
    },
    dialog: {
      backgroundColor: colors.customColors.deepNavy,
      borderRadius: CARD_BORDER_RADIUS + 4,
      padding: spacingPresets.lg1,
      gap: spacingPresets.md2,
      width: '100%',
      maxWidth: 340,
      borderWidth: 1,
      borderColor: 'rgba(255, 245, 236, 0.12)',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.4,
      shadowRadius: 24,
      elevation: 12,
    },
    title: {
      ...typographyPresets.Title,
      color: colors.customColors.cream,
      fontWeight: '800',
      fontSize: 22,
      lineHeight: 28,
      textAlign: 'center',
      fontFamily: 'SpaceGrotesk',
    },
    message: {
      ...typographyPresets.Body,
      color: 'rgba(255, 245, 236, 0.65)',
      fontSize: 15,
      lineHeight: 22,
      textAlign: 'center',
    },
    buttonRow: {
      flexDirection: 'row',
      gap: spacingPresets.md1,
      marginTop: spacingPresets.sm,
    },
  };

  // ── Success State ──

  const successStateStyles: SuccessStateStyles = {
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacingPresets.lg2,
      gap: spacingPresets.md2,
    },
    iconContainer: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: 'rgba(207, 255, 71, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacingPresets.sm,
    },
    iconColor: colors.customColors.voltGreen,
    title: {
      ...typographyPresets.PageTitle,
      color: colors.customColors.voltGreen,
      fontWeight: '900',
      fontSize: 32,
      lineHeight: 38,
      textAlign: 'center',
      fontFamily: 'SpaceGrotesk',
    },
    subtitle: {
      ...typographyPresets.Body,
      color: 'rgba(255, 245, 236, 0.6)',
      fontSize: 16,
      lineHeight: 24,
      textAlign: 'center',
    },
  };

  // ── Terms Section ──

  const termsSectionStyles: TermsSectionStyles = {
    container: {
      backgroundColor: 'rgba(255, 245, 236, 0.04)',
      borderRadius: CARD_BORDER_RADIUS,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255, 245, 236, 0.06)',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacingPresets.md2,
    },
    sectionTitle: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.5)',
      fontWeight: '700',
      fontSize: 11,
      lineHeight: 15,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
    },
    chevronWrapper: {
      width: 18,
      height: 18,
    },
    chevronColor: 'rgba(255, 245, 236, 0.4)',
    termsText: {
      ...typographyPresets.Body,
      color: 'rgba(255, 245, 236, 0.55)',
      fontSize: 13,
      lineHeight: 20,
      paddingHorizontal: spacingPresets.md2,
      paddingBottom: spacingPresets.md2,
    },
  };

  // ── Redeemed Badge ──

  const redeemedBadgeStyles: RedeemedBadgeStyles = {
    container: {
      alignSelf: 'center',
      backgroundColor: 'rgba(207, 255, 71, 0.15)',
      paddingHorizontal: spacingPresets.md2,
      paddingVertical: spacingPresets.sm,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(207, 255, 71, 0.3)',
    },
    text: {
      ...typographyPresets.Label,
      fontFamily: 'tt-autonomous-mono',
      color: colors.customColors.voltGreen,
      fontWeight: '900',
      fontSize: 13,
      lineHeight: 17,
      letterSpacing: 1.5,
    },
  };

  // ── Show to Staff Button (Volt Green CTA) ──

  const showToStaffButtonStyles: CustomButtonStyles = overrideStyles(buttonPresets.Primary, {
    container: {
      backgroundColor: colors.customColors.voltGreen,
      borderRadius: borderRadiusPresets.components,
      paddingVertical: spacingPresets.md2,
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
      size: 20,
      color: colors.customColors.inkBlack,
    },
  });

  // ── Mark as Redeemed Button (Coral) ──

  const markRedeemedButtonStyles: CustomButtonStyles = overrideStyles(buttonPresets.Primary, {
    container: {
      backgroundColor: colors.primaryAccent,
      borderRadius: borderRadiusPresets.components,
      paddingVertical: spacingPresets.md1,
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
    icon: {
      size: 18,
      color: colors.customColors.cream,
    },
  });

  // ── Confirm Yes Button (Volt Green) ──

  const confirmYesButtonStyles: CustomButtonStyles = overrideStyles(buttonPresets.Primary, {
    container: {
      flex: 1,
      backgroundColor: colors.customColors.voltGreen,
      borderRadius: borderRadiusPresets.inputElements,
      paddingVertical: spacingPresets.md1,
    },
    pressedContainer: {
      backgroundColor: '#B8E63E',
    },
    text: {
      color: colors.customColors.inkBlack,
      fontWeight: '800',
      fontSize: 15,
      lineHeight: 20,
    },
  });

  // ── Confirm Cancel Button ──

  const confirmCancelButtonStyles: CustomButtonStyles = overrideStyles(buttonPresets.Secondary, {
    container: {
      flex: 1,
      backgroundColor: 'rgba(255, 245, 236, 0.08)',
      borderRadius: borderRadiusPresets.inputElements,
      paddingVertical: spacingPresets.md1,
      borderWidth: 1,
      borderColor: 'rgba(255, 245, 236, 0.15)',
    },
    pressedContainer: {
      backgroundColor: 'rgba(255, 245, 236, 0.15)',
    },
    text: {
      color: colors.customColors.cream,
      fontWeight: '700',
      fontSize: 15,
      lineHeight: 20,
    },
  });

  // ── Back to Discover Button (Volt Green) ──

  const backToDiscoverButtonStyles: CustomButtonStyles = overrideStyles(buttonPresets.Primary, {
    container: {
      backgroundColor: colors.customColors.voltGreen,
      borderRadius: borderRadiusPresets.components,
      paddingVertical: spacingPresets.md2,
      marginTop: spacingPresets.md2,
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
      size: 20,
      color: colors.customColors.inkBlack,
    },
  });

  return createAppPageStyles<DealStyles>({
    styles,
    headerStyles,
    dealCardStyles,
    codeSectionStyles,
    instructionsSectionStyles,
    fullScreenOverlayStyles,
    confirmDialogStyles,
    successStateStyles,
    termsSectionStyles,
    redeemedBadgeStyles,
    showToStaffButtonStyles,
    markRedeemedButtonStyles,
    confirmYesButtonStyles,
    confirmCancelButtonStyles,
    backToDiscoverButtonStyles,
  });
}

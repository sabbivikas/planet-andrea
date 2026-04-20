/**
 * Styling for the Preferences page (Steps 2 and 3 of 3)
 */

import { type ImageStyle, TextStyle, type ViewStyle } from 'react-native';

import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';

const DOT_SIZE = 8;
const ACTIVE_DOT_COLOR = '#FF5C4D';
const INACTIVE_DOT_COLOR = '#3a4a6b';
const ONBOARDING_TEXT = '#FFF5EC';
const PILL_UNSELECTED_BG = '#1B2A4A';
const PILL_UNSELECTED_BORDER = 'rgba(255, 245, 236, 0.5)';
const PILL_SELECTED_BG = '#FF5C4D';
const PILL_SELECTED_TEXT = '#2D2D2D';
const OTP_INPUT_BG = '#1a2240';
const OTP_BORDER = '#3a4a6b';
const OTP_ACTIVE_BORDER = '#FF5C4D';

/** Interface for the progress dots sub-component styles */
export interface ProgressDotsStyles {
  container: ViewStyle;
  dot: ViewStyle;
  activeDot: ViewStyle;
}

/** Interface for interest pill styles */
export interface InterestPillStyles {
  pill: ViewStyle;
  pillSelected: ViewStyle;
  pillText: TextStyle;
  pillTextSelected: TextStyle;
}

/** Interface for OTP input styles */
export interface OtpInputStyles {
  container: ViewStyle;
  box: ViewStyle;
  boxActive: ViewStyle;
  boxText: TextStyle;
  hiddenInput: TextStyle;
}

/** Interface for base styles of the usePreferencesStyles hook */
export interface PreferencesBaseStyles {
  safeArea: ViewStyle;
  container: ViewStyle;
  headerContainer: ViewStyle;
  pageTitleSection: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  interestGrid: ViewStyle;
  illustrationContainer: ViewStyle;
  illustration: ImageStyle;
  bottomSection: ViewStyle;
  otpSection: ViewStyle;
  autoFillMessage: TextStyle;
  resendContainer: ViewStyle;
  resendText: TextStyle;
  resendTextDisabled: TextStyle;
  countdownText: TextStyle;
}

/**
 * Interface for the return value of the usePreferencesStyles hook
 */
export interface PreferencesStyles {
  styles: PreferencesBaseStyles;
  progressDotsStyles: ProgressDotsStyles;
  interestPillStyles: InterestPillStyles;
  otpInputStyles: OtpInputStyles;
  continueButtonStyles: CustomButtonStyles;
}

export function usePreferencesStyles(): PreferencesStyles {
  const { colors, typographyPresets, spacingPresets, buttonPresets, overrideStyles, createAppPageStyles, dimensions } =
    useStyleContext();

  const gridGap = spacingPresets.md1;
  const gridPadding = spacingPresets.lg1;
  const pillWidth = (dimensions.width - gridPadding * 2 - gridGap) / 2;

  const progressDotsStyles: ProgressDotsStyles = {
    container: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacingPresets.sm,
    },
    dot: {
      width: DOT_SIZE,
      height: DOT_SIZE,
      borderRadius: DOT_SIZE / 2,
      backgroundColor: INACTIVE_DOT_COLOR,
    },
    activeDot: {
      backgroundColor: ACTIVE_DOT_COLOR,
    },
  };

  const interestPillStyles: InterestPillStyles = {
    pill: {
      width: pillWidth,
      paddingVertical: 14,
      paddingHorizontal: 20,
      minHeight: 52,
      backgroundColor: PILL_UNSELECTED_BG,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: PILL_UNSELECTED_BORDER,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pillSelected: {
      backgroundColor: PILL_SELECTED_BG,
      borderColor: 'transparent',
      borderWidth: 0,
    },
    pillText: {
      fontFamily: 'strenuous',
      fontWeight: 'bold',
      color: ONBOARDING_TEXT,
      textAlign: 'center',
      fontSize: 15,
      lineHeight: 20,
    },
    pillTextSelected: {
      color: PILL_SELECTED_TEXT,
    },
  };

  const otpInputStyles: OtpInputStyles = {
    container: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacingPresets.sm,
    },
    box: {
      width: 48,
      height: 56,
      backgroundColor: OTP_INPUT_BG,
      borderWidth: 1,
      borderColor: OTP_BORDER,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    boxActive: {
      borderColor: OTP_ACTIVE_BORDER,
    },
    boxText: {
      ...typographyPresets.PageTitle,
      color: ONBOARDING_TEXT,
      fontSize: 24,
      lineHeight: 32,
      textAlign: 'center',
    },
    hiddenInput: {
      position: 'absolute',
      opacity: 0,
      width: 1,
      height: 1,
    },
  };

  const continueButtonStyles: CustomButtonStyles = overrideStyles(buttonPresets.Primary, {
    container: {
      alignSelf: 'stretch',
      backgroundColor: '#CFFF47',
      borderRadius: 14,
      height: 52,
      justifyContent: 'center',
      alignItems: 'center',
    },
    pressedContainer: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    disabledContainer: {
      backgroundColor: colors.tertiaryBackground,
      opacity: 0.5,
      shadowOpacity: 0,
    },
    text: {
      fontFamily: 'strenuous',
      fontWeight: 'bold',
      color: '#2D2D2D',
      fontSize: 17,
      lineHeight: 22,
    },
    pressedText: {
      color: '#2D2D2D',
    },
    disabledText: {
      color: '#2D2D2D',
    },
  });

  const ILLUSTRATION_MAX_HEIGHT = 160;
  const SECTION_GAP = 12;

  const styles: PreferencesBaseStyles = {
    safeArea: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    container: {
      flex: 1,
      flexDirection: 'column',
      paddingHorizontal: spacingPresets.lg1,
    },
    headerContainer: {
      paddingTop: SECTION_GAP,
      paddingBottom: SECTION_GAP,
      alignItems: 'center',
    },
    pageTitleSection: {
      flexDirection: 'column',
      alignItems: 'center',
      gap: spacingPresets.xs,
      marginBottom: SECTION_GAP,
    },
    title: {
      ...typographyPresets.PageTitle,
      color: ONBOARDING_TEXT,
      textAlign: 'center',
    },
    subtitle: {
      ...typographyPresets.Body,
      color: INACTIVE_DOT_COLOR,
      textAlign: 'center',
    },
    interestGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: gridGap,
      marginBottom: SECTION_GAP,
    },
    illustrationContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      maxHeight: ILLUSTRATION_MAX_HEIGHT,
      marginBottom: SECTION_GAP,
      overflow: 'hidden',
    },
    illustration: {
      height: ILLUSTRATION_MAX_HEIGHT,
      maxHeight: ILLUSTRATION_MAX_HEIGHT,
      resizeMode: 'contain',
    },
    bottomSection: {
      paddingBottom: 24,
    },
    otpSection: {
      marginTop: spacingPresets.lg2,
    },
    autoFillMessage: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 12,
      color: '#CFFF47',
      textAlign: 'center',
      marginBottom: spacingPresets.md1,
    },
    resendContainer: {
      alignItems: 'center',
      marginTop: spacingPresets.lg1,
    },
    resendText: {
      ...typographyPresets.Label,
      color: ACTIVE_DOT_COLOR,
      fontSize: 14,
      lineHeight: 18,
    },
    resendTextDisabled: {
      ...typographyPresets.Label,
      color: INACTIVE_DOT_COLOR,
      fontSize: 14,
      lineHeight: 18,
    },
    countdownText: {
      ...typographyPresets.Caption,
      color: INACTIVE_DOT_COLOR,
      marginTop: spacingPresets.xs,
    },
  };

  return createAppPageStyles<PreferencesStyles>({
    styles,
    progressDotsStyles,
    interestPillStyles,
    otpInputStyles,
    continueButtonStyles,
  });
}

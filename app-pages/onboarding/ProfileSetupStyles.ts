/**
 * Styling for the ProfileSetup page (Step 1 of 3)
 */

import { ImageStyle, TextStyle, type ViewStyle } from 'react-native';

import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';
import { CustomTextInputStyles } from '@/comp-lib/core/custom-text-input/CustomTextInputStyles';

const AVATAR_SIZE = 100;
const AVATAR_BADGE_SIZE = 32;
const DOT_SIZE = 8;

const ONBOARDING_INPUT_BG = '#1a2240';
const ONBOARDING_BORDER = '#3a4a6b';
const ONBOARDING_TEXT = '#FFF5EC';
const ACTIVE_DOT_COLOR = '#FF5C4D';
const INACTIVE_DOT_COLOR = '#3a4a6b';
const VOLT_GREEN = '#CFFF47';
const BUTTON_TEXT_COLOR = '#2D2D2D';

/** Interface for the avatar picker sub-component styles */
export interface AvatarPickerStyles {
  container: ViewStyle;
  imageContainer: ViewStyle;
  image: ImageStyle;
  placeholderContainer: ViewStyle;
  placeholderIconWrapper: ViewStyle;
  cameraBadge: ViewStyle;
  cameraBadgeIconWrapper: ViewStyle;
  placeholderIconColor: string;
  cameraBadgeIconColor: string;
}

/** Interface for the progress dots sub-component styles */
export interface ProgressDotsStyles {
  container: ViewStyle;
  dot: ViewStyle;
  activeDot: ViewStyle;
}

/** Interface for the phone label and error text styles */
export interface PhoneLabelStyles {
  label: TextStyle;
  errorText: TextStyle;
}

/** Interface for base styles of the useProfileSetupStyles hook */
export interface ProfileSetupBaseStyles {
  safeArea: ViewStyle;
  container: ViewStyle;
  headerContainer: ViewStyle;
  pageTitleSection: ViewStyle;
  title: TextStyle;
  avatarSection: ViewStyle;
  inputSection: ViewStyle;
  bottomSection: ViewStyle;
}

/**
 * Interface for the return value of the useProfileSetupStyles hook
 */
export interface ProfileSetupStyles {
  styles: ProfileSetupBaseStyles;
  avatarPickerStyles: AvatarPickerStyles;
  progressDotsStyles: ProgressDotsStyles;
  textInputStyles: CustomTextInputStyles;
  phoneInputStyles: CustomTextInputStyles;
  phoneLabelStyles: PhoneLabelStyles;
  continueButtonStyles: CustomButtonStyles;
}

export function useProfileSetupStyles(): ProfileSetupStyles {
  const { colors, typographyPresets, spacingPresets, buttonPresets, borderRadiusPresets, overrideStyles, createAppPageStyles, textInputPresets } =
    useStyleContext();

  const continueButtonStyles: CustomButtonStyles = overrideStyles(buttonPresets.Primary, {
    container: {
      alignSelf: 'stretch',
      backgroundColor: VOLT_GREEN,
      borderRadius: 10,
      paddingVertical: spacingPresets.md1,
      minHeight: 52,
    },
    pressedContainer: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    disabledContainer: {
      backgroundColor: VOLT_GREEN,
      opacity: 0.25,
      shadowOpacity: 0,
    },
    text: {
      ...typographyPresets.Button,
      fontFamily: 'strenuous',
      fontWeight: 'bold',
      color: BUTTON_TEXT_COLOR,
      fontSize: 17,
      lineHeight: 22,
    },
    pressedText: {
      color: BUTTON_TEXT_COLOR,
    },
    disabledText: {
      color: BUTTON_TEXT_COLOR,
    },
  });

  const textInputStyles: CustomTextInputStyles = overrideStyles(textInputPresets.DefaultInput, {
    wrapper: {
      flexDirection: 'column',
    },
    container: {
      backgroundColor: ONBOARDING_INPUT_BG,
      borderWidth: 1,
      borderColor: ONBOARDING_BORDER,
      borderRadius: 10,
      paddingHorizontal: spacingPresets.md2,
      minHeight: 48,
      height: 48,
    },
    focused: {
      borderWidth: 1,
      borderColor: ACTIVE_DOT_COLOR,
    },
    error: {
      borderWidth: 1,
      borderColor: colors.customColors.error,
    },
    input: {
      ...typographyPresets.Input,
      color: ONBOARDING_TEXT,
      fontSize: 16,
      lineHeight: 22,
    },
    label: {
      ...typographyPresets.Label,
      color: ONBOARDING_TEXT,
      marginBottom: spacingPresets.xs,
    },
    placeholderTextColor: ONBOARDING_BORDER,
  });

  const avatarPickerStyles: AvatarPickerStyles = {
    container: {
      alignItems: 'center',
    },
    imageContainer: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: ACTIVE_DOT_COLOR,
    },
    image: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
    },
    placeholderContainer: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
      backgroundColor: ONBOARDING_INPUT_BG,
      borderWidth: 2,
      borderColor: ONBOARDING_BORDER,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderIconWrapper: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cameraBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: AVATAR_BADGE_SIZE,
      height: AVATAR_BADGE_SIZE,
      borderRadius: AVATAR_BADGE_SIZE / 2,
      backgroundColor: ACTIVE_DOT_COLOR,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.primaryBackground,
    },
    cameraBadgeIconWrapper: {
      width: 16,
      height: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderIconColor: ACTIVE_DOT_COLOR,
    cameraBadgeIconColor: '#FFFFFF',
  };

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

  const phoneInputStyles: CustomTextInputStyles = overrideStyles(textInputStyles, {
    container: {
      borderColor: ACTIVE_DOT_COLOR,
    },
  });

  const phoneLabelStyles: PhoneLabelStyles = {
    label: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 13,
      color: ONBOARDING_TEXT,
      opacity: 0.6,
      marginBottom: 6,
    },
    errorText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 12,
      color: ACTIVE_DOT_COLOR,
      marginTop: 6,
    },
  };

  const styles: ProfileSetupBaseStyles = {
    safeArea: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    container: {
      flex: 1,
      flexDirection: 'column',
      paddingHorizontal: spacingPresets.lg1,
      paddingBottom: spacingPresets.lg2,
    },
    headerContainer: {
      paddingTop: spacingPresets.md2,
      paddingBottom: spacingPresets.md2,
      alignItems: 'center',
    },
    pageTitleSection: {
      flexDirection: 'column',
      alignItems: 'center',
      gap: spacingPresets.xs,
      marginBottom: spacingPresets.md2,
    },
    title: {
      ...typographyPresets.PageTitle,
      color: ONBOARDING_TEXT,
      textAlign: 'center',
    },
    avatarSection: {
      alignItems: 'center',
      marginBottom: spacingPresets.md2,
    },
    inputSection: {
      flexDirection: 'column',
      gap: spacingPresets.md1,
    },
    bottomSection: {
      marginTop: 'auto',
      paddingTop: spacingPresets.lg1,
    },
  };

  return createAppPageStyles<ProfileSetupStyles>({
    styles,
    avatarPickerStyles,
    progressDotsStyles,
    textInputStyles,
    phoneInputStyles,
    phoneLabelStyles,
    continueButtonStyles,
  });
}

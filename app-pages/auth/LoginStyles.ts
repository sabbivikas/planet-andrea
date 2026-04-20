/**
 * Login styles that handle user login styles
 */
import { TextStyle, ViewStyle } from 'react-native';

import { AuthBaseStyles, LoginCoreStyles } from '@/comp-lib/auth/LoginCoreStyles';
import { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';
import { CustomTextInputStyles } from '@/comp-lib/core/custom-text-input/CustomTextInputStyles';
import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { borderRadiusPresets } from '@/comp-lib/styles/Styles';

const PLANET_WORDMARK_FONT_SIZE = 36;
const PLANET_WORDMARK_MARGIN_TOP = 60;
const WELCOME_TITLE_FONT_SIZE = 22;

export interface LoginStyles {
  /**
   * Shared auth styles used across Login, Signup, and Reset Password screens
   */
  sharedAuthStyles: AuthBaseStyles;
  sharedTextInputStyles: CustomTextInputStyles;
  sharedPrimaryButtonStyles: CustomButtonStyles;
  sharedTertiaryButtonStyles: CustomButtonStyles;
  loginCoreStyles: LoginCoreStyles;
  loginTopSectionStyles: ViewStyle;
  wordmarkStyles: TextStyle;
  welcomeTitleStyles: TextStyle;
}
export function useLoginStyles(): LoginStyles {
  const {
    createAppPageStyles,
    colors,
    typographyPresets,
    textInputPresets,
    spacingPresets,
    buttonPresets,
    overrideStyles,
  } = useStyleContext();

  const deepNavy = colors.customColors.deepNavy;
  const cream = colors.customColors.cream;
  const inkBlack = colors.customColors.inkBlack;
  const voltGreen = colors.customColors.voltGreen;
  const coral = colors.primaryAccent;

  const authBaseStyles: AuthBaseStyles = {
    safeArea: {
      flex: 1,
      backgroundColor: deepNavy,
    },
    container: {
      flex: 1,
      paddingHorizontal: spacingPresets.lg1,
      backgroundColor: deepNavy,
    },
    subContainer: {
      flexGrow: 1,
      gap: spacingPresets.sm,
    },
    topSection: {
      flex: 1,
      // NOTE: adjust "topSection" top padding if needed to make space for the content
      paddingTop: spacingPresets.lg2,
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: spacingPresets.xs,
      paddingBottom: spacingPresets.md2,
    },
    iconWrapper: {
      marginBottom: spacingPresets.md2,
    },
    icon: {
      size: 40,
      color: coral,
    },
    appName: {
      ...typographyPresets.Slogan,
      fontFamily: 'comba',
      color: coral,
      letterSpacing: 1,
      marginBottom: spacingPresets.xs,
    },
    title: {
      ...typographyPresets.PageTitle,
      color: cream,
      fontSize: 30,
      lineHeight: 38,
      textAlign: 'center',
    },
    subTitle: {
      ...typographyPresets.Subtitle,
      color: cream,
      opacity: 0.7,
      textAlign: 'center',
    },
    middleSection: {
      flex: 1.2,
      alignSelf: 'stretch',
      justifyContent: 'center',
      gap: spacingPresets.md1,
    },
    bottomSection: {
      justifyContent: 'flex-start',
      gap: spacingPresets.sm,
      paddingBottom: spacingPresets.lg1,
    },
    bottomSectionKeyboard: {
      flexGrow: 0,
      flexShrink: 0,
      marginBottom: spacingPresets.md2,
    },
  };

  const textInputStyles: CustomTextInputStyles = overrideStyles(textInputPresets.DefaultInput, {
    container: {
      backgroundColor: colors.customColors.inputBackground,
      borderRadius: borderRadiusPresets.inputElements,
      borderWidth: 1,
      borderColor: colors.customColors.inputBorder,
      minHeight: 52,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    focused: {
      borderWidth: 2,
      borderColor: coral,
    },
    input: {
      color: cream,
      fontSize: 16,
      lineHeight: 22,
    },
    label: {
      color: cream,
      opacity: 0.85,
      marginBottom: spacingPresets.xs,
      fontWeight: '600',
    },
    placeholderTextColor: colors.customColors.inputBorder,
    iconRightColor: colors.customColors.inputBorder,
  });

  const primaryButtonStyles: CustomButtonStyles = overrideStyles(buttonPresets.Primary, {
    container: {
      alignSelf: 'stretch',
      backgroundColor: voltGreen,
      borderRadius: borderRadiusPresets.inputElements,
      minHeight: 52,
      shadowColor: voltGreen,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    pressedContainer: {
      backgroundColor: '#B8E63E',
      shadowOpacity: 0.15,
    },
    disabledContainer: {
      backgroundColor: voltGreen,
      opacity: 0.5,
    },
    text: {
      color: inkBlack,
      fontWeight: '700',
      fontSize: 17,
      lineHeight: 22,
    },
    pressedText: {
      color: inkBlack,
    },
    disabledText: {
      color: inkBlack,
    },
  });

  const tertiaryButtonStyles: CustomButtonStyles = overrideStyles(buttonPresets.Tertiary, {
    container: {
      alignSelf: 'stretch',
    },
    text: {
      color: coral,
      fontWeight: '600',
      textDecorationLine: 'underline',
      fontSize: 15,
      lineHeight: 20,
    },
    pressedText: {
      color: colors.primaryAccentDark,
    },
  });

  const resetPasswordButtonStyles: CustomButtonStyles = overrideStyles(buttonPresets.Tertiary, {
    container: {
      alignSelf: 'stretch',
      marginTop: spacingPresets.xs,
    },
    text: {
      ...typographyPresets.Label,
      color: coral,
      textAlign: 'center',
    },
    pressedText: {
      color: colors.primaryAccentDark,
    },
  });

  const loginTopSectionStyles: ViewStyle = {
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: spacingPresets.xs,
    paddingBottom: spacingPresets.md2,
  };

  const wordmarkStyles: TextStyle = {
    fontFamily: 'comba',
    fontSize: PLANET_WORDMARK_FONT_SIZE,
    color: cream,
    textAlign: 'center',
    marginTop: PLANET_WORDMARK_MARGIN_TOP,
  };

  const welcomeTitleStyles: TextStyle = {
    fontFamily: 'strenuous',
    fontSize: WELCOME_TITLE_FONT_SIZE,
    fontWeight: 'bold',
    color: cream,
    textAlign: 'center',
  };

  return {
    sharedAuthStyles: authBaseStyles,
    sharedTextInputStyles: textInputStyles,
    sharedPrimaryButtonStyles: primaryButtonStyles,
    sharedTertiaryButtonStyles: tertiaryButtonStyles,
    loginTopSectionStyles,
    wordmarkStyles,
    welcomeTitleStyles,
    /**
     * NOTE: repeating styles in the loginCoreStyles because we need "createAppPageStyles" for the page styles for app responsive size/style changes
     */
    ...createAppPageStyles<
      Omit<
        LoginStyles,
        | 'sharedAuthStyles'
        | 'sharedTextInputStyles'
        | 'sharedPrimaryButtonStyles'
        | 'sharedTertiaryButtonStyles'
        | 'loginTopSectionStyles'
        | 'wordmarkStyles'
        | 'welcomeTitleStyles'
      >
    >({
      loginCoreStyles: {
        authBaseStyles,
        textInputStyles,
        primaryButtonStyles,
        tertiaryButtonStyles,
        resetPasswordButtonStyles,
      },
    }),
  };
}

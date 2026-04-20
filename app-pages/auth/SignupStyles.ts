/**
 * Signup Styles that handle account creation styles
 */
import { TextStyle, ViewStyle } from 'react-native';

import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { SignupCoreStyles } from '@/comp-lib/auth/SignupCoreStyles';
import { useLoginStyles } from './LoginStyles';

const PLANET_WORDMARK_FONT_SIZE = 36;
const PLANET_WORDMARK_MARGIN_TOP = 60;
const JOIN_TITLE_FONT_SIZE = 22;
const TAGLINE_FONT_SIZE = 15;
const TAGLINE_OPACITY = 0.7;

export interface SignupStyles {
  signupCoreStyles: SignupCoreStyles;
  signupTopSectionStyles: ViewStyle;
  wordmarkStyles: TextStyle;
  joinTitleStyles: TextStyle;
  taglineStyles: TextStyle;
}

export function useSignupStyles(): SignupStyles {
  const { createAppPageStyles, overrideStyles } = useStyleContext();

  // Inherit styles from the login page to ensure visual consistency between auth pages (Login, Signup, etc)
  const { sharedAuthStyles, sharedTextInputStyles, sharedPrimaryButtonStyles, sharedTertiaryButtonStyles } =
    useLoginStyles();

  const loginMatchedSignupCoreStyles = {
    authBaseStyles: overrideStyles(sharedAuthStyles, {}),
    textInputStyles: overrideStyles(sharedTextInputStyles, {}),
    primaryButtonStyles: overrideStyles(sharedPrimaryButtonStyles, {}),
    tertiaryButtonStyles: overrideStyles(sharedTertiaryButtonStyles, {}),
  };

  const signupTopSectionStyles: ViewStyle = {
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 6,
    paddingBottom: 16,
  };

  const wordmarkStyles: TextStyle = {
    fontFamily: 'comba',
    fontSize: PLANET_WORDMARK_FONT_SIZE,
    color: '#FFF5EC',
    textAlign: 'center',
    marginTop: PLANET_WORDMARK_MARGIN_TOP,
  };

  const joinTitleStyles: TextStyle = {
    fontFamily: 'strenuous',
    fontSize: JOIN_TITLE_FONT_SIZE,
    fontWeight: 'bold',
    color: '#FFF5EC',
    textAlign: 'center',
  };

  const taglineStyles: TextStyle = {
    fontFamily: 'strenuous',
    fontSize: TAGLINE_FONT_SIZE,
    color: '#FFF5EC',
    textAlign: 'center',
    opacity: TAGLINE_OPACITY,
  };

  return {
    signupTopSectionStyles,
    wordmarkStyles,
    joinTitleStyles,
    taglineStyles,
    ...createAppPageStyles<
      Omit<SignupStyles, 'signupTopSectionStyles' | 'wordmarkStyles' | 'joinTitleStyles' | 'taglineStyles'>
    >({ signupCoreStyles: loginMatchedSignupCoreStyles }),
  };
}

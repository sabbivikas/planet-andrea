/**
 * Styling for the NotFound page
 */
import { ViewStyle, TextStyle } from 'react-native';

import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';

const COMPASS_RING_SIZE = 120;
const COMPASS_ICON_VIEW_SIZE = 48;
const ERROR_CODE_FONT_SIZE = 96;
const ERROR_CODE_LINE_HEIGHT = 104;

/**
 * Interface for base styles of the useNotFoundStyles hook
 */
export interface NotFoundBaseStyles {
  safeArea: ViewStyle;
  container: ViewStyle;
  iconArea: ViewStyle;
  compassRing: ViewStyle;
  compassGlow: ViewStyle;
  compassIconView: ViewStyle;
  errorCode: TextStyle;
  textContent: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  buttonArea: ViewStyle;
}

/**
 * Interface for the return value of the useNotFoundStyles hook
 */
export interface NotFoundStyles {
  styles: NotFoundBaseStyles;
  ctaButtonStyles: CustomButtonStyles;
}

/**
 * Custom hook that provides styles for the NotFound component
 */
export function useNotFoundStyles(): NotFoundStyles {
  const {
    createAppPageStyles,
    colors,
    typographyPresets,
    buttonPresets,
    spacingPresets,
    overrideStyles,
    borderRadiusPresets,
  } = useStyleContext();

  const deepNavy = colors.customColors.deepNavy;
  const cream = colors.customColors.cream;
  const voltGreen = colors.customColors.voltGreen;
  const heroStart = colors.customColors.heroGradientStart;
  const inkBlack = colors.customColors.inkBlack;

  const styles: NotFoundBaseStyles = {
    safeArea: {
      flex: 1,
      backgroundColor: deepNavy,
    },
    container: {
      flex: 1,
      backgroundColor: deepNavy,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacingPresets.lg1,
    },
    iconArea: {
      alignItems: 'center',
      marginBottom: spacingPresets.lg1,
    },
    compassRing: {
      width: COMPASS_RING_SIZE,
      height: COMPASS_RING_SIZE,
      borderRadius: COMPASS_RING_SIZE / 2,
      borderWidth: 2.5,
      borderColor: 'rgba(255, 92, 77, 0.35)',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 92, 77, 0.08)',
    },
    compassGlow: {
      width: COMPASS_RING_SIZE,
      height: COMPASS_RING_SIZE,
      borderRadius: COMPASS_RING_SIZE / 2,
      position: 'absolute',
      shadowColor: heroStart,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.45,
      shadowRadius: 32,
      elevation: 12,
    },
    compassIconView: {
      width: COMPASS_ICON_VIEW_SIZE,
      height: COMPASS_ICON_VIEW_SIZE,
    },
    errorCode: {
      ...typographyPresets.Slogan,
      fontSize: ERROR_CODE_FONT_SIZE,
      lineHeight: ERROR_CODE_LINE_HEIGHT,
      fontWeight: '900',
      color: 'rgba(255, 92, 77, 0.15)',
      textAlign: 'center',
      letterSpacing: 6,
      position: 'absolute',
      top: -20,
    },
    textContent: {
      alignItems: 'center',
      marginBottom: spacingPresets.xl,
    },
    title: {
      ...typographyPresets.Title,
      color: cream,
      fontSize: 24,
      lineHeight: 32,
      textAlign: 'center',
      marginBottom: spacingPresets.md1,
    },
    subtitle: {
      ...typographyPresets.Body,
      color: 'rgba(255, 245, 236, 0.6)',
      textAlign: 'center',
      fontSize: 15,
      lineHeight: 22,
      maxWidth: 280,
    },
  buttonArea: {
      width: '100%',
      paddingHorizontal: spacingPresets.sm,
    },
  };

  const ctaButtonStyles = overrideStyles(buttonPresets.Primary, {
    container: {
      backgroundColor: voltGreen,
      borderRadius: borderRadiusPresets.components,
      height: 56,
      minHeight: 56,
      width: '100%',
      shadowColor: voltGreen,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
    },
    pressedContainer: {
      backgroundColor: '#B8E63E',
      opacity: 0.95,
    },
    text: {
      color: inkBlack,
      fontFamily: 'SpaceGrotesk',
      fontSize: 18,
      lineHeight: 22,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    pressedText: {
      color: inkBlack,
    },
  });

  return createAppPageStyles<NotFoundStyles>({ styles, ctaButtonStyles });
}

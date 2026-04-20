import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';

/**
 * Interface for base styles of the useIndexStyles hook
 */
export interface IndexBaseStyles {
  container: ViewStyle;
  backgroundImage: ImageStyle;
  darkOverlay: ViewStyle;
  safeArea: ViewStyle;
  contentWrapper: ViewStyle;
  topSection: ViewStyle;
  appName: TextStyle;
  heroTagline: TextStyle;
  middleSection: ViewStyle;
  orbitIcon: ViewStyle;
  headline: TextStyle;
  subtitle: TextStyle;
  bottomSection: ViewStyle;
  haveAccountText: TextStyle;
}

/**
 * Interface for the return value of the useIndexStyles hook
 */
export interface IndexStyles {
  styles: IndexBaseStyles;
  getStartedButtonStyles: CustomButtonStyles;
}

const BACKGROUND_IMAGE_URI = 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&h=1280&w=720';
const ORBIT_ICON_SIZE = 80;
const CREAM = '#FFF5EC';
const CORAL = '#FF5C4D';
const VOLT_GREEN = '#CFFF47';
const INK_BLACK = '#2D2D2D';

/**
 * Custom hook that provides styles for the Index component
 */
export function useIndexStyles(): IndexStyles {
  const {
    createAppPageStyles,
    buttonPresets,
    overrideStyles,
    borderRadiusPresets,
    spacingPresets,
  } = useStyleContext();

  const styles: IndexBaseStyles = {
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },
    backgroundImage: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100%',
    },
    darkOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
    },
    safeArea: {
      flex: 1,
    },
    contentWrapper: {
      flex: 1,
      paddingHorizontal: spacingPresets.lg1,
    },
    topSection: {
      alignItems: 'center',
      paddingTop: spacingPresets.lg2,
    },
    appName: {
      fontFamily: 'comba',
      color: CREAM,
      fontSize: 38,
      lineHeight: 44,
      textAlign: 'center',
      letterSpacing: 2,
      textTransform: 'uppercase',
    },
    heroTagline: {
      fontFamily: 'strenuous',
      color: CREAM,
      opacity: 0.7,
      fontSize: 15,
      lineHeight: 20,
      textAlign: 'center',
      marginTop: spacingPresets.xs,
    },
    middleSection: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    orbitIcon: {
      width: ORBIT_ICON_SIZE,
      height: ORBIT_ICON_SIZE,
      marginBottom: spacingPresets.md2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headline: {
      fontFamily: 'strenuous',
      color: CREAM,
      fontSize: 28,
      lineHeight: 34,
      textAlign: 'center',
      fontWeight: 'bold',
    },
    subtitle: {
      fontFamily: 'strenuous',
      color: CREAM,
      opacity: 0.7,
      fontSize: 15,
      lineHeight: 20,
      textAlign: 'center',
      marginTop: spacingPresets.sm,
      maxWidth: 280,
    },
    bottomSection: {
      paddingHorizontal: spacingPresets.sm,
      paddingBottom: 40,
      alignItems: 'center',
    },
    haveAccountText: {
      fontFamily: 'strenuous',
      color: CORAL,
      fontSize: 16,
      lineHeight: 20,
      textAlign: 'center',
      marginTop: spacingPresets.md1,
      paddingVertical: spacingPresets.sm,
    },
  };

  const getStartedButtonStyles = overrideStyles(buttonPresets.Primary, {
    container: {
      backgroundColor: VOLT_GREEN,
      borderRadius: borderRadiusPresets.components,
      height: 56,
      minHeight: 56,
      width: '100%',
    },
    pressedContainer: {
      backgroundColor: '#B8E63E',
      opacity: 0.95,
    },
    text: {
      color: INK_BLACK,
      fontFamily: 'strenuous',
      fontSize: 18,
      lineHeight: 22,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    pressedText: {
      color: INK_BLACK,
    },
  });

  return createAppPageStyles<IndexStyles>({
    styles,
    getStartedButtonStyles,
  });
}

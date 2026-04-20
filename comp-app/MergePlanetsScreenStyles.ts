import { ViewStyle, TextStyle } from 'react-native';

import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';

export interface MergePlanetsScreenStyles {
  overlay: ViewStyle;
  container: ViewStyle;
  header: ViewStyle;
  eyebrowText: TextStyle;
  closeButton: ViewStyle;
  closeButtonText: TextStyle;
  animationArea: ViewStyle;
  planetRow: ViewStyle;
  planetWrapper: ViewStyle;
  leftPlanet: ViewStyle;
  rightPlanet: ViewStyle;
  planetLabel: ViewStyle;
  planetGroupName: TextStyle;
  planetMemberCount: TextStyle;
  mergeSymbol: TextStyle;
  particle: ViewStyle;
  contentArea: ViewStyle;
  title: TextStyle;
  activityName: TextStyle;
  tagline: TextStyle;
  bottomArea: ViewStyle;
  collideButton: CustomButtonStyles;
  soloLink: TextStyle;
  toastContainer: ViewStyle;
  toastText: TextStyle;
}

export function useMergePlanetsScreenStyles(): MergePlanetsScreenStyles {
  const { buttonPresets, overrideStyles } = useStyleContext();

  return {
    overlay: {
      flex: 1,
      backgroundColor: '#1B2A4A',
    },
    container: {
      flex: 1,
      backgroundColor: '#1B2A4A',
      alignItems: 'center',
    },
    header: {
      width: '100%',
      alignItems: 'center',
      marginTop: 60,
      paddingHorizontal: 24,
    },
    eyebrowText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 12,
      color: 'rgba(255, 245, 236, 0.5)',
      letterSpacing: 0.15 * 12,
      textTransform: 'uppercase',
    },
    closeButton: {
      position: 'absolute',
      top: 60,
      right: 24,
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeButtonText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 18,
      color: 'rgba(255, 245, 236, 0.5)',
    },
    animationArea: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    planetRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0,
    },
    planetWrapper: {
      alignItems: 'center',
      gap: 10,
    },
    leftPlanet: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#FF5C4D',
    },
    rightPlanet: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#CFFF47',
    },
    planetLabel: {
      alignItems: 'center',
      gap: 2,
    },
    planetGroupName: {
      fontFamily: 'strenuous',
      fontSize: 14,
      fontWeight: '700',
      color: '#FFF5EC',
      textAlign: 'center',
      maxWidth: 100,
    },
    planetMemberCount: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 11,
      color: 'rgba(255, 245, 236, 0.6)',
      textAlign: 'center',
    },
    mergeSymbol: {
      fontFamily: 'comba',
      fontSize: 32,
      color: '#FFF5EC',
      marginHorizontal: 16,
      textAlign: 'center',
    },
    particle: {
      position: 'absolute',
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    contentArea: {
      alignItems: 'center',
      paddingHorizontal: 24,
      gap: 10,
      marginTop: 24,
      marginBottom: 32,
    },
    title: {
      fontFamily: 'comba',
      fontSize: 32,
      color: '#FFF5EC',
      textAlign: 'center',
    },
    activityName: {
      fontFamily: 'strenuous',
      fontSize: 16,
      fontWeight: '700',
      color: '#FFF5EC',
      textAlign: 'center',
    },
    tagline: {
      fontFamily: 'strenuous',
      fontSize: 14,
      color: 'rgba(255, 245, 236, 0.7)',
      textAlign: 'center',
      maxWidth: 280,
    },
    bottomArea: {
      width: '100%',
      paddingHorizontal: 24,
      paddingBottom: 40,
      gap: 12,
      alignItems: 'center',
    },
    collideButton: overrideStyles(buttonPresets.Primary, {
      container: {
        width: '100%',
        backgroundColor: '#CFFF47',
        borderRadius: 14,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 0,
        paddingVertical: 0,
      },
      pressedContainer: {
        backgroundColor: '#B8E63E',
      },
      text: {
        fontFamily: 'strenuous',
        fontWeight: '700',
        fontSize: 17,
        lineHeight: 22,
        color: '#2D2D2D',
      },
    }),
    soloLink: {
      fontFamily: 'strenuous',
      fontSize: 15,
      color: '#FF5C4D',
      textAlign: 'center',
    },
    toastContainer: {
      position: 'absolute',
      bottom: 100,
      left: 24,
      right: 24,
      backgroundColor: '#243660',
      borderRadius: 12,
      paddingHorizontal: 20,
      paddingVertical: 14,
      alignItems: 'center',
    },
    toastText: {
      fontFamily: 'strenuous',
      fontSize: 14,
      color: '#FFF5EC',
      textAlign: 'center',
    },
  };
}

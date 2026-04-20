import type { ViewStyle, ImageStyle } from 'react-native';

import type { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';
import { useStyleContext } from '@/comp-lib/styles/StyleContext';

export interface PhotoPickerStyles {
  /** Root container style */
  container: ViewStyle;

  /** Style for TouchableOpacity container */
  pressableContainer: ViewStyle;

  /** Container for image and loader overlay */
  imageContainer: ViewStyle;

  /** Style for the displayed profile image */
  image: ImageStyle;

  /** Style for the row that contains buttons */
  buttonContainer: ViewStyle;

  /** Style for the placeholder image shown before selection */
  placeholderImage: ImageStyle;

  /** Overlay style for loader */
  loaderOverlay: ViewStyle;

  /** Color for the loader indicator */
  loaderColor: string;

  /** Styles for gallery button */
  galleryButtonStyles: CustomButtonStyles;

  /** Styles for camera button */
  cameraButtonStyles: CustomButtonStyles;
}

export function usePhotoPickerStyles(): PhotoPickerStyles {
  const { buttonPresets, spacingPresets, borderRadiusPresets, colors, createAppPageStyles } = useStyleContext();

  const baseButtonStyles = buttonPresets.Tertiary;

  const photoPickerStyles: PhotoPickerStyles = {
    container: {
      width: '100%',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    pressableContainer: {
      width: '100%',
    },
    imageContainer: {
      position: 'relative',
      alignItems: 'center',
    },
    image: {
      width: '100%',
      height: 220,
      borderRadius: borderRadiusPresets.components,
    },
    buttonContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: spacingPresets.md2,
      marginTop: spacingPresets.md1,
    },
    placeholderImage: {
      width: '100%',
      height: 220,
      borderRadius: borderRadiusPresets.components,
      backgroundColor: colors.secondaryBackground,
    },
    loaderOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loaderColor: colors.secondaryForeground,
    galleryButtonStyles: baseButtonStyles,
    cameraButtonStyles: baseButtonStyles,
  };

  return createAppPageStyles<PhotoPickerStyles>(photoPickerStyles);
}

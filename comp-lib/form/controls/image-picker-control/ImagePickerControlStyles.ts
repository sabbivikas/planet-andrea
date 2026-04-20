import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { ImageStyle } from 'expo-image';
import { ViewStyle } from 'react-native';
/**
 * Interface for the return value of the useImagePickerControlStyles hook
 */
export interface ImagePickerControlStyles {
  /** Style for the button that triggers image picking */
  button: ViewStyle;
  /** Style for the displayed image */
  image: ImageStyle;
}

export function useImagePickerControlStyles(): ImagePickerControlStyles {
  const { spacingPresets, colors } = useStyleContext();

  const styles: ImagePickerControlStyles = {
    button: {
      alignSelf: 'center',
      marginVertical: spacingPresets.lg1,
      borderRadius: 9999,
    },
    image: {
      width: 200,
      height: 200,
      borderRadius: 9999,
      borderWidth: 1,
      borderColor: colors.secondaryBackground,
    },
  };

  return styles;
}

/**
 * Styling for the BusinessLayout layout
 * @todo AUTO-GENERATED STUB - replace with actual implementation and content
 */
import { ViewStyle, TextStyle } from 'react-native';

import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { CustomButtonStyles, CustomButtonPresetStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';

/**
 * Interface for base styles of the useBusinessLayoutStyles hook
 */
export interface BusinessLayoutBaseStyles {
  container: ViewStyle;
}

/**
 * Interface for the return value of the useBusinessLayoutStyles hook
 */
export interface BusinessLayoutStyles {
  styles: BusinessLayoutBaseStyles;
}

/**
 * Custom hook that provides styles for the BusinessLayout component
 */
export function useBusinessLayoutStyles(): BusinessLayoutStyles {
  const { createAppPageStyles, dimensions, colors, typographyPresets, buttonPresets, spacingPresets } =
    useStyleContext();

  const styles: BusinessLayoutBaseStyles = {
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
  };

  return createAppPageStyles<BusinessLayoutStyles>({ styles });
}

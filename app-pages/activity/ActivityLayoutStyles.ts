/**
 * Styling for the ActivityLayout layout
 * @todo AUTO-GENERATED STUB - replace with actual implementation and content
 */
import { ViewStyle, TextStyle } from 'react-native';

import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { CustomButtonStyles, CustomButtonPresetStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';

/**
 * Interface for base styles of the useActivityLayoutStyles hook
 */
export interface ActivityLayoutBaseStyles {
  container: ViewStyle;
}

/**
 * Interface for the return value of the useActivityLayoutStyles hook
 */
export interface ActivityLayoutStyles {
  styles: ActivityLayoutBaseStyles;
}

/**
 * Custom hook that provides styles for the ActivityLayout component
 */
export function useActivityLayoutStyles(): ActivityLayoutStyles {
  const { createAppPageStyles, dimensions, colors, typographyPresets, buttonPresets, spacingPresets } =
    useStyleContext();

  const styles: ActivityLayoutBaseStyles = {
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
  };

  return createAppPageStyles<ActivityLayoutStyles>({ styles });
}

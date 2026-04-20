/**
 * Styling for the GroupLayout layout
 * @todo AUTO-GENERATED STUB - replace with actual implementation and content
 */
import { ViewStyle, TextStyle } from 'react-native';

import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { CustomButtonStyles, CustomButtonPresetStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';

/**
 * Interface for base styles of the useGroupLayoutStyles hook
 */
export interface GroupLayoutBaseStyles {
  container: ViewStyle;
}

/**
 * Interface for the return value of the useGroupLayoutStyles hook
 */
export interface GroupLayoutStyles {
  styles: GroupLayoutBaseStyles;
}

/**
 * Custom hook that provides styles for the GroupLayout component
 */
export function useGroupLayoutStyles(): GroupLayoutStyles {
  const { createAppPageStyles, dimensions, colors, typographyPresets, buttonPresets, spacingPresets } =
    useStyleContext();

  const styles: GroupLayoutBaseStyles = {
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
  };

  return createAppPageStyles<GroupLayoutStyles>({ styles });
}

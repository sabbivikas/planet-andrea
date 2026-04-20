// Do not remove ColorPalette import so the AI does not have to do it if it wants to add ColorPalette colors here.
import { ColorPalette } from '@/comp-lib/styles/ColorPalette';
import { ValidCustomColorTheme } from '@/comp-lib/styles/StyleContext';
import { CustomBaseColor, CustomBaseColors } from '../../comp-lib/styles/CustomBaseColors';

/**
 * Custom color definitions with light and dark mode variants
 * Usage instructions:
 * Developers may change and add colors but only if they are not available in the default Colors object.
 * If possible color values need to reference a shade or tint from the Color Palette. Only if there is no suitable source color use direct hex values.
 * All color keys must be specified for light and dark mode.
 */
export interface CustomColor extends CustomBaseColor {
  /** Volt Green - used exclusively for primary CTAs */
  voltGreen: string;
  /** Deep Navy - dark background for cinematic atmosphere */
  deepNavy: string;
  /** Cream - light surfaces for breathing room */
  cream: string;
  /** Hero gradient start color (Coral) */
  heroGradientStart: string;
  /** Hero gradient end color (warm orange) */
  heroGradientEnd: string;
  /** Ink Black - body text on light surfaces */
  inkBlack: string;
  /** Card Surface - slightly lighter navy for card backgrounds */
  cardSurface: string;
  /** Input Background - dark navy for input fields */
  inputBackground: string;
  /** Input Border - muted blue-gray for input borders */
  inputBorder: string;
}

export interface CustomColorsTheme {
  light: CustomColor;
  dark: CustomColor;
}

export const CustomColors: CustomColorsTheme = {
  light: {
    ...CustomBaseColors.light,
    voltGreen: '#CFFF47',
    deepNavy: ColorPalette.dark.baseBackground['-10'],
    cream: ColorPalette.dark.baseForeground['+40'],
    heroGradientStart: ColorPalette.dark.primaryAccent['0'],
    heroGradientEnd: '#FF9A3C',
    inkBlack: ColorPalette.light.baseForeground['-10'],
    cardSurface: '#243660',
    inputBackground: '#1a2240',
    inputBorder: '#3a4a6b',
  },
  dark: {
    ...CustomBaseColors.dark,
    voltGreen: '#CFFF47',
    deepNavy: ColorPalette.dark.baseBackground['-10'],
    cream: ColorPalette.dark.baseForeground['+40'],
    heroGradientStart: ColorPalette.dark.primaryAccent['0'],
    heroGradientEnd: '#FF9A3C',
    inkBlack: ColorPalette.light.baseForeground['-10'],
    cardSurface: '#243660',
    inputBackground: '#1a2240',
    inputBorder: '#3a4a6b',
  },
};

// Simple compile-time validation - this will error if structure is invalid
const _validation: ValidCustomColorTheme<typeof CustomColors> = CustomColors;

import { ColorPalette } from '@/comp-lib/styles/ColorPalette';
import { ColorTheme } from '@/comp-lib/styles/StyleContext';
/**
 * Default color theme for the application in light and dark modes.
 * Only shade and tint values can be changed, no new colors or changes to direct color values can be made here.
 */
export const DefaultColors: ColorTheme = {
  light: {
    primaryBackground: ColorPalette.dark.baseBackground['-10'],       // #1B2A4A — deep navy canvas
    secondaryBackground: ColorPalette.dark.baseBackground['0'],       // #243862 — card surfaces
    tertiaryBackground: ColorPalette.dark.baseBackground['+10'],      // #2D467B — elevated surfaces
    primaryForeground: ColorPalette.dark.baseForeground['+40'],       // #FFF5EC — cream body text
    secondaryForeground: ColorPalette.dark.baseForeground['+30'],     // #FFE4CB — secondary text
    tertiaryForeground: ColorPalette.dark.baseForeground['+20'],      // #FFD2AA — caption text
    primaryAccent: ColorPalette.dark.primaryAccent['0'],              // #FF5C4D — links/secondary actions
    primaryAccentForeground: ColorPalette.light.baseForeground['-10'], // #2D2D2D — button text on accent
    primaryAccentLight: ColorPalette.dark.primaryAccent['+20'],
    primaryAccentDark: ColorPalette.dark.primaryAccent['-20'],
  },
  dark: {
    primaryBackground: ColorPalette.dark.baseBackground['-10'],       // #1B2A4A — deep navy canvas
    secondaryBackground: ColorPalette.dark.baseBackground['0'],       // #243862 — card surfaces
    tertiaryBackground: ColorPalette.dark.baseBackground['+10'],      // #2D467B — elevated surfaces
    primaryForeground: ColorPalette.dark.baseForeground['+40'],       // #FFF5EC — cream body text
    secondaryForeground: ColorPalette.dark.baseForeground['+30'],     // #FFE4CB — secondary text
    tertiaryForeground: ColorPalette.dark.baseForeground['+20'],      // #FFD2AA — caption text
    primaryAccent: ColorPalette.dark.primaryAccent['0'],              // #FF5C4D — links/secondary actions
    primaryAccentForeground: ColorPalette.light.baseForeground['-10'], // #2D2D2D — button text on accent
    primaryAccentLight: ColorPalette.dark.primaryAccent['+20'],
    primaryAccentDark: ColorPalette.dark.primaryAccent['-20'],
  },
};

/**
 * Styling for the Settings page
 */
import { ViewStyle, TextStyle } from 'react-native';

import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';
import { CustomHeaderStyles, useCustomHeaderStyles } from '@/comp-lib/custom-header/CustomHeaderStyles';
import { CustomSwitchStyles } from '@/comp-lib/core/custom-switch/CustomSwitchStyles';

// ── Sub-component style interfaces ──

export interface SectionHeaderStyles {
  container: ViewStyle;
  title: TextStyle;
}

export interface SettingRowStyles {
  container: ViewStyle;
  pressable: ViewStyle;
  iconContainer: ViewStyle;
  iconColor: string;
  textContainer: ViewStyle;
  label: TextStyle;
  hint: TextStyle;
  valueContainer: ViewStyle;
  value: TextStyle;
  chevronContainer: ViewStyle;
  chevronColor: string;
  divider: ViewStyle;
}

export interface SettingSwitchRowStyles {
  container: ViewStyle;
  iconContainer: ViewStyle;
  iconColor: string;
  textContainer: ViewStyle;
  label: TextStyle;
  hint: TextStyle;
  divider: ViewStyle;
}

/**
 * Interface for base styles of the useSettingsStyles hook
 */
export interface SettingsBaseStyles {
  safeArea: ViewStyle;
  container: ViewStyle;
  scrollContent: ViewStyle;
  sectionContainer: ViewStyle;
  sectionCard: ViewStyle;
  dangerCard: ViewStyle;
}

/**
 * Interface for the return value of the useSettingsStyles hook
 */
export interface SettingsStyles {
  styles: SettingsBaseStyles;
  headerStyles: CustomHeaderStyles;
  sectionHeaderStyles: SectionHeaderStyles;
  settingRowStyles: SettingRowStyles;
  settingSwitchRowStyles: SettingSwitchRowStyles;
  switchStyles: CustomSwitchStyles;
  deleteButtonStyles: CustomButtonStyles;
}

// ── Constants ──

const ICON_CONTAINER_SIZE = 36;
const ICON_SIZE = 18;
const CHEVRON_SIZE = 16;
const ROW_VERTICAL_PADDING = 14;

/**
 * Custom hook that provides styles for the Settings component
 */
export function useSettingsStyles(): SettingsStyles {
  const {
    createAppPageStyles,
    colors,
    typographyPresets,
    buttonPresets,
    spacingPresets,
    borderRadiusPresets,
    overrideStyles,
  } = useStyleContext();

  const defaultHeaderStyles = useCustomHeaderStyles();

  const creamMuted = 'rgba(255, 245, 236, 0.45)';
  const creamSubtle = 'rgba(255, 245, 236, 0.06)';
  const creamDivider = 'rgba(255, 245, 236, 0.08)';
  const creamSoft = 'rgba(255, 245, 236, 0.7)';

  // ── Base page styles ──

  const styles: SettingsBaseStyles = {
    safeArea: {
      flex: 1,
      backgroundColor: colors.customColors.deepNavy,
    },
    container: {
      flex: 1,
      backgroundColor: colors.customColors.deepNavy,
    },
    scrollContent: {
      paddingHorizontal: spacingPresets.md2,
      paddingBottom: spacingPresets.xl + spacingPresets.lg2,
    },
    sectionContainer: {
      marginTop: spacingPresets.lg1,
    },
    sectionCard: {
      backgroundColor: creamSubtle,
      borderRadius: borderRadiusPresets.components,
      borderWidth: 1,
      borderColor: creamDivider,
      overflow: 'hidden',
    },
    dangerCard: {
      backgroundColor: 'rgba(255, 92, 77, 0.06)',
      borderRadius: borderRadiusPresets.components,
      borderWidth: 1,
      borderColor: 'rgba(255, 92, 77, 0.15)',
      overflow: 'hidden',
      paddingVertical: spacingPresets.md2,
      alignItems: 'center',
    },
  };

  // ── Header ──

  const headerStyles: CustomHeaderStyles = overrideStyles(defaultHeaderStyles, {
    container: {
      backgroundColor: 'transparent',
      paddingHorizontal: spacingPresets.md2,
      paddingTop: spacingPresets.sm,
    },
    mainContainer: {
      height: 48,
    },
    headerLeft: {
      minWidth: 44,
    },
    headerRight: {
      minWidth: 44,
    },
    title: {
      ...typographyPresets.Title,
      color: colors.customColors.cream,
      fontWeight: '800',
      fontSize: 20,
      lineHeight: 26,
    },
    backCustomButtonStyles: overrideStyles(defaultHeaderStyles.backCustomButtonStyles, {
      icon: {
        size: 24,
        color: colors.customColors.cream,
      },
    }),
  });

  // ── Section Header ──

  const sectionHeaderStyles: SectionHeaderStyles = {
    container: {
      paddingBottom: spacingPresets.sm,
      paddingLeft: spacingPresets.xs,
    },
    title: {
      ...typographyPresets.Caption,
      color: creamMuted,
      fontWeight: '700',
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 1,
    },
  };

  // ── Setting Row ──

  const settingRowStyles: SettingRowStyles = {
    container: {
      position: 'relative',
    },
    pressable: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: ROW_VERTICAL_PADDING,
      paddingHorizontal: spacingPresets.md2,
      gap: spacingPresets.md1,
    },
    iconContainer: {
      width: ICON_CONTAINER_SIZE,
      height: ICON_CONTAINER_SIZE,
      borderRadius: ICON_CONTAINER_SIZE / 2,
      backgroundColor: 'rgba(255, 245, 236, 0.08)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconColor: creamSoft,
    textContainer: {
      flex: 1,
    },
    label: {
      ...typographyPresets.Body,
      color: colors.customColors.cream,
      fontSize: 15,
      lineHeight: 20,
    },
    hint: {
      ...typographyPresets.Caption,
      color: creamMuted,
      fontSize: 12,
      lineHeight: 16,
      marginTop: spacingPresets.xxs,
    },
    valueContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacingPresets.xs,
    },
    value: {
      ...typographyPresets.Caption,
      color: creamMuted,
      fontSize: 13,
      lineHeight: 18,
    },
    chevronContainer: {
      width: CHEVRON_SIZE,
      height: CHEVRON_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chevronColor: creamMuted,
    divider: {
      height: 1,
      backgroundColor: creamDivider,
      marginLeft: spacingPresets.md2 + ICON_CONTAINER_SIZE + spacingPresets.md1,
    },
  };

  // ── Setting Switch Row ──

  const settingSwitchRowStyles: SettingSwitchRowStyles = {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: ROW_VERTICAL_PADDING,
      paddingHorizontal: spacingPresets.md2,
      gap: spacingPresets.md1,
    },
    iconContainer: {
      width: ICON_CONTAINER_SIZE,
      height: ICON_CONTAINER_SIZE,
      borderRadius: ICON_CONTAINER_SIZE / 2,
      backgroundColor: 'rgba(255, 245, 236, 0.08)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconColor: creamSoft,
    textContainer: {
      flex: 1,
    },
    label: {
      ...typographyPresets.Body,
      color: colors.customColors.cream,
      fontSize: 15,
      lineHeight: 20,
    },
    hint: {
      ...typographyPresets.Caption,
      color: creamMuted,
      fontSize: 12,
      lineHeight: 16,
      marginTop: spacingPresets.xxs,
    },
    divider: {
      height: 1,
      backgroundColor: creamDivider,
      marginLeft: spacingPresets.md2 + ICON_CONTAINER_SIZE + spacingPresets.md1,
    },
  };

  // ── Switch ──

  const switchStyles: CustomSwitchStyles = {
    switchTrackColor: {
      false: 'rgba(255, 245, 236, 0.12)',
      true: colors.customColors.voltGreen,
    },
    switchThumbColor: '#FFFFFF',
    switchIosBackgroundColor: 'rgba(255, 245, 236, 0.12)',
  };

  // ── Delete Button ──

  const deleteButtonStyles: CustomButtonStyles = overrideStyles(buttonPresets.Primary, {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.primaryAccent,
      borderRadius: borderRadiusPresets.inputElements,
      paddingVertical: spacingPresets.md1,
      paddingHorizontal: spacingPresets.lg2,
    },
    text: {
      ...typographyPresets.Button,
      color: colors.primaryAccent,
      fontWeight: '700',
    },
    pressedContainer: {
      backgroundColor: 'rgba(255, 92, 77, 0.15)',
    },
  });

  return createAppPageStyles<SettingsStyles>({
    styles,
    headerStyles,
    sectionHeaderStyles,
    settingRowStyles,
    settingSwitchRowStyles,
    switchStyles,
    deleteButtonStyles,
  });
}

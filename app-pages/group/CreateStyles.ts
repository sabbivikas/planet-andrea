/**
 * Styling for the Create Group page
 */
import { ImageStyle, TextStyle, ViewStyle } from 'react-native';

import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';
import { CustomTextInputStyles } from '@/comp-lib/core/custom-text-input/CustomTextInputStyles';
import { CustomSwitchStyles } from '@/comp-lib/core/custom-switch/CustomSwitchStyles';
import { SliderControlStyles } from '@/comp-lib/form/controls/slider-control/SliderControlStyles';
import { CustomHeaderStyles , useCustomHeaderStyles } from '@/comp-lib/custom-header/CustomHeaderStyles';

const GROUP_PHOTO_SIZE = 110;
const CAMERA_BADGE_SIZE = 38;

/** Interface for the group photo picker sub-component styles */
export interface GroupPhotoPickerStyles {
  container: ViewStyle;
  imageContainer: ViewStyle;
  image: ImageStyle;
  placeholderContainer: ViewStyle;
  placeholderIconWrapper: ViewStyle;
  cameraBadge: ViewStyle;
  cameraBadgeIconWrapper: ViewStyle;
  photoHint: TextStyle;
  placeholderIconColor: string;
  cameraBadgeIconColor: string;
}

/** Interface for the visibility option sub-component styles */
export interface VisibilityOptionItemStyles {
  container: ViewStyle;
  selectedContainer: ViewStyle;
  iconWrapper: ViewStyle;
  textContainer: ViewStyle;
  label: TextStyle;
  selectedLabel: TextStyle;
  hint: TextStyle;
  selectedHint: TextStyle;
  selectedIndicator: ViewStyle;
  iconColor: string;
  selectedIconColor: string;
}

/**
 * Interface for base styles of the useCreateStyles hook
 */
export interface CreateBaseStyles {
  safeArea: ViewStyle;
  container: ViewStyle;
  scrollContent: ViewStyle;
  section: ViewStyle;
  sectionLabel: TextStyle;
  sectionHint: TextStyle;
  toggleRow: ViewStyle;
  toggleTextContainer: ViewStyle;
  toggleLabel: TextStyle;
  toggleHint: TextStyle;
  sliderValueText: TextStyle;
  sliderContainer: ViewStyle;
  visibilityContainer: ViewStyle;
  inputMetaRow: ViewStyle;
  characterCount: TextStyle;
  characterCountNearLimit: TextStyle;
  bottomSection: ViewStyle;
}

/**
 * Interface for the return value of the useCreateStyles hook
 */
export interface CreateStyles {
  styles: CreateBaseStyles;
  headerStyles: CustomHeaderStyles;
  groupNameInputStyles: CustomTextInputStyles;
  groupPhotoPickerStyles: GroupPhotoPickerStyles;
  switchStyles: CustomSwitchStyles;
  sliderStyles: SliderControlStyles;
  visibilityOptionStyles: VisibilityOptionItemStyles;
  createButtonStyles: CustomButtonStyles;
}

/**
 * Custom hook that provides styles for the Create component
 */
export function useCreateStyles(): CreateStyles {
  const {
    createAppPageStyles,
    colors,
    typographyPresets,
    buttonPresets,
    spacingPresets,
    borderRadiusPresets,
    overrideStyles,
    textInputPresets,
  } = useStyleContext();

  const defaultHeaderStyles = useCustomHeaderStyles();

  const headerStyles: CustomHeaderStyles = overrideStyles(defaultHeaderStyles, {
    container: {
      backgroundColor: 'transparent',
      paddingHorizontal: spacingPresets.md2,
    },
    title: {
      ...typographyPresets.Title,
      color: colors.primaryForeground,
    },
    backCustomButtonStyles: overrideStyles(buttonPresets.Tertiary, {
      container: {
        padding: spacingPresets.xs,
      },
      icon: {
        size: 24,
        color: colors.primaryForeground,
      },
    }),
  });

  const groupNameInputStyles: CustomTextInputStyles = overrideStyles(textInputPresets.DefaultInput, {
    wrapper: {
      flexDirection: 'column',
    },
    container: {
      backgroundColor: colors.customColors.cream,
      borderWidth: 2,
      borderColor: 'transparent',
      borderRadius: borderRadiusPresets.components,
      paddingHorizontal: spacingPresets.md2,
      minHeight: 56,
    },
    focused: {
      borderWidth: 2,
      borderColor: colors.primaryAccent,
    },
    error: {
      borderWidth: 2,
      borderColor: colors.customColors.error,
    },
    input: {
      ...typographyPresets.Input,
      color: colors.customColors.inkBlack,
      fontSize: 16,
      lineHeight: 22,
    },
    label: {
      ...typographyPresets.Label,
      color: colors.secondaryForeground,
      marginBottom: spacingPresets.xs,
    },
    placeholderTextColor: colors.customColors.tertiary,
  });

  const groupPhotoPickerStyles: GroupPhotoPickerStyles = {
    container: {
      alignItems: 'center',
    },
    imageContainer: {
      width: GROUP_PHOTO_SIZE,
      height: GROUP_PHOTO_SIZE,
      borderRadius: GROUP_PHOTO_SIZE / 2,
      overflow: 'hidden',
      borderWidth: 3,
      borderColor: colors.primaryAccent,
      shadowColor: colors.primaryAccent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    image: {
      width: GROUP_PHOTO_SIZE,
      height: GROUP_PHOTO_SIZE,
      borderRadius: GROUP_PHOTO_SIZE / 2,
    },
    placeholderContainer: {
      width: GROUP_PHOTO_SIZE,
      height: GROUP_PHOTO_SIZE,
      borderRadius: GROUP_PHOTO_SIZE / 2,
      backgroundColor: colors.tertiaryBackground,
      borderWidth: 2,
      borderColor: colors.primaryAccent,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderIconWrapper: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cameraBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: CAMERA_BADGE_SIZE,
      height: CAMERA_BADGE_SIZE,
      borderRadius: CAMERA_BADGE_SIZE / 2,
      backgroundColor: colors.primaryAccent,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: colors.customColors.deepNavy,
      shadowColor: colors.customColors.inkBlack,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    cameraBadgeIconWrapper: {
      width: 18,
      height: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    photoHint: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
      marginTop: spacingPresets.sm,
      textAlign: 'center',
    },
    placeholderIconColor: colors.primaryAccent,
    cameraBadgeIconColor: colors.primaryAccentForeground,
  };

  const switchStyles: CustomSwitchStyles = {
    switchTrackColor: {
      false: colors.tertiaryBackground,
      true: colors.primaryAccent,
    },
    switchThumbColor: colors.customColors.cream,
    switchIosBackgroundColor: colors.tertiaryBackground,
  };

  const sliderStyles: SliderControlStyles = {
    valueContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    valueText: {
      ...typographyPresets.Title,
      color: colors.primaryForeground,
      marginBottom: spacingPresets.sm,
    },
    labelText: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
      marginTop: spacingPresets.xs,
    },
    slider: {
      width: '100%',
    },
    minimumTrackTintColor: colors.primaryAccent,
    maximumTrackTintColor: colors.tertiaryBackground,
  };

  const visibilityOptionStyles: VisibilityOptionItemStyles = {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacingPresets.md1,
      paddingHorizontal: spacingPresets.md2,
      borderRadius: borderRadiusPresets.components,
      borderWidth: 2,
      borderColor: colors.tertiaryBackground,
      backgroundColor: 'transparent',
    },
    selectedContainer: {
      borderColor: colors.primaryAccent,
      backgroundColor: colors.secondaryBackground,
    },
    iconWrapper: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.tertiaryBackground,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacingPresets.md1,
    },
    textContainer: {
      flex: 1,
    },
    label: {
      ...typographyPresets.Label,
      color: colors.primaryForeground,
      fontSize: 15,
      lineHeight: 20,
    },
    selectedLabel: {
      color: colors.primaryForeground,
    },
    hint: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
      marginTop: 2,
    },
    selectedHint: {
      color: colors.secondaryForeground,
    },
    selectedIndicator: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.primaryAccent,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconColor: colors.secondaryForeground,
    selectedIconColor: colors.primaryAccent,
  };

  const createButtonStyles: CustomButtonStyles = overrideStyles(buttonPresets.Primary, {
    container: {
      alignSelf: 'stretch',
      backgroundColor: colors.customColors.voltGreen,
      borderRadius: borderRadiusPresets.components,
      paddingVertical: spacingPresets.md1,
      minHeight: 56,
      shadowColor: colors.customColors.voltGreen,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 6,
    },
    pressedContainer: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    disabledContainer: {
      backgroundColor: colors.customColors.voltGreen,
      opacity: 0.25,
      shadowOpacity: 0,
    },
    text: {
      ...typographyPresets.Button,
      color: colors.customColors.inkBlack,
      fontSize: 17,
      lineHeight: 22,
    },
    pressedText: {
      color: colors.customColors.inkBlack,
    },
    disabledText: {
      color: colors.customColors.inkBlack,
    },
  });

  const styles: CreateBaseStyles = {
    safeArea: {
      flex: 1,
      backgroundColor: colors.customColors.deepNavy,
    },
    container: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: spacingPresets.lg1,
      paddingBottom: spacingPresets.lg2,
    },
    section: {
      marginTop: spacingPresets.lg1,
    },
    sectionLabel: {
      ...typographyPresets.Label,
      color: colors.secondaryForeground,
      marginBottom: spacingPresets.sm,
    },
    sectionHint: {
      ...typographyPresets.Caption,
      color: colors.tertiaryForeground,
      marginTop: spacingPresets.xs,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.secondaryBackground,
      paddingVertical: spacingPresets.md1,
      paddingHorizontal: spacingPresets.md2,
      borderRadius: borderRadiusPresets.components,
    },
    toggleTextContainer: {
      flex: 1,
      marginRight: spacingPresets.md1,
    },
    toggleLabel: {
      ...typographyPresets.Label,
      color: colors.primaryForeground,
      fontSize: 15,
      lineHeight: 20,
    },
    toggleHint: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
      marginTop: 2,
    },
    sliderValueText: {
      ...typographyPresets.Title,
      color: colors.primaryForeground,
      textAlign: 'center',
    },
    sliderContainer: {
      marginTop: spacingPresets.md2,
      paddingHorizontal: spacingPresets.xs,
    },
    visibilityContainer: {
      gap: spacingPresets.sm,
    },
    inputMetaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: spacingPresets.xxs,
    },
    characterCount: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.tertiaryForeground,
      textAlign: 'right',
    },
    characterCountNearLimit: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.customColors.warning,
      textAlign: 'right',
    },
    bottomSection: {
      marginTop: 'auto',
      paddingTop: spacingPresets.lg1,
    },
  };

  return createAppPageStyles<CreateStyles>({
    styles,
    headerStyles,
    groupNameInputStyles,
    groupPhotoPickerStyles,
    switchStyles,
    sliderStyles,
    visibilityOptionStyles,
    createButtonStyles,
  });
}

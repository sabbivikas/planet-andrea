/**
 * Styling for the Profile page
 */
import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { CustomTextInputStyles } from '@/comp-lib/core/custom-text-input/CustomTextInputStyles';
import { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';

// ── Stats item sub-component styles ──

export interface StatItemStyles {
  container: ViewStyle;
  value: TextStyle;
  label: TextStyle;
}

// ── Activity card sub-component styles ──

export interface ActivityCardStyles {
  container: ViewStyle;
  image: ImageStyle;
  overlay: ViewStyle;
  title: TextStyle;
  category: TextStyle;
}

// ── Loading state styles ──

export interface LoadingStyles {
  container: ViewStyle;
  text: TextStyle;
}

// ── Main settings sheet styles ──

export interface SettingsSheetStyles {
  backdrop: ViewStyle;
  sheet: ViewStyle;
  scrollContent: ViewStyle;
  dragHandle: ViewStyle;
  titleRow: ViewStyle;
  title: TextStyle;
  sectionLabel: TextStyle;
  settingRow: ViewStyle;
  settingRowLast: ViewStyle;
  settingIconWrapper: ViewStyle;
  settingTextContainer: ViewStyle;
  settingLabel: TextStyle;
  settingSubtitle: TextStyle;
  settingSubtitleAccent: TextStyle;
  settingChevronWrapper: ViewStyle;
  signOutRow: ViewStyle;
  signOutLabel: TextStyle;
}

// ── Edit profile sheet styles ──

export interface EditProfileSheetStyles {
  backdrop: ViewStyle;
  sheet: ViewStyle;
  dragHandle: ViewStyle;
  titleRow: ViewStyle;
  title: TextStyle;
  photoSection: ViewStyle;
  photoCircle: ViewStyle;
  photoImage: ImageStyle;
  photoPlaceholder: ViewStyle;
  photoOverlay: ViewStyle;
  photoOverlayIcon: ViewStyle;
  photoLoadingOverlay: ViewStyle;
  inputSection: ViewStyle;
  saveButtonSection: ViewStyle;
  saveButton: CustomButtonStyles;
  textInputStyles: CustomTextInputStyles;
}

// ── Verify identity sheet styles ──

export interface VerifySheetStyles {
  backdrop: ViewStyle;
  sheet: ViewStyle;
  scrollContent: ViewStyle;
  dragHandle: ViewStyle;
  titleRow: ViewStyle;
  title: TextStyle;
  tierBadgeSection: ViewStyle;
  tierBadge: ViewStyle;
  tierBadgeText: TextStyle;
  stepsSection: ViewStyle;
  stepRow: ViewStyle;
  stepIconComplete: ViewStyle;
  stepIconIncomplete: ViewStyle;
  stepTextContainer: ViewStyle;
  stepLabel: TextStyle;
  stepHint: TextStyle;
  divider: ViewStyle;
  tiersSection: ViewStyle;
  tiersSectionTitle: TextStyle;
  tierRow: ViewStyle;
  tierBadgePill: ViewStyle;
  tierBadgePillText: TextStyle;
  tierAccess: TextStyle;
  closeLinkRow: ViewStyle;
  closeLink: TextStyle;
}

// ── Notifications sheet styles ──

export interface NotificationsSheetStyles {
  backdrop: ViewStyle;
  sheet: ViewStyle;
  dragHandle: ViewStyle;
  titleRow: ViewStyle;
  title: TextStyle;
  toggleRow: ViewStyle;
  toggleRowLast: ViewStyle;
  toggleTextContainer: ViewStyle;
  toggleLabel: TextStyle;
  toggleSubtitle: TextStyle;
}

// ── Activity preferences sheet styles ──

export interface ActivityPrefsSheetStyles {
  backdrop: ViewStyle;
  sheet: ViewStyle;
  dragHandle: ViewStyle;
  titleRow: ViewStyle;
  title: TextStyle;
  pillGrid: ViewStyle;
  pill: ViewStyle;
  pillSelected: ViewStyle;
  pillText: TextStyle;
  pillTextSelected: TextStyle;
  saveButtonSection: ViewStyle;
  saveButton: CustomButtonStyles;
}

// ── Privacy sheet styles ──

export interface PrivacySheetStyles {
  backdrop: ViewStyle;
  sheet: ViewStyle;
  dragHandle: ViewStyle;
  titleRow: ViewStyle;
  title: TextStyle;
  toggleRow: ViewStyle;
  toggleRowLast: ViewStyle;
  toggleLabel: TextStyle;
}

// ── Sign out confirm sheet styles ──

export interface SignOutConfirmSheetStyles {
  backdrop: ViewStyle;
  sheet: ViewStyle;
  dragHandle: ViewStyle;
  title: TextStyle;
  confirmButton: CustomButtonStyles;
  cancelLinkRow: ViewStyle;
  cancelLink: TextStyle;
}

// ── Toast styles ──

export interface ToastStyles {
  container: ViewStyle;
  text: TextStyle;
}

// ── Base profile page styles ──

export interface ProfileBaseStyles {
  safeArea: ViewStyle;
  scrollContent: ViewStyle;

  // Header
  headerRow: ViewStyle;
  headerTitle: TextStyle;
  settingsButton: ViewStyle;
  settingsIconWrapper: ViewStyle;

  // Avatar section
  avatarSection: ViewStyle;
  avatarContainer: ViewStyle;
  avatarImage: ImageStyle;
  avatarPlaceholder: ViewStyle;
  avatarPlaceholderIcon: ViewStyle;
  avatarEditOverlay: ViewStyle;
  avatarEditIconWrapper: ViewStyle;
  avatarLoadingOverlay: ViewStyle;

  // Name & badge
  nameRow: ViewStyle;
  displayName: TextStyle;
  verifiedBadge: ViewStyle;

  // Stats
  statsRow: ViewStyle;

  // Activity history
  activitySection: ViewStyle;
  activitySectionTitle: TextStyle;
  activityList: ViewStyle;
  activityListContent: ViewStyle;

  // Toast overlay
  toastOverlay: ViewStyle;
}

// ── Full return type ──

export interface ProfileStyles {
  styles: ProfileBaseStyles;
  loadingStyles: LoadingStyles;
  statItemStyles: StatItemStyles;
  activityCardStyles: ActivityCardStyles;
  settingsSheetStyles: SettingsSheetStyles;
  editProfileSheetStyles: EditProfileSheetStyles;
  verifySheetStyles: VerifySheetStyles;
  notificationsSheetStyles: NotificationsSheetStyles;
  activityPrefsSheetStyles: ActivityPrefsSheetStyles;
  privacySheetStyles: PrivacySheetStyles;
  signOutConfirmSheetStyles: SignOutConfirmSheetStyles;
  toastStyles: ToastStyles;
}

const AVATAR_SIZE = 104;
const AVATAR_BORDER_WIDTH = 3;
const ACTIVITY_CARD_WIDTH = 140;
const ACTIVITY_CARD_HEIGHT = 180;
const ICON_SIZE_SM = 16;
const ICON_SIZE_MD = 20;
const ICON_SIZE_LG = 24;
const SETTINGS_BUTTON_SIZE = 44;
const EDIT_OVERLAY_SIZE = 32;
const SETTING_ROW_HEIGHT = 60;
const SECTION_LABEL_HEIGHT = 32;
const SHEET_DRAG_HANDLE_WIDTH = 40;
const SHEET_DRAG_HANDLE_HEIGHT = 4;
const EDIT_PHOTO_SIZE = 80;
const EDIT_PHOTO_OVERLAY_SIZE = 28;

const SHEET_BG = '#1a2240';
const ROW_DIVIDER = '#3a4a6b';
const CORAL = '#FF5C4D';
const VOLT = '#CFFF47';
const CREAM = '#FFF5EC';
const SECTION_LABEL_COLOR = 'rgba(255, 245, 236, 0.4)';
const SUBTITLE_COLOR = 'rgba(255, 245, 236, 0.5)';
const CHEVRON_COLOR = 'rgba(255, 245, 236, 0.4)';
const LOCK_COLOR = 'rgba(255, 245, 236, 0.6)';
const TOGGLE_OFF = '#3a4a6b';
const TOGGLE_ON = CORAL;

export function useProfileStyles(): ProfileStyles {
  const {
    createAppPageStyles,
    colors,
    typographyPresets,
    buttonPresets,
    textInputPresets,
    spacingPresets,
    borderRadiusPresets,
    overrideStyles,
    dimensions,
  } = useStyleContext();

  const styles: ProfileBaseStyles = {
    safeArea: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    scrollContent: {
      paddingBottom: 40,
    },

    // Header
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacingPresets.lg1,
      paddingTop: spacingPresets.md2,
      paddingBottom: spacingPresets.sm,
    },
    headerTitle: {
      ...typographyPresets.PageTitle,
      color: colors.primaryForeground,
    },
    settingsButton: {
      width: SETTINGS_BUTTON_SIZE,
      height: SETTINGS_BUTTON_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: SETTINGS_BUTTON_SIZE / 2,
      backgroundColor: colors.secondaryBackground,
    },
    settingsIconWrapper: {
      width: ICON_SIZE_LG,
      height: ICON_SIZE_LG,
    },

    // Avatar section
    avatarSection: {
      alignItems: 'center',
      paddingTop: spacingPresets.lg1,
      paddingBottom: spacingPresets.md2,
    },
    avatarContainer: {
      width: AVATAR_SIZE + AVATAR_BORDER_WIDTH * 2,
      height: AVATAR_SIZE + AVATAR_BORDER_WIDTH * 2,
      borderRadius: (AVATAR_SIZE + AVATAR_BORDER_WIDTH * 2) / 2,
      borderWidth: AVATAR_BORDER_WIDTH,
      borderColor: colors.primaryAccent,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    avatarImage: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
    },
    avatarPlaceholder: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
      backgroundColor: colors.secondaryBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarPlaceholderIcon: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarEditOverlay: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: EDIT_OVERLAY_SIZE,
      height: EDIT_OVERLAY_SIZE,
      borderRadius: EDIT_OVERLAY_SIZE / 2,
      backgroundColor: colors.primaryAccent,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
    },
    avatarEditIconWrapper: {
      width: ICON_SIZE_SM,
      height: ICON_SIZE_SM,
    },
    avatarLoadingOverlay: {
      position: 'absolute',
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
      backgroundColor: 'rgba(0,0,0,0.4)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Name & badge
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacingPresets.md1,
      gap: spacingPresets.xs,
      paddingHorizontal: spacingPresets.lg1,
    },
    displayName: {
      ...typographyPresets.Title,
      color: colors.primaryForeground,
      textAlign: 'center',
    },
    verifiedBadge: {
      width: ICON_SIZE_MD,
      height: ICON_SIZE_MD,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Stats
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      paddingHorizontal: spacingPresets.lg1,
      marginTop: spacingPresets.lg1,
      gap: spacingPresets.sm,
    },

    // Activity history
    activitySection: {
      marginTop: spacingPresets.lg2,
    },
    activitySectionTitle: {
      ...typographyPresets.Subtitle,
      color: colors.primaryForeground,
      paddingHorizontal: spacingPresets.lg1,
      marginBottom: spacingPresets.md1,
    },
    activityList: {
      flexGrow: 0,
    },
    activityListContent: {
      paddingHorizontal: spacingPresets.lg1,
      gap: spacingPresets.md1,
    },

    // Toast overlay
    toastOverlay: {
      position: 'absolute',
      bottom: 80,
      left: spacingPresets.lg1,
      right: spacingPresets.lg1,
      alignItems: 'center',
      zIndex: 9999,
    },
  };

  const loadingStyles: LoadingStyles = {
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryBackground,
    },
    text: {
      ...typographyPresets.Body,
      color: colors.secondaryForeground,
      marginTop: spacingPresets.md1,
    },
  };

  const statItemStyles: StatItemStyles = {
    container: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacingPresets.md2,
      backgroundColor: colors.secondaryBackground,
      borderRadius: borderRadiusPresets.components,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    value: {
      ...typographyPresets.Title,
      color: colors.primaryAccent,
    },
    label: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.secondaryForeground,
      marginTop: spacingPresets.xxs,
    },
  };

  const activityCardStyles: ActivityCardStyles = {
    container: {
      width: ACTIVITY_CARD_WIDTH,
      height: ACTIVITY_CARD_HEIGHT,
      borderRadius: borderRadiusPresets.components,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    image: {
      width: ACTIVITY_CARD_WIDTH,
      height: ACTIVITY_CARD_HEIGHT,
      borderRadius: borderRadiusPresets.components,
    },
    overlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: spacingPresets.sm,
      paddingVertical: spacingPresets.sm,
      borderBottomLeftRadius: borderRadiusPresets.components,
      borderBottomRightRadius: borderRadiusPresets.components,
    },
    title: {
      ...typographyPresets.Label,
      color: '#FFFFFF',
    },
    category: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: 'rgba(255,255,255,0.8)',
      marginTop: spacingPresets.xxs,
    },
  };

  // ── Settings sheet ──

  const settingsSheetStyles: SettingsSheetStyles = {
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: SHEET_BG,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '90%',
    },
    scrollContent: {
      paddingHorizontal: spacingPresets.lg1,
      paddingBottom: 40,
    },
    dragHandle: {
      width: SHEET_DRAG_HANDLE_WIDTH,
      height: SHEET_DRAG_HANDLE_HEIGHT,
      borderRadius: SHEET_DRAG_HANDLE_HEIGHT / 2,
      backgroundColor: 'rgba(255, 245, 236, 0.3)',
      alignSelf: 'center',
      marginTop: spacingPresets.md1,
      marginBottom: spacingPresets.md1,
    },
    titleRow: {
      paddingBottom: spacingPresets.md1,
    },
    title: {
      fontFamily: 'strenuous',
      fontWeight: 'bold',
      fontSize: 20,
      color: CREAM,
    },
    sectionLabel: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 11,
      color: SECTION_LABEL_COLOR,
      height: SECTION_LABEL_HEIGHT,
      lineHeight: SECTION_LABEL_HEIGHT,
      marginTop: 8,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      height: SETTING_ROW_HEIGHT,
      borderBottomWidth: 1,
      borderBottomColor: ROW_DIVIDER,
    },
    settingRowLast: {
      flexDirection: 'row',
      alignItems: 'center',
      height: SETTING_ROW_HEIGHT,
    },
    settingIconWrapper: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacingPresets.md1,
    },
    settingTextContainer: {
      flex: 1,
    },
    settingLabel: {
      fontFamily: 'strenuous',
      fontSize: 16,
      color: CREAM,
    },
    settingSubtitle: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 12,
      color: SUBTITLE_COLOR,
      marginTop: 2,
    },
    settingSubtitleAccent: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 12,
      color: VOLT,
      marginTop: 2,
    },
    settingChevronWrapper: {
      width: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    signOutRow: {
      flexDirection: 'row',
      alignItems: 'center',
      height: SETTING_ROW_HEIGHT,
    },
    signOutLabel: {
      fontFamily: 'strenuous',
      fontSize: 16,
      color: CORAL,
    },
  };

  // ── Edit profile sheet ──

  const editProfileTextInput = overrideStyles(textInputPresets.DefaultInput, {
    container: {
      backgroundColor: colors.secondaryBackground,
      borderColor: ROW_DIVIDER,
      borderWidth: 1,
      marginBottom: spacingPresets.md1,
    },
    input: {
      ...typographyPresets.Body,
      color: CREAM,
    },
    placeholderTextColor: SUBTITLE_COLOR,
  });

  const editProfileSaveButton = overrideStyles(buttonPresets.Primary, {
    container: {
      backgroundColor: VOLT,
      borderRadius: 14,
      height: 52,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontFamily: 'strenuous',
      fontWeight: 'bold',
      color: '#2D2D2D',
      fontSize: 17,
    },
  });

  const editProfileSheetStyles: EditProfileSheetStyles = {
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: SHEET_BG,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: spacingPresets.lg1,
      paddingBottom: 40,
      maxHeight: '90%',
    },
    dragHandle: {
      width: SHEET_DRAG_HANDLE_WIDTH,
      height: SHEET_DRAG_HANDLE_HEIGHT,
      borderRadius: SHEET_DRAG_HANDLE_HEIGHT / 2,
      backgroundColor: 'rgba(255, 245, 236, 0.3)',
      alignSelf: 'center',
      marginTop: spacingPresets.md1,
      marginBottom: spacingPresets.md1,
    },
    titleRow: {
      paddingBottom: spacingPresets.md2,
    },
    title: {
      fontFamily: 'strenuous',
      fontWeight: 'bold',
      fontSize: 20,
      color: CREAM,
    },
    photoSection: {
      alignItems: 'center',
      marginBottom: spacingPresets.lg1,
    },
    photoCircle: {
      width: EDIT_PHOTO_SIZE,
      height: EDIT_PHOTO_SIZE,
      borderRadius: EDIT_PHOTO_SIZE / 2,
      backgroundColor: colors.secondaryBackground,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: colors.primaryAccent,
    },
    photoImage: {
      width: EDIT_PHOTO_SIZE,
      height: EDIT_PHOTO_SIZE,
      borderRadius: EDIT_PHOTO_SIZE / 2,
    },
    photoPlaceholder: {
      width: EDIT_PHOTO_SIZE,
      height: EDIT_PHOTO_SIZE,
      borderRadius: EDIT_PHOTO_SIZE / 2,
      backgroundColor: colors.secondaryBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    photoOverlay: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: EDIT_PHOTO_OVERLAY_SIZE,
      height: EDIT_PHOTO_OVERLAY_SIZE,
      borderRadius: EDIT_PHOTO_OVERLAY_SIZE / 2,
      backgroundColor: CORAL,
      alignItems: 'center',
      justifyContent: 'center',
    },
    photoOverlayIcon: {
      width: 14,
      height: 14,
    },
    photoLoadingOverlay: {
      position: 'absolute',
      width: EDIT_PHOTO_SIZE,
      height: EDIT_PHOTO_SIZE,
      borderRadius: EDIT_PHOTO_SIZE / 2,
      backgroundColor: 'rgba(0,0,0,0.4)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputSection: {
      flex: 1,
    },
    saveButtonSection: {
      paddingTop: spacingPresets.md1,
    },
    saveButton: editProfileSaveButton,
    textInputStyles: editProfileTextInput,
  };

  // ── Verify identity sheet ──

  const verifySheetStyles: VerifySheetStyles = {
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: SHEET_BG,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '90%',
    },
    scrollContent: {
      paddingHorizontal: spacingPresets.lg1,
      paddingBottom: 40,
    },
    dragHandle: {
      width: SHEET_DRAG_HANDLE_WIDTH,
      height: SHEET_DRAG_HANDLE_HEIGHT,
      borderRadius: SHEET_DRAG_HANDLE_HEIGHT / 2,
      backgroundColor: 'rgba(255, 245, 236, 0.3)',
      alignSelf: 'center',
      marginTop: spacingPresets.md1,
      marginBottom: spacingPresets.md1,
    },
    titleRow: {
      paddingBottom: spacingPresets.md2,
    },
    title: {
      fontFamily: 'strenuous',
      fontWeight: 'bold',
      fontSize: 20,
      color: CREAM,
    },
    tierBadgeSection: {
      alignItems: 'center',
      marginBottom: spacingPresets.lg1,
    },
    tierBadge: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.secondaryBackground,
      borderWidth: 1,
      borderColor: VOLT,
    },
    tierBadgeText: {
      fontFamily: 'strenuous',
      fontWeight: 'bold',
      fontSize: 16,
      color: VOLT,
    },
    stepsSection: {
      marginBottom: spacingPresets.lg1,
    },
    stepRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: spacingPresets.md1,
      borderBottomWidth: 1,
      borderBottomColor: ROW_DIVIDER,
    },
    stepIconComplete: {
      width: 24,
      height: 24,
      marginRight: spacingPresets.md1,
      marginTop: 2,
    },
    stepIconIncomplete: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: ROW_DIVIDER,
      marginRight: spacingPresets.md1,
      marginTop: 2,
    },
    stepTextContainer: {
      flex: 1,
    },
    stepLabel: {
      fontFamily: 'strenuous',
      fontSize: 15,
      color: CREAM,
    },
    stepHint: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 12,
      color: SUBTITLE_COLOR,
      marginTop: 4,
    },
    divider: {
      height: 1,
      backgroundColor: ROW_DIVIDER,
      marginVertical: spacingPresets.md1,
    },
    tiersSection: {
      marginBottom: spacingPresets.lg1,
    },
    tiersSectionTitle: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 11,
      color: SECTION_LABEL_COLOR,
      marginBottom: spacingPresets.md1,
    },
    tierRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacingPresets.sm,
      gap: spacingPresets.md1,
    },
    tierBadgePill: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: colors.secondaryBackground,
      minWidth: 70,
      alignItems: 'center',
    },
    tierBadgePillText: {
      fontFamily: 'strenuous',
      fontSize: 13,
      color: CREAM,
    },
    tierAccess: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 12,
      color: SUBTITLE_COLOR,
      flex: 1,
    },
    closeLinkRow: {
      alignItems: 'center',
      paddingVertical: spacingPresets.md1,
    },
    closeLink: {
      fontFamily: 'strenuous',
      fontSize: 15,
      color: CORAL,
    },
  };

  // ── Notifications sheet ──

  const notificationsSheetStyles: NotificationsSheetStyles = {
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: SHEET_BG,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: spacingPresets.lg1,
      paddingBottom: 40,
    },
    dragHandle: {
      width: SHEET_DRAG_HANDLE_WIDTH,
      height: SHEET_DRAG_HANDLE_HEIGHT,
      borderRadius: SHEET_DRAG_HANDLE_HEIGHT / 2,
      backgroundColor: 'rgba(255, 245, 236, 0.3)',
      alignSelf: 'center',
      marginTop: spacingPresets.md1,
      marginBottom: spacingPresets.md1,
    },
    titleRow: {
      paddingBottom: spacingPresets.md2,
    },
    title: {
      fontFamily: 'strenuous',
      fontWeight: 'bold',
      fontSize: 20,
      color: CREAM,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      height: SETTING_ROW_HEIGHT,
      borderBottomWidth: 1,
      borderBottomColor: ROW_DIVIDER,
    },
    toggleRowLast: {
      flexDirection: 'row',
      alignItems: 'center',
      height: SETTING_ROW_HEIGHT,
    },
    toggleTextContainer: {
      flex: 1,
    },
    toggleLabel: {
      fontFamily: 'strenuous',
      fontSize: 15,
      color: CREAM,
    },
    toggleSubtitle: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 12,
      color: SUBTITLE_COLOR,
      marginTop: 2,
    },
  };

  // ── Activity preferences sheet ──

  const gridPadding = spacingPresets.lg1;
  const gridGap = spacingPresets.md1;
  const pillWidth = (dimensions.width - gridPadding * 2 - gridGap) / 2;

  const activityPrefsSaveButton = overrideStyles(buttonPresets.Primary, {
    container: {
      backgroundColor: VOLT,
      borderRadius: 14,
      height: 52,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontFamily: 'strenuous',
      fontWeight: 'bold',
      color: '#2D2D2D',
      fontSize: 17,
    },
  });

  const activityPrefsSheetStyles: ActivityPrefsSheetStyles = {
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: SHEET_BG,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: spacingPresets.lg1,
      paddingBottom: 40,
    },
    dragHandle: {
      width: SHEET_DRAG_HANDLE_WIDTH,
      height: SHEET_DRAG_HANDLE_HEIGHT,
      borderRadius: SHEET_DRAG_HANDLE_HEIGHT / 2,
      backgroundColor: 'rgba(255, 245, 236, 0.3)',
      alignSelf: 'center',
      marginTop: spacingPresets.md1,
      marginBottom: spacingPresets.md1,
    },
    titleRow: {
      paddingBottom: spacingPresets.md2,
    },
    title: {
      fontFamily: 'strenuous',
      fontWeight: 'bold',
      fontSize: 20,
      color: CREAM,
    },
    pillGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: gridGap,
      marginBottom: spacingPresets.lg1,
    },
    pill: {
      width: pillWidth,
      paddingVertical: 14,
      paddingHorizontal: 20,
      minHeight: 52,
      backgroundColor: '#243660',
      borderRadius: 24,
      borderWidth: 2,
      borderColor: 'rgba(255, 245, 236, 0.5)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    pillSelected: {
      backgroundColor: CORAL,
      borderColor: 'transparent',
      borderWidth: 0,
    },
    pillText: {
      fontFamily: 'strenuous',
      fontWeight: 'bold',
      color: CREAM,
      textAlign: 'center',
      fontSize: 15,
      lineHeight: 20,
    },
    pillTextSelected: {
      color: '#2D2D2D',
    },
    saveButtonSection: {
      paddingTop: spacingPresets.sm,
    },
    saveButton: activityPrefsSaveButton,
  };

  // ── Privacy sheet ──

  const privacySheetStyles: PrivacySheetStyles = {
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: SHEET_BG,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: spacingPresets.lg1,
      paddingBottom: 40,
    },
    dragHandle: {
      width: SHEET_DRAG_HANDLE_WIDTH,
      height: SHEET_DRAG_HANDLE_HEIGHT,
      borderRadius: SHEET_DRAG_HANDLE_HEIGHT / 2,
      backgroundColor: 'rgba(255, 245, 236, 0.3)',
      alignSelf: 'center',
      marginTop: spacingPresets.md1,
      marginBottom: spacingPresets.md1,
    },
    titleRow: {
      paddingBottom: spacingPresets.md2,
    },
    title: {
      fontFamily: 'strenuous',
      fontWeight: 'bold',
      fontSize: 20,
      color: CREAM,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      height: SETTING_ROW_HEIGHT,
      borderBottomWidth: 1,
      borderBottomColor: ROW_DIVIDER,
    },
    toggleRowLast: {
      flexDirection: 'row',
      alignItems: 'center',
      height: SETTING_ROW_HEIGHT,
    },
    toggleLabel: {
      fontFamily: 'strenuous',
      fontSize: 15,
      color: CREAM,
      flex: 1,
    },
  };

  // ── Sign out confirm sheet ──

  const signOutConfirmButton = overrideStyles(buttonPresets.Primary, {
    container: {
      backgroundColor: CORAL,
      borderRadius: 14,
      height: 52,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontFamily: 'strenuous',
      fontWeight: 'bold',
      color: CREAM,
      fontSize: 17,
    },
  });

  const signOutConfirmSheetStyles: SignOutConfirmSheetStyles = {
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: SHEET_BG,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: spacingPresets.lg1,
      paddingBottom: 40,
    },
    dragHandle: {
      width: SHEET_DRAG_HANDLE_WIDTH,
      height: SHEET_DRAG_HANDLE_HEIGHT,
      borderRadius: SHEET_DRAG_HANDLE_HEIGHT / 2,
      backgroundColor: 'rgba(255, 245, 236, 0.3)',
      alignSelf: 'center',
      marginTop: spacingPresets.md1,
      marginBottom: spacingPresets.md1,
    },
    title: {
      fontFamily: 'strenuous',
      fontWeight: 'bold',
      fontSize: 20,
      color: CREAM,
      textAlign: 'center',
      paddingVertical: spacingPresets.lg1,
    },
    confirmButton: signOutConfirmButton,
    cancelLinkRow: {
      alignItems: 'center',
      paddingTop: spacingPresets.lg1,
    },
    cancelLink: {
      fontFamily: 'strenuous',
      fontSize: 15,
      color: CORAL,
    },
  };

  // ── Toast styles ──

  const toastStyles: ToastStyles = {
    container: {
      backgroundColor: '#243660',
      borderRadius: 12,
      paddingHorizontal: spacingPresets.lg1,
      paddingVertical: spacingPresets.md1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    text: {
      fontFamily: 'strenuous',
      fontSize: 14,
      color: CREAM,
      textAlign: 'center',
    },
  };

  // Unused constants referenced to satisfy linter
  void TOGGLE_OFF;
  void TOGGLE_ON;
  void LOCK_COLOR;

  return createAppPageStyles<ProfileStyles>({
    styles,
    loadingStyles,
    statItemStyles,
    activityCardStyles,
    settingsSheetStyles,
    editProfileSheetStyles,
    verifySheetStyles,
    notificationsSheetStyles,
    activityPrefsSheetStyles,
    privacySheetStyles,
    signOutConfirmSheetStyles,
    toastStyles,
  });
}

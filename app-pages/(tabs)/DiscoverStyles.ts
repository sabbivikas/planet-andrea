import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';

// ── Sub-component style interfaces ──

export interface HeaderStyles {
  container: ViewStyle;
  logoText: TextStyle;
  locationContainer: ViewStyle;
  locationIcon: ViewStyle;
  locationText: TextStyle;
  bellContainer: ViewStyle;
  bellIcon: ViewStyle;
  badgeContainer: ViewStyle;
  badgeText: TextStyle;
}

export interface CityPickerStyles {
  overlay: ViewStyle;
  sheet: ViewStyle;
  sheetTitle: TextStyle;
  cityItem: ViewStyle;
  cityItemSelected: ViewStyle;
  cityText: TextStyle;
  cityTextSelected: TextStyle;
}

export interface CardStyles {
  wrapper: ViewStyle;
  container: ViewStyle;
  nextCard: ViewStyle;
  image: ImageStyle;
  imageOverlay: ViewStyle;
  contentContainer: ViewStyle;
  venueName: TextStyle;
  activityTitle: TextStyle;
  metaRow: ViewStyle;
  metaItem: ViewStyle;
  metaIcon: ViewStyle;
  metaText: TextStyle;
  categoryBadge: ViewStyle;
  categoryBadgeText: TextStyle;
  dealBanner: ViewStyle;
  dealBannerText: TextStyle;
  swipeOverlay: ViewStyle;
  swipeLikeOverlay: ViewStyle;
  swipePassOverlay: ViewStyle;
  swipeSuperLikeOverlay: ViewStyle;
  swipeOverlayText: TextStyle;
  swipeLikeText: TextStyle;
  swipePassText: TextStyle;
  swipeSuperLikeText: TextStyle;
  swipeScrollDownOverlay: ViewStyle;
  swipeScrollDownText: TextStyle;
}

export interface ActionButtonsStyles {
  container: ViewStyle;
  undoButton: CustomButtonStyles;
  infoButton: CustomButtonStyles;
  superLikeButton: CustomButtonStyles;
  scrollDownButton: CustomButtonStyles;
}

export interface GroupIndicatorsStyles {
  container: ViewStyle;
  label: TextStyle;
  avatarsRow: ViewStyle;
  avatarContainer: ViewStyle;
  avatarText: TextStyle;
  swipingDot: ViewStyle;
}

export interface EmptyStateStyles {
  container: ViewStyle;
  iconContainer: ViewStyle;
  illustration: ImageStyle;
  title: TextStyle;
  subtitle: TextStyle;
  refreshButtonContainer: ViewStyle;
  refreshButton: CustomButtonStyles;
}

export interface InfoSheetStyles {
  overlay: ViewStyle;
  sheet: ViewStyle;
  activityName: TextStyle;
  venueName: TextStyle;
  categoryPill: ViewStyle;
  categoryPillText: TextStyle;
  price: TextStyle;
  description: TextStyle;
  dealBanner: ViewStyle;
  dealBannerText: TextStyle;
  metaRow: ViewStyle;
  closeButton: ViewStyle;
}

// ── Main styles interface ──

export interface DiscoverBaseStyles {
  safeArea: ViewStyle;
  container: ViewStyle;
  cardArea: ViewStyle;
}

export interface DiscoverStyles {
  styles: DiscoverBaseStyles;
  headerStyles: HeaderStyles;
  cityPickerStyles: CityPickerStyles;
  cardStyles: CardStyles;
  actionButtonsStyles: ActionButtonsStyles;
  groupIndicatorsStyles: GroupIndicatorsStyles;
  emptyStateStyles: EmptyStateStyles;
  infoSheetStyles: InfoSheetStyles;
}

/**
 * Custom hook that provides styles for the Discover component
 */
export function useDiscoverStyles(): DiscoverStyles {
  const {
    createAppPageStyles,
    colors,
    typographyPresets,
    buttonPresets,
    spacingPresets,
    borderRadiusPresets,
    overrideStyles,
    dimensions,
  } = useStyleContext();

  const CARD_WIDTH = dimensions.width - spacingPresets.lg1 * 2;
  const CARD_HEIGHT = dimensions.height * 0.58;
  const CARD_BORDER_RADIUS = 20;

  // ── Base page styles ──

  const styles: DiscoverBaseStyles = {
    safeArea: {
      flex: 1,
      backgroundColor: colors.customColors.deepNavy,
    },
    container: {
      flex: 1,
      backgroundColor: colors.customColors.deepNavy,
    },
    cardArea: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  };

  // ── Header ──

  const headerStyles: HeaderStyles = {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: spacingPresets.lg1,
      paddingRight: 16,
      paddingVertical: spacingPresets.md1,
      overflow: 'visible',
    },
    logoText: {
      ...typographyPresets.Title,
      fontFamily: 'comba',
      color: colors.customColors.cream,
      fontWeight: '800',
      fontSize: 22,
      lineHeight: 28,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 245, 236, 0.1)',
      paddingHorizontal: spacingPresets.md1,
      paddingVertical: spacingPresets.xs,
      borderRadius: 20,
      gap: spacingPresets.xs,
    },
    locationIcon: {
      width: 18,
      height: 18,
    },
    locationText: {
      fontFamily: 'tt-autonomous-mono',
      color: '#FFF5EC',
      fontSize: 13,
      lineHeight: 18,
    },
    bellContainer: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'visible',
    },
    bellIcon: {
      width: 24,
      height: 24,
    },
    badgeContainer: {
      position: 'absolute',
      top: 4,
      right: 2,
      backgroundColor: colors.primaryAccent,
      borderRadius: 9,
      minWidth: 18,
      height: 18,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    badgeText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.customColors.cream,
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '700',
    },
  };

  // ── City Picker ──

  const cityPickerStyles: CityPickerStyles = {
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: '#1B2A4A',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: spacingPresets.lg1,
      paddingTop: spacingPresets.lg1,
      paddingBottom: 40,
    },
    sheetTitle: {
      fontFamily: 'strenuous',
      fontWeight: 'bold',
      color: '#FFF5EC',
      fontSize: 18,
      lineHeight: 24,
      marginBottom: spacingPresets.md2,
      textAlign: 'center',
    },
    cityItem: {
      paddingVertical: 14,
      paddingHorizontal: spacingPresets.md2,
      borderRadius: 12,
      marginBottom: 4,
    },
    cityItemSelected: {
      backgroundColor: 'rgba(207, 255, 71, 0.15)',
    },
    cityText: {
      fontFamily: 'tt-autonomous-mono',
      color: '#FFF5EC',
      fontSize: 15,
      lineHeight: 20,
    },
    cityTextSelected: {
      color: '#CFFF47',
      fontWeight: '700',
    },
  };

  // ── Card ──

  const cardStyles: CardStyles = {
    wrapper: {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      alignItems: 'center',
      justifyContent: 'center',
    },
    container: {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      borderRadius: CARD_BORDER_RADIUS,
      overflow: 'hidden',
      backgroundColor: colors.customColors.deepNavy,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 8,
    },
    nextCard: {
      position: 'absolute',
      width: CARD_WIDTH - 20,
      height: CARD_HEIGHT - 10,
      borderRadius: CARD_BORDER_RADIUS,
      overflow: 'hidden',
      backgroundColor: colors.customColors.deepNavy,
      top: 5,
      opacity: 0.6,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    image: {
      width: '100%',
      height: '100%',
      borderRadius: CARD_BORDER_RADIUS,
    },
    imageOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '50%',
      borderBottomLeftRadius: CARD_BORDER_RADIUS,
      borderBottomRightRadius: CARD_BORDER_RADIUS,
    },
    contentContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: spacingPresets.md2,
      paddingBottom: spacingPresets.md2,
      gap: spacingPresets.xs,
    },
    venueName: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.8)',
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    activityTitle: {
      ...typographyPresets.Title,
      color: colors.customColors.cream,
      fontSize: 24,
      lineHeight: 30,
      fontWeight: '800',
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacingPresets.md1,
      marginTop: spacingPresets.xxs,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    metaIcon: {
      width: 14,
      height: 14,
    },
    metaText: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.9)',
      fontSize: 13,
      lineHeight: 18,
    },
    categoryBadge: {
      position: 'absolute',
      top: spacingPresets.md2,
      left: spacingPresets.md2,
      backgroundColor: 'rgba(255, 245, 236, 0.9)',
      paddingHorizontal: spacingPresets.sm,
      paddingVertical: spacingPresets.xxs + 1,
      borderRadius: 12,
    },
    categoryBadgeText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.customColors.inkBlack,
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    dealBanner: {
      position: 'absolute',
      top: spacingPresets.md2,
      right: spacingPresets.md2,
      backgroundColor: colors.primaryAccent,
      paddingHorizontal: spacingPresets.sm,
      paddingVertical: spacingPresets.xxs + 1,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    dealBannerText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.customColors.cream,
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '700',
    },
    swipeOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: CARD_BORDER_RADIUS,
      alignItems: 'center',
      justifyContent: 'center',
    },
    swipeLikeOverlay: {
      backgroundColor: 'rgba(255, 92, 77, 0.4)',
    },
    swipePassOverlay: {
      backgroundColor: 'rgba(100, 100, 100, 0.4)',
    },
    swipeSuperLikeOverlay: {
      backgroundColor: 'rgba(207, 255, 71, 0.35)',
    },
    swipeOverlayText: {
      ...typographyPresets.Slogan,
      fontSize: 36,
      lineHeight: 42,
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: 2,
    },
    swipeLikeText: {
      color: colors.primaryAccent,
    },
    swipePassText: {
      color: '#AAAAAA',
    },
    swipeSuperLikeText: {
      fontFamily: 'comba',
      color: colors.customColors.voltGreen,
    },
    swipeScrollDownOverlay: {
      backgroundColor: 'rgba(255, 92, 77, 0.4)',
    },
    swipeScrollDownText: {
      fontFamily: 'comba',
      color: colors.primaryAccent,
    },
  };

  // ── Action Buttons ──

  const actionButtonsStyles: ActionButtonsStyles = {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      paddingVertical: spacingPresets.md2,
    },
    undoButton: overrideStyles(buttonPresets.Secondary, {
      container: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'rgba(255, 245, 236, 0.1)',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 245, 236, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 0,
        paddingVertical: 0,
      },
      pressedContainer: {
        backgroundColor: 'rgba(255, 245, 236, 0.2)',
      },
      disabledContainer: {
        opacity: 0.35,
        backgroundColor: 'rgba(255, 245, 236, 0.05)',
        borderColor: 'rgba(255, 245, 236, 0.1)',
      },
      icon: {
        size: 22,
        color: colors.customColors.cream,
      },
      disabledIcon: {
        color: 'rgba(255, 245, 236, 0.3)',
      },
    }),
    infoButton: overrideStyles(buttonPresets.Secondary, {
      container: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'rgba(255, 245, 236, 0.1)',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 245, 236, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 0,
        paddingVertical: 0,
      },
      pressedContainer: {
        backgroundColor: 'rgba(255, 245, 236, 0.2)',
      },
      icon: {
        size: 22,
        color: colors.customColors.cream,
      },
    }),
    superLikeButton: overrideStyles(buttonPresets.Primary, {
      container: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.customColors.voltGreen,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 0,
        paddingVertical: 0,
        shadowColor: colors.customColors.voltGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6,
      },
      pressedContainer: {
        backgroundColor: '#B8E63E',
      },
      icon: {
        size: 28,
        color: colors.customColors.inkBlack,
      },
    }),
    scrollDownButton: overrideStyles(buttonPresets.Primary, {
      container: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.primaryAccent,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 0,
        paddingVertical: 0,
        shadowColor: colors.primaryAccent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6,
      },
      pressedContainer: {
        backgroundColor: colors.primaryAccentDark,
      },
      icon: {
        size: 28,
        color: colors.customColors.inkBlack,
      },
    }),
  };

  // ── Group Indicators ──

  const groupIndicatorsStyles: GroupIndicatorsStyles = {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: spacingPresets.md1,
      gap: spacingPresets.sm,
    },
    label: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.5)',
      fontSize: 12,
      lineHeight: 16,
    },
    avatarsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: -4,
    },
    avatarContainer: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.tertiaryBackground,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.customColors.deepNavy,
    },
    avatarText: {
      ...typographyPresets.Caption,
      color: colors.customColors.cream,
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '700',
    },
    swipingDot: {
      position: 'absolute',
      bottom: -1,
      right: -1,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.customColors.voltGreen,
      borderWidth: 1.5,
      borderColor: colors.customColors.deepNavy,
    },
  };

  // ── Empty State ──

  const emptyStateStyles: EmptyStateStyles = {
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacingPresets.lg1,
      gap: spacingPresets.md1,
    },
    iconContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacingPresets.sm,
    },
    illustration: {
      height: 200,
      resizeMode: 'contain',
    },
    title: {
      fontFamily: 'strenuous',
      fontWeight: 'bold',
      color: '#FFF5EC',
      textAlign: 'center',
      fontSize: 22,
      lineHeight: 28,
    },
    subtitle: {
      fontFamily: 'tt-autonomous-mono',
      color: 'rgba(255, 245, 236, 0.6)',
      textAlign: 'center',
      fontSize: 15,
      lineHeight: 22,
      maxWidth: 280,
    },
    refreshButtonContainer: {
      alignSelf: 'stretch',
      marginTop: spacingPresets.md1,
    },
    refreshButton: overrideStyles(buttonPresets.Primary, {
      container: {
        alignSelf: 'stretch',
        backgroundColor: '#CFFF47',
        borderRadius: 14,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
      },
      pressedContainer: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
      },
      text: {
        fontFamily: 'strenuous',
        fontWeight: 'bold',
        color: '#2D2D2D',
        fontSize: 17,
        lineHeight: 22,
      },
      pressedText: {
        color: '#2D2D2D',
      },
    }),
  };

  // ── Info Sheet ──

  const infoSheetStyles: InfoSheetStyles = {
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: '#1B2A4A',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: spacingPresets.lg1,
      paddingTop: spacingPresets.lg1,
      paddingBottom: 40,
      gap: spacingPresets.md1,
    },
    activityName: {
      fontFamily: 'strenuous',
      fontWeight: 'bold',
      color: '#FFF5EC',
      fontSize: 22,
      lineHeight: 28,
    },
    venueName: {
      fontFamily: 'tt-autonomous-mono',
      color: 'rgba(255, 245, 236, 0.6)',
      fontSize: 14,
      lineHeight: 20,
    },
    categoryPill: {
      alignSelf: 'flex-start',
      backgroundColor: '#FF5C4D',
      paddingHorizontal: spacingPresets.sm,
      paddingVertical: spacingPresets.xxs + 1,
      borderRadius: 12,
    },
    categoryPillText: {
      fontFamily: 'tt-autonomous-mono',
      color: '#2D2D2D',
      fontSize: 12,
      lineHeight: 16,
    },
    price: {
      fontFamily: 'tt-autonomous-mono',
      color: '#CFFF47',
      fontSize: 14,
      lineHeight: 20,
    },
    description: {
      fontFamily: 'strenuous',
      color: '#FFF5EC',
      fontSize: 15,
      lineHeight: 22,
    },
    dealBanner: {
      backgroundColor: '#FF5C4D',
      borderRadius: 12,
      padding: 12,
    },
    dealBannerText: {
      fontFamily: 'strenuous',
      color: '#FFF5EC',
      fontSize: 14,
      lineHeight: 20,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacingPresets.md1,
    },
    closeButton: {
      alignSelf: 'flex-end',
      padding: spacingPresets.xs,
    },
  };

  return createAppPageStyles<DiscoverStyles>({
    styles,
    headerStyles,
    cityPickerStyles,
    cardStyles,
    actionButtonsStyles,
    groupIndicatorsStyles,
    emptyStateStyles,
    infoSheetStyles,
  });
}

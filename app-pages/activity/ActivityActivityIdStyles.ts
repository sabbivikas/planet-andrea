import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';

// ── Sub-component style interfaces ──

export interface HeroImageStyles {
  container: ViewStyle;
  image: ImageStyle;
  gradientOverlay: ViewStyle;
  backButton: CustomButtonStyles;
  backButtonContainer: ViewStyle;
  indicatorRow: ViewStyle;
  indicatorDot: ViewStyle;
  indicatorDotActive: ViewStyle;
}

export interface VenueInfoStyles {
  container: ViewStyle;
  venueName: TextStyle;
  activityTitle: TextStyle;
  metaRow: ViewStyle;
  metaItem: ViewStyle;
  metaIcon: ViewStyle;
  metaText: TextStyle;
  categoryBadge: ViewStyle;
  categoryBadgeText: TextStyle;
  tagsRow: ViewStyle;
  tag: ViewStyle;
  tagText: TextStyle;
  starIconColor: string;
  secondaryIconColor: string;
}

export interface DealBannerStyles {
  container: ViewStyle;
  topRow: ViewStyle;
  discountBadge: ViewStyle;
  discountBadgeText: TextStyle;
  headline: TextStyle;
  detailsRow: ViewStyle;
  expiryText: TextStyle;
  termsText: TextStyle;
  viewDealButton: CustomButtonStyles;
}

export interface DealModalStyles {
  overlay: ViewStyle;
  sheet: ViewStyle;
  header: ViewStyle;
  discountBadge: ViewStyle;
  discountBadgeText: TextStyle;
  headline: TextStyle;
  detailsText: TextStyle;
  termsText: TextStyle;
  divider: ViewStyle;
  redeemButton: CustomButtonStyles;
  closeButton: ViewStyle;
  closeIconColor: string;
}

export interface DescriptionStyles {
  container: ViewStyle;
  sectionTitle: TextStyle;
  text: TextStyle;
  readMoreText: TextStyle;
}

export interface VenueContactStyles {
  container: ViewStyle;
  sectionTitle: TextStyle;
  row: ViewStyle;
  rowIcon: ViewStyle;
  rowTextContainer: ViewStyle;
  rowLabel: TextStyle;
  rowValue: TextStyle;
  rowIconColor: string;
}

export interface MapPreviewStyles {
  container: ViewStyle;
  map: ViewStyle;
  mapAddressBar: ViewStyle;
  mapAddressText: TextStyle;
  mapTapHint: TextStyle;
  pinContainer: ViewStyle;
}

export interface ReviewCardStyles {
  container: ViewStyle;
  sectionTitle: TextStyle;
  scrollContent: ViewStyle;
  card: ViewStyle;
  cardHeader: ViewStyle;
  avatar: ViewStyle;
  avatarText: TextStyle;
  authorName: TextStyle;
  sourceText: TextStyle;
  starsRow: ViewStyle;
  starIcon: ViewStyle;
  reviewText: TextStyle;
  starActiveColor: string;
  starInactiveColor: string;
}

export interface GroupInterestStyles {
  container: ViewStyle;
  iconContainer: ViewStyle;
  text: TextStyle;
  iconColor: string;
}

export interface ActionBarStyles {
  container: ViewStyle;
  innerContainer: ViewStyle;
  likeButton: CustomButtonStyles;
  likeButtonActive: CustomButtonStyles;
  shareButton: CustomButtonStyles;
  getDealButton: CustomButtonStyles;
}

export interface LoadingStyles {
  container: ViewStyle;
  indicatorColor: string;
}

export interface ErrorStyles {
  container: ViewStyle;
  iconContainer: ViewStyle;
  iconColor: string;
  title: TextStyle;
  subtitle: TextStyle;
}

// ── Main styles interface ──

export interface ActivityActivityIdBaseStyles {
  scrollContainer: ViewStyle;
  scrollContent: ViewStyle;
  contentContainer: ViewStyle;
  sectionDivider: ViewStyle;
}

export interface ActivityActivityIdStyles {
  styles: ActivityActivityIdBaseStyles;
  heroImageStyles: HeroImageStyles;
  venueInfoStyles: VenueInfoStyles;
  dealBannerStyles: DealBannerStyles;
  dealModalStyles: DealModalStyles;
  descriptionStyles: DescriptionStyles;
  venueContactStyles: VenueContactStyles;
  mapPreviewStyles: MapPreviewStyles;
  reviewCardStyles: ReviewCardStyles;
  groupInterestStyles: GroupInterestStyles;
  actionBarStyles: ActionBarStyles;
  loadingStyles: LoadingStyles;
  errorStyles: ErrorStyles;
}

/**
 * Custom hook that provides styles for the ActivityActivityId component
 */
export function useActivityActivityIdStyles(): ActivityActivityIdStyles {
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

  const HERO_HEIGHT = dimensions.height * 0.42;
  const CARD_BORDER_RADIUS = 16;
  const ACTION_BAR_HEIGHT = 88;
  const REVIEW_CARD_WIDTH = 260;

  // ── Base page styles ──

  const styles: ActivityActivityIdBaseStyles = {
    scrollContainer: {
      flex: 1,
      backgroundColor: colors.customColors.deepNavy,
    },
    scrollContent: {
      paddingBottom: ACTION_BAR_HEIGHT + spacingPresets.lg1,
    },
    contentContainer: {
      paddingHorizontal: spacingPresets.lg1,
      gap: spacingPresets.lg1,
      paddingTop: spacingPresets.lg1,
    },
    sectionDivider: {
      height: 1,
      backgroundColor: 'rgba(255, 245, 236, 0.08)',
    },
  };

  // ── Hero Image ──

  const heroImageStyles: HeroImageStyles = {
    container: {
      width: dimensions.width,
      height: HERO_HEIGHT,
      overflow: 'hidden',
    },
    image: {
      width: dimensions.width,
      height: HERO_HEIGHT,
    },
    gradientOverlay: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
    backButton: overrideStyles(buttonPresets.Secondary, {
      container: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(27, 42, 74, 0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 0,
        paddingVertical: 0,
        borderWidth: 0,
      },
      pressedContainer: {
        backgroundColor: 'rgba(27, 42, 74, 0.85)',
      },
      icon: {
        size: 22,
        color: colors.customColors.cream,
      },
    }),
    backButtonContainer: {
      position: 'absolute',
      left: spacingPresets.md2,
      zIndex: 10,
    },
    indicatorRow: {
      position: 'absolute',
      bottom: spacingPresets.md2,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacingPresets.sm,
    },
    indicatorDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(255, 245, 236, 0.4)',
    },
    indicatorDotActive: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.customColors.cream,
    },
  };

  // ── Venue Info ──

  const venueInfoStyles: VenueInfoStyles = {
    container: {
      gap: spacingPresets.sm,
    },
    venueName: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.7)',
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    activityTitle: {
      ...typographyPresets.PageTitle,
      color: colors.customColors.cream,
      fontSize: 28,
      lineHeight: 34,
      fontWeight: '800',
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacingPresets.md2,
      marginTop: spacingPresets.xxs,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaIcon: {
      width: 16,
      height: 16,
    },
    metaText: {
      ...typographyPresets.Label,
      color: 'rgba(255, 245, 236, 0.85)',
      fontSize: 14,
      lineHeight: 18,
    },
    categoryBadge: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(255, 245, 236, 0.12)',
      paddingHorizontal: spacingPresets.md1,
      paddingVertical: spacingPresets.xxs + 1,
      borderRadius: 14,
      marginTop: spacingPresets.xs,
    },
    categoryBadgeText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.customColors.cream,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    tagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacingPresets.sm,
      marginTop: spacingPresets.xs,
    },
    tag: {
      backgroundColor: 'rgba(255, 245, 236, 0.08)',
      paddingHorizontal: spacingPresets.sm,
      paddingVertical: spacingPresets.xxs,
      borderRadius: 10,
    },
    tagText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: 'rgba(255, 245, 236, 0.6)',
      fontSize: 12,
      lineHeight: 16,
    },
    starIconColor: colors.customColors.voltGreen,
    secondaryIconColor: 'rgba(255, 245, 236, 0.85)',
  };

  // ── Deal Banner ──

  const dealBannerStyles: DealBannerStyles = {
    container: {
      backgroundColor: colors.primaryAccent,
      borderRadius: CARD_BORDER_RADIUS,
      padding: spacingPresets.md2,
      gap: spacingPresets.md1,
      shadowColor: colors.primaryAccent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacingPresets.sm,
    },
    discountBadge: {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      paddingHorizontal: spacingPresets.sm,
      paddingVertical: spacingPresets.xxs,
      borderRadius: 8,
    },
    discountBadgeText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: '#FFFFFF',
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    headline: {
      ...typographyPresets.Subtitle,
      color: '#FFFFFF',
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '700',
      flex: 1,
    },
    detailsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    expiryText: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 255, 255, 0.85)',
      fontSize: 12,
      lineHeight: 16,
    },
    termsText: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: 11,
      lineHeight: 16,
    },
    viewDealButton: overrideStyles(buttonPresets.Primary, {
      container: {
        backgroundColor: colors.customColors.voltGreen,
        borderRadius: 12,
        paddingHorizontal: spacingPresets.md2,
        paddingVertical: spacingPresets.sm,
        alignSelf: 'flex-start',
      },
      pressedContainer: {
        backgroundColor: 'rgba(207, 255, 71, 0.85)',
      },
      text: {
        color: colors.primaryAccent,
        fontWeight: '700',
        fontSize: 14,
        lineHeight: 18,
      },
    }),
  };

  // ── Deal Modal ──

  const dealModalStyles: DealModalStyles = {
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.primaryAccent,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: spacingPresets.lg1,
      gap: spacingPresets.md1,
      paddingBottom: spacingPresets.xl,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    discountBadge: {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      paddingHorizontal: spacingPresets.sm,
      paddingVertical: spacingPresets.xxs,
      borderRadius: 8,
    },
    discountBadgeText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: '#FFFFFF',
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    headline: {
      ...typographyPresets.Subtitle,
      color: '#FFFFFF',
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '700',
    },
    detailsText: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 255, 255, 0.85)',
      fontSize: 12,
      lineHeight: 16,
    },
    termsText: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: 11,
      lineHeight: 16,
    },
    divider: {
      height: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      marginVertical: spacingPresets.sm,
    },
    redeemButton: overrideStyles(buttonPresets.Primary, {
      container: {
        backgroundColor: colors.customColors.voltGreen,
        borderRadius: borderRadiusPresets.components,
        paddingVertical: spacingPresets.md2,
      },
      pressedContainer: {
        backgroundColor: 'rgba(207, 255, 71, 0.85)',
      },
      text: {
        color: colors.primaryAccent,
        fontWeight: '900',
        fontSize: 17,
        lineHeight: 22,
        fontFamily: 'SpaceGrotesk',
      },
      icon: {
        color: colors.primaryAccent,
      },
    }),
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeIconColor: 'rgba(255, 255, 255, 0.9)',
  };

  // ── Description ──

  const descriptionStyles: DescriptionStyles = {
    container: {
      gap: spacingPresets.md1,
    },
    sectionTitle: {
      ...typographyPresets.Label,
      color: 'rgba(255, 245, 236, 0.5)',
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '700',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
    },
    text: {
      ...typographyPresets.Body,
      color: 'rgba(255, 245, 236, 0.8)',
      fontSize: 15,
      lineHeight: 24,
    },
    readMoreText: {
      ...typographyPresets.Label,
      color: colors.primaryAccent,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: '600',
      marginTop: spacingPresets.xs,
    },
  };

  // ── Venue Contact ──

  const venueContactStyles: VenueContactStyles = {
    container: {
      gap: spacingPresets.md2,
    },
    sectionTitle: {
      ...typographyPresets.Label,
      color: 'rgba(255, 245, 236, 0.5)',
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '700',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacingPresets.md1,
    },
    rowIcon: {
      width: 20,
      height: 20,
      marginTop: 2,
    },
    rowTextContainer: {
      flex: 1,
      gap: spacingPresets.xxs,
    },
    rowLabel: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.5)',
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    rowValue: {
      ...typographyPresets.Body,
      color: colors.customColors.cream,
      fontSize: 15,
      lineHeight: 22,
    },
    rowIconColor: 'rgba(255, 245, 236, 0.6)',
  };

  const mapPreviewStyles: MapPreviewStyles = {
    container: {
      borderRadius: CARD_BORDER_RADIUS,
      overflow: 'hidden',
    },
    map: {
      height: 180,
      width: '100%',
    },
    mapAddressBar: {
      backgroundColor: 'rgba(255, 245, 236, 0.06)',
      borderBottomLeftRadius: CARD_BORDER_RADIUS,
      borderBottomRightRadius: CARD_BORDER_RADIUS,
      borderWidth: 1,
      borderTopWidth: 0,
      borderColor: 'rgba(255, 245, 236, 0.08)',
      paddingVertical: spacingPresets.sm,
      paddingHorizontal: spacingPresets.md2,
      alignItems: 'center',
      gap: 2,
    },
    pinContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255, 92, 77, 0.9)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.customColors.cream,
    },
    mapAddressText: {
      ...typographyPresets.Label,
      color: colors.customColors.cream,
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'center',
    },
    mapTapHint: {
      ...typographyPresets.Caption,
      color: colors.primaryAccent,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '600',
    },
  };

  // ── Reviews ──

  const reviewCardStyles: ReviewCardStyles = {
    container: {
      gap: spacingPresets.md2,
      flexGrow: 0,
    },
    sectionTitle: {
      ...typographyPresets.Label,
      color: 'rgba(255, 245, 236, 0.5)',
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '700',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      paddingHorizontal: spacingPresets.lg1,
    },
    scrollContent: {
      paddingHorizontal: spacingPresets.lg1,
      gap: spacingPresets.md1,
    },
    card: {
      width: REVIEW_CARD_WIDTH,
      backgroundColor: 'rgba(255, 245, 236, 0.06)',
      borderRadius: CARD_BORDER_RADIUS,
      padding: spacingPresets.md2,
      gap: spacingPresets.sm,
      borderWidth: 1,
      borderColor: 'rgba(255, 245, 236, 0.06)',
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacingPresets.sm,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primaryAccent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      ...typographyPresets.Caption,
      color: '#FFFFFF',
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '700',
    },
    authorName: {
      ...typographyPresets.Label,
      color: colors.customColors.cream,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: '600',
      flex: 1,
    },
    sourceText: {
      ...typographyPresets.Caption,
      color: 'rgba(255, 245, 236, 0.4)',
      fontSize: 11,
      lineHeight: 16,
    },
    starsRow: {
      flexDirection: 'row',
      gap: 2,
    },
    starIcon: {
      width: 14,
      height: 14,
    },
    reviewText: {
      ...typographyPresets.Body,
      color: 'rgba(255, 245, 236, 0.75)',
      fontSize: 14,
      lineHeight: 21,
    },
    starActiveColor: colors.customColors.voltGreen,
    starInactiveColor: 'rgba(255, 245, 236, 0.2)',
  };

  // ── Group Interest ──

  const groupInterestStyles: GroupInterestStyles = {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacingPresets.md1,
      backgroundColor: 'rgba(255, 245, 236, 0.06)',
      borderRadius: CARD_BORDER_RADIUS,
      padding: spacingPresets.md2,
      borderWidth: 1,
      borderColor: 'rgba(255, 245, 236, 0.06)',
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(207, 255, 71, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      ...typographyPresets.Label,
      color: colors.customColors.cream,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: '600',
      flex: 1,
    },
    iconColor: colors.customColors.voltGreen,
  };

  // ── Action Bar ──

  const actionBarStyles: ActionBarStyles = {
    container: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(27, 42, 74, 0.95)',
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 245, 236, 0.08)',
    },
    innerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacingPresets.lg1,
      paddingTop: spacingPresets.md1,
      gap: spacingPresets.md1,
    },
    likeButton: overrideStyles(buttonPresets.Secondary, {
      container: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'rgba(255, 245, 236, 0.08)',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 245, 236, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 0,
        paddingVertical: 0,
      },
      pressedContainer: {
        backgroundColor: 'rgba(255, 92, 77, 0.2)',
      },
      icon: {
        size: 24,
        color: colors.customColors.cream,
      },
    }),
    likeButtonActive: overrideStyles(buttonPresets.Secondary, {
      container: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'rgba(255, 92, 77, 0.2)',
        borderWidth: 1.5,
        borderColor: colors.primaryAccent,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 0,
        paddingVertical: 0,
      },
      pressedContainer: {
        backgroundColor: 'rgba(255, 92, 77, 0.3)',
      },
      icon: {
        size: 24,
        color: colors.primaryAccent,
      },
    }),
    shareButton: overrideStyles(buttonPresets.Secondary, {
      container: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'rgba(255, 245, 236, 0.08)',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 245, 236, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 0,
        paddingVertical: 0,
      },
      pressedContainer: {
        backgroundColor: 'rgba(255, 245, 236, 0.15)',
      },
      icon: {
        size: 22,
        color: colors.customColors.cream,
      },
    }),
    getDealButton: overrideStyles(buttonPresets.Primary, {
      container: {
        flex: 1,
        backgroundColor: colors.customColors.voltGreen,
        borderRadius: 26,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacingPresets.lg1,
        shadowColor: colors.customColors.voltGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
      },
      pressedContainer: {
        backgroundColor: '#B8E63E',
      },
      text: {
        color: colors.customColors.inkBlack,
        fontWeight: '800',
        fontSize: 16,
        lineHeight: 20,
        letterSpacing: 0.5,
      },
      icon: {
        size: 20,
        color: colors.customColors.inkBlack,
      },
    }),
  };

  // ── Loading ──

  const loadingStyles: LoadingStyles = {
    container: {
      flex: 1,
      backgroundColor: colors.customColors.deepNavy,
      alignItems: 'center',
      justifyContent: 'center',
    },
    indicatorColor: colors.primaryAccent,
  };

  // ── Error ──

  const errorStyles: ErrorStyles = {
    container: {
      flex: 1,
      backgroundColor: colors.customColors.deepNavy,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacingPresets.lg2,
      gap: spacingPresets.md1,
    },
    iconContainer: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: 'rgba(255, 92, 77, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacingPresets.sm,
    },
    iconColor: colors.primaryAccent,
    title: {
      ...typographyPresets.Title,
      color: colors.customColors.cream,
      textAlign: 'center',
      fontSize: 22,
      lineHeight: 28,
    },
    subtitle: {
      ...typographyPresets.Body,
      color: 'rgba(255, 245, 236, 0.5)',
      textAlign: 'center',
      fontSize: 15,
      lineHeight: 22,
      maxWidth: 280,
    },
  };

  return createAppPageStyles<ActivityActivityIdStyles>({
    styles,
    heroImageStyles,
    venueInfoStyles,
    dealBannerStyles,
    dealModalStyles,
    descriptionStyles,
    venueContactStyles,
    mapPreviewStyles,
    reviewCardStyles,
    groupInterestStyles,
    actionBarStyles,
    loadingStyles,
    errorStyles,
  });
}

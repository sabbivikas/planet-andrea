/**
 * Styling for the Dashboard page
 */
import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';
import { CustomHeaderStyles } from '@/comp-lib/custom-header/CustomHeaderStyles';
import { useCustomHeaderStyles } from '@/comp-lib/custom-header/CustomHeaderStyles';

// ── Sub-component style interfaces ──

export interface MetricCardStyles {
  container: ViewStyle;
  value: TextStyle;
  label: TextStyle;
  trendRow: ViewStyle;
  trendIconWrapper: ViewStyle;
  trendTextUp: TextStyle;
  trendTextDown: TextStyle;
  trendTextFlat: TextStyle;
}

export interface PromotionCardStyles {
  container: ViewStyle;
  badgeRow: ViewStyle;
  badge: ViewStyle;
  badgeText: TextStyle;
  lowBudgetBadge: ViewStyle;
  lowBudgetBadgeText: TextStyle;
  title: TextStyle;
  detailsRow: ViewStyle;
  detailText: TextStyle;
  budgetText: TextStyle;
  budgetTextLow: TextStyle;
}

export interface FeedItemStyles {
  container: ViewStyle;
  iconWrapper: ViewStyle;
  groupInterestIconWrapper: ViewStyle;
  dealRedeemedIconWrapper: ViewStyle;
  superLikeIconWrapper: ViewStyle;
  contentContainer: ViewStyle;
  description: TextStyle;
  timeAgo: TextStyle;
  groupInterestIconColor: string;
  dealRedeemedIconColor: string;
  superLikeIconColor: string;
}

export interface AlertItemStyles {
  container: ViewStyle;
  warningContainer: ViewStyle;
  infoContainer: ViewStyle;
  iconWrapper: ViewStyle;
  message: TextStyle;
  warningIconColor: string;
  infoIconColor: string;
}

export interface UpgradePromptStyles {
  container: ViewStyle;
  iconWrapper: ViewStyle;
  textContainer: ViewStyle;
  title: TextStyle;
  description: TextStyle;
  iconColor: string;
}

export interface VenueIdentityStyles {
  container: ViewStyle;
  logoContainer: ViewStyle;
  logo: ImageStyle;
  logoPlaceholder: ViewStyle;
  infoContainer: ViewStyle;
  name: TextStyle;
  badgeRow: ViewStyle;
  badgeIconWrapper: ViewStyle;
  badgeText: TextStyle;
  unverifiedText: TextStyle;
}

/**
 * Interface for base styles of the useDashboardStyles hook
 */
export interface DashboardBaseStyles {
  safeArea: ViewStyle;
  scrollContent: ViewStyle;
  sectionContainer: ViewStyle;
  sectionTitle: TextStyle;
  metricsGrid: ViewStyle;
  metricsRow: ViewStyle;
  quickActionsContainer: ViewStyle;
  quickActionsRow: ViewStyle;
  emptyText: TextStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
}

/**
 * Interface for the return value of the useDashboardStyles hook
 */
export interface DashboardStyles {
  styles: DashboardBaseStyles;
  headerStyles: CustomHeaderStyles;
  venueIdentityStyles: VenueIdentityStyles;
  metricCardStyles: MetricCardStyles;
  promotionCardStyles: PromotionCardStyles;
  feedItemStyles: FeedItemStyles;
  alertItemStyles: AlertItemStyles;
  upgradePromptStyles: UpgradePromptStyles;
  manageActivitiesButtonStyles: CustomButtonStyles;
  manageDealsButtonStyles: CustomButtonStyles;
  viewAnalyticsButtonStyles: CustomButtonStyles;
  upgradeButtonStyles: CustomButtonStyles;
}

const LOGO_SIZE = 56;
const METRIC_ICON_SIZE = 16;
const FEED_ICON_SIZE = 36;
const ALERT_ICON_SIZE = 20;
const BADGE_ICON_SIZE = 14;
const UPGRADE_ICON_SIZE = 40;

/**
 * Custom hook that provides styles for the Dashboard component
 */
export function useDashboardStyles(): DashboardStyles {
  const {
    createAppPageStyles,
    colors,
    typographyPresets,
    buttonPresets,
    spacingPresets,
    borderRadiusPresets,
    overrideStyles,
  } = useStyleContext();

  const styles: DashboardBaseStyles = {
    safeArea: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    scrollContent: {
      paddingBottom: spacingPresets.xl,
    },
    sectionContainer: {
      paddingHorizontal: spacingPresets.lg1,
      marginTop: spacingPresets.lg1,
    },
    sectionTitle: {
      ...typographyPresets.Label,
      color: colors.secondaryForeground,
      letterSpacing: 1.2,
      marginBottom: spacingPresets.md1,
    },
    metricsGrid: {
      paddingHorizontal: spacingPresets.lg1,
      marginTop: spacingPresets.lg1,
    },
    metricsRow: {
      flexDirection: 'row',
      gap: spacingPresets.md1,
      marginBottom: spacingPresets.md1,
    },
    quickActionsContainer: {
      paddingHorizontal: spacingPresets.lg1,
      marginTop: spacingPresets.lg1,
      gap: spacingPresets.sm,
    },
    quickActionsRow: {
      flexDirection: 'row',
      gap: spacingPresets.sm,
    },
    emptyText: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
      textAlign: 'center',
      paddingVertical: spacingPresets.md2,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryBackground,
    },
    loadingText: {
      ...typographyPresets.Body,
      color: colors.secondaryForeground,
      marginTop: spacingPresets.md1,
    },
  };

  const defaultHeaderStyles = useCustomHeaderStyles();
  const headerStyles = overrideStyles(defaultHeaderStyles, {
    container: {
      backgroundColor: 'transparent',
    },
    title: {
      ...typographyPresets.Title,
      color: colors.primaryForeground,
    },
  });

  const venueIdentityStyles: VenueIdentityStyles = {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacingPresets.md2,
      paddingVertical: spacingPresets.md2,
      marginHorizontal: spacingPresets.lg1,
      marginTop: spacingPresets.sm,
      backgroundColor: colors.secondaryBackground,
      borderRadius: borderRadiusPresets.components,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    logoContainer: {
      width: LOGO_SIZE,
      height: LOGO_SIZE,
      borderRadius: borderRadiusPresets.inputElements,
      overflow: 'hidden',
      backgroundColor: colors.tertiaryBackground,
    },
    logo: {
      width: LOGO_SIZE,
      height: LOGO_SIZE,
    },
    logoPlaceholder: {
      width: LOGO_SIZE,
      height: LOGO_SIZE,
      borderRadius: borderRadiusPresets.inputElements,
      backgroundColor: colors.tertiaryBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoContainer: {
      flex: 1,
      marginLeft: spacingPresets.md2,
    },
    name: {
      ...typographyPresets.Title,
      color: colors.primaryForeground,
    },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacingPresets.xs,
      gap: spacingPresets.xs,
    },
    badgeIconWrapper: {
      width: BADGE_ICON_SIZE,
      height: BADGE_ICON_SIZE,
    },
    badgeText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.customColors.voltGreen,
    },
    unverifiedText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.secondaryForeground,
    },
  };

  const metricCardStyles: MetricCardStyles = {
    container: {
      flex: 1,
      backgroundColor: colors.secondaryBackground,
      borderRadius: borderRadiusPresets.components,
      paddingVertical: spacingPresets.md2,
      paddingHorizontal: spacingPresets.md1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    value: {
      ...typographyPresets.PageTitle,
      color: colors.primaryForeground,
      fontSize: 26,
      lineHeight: 32,
    },
    label: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
      marginTop: spacingPresets.xs,
    },
    trendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacingPresets.sm,
      gap: spacingPresets.xxs,
    },
    trendIconWrapper: {
      width: METRIC_ICON_SIZE,
      height: METRIC_ICON_SIZE,
    },
    trendTextUp: {
      ...typographyPresets.Caption,
      color: colors.customColors.success,
      fontWeight: '700',
    },
    trendTextDown: {
      ...typographyPresets.Caption,
      color: colors.customColors.error,
      fontWeight: '700',
    },
    trendTextFlat: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
    },
  };

  const promotionCardStyles: PromotionCardStyles = {
    container: {
      backgroundColor: colors.secondaryBackground,
      borderRadius: borderRadiusPresets.components,
      padding: spacingPresets.md2,
      marginBottom: spacingPresets.sm,
      borderLeftWidth: 3,
      borderLeftColor: colors.customColors.voltGreen,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacingPresets.sm,
    },
    badge: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(207, 255, 71, 0.15)',
      borderRadius: 6,
      paddingHorizontal: spacingPresets.sm,
      paddingVertical: spacingPresets.xxs,
    },
    badgeText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.customColors.voltGreen,
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 1,
      fontWeight: '700',
    },
    lowBudgetBadge: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(255, 152, 0, 0.15)',
      borderRadius: 6,
      paddingHorizontal: spacingPresets.sm,
      paddingVertical: spacingPresets.xxs,
      marginLeft: spacingPresets.xs,
      marginBottom: spacingPresets.sm,
    },
    lowBudgetBadgeText: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.customColors.warning,
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 1,
      fontWeight: '700',
    },
    title: {
      ...typographyPresets.Label,
      color: colors.primaryForeground,
    },
    detailsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacingPresets.sm,
    },
    detailText: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
    },
    budgetText: {
      ...typographyPresets.Caption,
      color: colors.customColors.voltGreen,
      fontWeight: '600',
    },
    budgetTextLow: {
      ...typographyPresets.Caption,
      color: colors.customColors.warning,
      fontWeight: '600',
    },
  };

  const feedItemStyles: FeedItemStyles = {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacingPresets.md1,
      borderBottomWidth: 1,
      borderBottomColor: colors.tertiaryBackground,
    },
    iconWrapper: {
      width: FEED_ICON_SIZE,
      height: FEED_ICON_SIZE,
      borderRadius: FEED_ICON_SIZE / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    groupInterestIconWrapper: {
      backgroundColor: 'rgba(207, 255, 71, 0.15)',
    },
    dealRedeemedIconWrapper: {
      backgroundColor: 'rgba(255, 92, 77, 0.15)',
    },
    superLikeIconWrapper: {
      backgroundColor: 'rgba(255, 154, 60, 0.15)',
    },
    contentContainer: {
      flex: 1,
      marginLeft: spacingPresets.md1,
    },
    description: {
      ...typographyPresets.Caption,
      color: colors.primaryForeground,
      fontSize: 13,
      lineHeight: 18,
    },
    timeAgo: {
      ...typographyPresets.Caption,
      fontFamily: 'tt-autonomous-mono',
      color: colors.secondaryForeground,
      marginTop: spacingPresets.xxs,
      fontSize: 11,
      lineHeight: 14,
    },
    groupInterestIconColor: colors.customColors.voltGreen,
    dealRedeemedIconColor: colors.primaryAccent,
    superLikeIconColor: colors.customColors.heroGradientEnd,
  };

  const alertItemStyles: AlertItemStyles = {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacingPresets.md1,
      borderRadius: borderRadiusPresets.inputElements,
      marginBottom: spacingPresets.sm,
    },
    warningContainer: {
      backgroundColor: 'rgba(255, 152, 0, 0.12)',
    },
    infoContainer: {
      backgroundColor: 'rgba(207, 255, 71, 0.08)',
    },
    iconWrapper: {
      width: ALERT_ICON_SIZE,
      height: ALERT_ICON_SIZE,
      marginRight: spacingPresets.md1,
    },
    message: {
      ...typographyPresets.Caption,
      color: colors.primaryForeground,
      flex: 1,
      fontSize: 13,
      lineHeight: 18,
    },
    warningIconColor: colors.customColors.warning,
    infoIconColor: colors.customColors.voltGreen,
  };

  const upgradePromptStyles: UpgradePromptStyles = {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: spacingPresets.lg1,
      marginTop: spacingPresets.lg1,
      padding: spacingPresets.md2,
      borderRadius: borderRadiusPresets.components,
      borderWidth: 1,
      borderColor: colors.primaryAccent,
      backgroundColor: colors.secondaryBackground,
      shadowColor: colors.primaryAccent,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 3,
    },
    iconWrapper: {
      width: UPGRADE_ICON_SIZE,
      height: UPGRADE_ICON_SIZE,
      borderRadius: UPGRADE_ICON_SIZE / 2,
      backgroundColor: 'rgba(255, 92, 77, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacingPresets.md1,
    },
    textContainer: {
      flex: 1,
      marginRight: spacingPresets.md1,
    },
    title: {
      ...typographyPresets.Label,
      color: colors.primaryAccent,
      fontWeight: '700',
    },
    description: {
      ...typographyPresets.Caption,
      color: colors.secondaryForeground,
      marginTop: spacingPresets.xxs,
    },
    iconColor: colors.primaryAccent,
  };

  const manageActivitiesButtonStyles = overrideStyles(buttonPresets.Primary, {
    container: {
      flex: 1,
      backgroundColor: colors.customColors.voltGreen,
      borderRadius: borderRadiusPresets.inputElements,
      paddingVertical: spacingPresets.md1,
    },
    text: {
      ...typographyPresets.Button,
      color: colors.customColors.inkBlack,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '700',
    },
    icon: {
      color: colors.customColors.inkBlack,
    },
  });

  const manageDealsButtonStyles = overrideStyles(buttonPresets.Primary, {
    container: {
      flex: 1,
      backgroundColor: colors.primaryAccent,
      borderRadius: borderRadiusPresets.inputElements,
      paddingVertical: spacingPresets.md1,
    },
    text: {
      ...typographyPresets.Button,
      color: '#FFFFFF',
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '700',
    },
    icon: {
      color: '#FFFFFF',
    },
  });

  const viewAnalyticsButtonStyles = overrideStyles(buttonPresets.Secondary, {
    container: {
      flex: 1,
      borderColor: colors.secondaryForeground,
      borderWidth: 1,
      borderRadius: borderRadiusPresets.inputElements,
      paddingVertical: spacingPresets.md1,
      backgroundColor: 'transparent',
    },
    text: {
      ...typographyPresets.Button,
      color: colors.primaryForeground,
      fontSize: 13,
      lineHeight: 18,
    },
    icon: {
      color: colors.primaryForeground,
    },
  });

  const upgradeButtonStyles = overrideStyles(buttonPresets.Primary, {
    container: {
      backgroundColor: colors.primaryAccent,
      borderRadius: borderRadiusPresets.inputElements,
      paddingVertical: spacingPresets.sm,
      paddingHorizontal: spacingPresets.md2,
    },
    text: {
      ...typographyPresets.Button,
      color: '#FFFFFF',
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '700',
    },
  });

  return createAppPageStyles<DashboardStyles>({
    styles,
    headerStyles,
    venueIdentityStyles,
    metricCardStyles,
    promotionCardStyles,
    feedItemStyles,
    alertItemStyles,
    upgradePromptStyles,
    manageActivitiesButtonStyles,
    manageDealsButtonStyles,
    viewAnalyticsButtonStyles,
    upgradeButtonStyles,
  });
}

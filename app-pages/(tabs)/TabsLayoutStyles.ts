import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { type TextStyle } from 'react-native';

import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { useTabLayoutStyles } from '@/comp-lib/styles/useTabLayoutStyles';

export interface TabsLayoutBaseStyles {}

export interface TabBadgeStyle {
  tabBarBadgeStyle: TextStyle;
}

export interface TabsLayoutStyles {
  styles: TabsLayoutBaseStyles;
  // MUST NOT add tabBarStyle as it is already handled in useTabLayoutStyles and will break UI otherwise
  tabsLayoutOptions: BottomTabNavigationOptions;
  badgeStyle: TabBadgeStyle;
}

export function useTabsLayoutStyles(): TabsLayoutStyles {
  const { colors, scaleProperties, spacingPresets } = useStyleContext();

  const tabsLayoutOptions = useTabLayoutStyles({
    tabBarBackgroundColor: colors.customColors.deepNavy,
    tabBarActiveTintColor: colors.primaryAccent,
    tabBarInactiveTintColor: colors.customColors.cream,
  });
  const scaledTabsLayoutOptions = scaleProperties<BottomTabNavigationOptions>(tabsLayoutOptions);

  const styles: TabsLayoutBaseStyles = {};
  const scaledStyles = scaleProperties<TabsLayoutBaseStyles>(styles);

  const badgeStyle: TabBadgeStyle = {
    tabBarBadgeStyle: {
      backgroundColor: colors.primaryAccent,
      color: colors.customColors.cream,
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '700',
      minWidth: 18,
      height: 18,
      borderRadius: 9,
    },
  };
  const scaledBadgeStyle = scaleProperties<TabBadgeStyle>(badgeStyle);

  return { styles: scaledStyles, tabsLayoutOptions: scaledTabsLayoutOptions, badgeStyle: scaledBadgeStyle };
}

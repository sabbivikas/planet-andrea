import { type ReactNode } from 'react';
import 'react-native-reanimated';

import { Tabs } from 'expo-router';
import { Compass, Zap, User } from 'lucide-react-native';

import { t } from '@/i18n';
import { TabBarIcon } from '@/comp-lib/navigation/TabBarIcon';
import { PlanetIcon } from '@/comp-app/PlanetIcon';
import { TabSafeAreaWrapper } from '@/comp-lib/navigation/TabSafeAreaWrapper';
import { TabsLayoutProps } from '@/app/(tabs)/_layout';
import { useTabsLayoutStyles } from './TabsLayoutStyles';
import { useTabsLayout } from './TabsLayoutFunc';

export default function TabsLayoutContainer(props: TabsLayoutProps): ReactNode {
  const { tabsLayoutOptions, badgeStyle } = useTabsLayoutStyles();
  const { pendingInviteCount, activeBattleCount } = useTabsLayout(props);

  return (
    <TabSafeAreaWrapper>
      <Tabs initialRouteName="discover" screenOptions={tabsLayoutOptions}>
        <Tabs.Screen
          name="discover"
          options={{
            title: t('tabBar.discover'),
            headerShown: false,
            tabBarIcon: ({ color }) => <TabBarIcon Icon={Compass} color={color} size={24} />,
          }}
        />

        <Tabs.Screen
          name="groups"
          options={{
            title: t('tabBar.groups'),
            headerShown: false,
            tabBarIcon: ({ color }) => <PlanetIcon color={color} size={24} />,
            tabBarBadge: pendingInviteCount,
            tabBarBadgeStyle: badgeStyle.tabBarBadgeStyle,
          }}
        />

        <Tabs.Screen
          name="battles"
          options={{
            title: t('tabBar.battles'),
            headerShown: false,
            tabBarIcon: ({ color }) => <TabBarIcon Icon={Zap} color={color} size={24} />,
            tabBarBadge: activeBattleCount,
            tabBarBadgeStyle: badgeStyle.tabBarBadgeStyle,
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: t('tabBar.profile'),
            headerShown: false,
            tabBarIcon: ({ color }) => <TabBarIcon Icon={User} color={color} size={24} />,
          }}
        />
      </Tabs>
    </TabSafeAreaWrapper>
  );
}

/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams, Stack } from 'expo-router';

import { useStackLayoutStyles } from '@/comp-lib/styles/useStackLayoutStyles';
import { useNav } from '@/comp-lib/navigation/useNav';
import BusinessLayoutContainer from '@/app-pages/business/BusinessLayoutContainer';

export type BusinessLayoutUrlParams = UnknownOutputParams;

export interface BusinessLayoutProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: BusinessLayoutUrlParams;
  /**
   * Sets the navigation options using navigation.setOptions()
   * @param options The options to set
   * @returns void
   */
  setNavigationOptions: (options?: Record<string, any>) => void;
}

/**
 * Business dashboard layout for venue owners
 */
export default function BusinessLayout(): ReactNode {
  const { defaultScreenOptions: defaultStackLayoutOptions } = useStackLayoutStyles();
  const { urlParams, setOptions } = useNav<BusinessLayoutUrlParams>({ auth: true });

  return (
    <BusinessLayoutContainer urlParams={urlParams} setNavigationOptions={setOptions}>
      <Stack screenOptions={{ ...defaultStackLayoutOptions, headerShown: false }}>
        <Stack.Screen
          name="dashboard"
          options={{
            title: 'Business Dashboard',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="activities"
          options={{
            title: 'Manage Activities',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="deals"
          options={{
            title: 'Manage Deals',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="analytics"
          options={{
            title: 'Analytics',
            headerShown: false,
          }}
        />
      </Stack>
    </BusinessLayoutContainer>
  );
}

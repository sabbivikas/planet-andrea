/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams, Stack } from 'expo-router';

import { useStackLayoutStyles } from '@/comp-lib/styles/useStackLayoutStyles';
import { useNav } from '@/comp-lib/navigation/useNav';
import ActivityLayoutContainer from '@/app-pages/activity/ActivityLayoutContainer';

export type ActivityLayoutUrlParams = UnknownOutputParams;

export interface ActivityLayoutProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: ActivityLayoutUrlParams;
  /**
   * Sets the navigation options using navigation.setOptions()
   * @param options The options to set
   * @returns void
   */
  setNavigationOptions: (options?: Record<string, any>) => void;
}

/**
 * Activity related pages layout
 */
export default function ActivityLayout(): ReactNode {
  const { defaultScreenOptions: defaultStackLayoutOptions } = useStackLayoutStyles();
  const { urlParams, setOptions } = useNav<ActivityLayoutUrlParams>({ auth: true });

  return (
    <ActivityLayoutContainer urlParams={urlParams} setNavigationOptions={setOptions}>
      <Stack screenOptions={{ ...defaultStackLayoutOptions, headerShown: false }}>
        <Stack.Screen
          name="[activityId]"
          options={{
            title: 'Activity Details',
            headerShown: false,
          }}
        />
      </Stack>
    </ActivityLayoutContainer>
  );
}

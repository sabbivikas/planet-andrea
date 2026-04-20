/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams, Stack } from 'expo-router';

import { useStackLayoutStyles } from '@/comp-lib/styles/useStackLayoutStyles';
import { useNav } from '@/comp-lib/navigation/useNav';
import GroupLayoutContainer from '@/app-pages/group/GroupLayoutContainer';

export type GroupLayoutUrlParams = UnknownOutputParams;

export interface GroupLayoutProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: GroupLayoutUrlParams;
  /**
   * Sets the navigation options using navigation.setOptions()
   * @param options The options to set
   * @returns void
   */
  setNavigationOptions: (options?: Record<string, any>) => void;
}

/**
 * Group related pages layout
 */
export default function GroupLayout(): ReactNode {
  const { defaultScreenOptions: defaultStackLayoutOptions } = useStackLayoutStyles();
  const { urlParams, setOptions } = useNav<GroupLayoutUrlParams>({ auth: true });

  return (
    <GroupLayoutContainer urlParams={urlParams} setNavigationOptions={setOptions}>
      <Stack screenOptions={{ ...defaultStackLayoutOptions, headerShown: false }}>
        <Stack.Screen
          name="create"
          options={{
            title: 'Create Group',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="[groupId]"
          options={{
            title: 'Group Details',
            headerShown: false,
          }}
        />
      </Stack>
    </GroupLayoutContainer>
  );
}

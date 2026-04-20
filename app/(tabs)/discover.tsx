/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams } from 'expo-router';

import { useNav } from '@/comp-lib/navigation/useNav';
import { type ActivityActivityIdUrlParams } from '@/app/activity/[activityId]';
import { type NotificationsUrlParams } from '@/app/notifications';
import DiscoverContainer from '@/app-pages/(tabs)/DiscoverContainer';

export type TabsDiscoverUrlParams = UnknownOutputParams;

export interface DiscoverProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: TabsDiscoverUrlParams;
  /**
   * Sets the navigation options using navigation.setOptions()
   * @param options The options to set
   * @returns void
   */
  setNavigationOptions: (options?: Record<string, any>) => void;

  /**
   * View full activity details from swipe card
   */
  onNavigateToActivityDetail: (urlParams: ActivityActivityIdUrlParams) => void;
  /**
   * Open notifications from header
   */
  onNavigateToNotifications: (urlParams?: NotificationsUrlParams) => void;
}

/**
 * Activity swiping and discovery feed - core app experience
 */
export default function DiscoverPage(props: DiscoverProps): ReactNode {
  const { urlParams, setOptions, navigate } = useNav<TabsDiscoverUrlParams>({ auth: true });
  /**
   * View full activity details from swipe card
   */
  const onNavigateToActivityDetail = (urlParams: ActivityActivityIdUrlParams) => {
    navigate({
      pathname: '/activity/[activityId]',
      params: urlParams,
    });
  };
  /**
   * Open notifications from header
   */
  const onNavigateToNotifications = (urlParams?: NotificationsUrlParams) => {
    navigate({
      pathname: '/notifications',
      params: urlParams,
    });
  };

  return (
    <DiscoverContainer
      children={props.children}
      urlParams={urlParams}
      setNavigationOptions={setOptions}
      onNavigateToActivityDetail={onNavigateToActivityDetail}
      onNavigateToNotifications={onNavigateToNotifications}
    />
  );
}

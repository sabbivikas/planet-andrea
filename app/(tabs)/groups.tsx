/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams } from 'expo-router';

import { useNav } from '@/comp-lib/navigation/useNav';
import { type GroupCreateUrlParams } from '@/app/group/create';
import { type GroupGroupIdUrlParams } from '@/app/group/[groupId]';
import { type NotificationsUrlParams } from '@/app/notifications';
import GroupsContainer from '@/app-pages/(tabs)/GroupsContainer';

export type TabsGroupsUrlParams = UnknownOutputParams;

export interface GroupsProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: TabsGroupsUrlParams;
  /**
   * Sets the navigation options using navigation.setOptions()
   * @param options The options to set
   * @returns void
   */
  setNavigationOptions: (options?: Record<string, any>) => void;

  /**
   * Create a new group
   */
  onNavigateToCreateGroup: (urlParams?: GroupCreateUrlParams) => void;
  /**
   * View specific group details
   */
  onNavigateToGroupDetail: (urlParams: GroupGroupIdUrlParams) => void;
  /**
   * Open notifications from header
   */
  onNavigateToNotifications: (urlParams?: NotificationsUrlParams) => void;
}

/**
 * View and manage friend groups
 */
export default function GroupsPage(props: GroupsProps): ReactNode {
  const { urlParams, setOptions, navigate } = useNav<TabsGroupsUrlParams>({ auth: true });
  /**
   * Create a new group
   */
  const onNavigateToCreateGroup = (urlParams?: GroupCreateUrlParams) => {
    navigate({
      pathname: '/group/create',
      params: urlParams,
    });
  };
  /**
   * View specific group details
   */
  const onNavigateToGroupDetail = (urlParams: GroupGroupIdUrlParams) => {
    navigate({
      pathname: '/group/[groupId]',
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
    <GroupsContainer
      children={props.children}
      urlParams={urlParams}
      setNavigationOptions={setOptions}
      onNavigateToCreateGroup={onNavigateToCreateGroup}
      onNavigateToGroupDetail={onNavigateToGroupDetail}
      onNavigateToNotifications={onNavigateToNotifications}
    />
  );
}

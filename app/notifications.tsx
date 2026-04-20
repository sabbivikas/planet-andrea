/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams } from 'expo-router';

import { useNav } from '@/comp-lib/navigation/useNav';
import { type GroupGroupIdUrlParams } from '@/app/group/[groupId]';
import { type GroupIdBattleUrlParams } from '@/app/group/[groupId]/battle';
import NotificationsContainer from '@/app-pages/NotificationsContainer';

export type NotificationsUrlParams = UnknownOutputParams;

export interface NotificationsProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: NotificationsUrlParams;
  /**
   * Sets the navigation options using navigation.setOptions()
   * @param options The options to set
   * @returns void
   */
  setNavigationOptions: (options?: Record<string, any>) => void;

  /**
   * Return to previous screen
   */
  onGoBack: () => void;
  /**
   * Open group from notification
   */
  onNavigateToGroupDetail: (urlParams: GroupGroupIdUrlParams) => void;
  /**
   * Join battle from notification
   */
  onNavigateToBattle: (urlParams: GroupIdBattleUrlParams) => void;
}

/**
 * Activity updates, group invites, and battle notifications
 */
export default function NotificationsPage(props: NotificationsProps): ReactNode {
  const { urlParams, setOptions, back, navigate } = useNav<NotificationsUrlParams>({ auth: true });
  /**
   * Return to previous screen
   */
  const onGoBack = () => {
    back();
  };
  /**
   * Open group from notification
   */
  const onNavigateToGroupDetail = (urlParams: GroupGroupIdUrlParams) => {
    navigate({
      pathname: '/group/[groupId]',
      params: urlParams,
    });
  };
  /**
   * Join battle from notification
   */
  const onNavigateToBattle = (urlParams: GroupIdBattleUrlParams) => {
    navigate({
      pathname: '/group/[groupId]/battle',
      params: urlParams,
    });
  };

  return (
    <NotificationsContainer
      children={props.children}
      urlParams={urlParams}
      setNavigationOptions={setOptions}
      onGoBack={onGoBack}
      onNavigateToGroupDetail={onNavigateToGroupDetail}
      onNavigateToBattle={onNavigateToBattle}
    />
  );
}

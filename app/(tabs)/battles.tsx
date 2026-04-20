/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams } from 'expo-router';

import { useNav } from '@/comp-lib/navigation/useNav';
import { type GroupIdBattleUrlParams } from '@/app/group/[groupId]/battle';
import { type GroupIdResultsUrlParams } from '@/app/group/[groupId]/results';
import { type NotificationsUrlParams } from '@/app/notifications';
import BattlesContainer from '@/app-pages/(tabs)/BattlesContainer';

export type TabsBattlesUrlParams = UnknownOutputParams;

export interface BattlesProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: TabsBattlesUrlParams;
  /**
   * Sets the navigation options using navigation.setOptions()
   * @param options The options to set
   * @returns void
   */
  setNavigationOptions: (options?: Record<string, any>) => void;

  /**
   * Join active battle for a group
   */
  onNavigateToGroupBattle: (urlParams: GroupIdBattleUrlParams) => void;
  /**
   * View battle results for a group
   */
  onNavigateToGroupResults: (urlParams: GroupIdResultsUrlParams) => void;
  /**
   * Open notifications from header
   */
  onNavigateToNotifications: (urlParams?: NotificationsUrlParams) => void;
}

/**
 * Active voting battles and results
 */
export default function BattlesPage(props: BattlesProps): ReactNode {
  const { urlParams, setOptions, navigate } = useNav<TabsBattlesUrlParams>({ auth: true });
  /**
   * Join active battle for a group
   */
  const onNavigateToGroupBattle = (urlParams: GroupIdBattleUrlParams) => {
    navigate({
      pathname: '/group/[groupId]/battle',
      params: urlParams,
    });
  };
  /**
   * View battle results for a group
   */
  const onNavigateToGroupResults = (urlParams: GroupIdResultsUrlParams) => {
    navigate({
      pathname: '/group/[groupId]/results',
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
    <BattlesContainer
      children={props.children}
      urlParams={urlParams}
      setNavigationOptions={setOptions}
      onNavigateToGroupBattle={onNavigateToGroupBattle}
      onNavigateToGroupResults={onNavigateToGroupResults}
      onNavigateToNotifications={onNavigateToNotifications}
    />
  );
}

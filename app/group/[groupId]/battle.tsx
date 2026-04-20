/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams } from 'expo-router';

import { useNav } from '@/comp-lib/navigation/useNav';
import { type GroupIdResultsUrlParams } from '@/app/group/[groupId]/results';
import BattleContainer from '@/app-pages/group/[groupId]/BattleContainer';

export type GroupIdBattleUrlParams = UnknownOutputParams & {
  groupId: string;
};

export interface BattleProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: GroupIdBattleUrlParams;
  /**
   * Sets the navigation options using navigation.setOptions()
   * @param options The options to set
   * @returns void
   */
  setNavigationOptions: (options?: Record<string, any>) => void;

  /**
   * Return to group detail
   */
  onGoBack: () => void;
  /**
   * View results after battle completes
   */
  onNavigateToResults: (urlParams: GroupIdResultsUrlParams) => void;
}

/**
 * Live voting battle for the group
 */
export default function BattlePage(props: BattleProps): ReactNode {
  const { urlParams, setOptions, back, replace } = useNav<GroupIdBattleUrlParams>({ auth: true });
  /**
   * Return to group detail
   */
  const onGoBack = () => {
    back();
  };
  /**
   * View results after battle completes
   */
  const onNavigateToResults = (urlParams: GroupIdResultsUrlParams) => {
    replace({
      pathname: '/group/[groupId]/results',
      params: urlParams,
    });
  };

  return (
    <BattleContainer
      children={props.children}
      urlParams={urlParams}
      setNavigationOptions={setOptions}
      onGoBack={onGoBack}
      onNavigateToResults={onNavigateToResults}
    />
  );
}

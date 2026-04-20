/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams } from 'expo-router';

import { useNav } from '@/comp-lib/navigation/useNav';
import { type ActivityActivityIdUrlParams } from '@/app/activity/[activityId]';
import { type GroupIdInviteUrlParams } from '@/app/group/[groupId]/invite';
import ResultsContainer from '@/app-pages/group/[groupId]/ResultsContainer';

export type GroupIdResultsUrlParams = UnknownOutputParams & {
  groupId: string;
};

export interface ResultsProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: GroupIdResultsUrlParams;
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
   * View winning activity details
   */
  onNavigateToActivityDetail: (urlParams: ActivityActivityIdUrlParams) => void;
  /**
   * Share the plan with others
   */
  onNavigateToInvite: (urlParams: GroupIdInviteUrlParams) => void;
}

/**
 * Battle results and final plan
 */
export default function ResultsPage(props: ResultsProps): ReactNode {
  const { urlParams, setOptions, back, navigate } = useNav<GroupIdResultsUrlParams>({ auth: true });
  /**
   * Return to group detail
   */
  const onGoBack = () => {
    back();
  };
  /**
   * View winning activity details
   */
  const onNavigateToActivityDetail = (urlParams: ActivityActivityIdUrlParams) => {
    navigate({
      pathname: '/activity/[activityId]',
      params: urlParams,
    });
  };
  /**
   * Share the plan with others
   */
  const onNavigateToInvite = (urlParams: GroupIdInviteUrlParams) => {
    navigate({
      pathname: '/group/[groupId]/invite',
      params: urlParams,
    });
  };

  return (
    <ResultsContainer
      children={props.children}
      urlParams={urlParams}
      setNavigationOptions={setOptions}
      onGoBack={onGoBack}
      onNavigateToActivityDetail={onNavigateToActivityDetail}
      onNavigateToInvite={onNavigateToInvite}
    />
  );
}

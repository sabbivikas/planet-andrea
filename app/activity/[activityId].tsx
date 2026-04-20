/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams } from 'expo-router';

import { useNav } from '@/comp-lib/navigation/useNav';
import { type ActivityIdDealUrlParams } from '@/app/activity/[activityId]/deal';
import ActivityActivityIdContainer from '@/app-pages/activity/ActivityActivityIdContainer';

export type ActivityActivityIdUrlParams = UnknownOutputParams & {
  activityId: string;
};

export interface ActivityActivityIdProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: ActivityActivityIdUrlParams;
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
   * View and redeem deal
   */
  onNavigateToDeal: (urlParams: ActivityIdDealUrlParams) => void;
}

/**
 * Full activity card with details and deals
 */
export default function ActivityActivityIdPage(props: ActivityActivityIdProps): ReactNode {
  const { urlParams, setOptions, back, navigate } = useNav<ActivityActivityIdUrlParams>({ auth: true });
  /**
   * Return to previous screen
   */
  const onGoBack = () => {
    back();
  };
  /**
   * View and redeem deal
   */
  const onNavigateToDeal = (urlParams: ActivityIdDealUrlParams) => {
    navigate({
      pathname: '/activity/[activityId]/deal',
      params: urlParams,
    });
  };

  return (
    <ActivityActivityIdContainer
      children={props.children}
      urlParams={urlParams}
      setNavigationOptions={setOptions}
      onGoBack={onGoBack}
      onNavigateToDeal={onNavigateToDeal}
    />
  );
}

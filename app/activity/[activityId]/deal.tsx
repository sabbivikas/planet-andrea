/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams } from 'expo-router';

import { useNav } from '@/comp-lib/navigation/useNav';
import { type TabsDiscoverUrlParams } from '@/app/(tabs)/discover';
import DealContainer from '@/app-pages/activity/[activityId]/DealContainer';

export type ActivityIdDealUrlParams = UnknownOutputParams & {
  activityId: string;
};

export interface DealProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: ActivityIdDealUrlParams;
  /**
   * Sets the navigation options using navigation.setOptions()
   * @param options The options to set
   * @returns void
   */
  setNavigationOptions: (options?: Record<string, any>) => void;

  /**
   * Return to activity detail
   */
  onGoBack: () => void;
  /**
   * Return to discover after redeeming deal
   */
  onDismissToDiscover: (urlParams?: TabsDiscoverUrlParams) => void;
}

/**
 * Deal redemption page
 */
export default function DealPage(props: DealProps): ReactNode {
  const { urlParams, setOptions, back, dismissTo } = useNav<ActivityIdDealUrlParams>({ auth: true });
  /**
   * Return to activity detail
   */
  const onGoBack = () => {
    back();
  };
  /**
   * Return to discover after redeeming deal
   */
  const onDismissToDiscover = (urlParams?: TabsDiscoverUrlParams) => {
    dismissTo({
      pathname: '/(tabs)/discover',
      params: urlParams,
    });
  };

  return (
    <DealContainer
      children={props.children}
      urlParams={urlParams}
      setNavigationOptions={setOptions}
      onGoBack={onGoBack}
      onDismissToDiscover={onDismissToDiscover}
    />
  );
}

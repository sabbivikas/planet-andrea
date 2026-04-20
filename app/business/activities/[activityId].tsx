/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams } from 'expo-router';

import { useNav } from '@/comp-lib/navigation/useNav';
import { type BusinessActivitiesUrlParams } from '@/app/business/activities';
import ActivitiesActivityIdContainer from '@/app-pages/business/activities/ActivitiesActivityIdContainer';

export type ActivitiesActivityIdUrlParams = UnknownOutputParams & {
  activityId: string;
};

export interface ActivitiesActivityIdProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: ActivitiesActivityIdUrlParams;
  /**
   * Sets the navigation options using navigation.setOptions()
   * @param options The options to set
   * @returns void
   */
  setNavigationOptions: (options?: Record<string, any>) => void;

  /**
   * Return to activities list
   */
  onGoBack: () => void;
  /**
   * Return to activities list after saving changes
   */
  onNavigateToActivitiesAfterSave: (urlParams?: BusinessActivitiesUrlParams) => void;
}

/**
 * Edit existing activity card
 */
export default function ActivitiesActivityIdPage(props: ActivitiesActivityIdProps): ReactNode {
  const { urlParams, setOptions, back, dismissTo } = useNav<ActivitiesActivityIdUrlParams>({ auth: true });
  /**
   * Return to activities list
   */
  const onGoBack = () => {
    back();
  };
  /**
   * Return to activities list after saving changes
   */
  const onNavigateToActivitiesAfterSave = (urlParams?: BusinessActivitiesUrlParams) => {
    dismissTo({
      pathname: '/business/activities',
      params: urlParams,
    });
  };

  return (
    <ActivitiesActivityIdContainer
      children={props.children}
      urlParams={urlParams}
      setNavigationOptions={setOptions}
      onGoBack={onGoBack}
      onNavigateToActivitiesAfterSave={onNavigateToActivitiesAfterSave}
    />
  );
}

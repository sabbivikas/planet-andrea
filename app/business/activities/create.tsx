/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams } from 'expo-router';

import { useNav } from '@/comp-lib/navigation/useNav';
import { type BusinessActivitiesUrlParams } from '@/app/business/activities';
import CreateContainer from '@/app-pages/business/activities/CreateContainer';

export type ActivitiesCreateUrlParams = UnknownOutputParams;

export interface CreateProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: ActivitiesCreateUrlParams;
  /**
   * Sets the navigation options using navigation.setOptions()
   * @param options The options to set
   * @returns void
   */
  setNavigationOptions: (options?: Record<string, any>) => void;

  /**
   * Cancel and return to activities list
   */
  onGoBack: () => void;
  /**
   * Return to activities list after creating
   */
  onNavigateToActivities: (urlParams?: BusinessActivitiesUrlParams) => void;
}

/**
 * Create new activity card
 */
export default function CreatePage(props: CreateProps): ReactNode {
  const { urlParams, setOptions, back, dismissTo } = useNav<ActivitiesCreateUrlParams>({ auth: true });
  /**
   * Cancel and return to activities list
   */
  const onGoBack = () => {
    back();
  };
  /**
   * Return to activities list after creating
   */
  const onNavigateToActivities = (urlParams?: BusinessActivitiesUrlParams) => {
    dismissTo({
      pathname: '/business/activities',
      params: urlParams,
    });
  };

  return (
    <CreateContainer
      children={props.children}
      urlParams={urlParams}
      setNavigationOptions={setOptions}
      onGoBack={onGoBack}
      onNavigateToActivities={onNavigateToActivities}
    />
  );
}

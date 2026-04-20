/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams } from 'expo-router';

import { useNav } from '@/comp-lib/navigation/useNav';
import { type ActivitiesCreateUrlParams } from '@/app/business/activities/create';
import { type ActivitiesActivityIdUrlParams } from '@/app/business/activities/[activityId]';
import ActivitiesContainer from '@/app-pages/business/ActivitiesContainer';

export type BusinessActivitiesUrlParams = UnknownOutputParams;

export interface ActivitiesProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: BusinessActivitiesUrlParams;
  /**
   * Sets the navigation options using navigation.setOptions()
   * @param options The options to set
   * @returns void
   */
  setNavigationOptions: (options?: Record<string, any>) => void;

  /**
   * Return to business dashboard
   */
  onGoBack: () => void;
  /**
   * Create new activity card
   */
  onNavigateToCreateActivity: (urlParams?: ActivitiesCreateUrlParams) => void;
  /**
   * Edit existing activity card
   */
  onNavigateToEditActivity: (urlParams: ActivitiesActivityIdUrlParams) => void;
}

/**
 * Manage activity cards for the venue
 */
export default function ActivitiesPage(props: ActivitiesProps): ReactNode {
  const { urlParams, setOptions, back, navigate } = useNav<BusinessActivitiesUrlParams>({ auth: true });
  /**
   * Return to business dashboard
   */
  const onGoBack = () => {
    back();
  };
  /**
   * Create new activity card
   */
  const onNavigateToCreateActivity = (urlParams?: ActivitiesCreateUrlParams) => {
    navigate({
      pathname: '/business/activities/create',
      params: urlParams,
    });
  };
  /**
   * Edit existing activity card
   */
  const onNavigateToEditActivity = (urlParams: ActivitiesActivityIdUrlParams) => {
    navigate({
      pathname: '/business/activities/[activityId]',
      params: urlParams,
    });
  };

  return (
    <ActivitiesContainer
      children={props.children}
      urlParams={urlParams}
      setNavigationOptions={setOptions}
      onGoBack={onGoBack}
      onNavigateToCreateActivity={onNavigateToCreateActivity}
      onNavigateToEditActivity={onNavigateToEditActivity}
    />
  );
}

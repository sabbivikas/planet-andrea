/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams } from 'expo-router';

import { useNav } from '@/comp-lib/navigation/useNav';
import { type BusinessActivitiesUrlParams } from '@/app/business/activities';
import { type BusinessDealsUrlParams } from '@/app/business/deals';
import { type BusinessAnalyticsUrlParams } from '@/app/business/analytics';
import DashboardContainer from '@/app-pages/business/DashboardContainer';

export type BusinessDashboardUrlParams = UnknownOutputParams;

export interface DashboardProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: BusinessDashboardUrlParams;
  /**
   * Sets the navigation options using navigation.setOptions()
   * @param options The options to set
   * @returns void
   */
  setNavigationOptions: (options?: Record<string, any>) => void;

  /**
   * Return to user profile
   */
  onGoBack: () => void;
  /**
   * Manage activity cards
   */
  onNavigateToActivities: (urlParams?: BusinessActivitiesUrlParams) => void;
  /**
   * Manage deals and coupons
   */
  onNavigateToDeals: (urlParams?: BusinessDealsUrlParams) => void;
  /**
   * View performance analytics
   */
  onNavigateToAnalytics: (urlParams?: BusinessAnalyticsUrlParams) => void;
}

/**
 * Business overview with key metrics
 */
export default function DashboardPage(props: DashboardProps): ReactNode {
  const { urlParams, setOptions, back, navigate } = useNav<BusinessDashboardUrlParams>({ auth: true });
  /**
   * Return to user profile
   */
  const onGoBack = () => {
    back();
  };
  /**
   * Manage activity cards
   */
  const onNavigateToActivities = (urlParams?: BusinessActivitiesUrlParams) => {
    navigate({
      pathname: '/business/activities',
      params: urlParams,
    });
  };
  /**
   * Manage deals and coupons
   */
  const onNavigateToDeals = (urlParams?: BusinessDealsUrlParams) => {
    navigate({
      pathname: '/business/deals',
      params: urlParams,
    });
  };
  /**
   * View performance analytics
   */
  const onNavigateToAnalytics = (urlParams?: BusinessAnalyticsUrlParams) => {
    navigate({
      pathname: '/business/analytics',
      params: urlParams,
    });
  };

  return (
    <DashboardContainer
      children={props.children}
      urlParams={urlParams}
      setNavigationOptions={setOptions}
      onGoBack={onGoBack}
      onNavigateToActivities={onNavigateToActivities}
      onNavigateToDeals={onNavigateToDeals}
      onNavigateToAnalytics={onNavigateToAnalytics}
    />
  );
}

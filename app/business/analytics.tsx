/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams } from 'expo-router';

import { useNav } from '@/comp-lib/navigation/useNav';
import AnalyticsContainer from '@/app-pages/business/AnalyticsContainer';

export type BusinessAnalyticsUrlParams = UnknownOutputParams;

export interface AnalyticsProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: BusinessAnalyticsUrlParams;
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
}

/**
 * View redemptions, group sizes, and performance metrics
 */
export default function AnalyticsPage(props: AnalyticsProps): ReactNode {
  const { urlParams, setOptions, back } = useNav<BusinessAnalyticsUrlParams>({ auth: true });
  /**
   * Return to business dashboard
   */
  const onGoBack = () => {
    back();
  };

  return (
    <AnalyticsContainer
      children={props.children}
      urlParams={urlParams}
      setNavigationOptions={setOptions}
      onGoBack={onGoBack}
    />
  );
}

/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams } from 'expo-router';

import { useNav } from '@/comp-lib/navigation/useNav';
import { type BusinessDealsUrlParams } from '@/app/business/deals';
import CreateContainer from '@/app-pages/business/deals/CreateContainer';

export type DealsCreateUrlParams = UnknownOutputParams;

export interface CreateProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: DealsCreateUrlParams;
  /**
   * Sets the navigation options using navigation.setOptions()
   * @param options The options to set
   * @returns void
   */
  setNavigationOptions: (options?: Record<string, any>) => void;

  /**
   * Cancel and return to deals list
   */
  onGoBack: () => void;
  /**
   * Return to deals list after creating
   */
  onNavigateToDeals: (urlParams?: BusinessDealsUrlParams) => void;
}

/**
 * Create new deal or coupon
 */
export default function CreatePage(props: CreateProps): ReactNode {
  const { urlParams, setOptions, back, dismissTo } = useNav<DealsCreateUrlParams>({ auth: true });
  /**
   * Cancel and return to deals list
   */
  const onGoBack = () => {
    back();
  };
  /**
   * Return to deals list after creating
   */
  const onNavigateToDeals = (urlParams?: BusinessDealsUrlParams) => {
    dismissTo({
      pathname: '/business/deals',
      params: urlParams,
    });
  };

  return (
    <CreateContainer
      children={props.children}
      urlParams={urlParams}
      setNavigationOptions={setOptions}
      onGoBack={onGoBack}
      onNavigateToDeals={onNavigateToDeals}
    />
  );
}

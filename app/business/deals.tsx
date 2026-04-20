/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams } from 'expo-router';

import { useNav } from '@/comp-lib/navigation/useNav';
import { type DealsCreateUrlParams } from '@/app/business/deals/create';
import DealsContainer from '@/app-pages/business/DealsContainer';

export type BusinessDealsUrlParams = UnknownOutputParams;

export interface DealsProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: BusinessDealsUrlParams;
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
   * Create new deal
   */
  onNavigateToCreateDeal: (urlParams?: DealsCreateUrlParams) => void;
}

/**
 * Manage deals and coupons
 */
export default function DealsPage(props: DealsProps): ReactNode {
  const { urlParams, setOptions, back, navigate } = useNav<BusinessDealsUrlParams>({ auth: true });
  /**
   * Return to business dashboard
   */
  const onGoBack = () => {
    back();
  };
  /**
   * Create new deal
   */
  const onNavigateToCreateDeal = (urlParams?: DealsCreateUrlParams) => {
    navigate({
      pathname: '/business/deals/create',
      params: urlParams,
    });
  };

  return (
    <DealsContainer
      children={props.children}
      urlParams={urlParams}
      setNavigationOptions={setOptions}
      onGoBack={onGoBack}
      onNavigateToCreateDeal={onNavigateToCreateDeal}
    />
  );
}

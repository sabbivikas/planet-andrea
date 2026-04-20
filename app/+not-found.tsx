/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams } from 'expo-router';

import { useNav } from '@/comp-lib/navigation/useNav';
import { type TabsDiscoverUrlParams } from '@/app/(tabs)/discover';
import NotFoundContainer from '@/app-pages/NotFoundContainer';

export type NotFoundUrlParams = UnknownOutputParams;

export interface NotFoundProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: NotFoundUrlParams;
  /**
   * Sets the navigation options using navigation.setOptions()
   * @param options The options to set
   * @returns void
   */
  setNavigationOptions: (options?: Record<string, any>) => void;

  /**
   * Return to main app from not found page
   */
  onNavigateToHome: (urlParams?: TabsDiscoverUrlParams) => void;
}

/**
 * 404 Not Found page
 */
export default function NotFoundPage(props: NotFoundProps): ReactNode {
  const { urlParams, setOptions, navigate } = useNav<NotFoundUrlParams>({ auth: false });
  /**
   * Return to main app from not found page
   */
  const onNavigateToHome = (urlParams?: TabsDiscoverUrlParams) => {
    navigate({
      pathname: '/(tabs)/discover',
      params: urlParams,
    });
  };

  return (
    <NotFoundContainer
      children={props.children}
      urlParams={urlParams}
      setNavigationOptions={setOptions}
      onNavigateToHome={onNavigateToHome}
    />
  );
}

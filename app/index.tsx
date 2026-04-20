/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams } from 'expo-router';

import { useNav } from '@/comp-lib/navigation/useNav';
import { type AuthLoginUrlParams } from '@/app/auth/login';
import { type AuthSignupUrlParams } from '@/app/auth/signup';
import IndexContainer from '@/app-pages/IndexContainer';

export type IndexUrlParams = UnknownOutputParams;

export interface IndexProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: IndexUrlParams;
  /**
   * Sets the navigation options using navigation.setOptions()
   * @param options The options to set
   * @returns void
   */
  setNavigationOptions: (options?: Record<string, any>) => void;

  /**
   * User selects they have an existing account
   */
  onNavigateToLogin: (urlParams?: AuthLoginUrlParams) => void;
  /**
   * User selects they want to create a new account
   */
  onNavigateToSignup: (urlParams?: AuthSignupUrlParams) => void;
}

/**
 * Landing page with app branding and auth options
 */
export default function IndexPage(props: IndexProps): ReactNode {
  const { urlParams, setOptions, navigate } = useNav<IndexUrlParams>({ auth: false });
  /**
   * User selects they have an existing account
   */
  const onNavigateToLogin = (urlParams?: AuthLoginUrlParams) => {
    navigate({
      pathname: '/auth/login',
      params: urlParams,
    });
  };
  /**
   * User selects they want to create a new account
   */
  const onNavigateToSignup = (urlParams?: AuthSignupUrlParams) => {
    navigate({
      pathname: '/auth/signup',
      params: urlParams,
    });
  };

  return (
    <IndexContainer
      children={props.children}
      urlParams={urlParams}
      setNavigationOptions={setOptions}
      onNavigateToLogin={onNavigateToLogin}
      onNavigateToSignup={onNavigateToSignup}
    />
  );
}

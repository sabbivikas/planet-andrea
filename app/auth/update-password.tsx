/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams } from 'expo-router';

import { useNav } from '@/comp-lib/navigation/useNav';
import { type AuthLoginUrlParams } from '@/app/auth/login';
import UpdatePasswordContainer from '@/app-pages/auth/UpdatePasswordContainer';

export type AuthUpdatePasswordUrlParams = UnknownOutputParams;

export interface UpdatePasswordProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: AuthUpdatePasswordUrlParams;
  /**
   * Sets the navigation options using navigation.setOptions()
   * @param options The options to set
   * @returns void
   */
  setNavigationOptions: (options?: Record<string, any>) => void;

  /**
   * Return to login after successfully updating password
   */
  onNavigateToLogin: (urlParams?: AuthLoginUrlParams) => void;
}

/**
 * Update password after reset
 */
export default function UpdatePasswordPage(props: UpdatePasswordProps): ReactNode {
  const { urlParams, setOptions, navigate } = useNav<AuthUpdatePasswordUrlParams>({ auth: false });
  /**
   * Return to login after successfully updating password
   */
  const onNavigateToLogin = (urlParams?: AuthLoginUrlParams) => {
    navigate({
      pathname: '/auth/login',
      params: urlParams,
    });
  };

  return (
    <UpdatePasswordContainer
      children={props.children}
      urlParams={urlParams}
      setNavigationOptions={setOptions}
      onNavigateToLogin={onNavigateToLogin}
    />
  );
}

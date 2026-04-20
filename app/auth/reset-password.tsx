/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams } from 'expo-router';

import { useNav } from '@/comp-lib/navigation/useNav';
import { type AuthLoginUrlParams } from '@/app/auth/login';
import ResetPasswordContainer from '@/app-pages/auth/ResetPasswordContainer';

export type AuthResetPasswordUrlParams = UnknownOutputParams;

export interface ResetPasswordProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: AuthResetPasswordUrlParams;
  /**
   * Sets the navigation options using navigation.setOptions()
   * @param options The options to set
   * @returns void
   */
  setNavigationOptions: (options?: Record<string, any>) => void;

  /**
   * Return to login after submitting reset password request
   */
  onNavigateToLogin: (urlParams?: AuthLoginUrlParams) => void;
}

/**
 * Password reset request page
 */
export default function ResetPasswordPage(props: ResetPasswordProps): ReactNode {
  const { urlParams, setOptions, navigate } = useNav<AuthResetPasswordUrlParams>({ auth: false });
  /**
   * Return to login after submitting reset password request
   */
  const onNavigateToLogin = (urlParams?: AuthLoginUrlParams) => {
    navigate({
      pathname: '/auth/login',
      params: urlParams,
    });
  };

  return (
    <ResetPasswordContainer
      children={props.children}
      urlParams={urlParams}
      setNavigationOptions={setOptions}
      onNavigateToLogin={onNavigateToLogin}
    />
  );
}

/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams } from 'expo-router';

import { useNav } from '@/comp-lib/navigation/useNav';
import { type OnboardingProfileSetupUrlParams } from '@/app/onboarding/profile-setup';
import { type AuthLoginUrlParams } from '@/app/auth/login';
import SignupContainer from '@/app-pages/auth/SignupContainer';

export type AuthSignupUrlParams = UnknownOutputParams;

export interface SignupProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: AuthSignupUrlParams;
  /**
   * Sets the navigation options using navigation.setOptions()
   * @param options The options to set
   * @returns void
   */
  setNavigationOptions: (options?: Record<string, any>) => void;

  /**
   * Navigate to onboarding after successful signup
   */
  onNavigateToOnboarding: (urlParams?: OnboardingProfileSetupUrlParams) => void;
  /**
   * User selects they already have an account
   */
  onNavigateToLogin: (urlParams?: AuthLoginUrlParams) => void;
}

/**
 * User registration page
 */
export default function SignupPage(props: SignupProps): ReactNode {
  const { urlParams, setOptions, navigate } = useNav<AuthSignupUrlParams>({ auth: false });
  /**
   * Navigate to onboarding after successful signup
   */
  const onNavigateToOnboarding = (urlParams?: OnboardingProfileSetupUrlParams) => {
    navigate({
      pathname: '/onboarding/profile-setup',
      params: urlParams,
    });
  };
  /**
   * User selects they already have an account
   */
  const onNavigateToLogin = (urlParams?: AuthLoginUrlParams) => {
    navigate({
      pathname: '/auth/login',
      params: urlParams,
    });
  };

  return (
    <SignupContainer
      children={props.children}
      urlParams={urlParams}
      setNavigationOptions={setOptions}
      onNavigateToOnboarding={onNavigateToOnboarding}
      onNavigateToLogin={onNavigateToLogin}
    />
  );
}

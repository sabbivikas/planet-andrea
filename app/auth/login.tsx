/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams } from 'expo-router';

import { useNav } from '@/comp-lib/navigation/useNav';
import { type TabsDiscoverUrlParams } from '@/app/(tabs)/discover';
import { type OnboardingProfileSetupUrlParams } from '@/app/onboarding/profile-setup';
import { type AuthSignupUrlParams } from '@/app/auth/signup';
import { type AuthResetPasswordUrlParams } from '@/app/auth/reset-password';
import LoginContainer from '@/app-pages/auth/LoginContainer';

export type AuthLoginUrlParams = UnknownOutputParams;

export interface LoginProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: AuthLoginUrlParams;
  /**
   * Sets the navigation options using navigation.setOptions()
   * @param options The options to set
   * @returns void
   */
  setNavigationOptions: (options?: Record<string, any>) => void;

  /**
   * Navigate to main app after successful login when onboarding is complete
   */
  onNavigateToHome: (urlParams?: TabsDiscoverUrlParams) => void;
  /**
   * Navigate to onboarding after successful login when onboarding is not complete
   */
  onNavigateToOnboarding: (urlParams?: OnboardingProfileSetupUrlParams) => void;
  /**
   * User selects they need to create an account
   */
  onNavigateToSignup: (urlParams?: AuthSignupUrlParams) => void;
  /**
   * User selects forgot password
   */
  onNavigateToResetPassword: (urlParams?: AuthResetPasswordUrlParams) => void;
}

/**
 * User login page
 */
export default function LoginPage(props: LoginProps): ReactNode {
  const { urlParams, setOptions, navigate } = useNav<AuthLoginUrlParams>({ auth: false });
  /**
   * Navigate to main app after successful login when onboarding is complete
   */
  const onNavigateToHome = (urlParams?: TabsDiscoverUrlParams) => {
    navigate({
      pathname: '/(tabs)/discover',
      params: urlParams,
    });
  };
  /**
   * Navigate to onboarding after successful login when onboarding is not complete
   */
  const onNavigateToOnboarding = (urlParams?: OnboardingProfileSetupUrlParams) => {
    navigate({
      pathname: '/onboarding/profile-setup',
      params: urlParams,
    });
  };
  /**
   * User selects they need to create an account
   */
  const onNavigateToSignup = (urlParams?: AuthSignupUrlParams) => {
    navigate({
      pathname: '/auth/signup',
      params: urlParams,
    });
  };
  /**
   * User selects forgot password
   */
  const onNavigateToResetPassword = (urlParams?: AuthResetPasswordUrlParams) => {
    navigate({
      pathname: '/auth/reset-password',
      params: urlParams,
    });
  };

  return (
    <LoginContainer
      children={props.children}
      urlParams={urlParams}
      setNavigationOptions={setOptions}
      onNavigateToHome={onNavigateToHome}
      onNavigateToOnboarding={onNavigateToOnboarding}
      onNavigateToSignup={onNavigateToSignup}
      onNavigateToResetPassword={onNavigateToResetPassword}
    />
  );
}

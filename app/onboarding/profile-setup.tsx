/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams } from 'expo-router';

import { useNav } from '@/comp-lib/navigation/useNav';
import { type OnboardingPreferencesUrlParams } from '@/app/onboarding/preferences';
import ProfileSetupContainer from '@/app-pages/onboarding/ProfileSetupContainer';

export type OnboardingProfileSetupUrlParams = UnknownOutputParams;

export interface ProfileSetupProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: OnboardingProfileSetupUrlParams;
  /**
   * Sets the navigation options using navigation.setOptions()
   * @param options The options to set
   * @returns void
   */
  setNavigationOptions: (options?: Record<string, any>) => void;

  /**
   * Continue to preferences after completing profile setup
   */
  onNavigateNextPage: (urlParams?: OnboardingPreferencesUrlParams) => void;
}

/**
 * Collect user name and profile picture for social features
 */
export default function ProfileSetupPage(props: ProfileSetupProps): ReactNode {
  const { urlParams, setOptions, navigate } = useNav<OnboardingProfileSetupUrlParams>({ auth: true });
  /**
   * Continue to preferences after completing profile setup
   */
  const onNavigateNextPage = (urlParams?: OnboardingPreferencesUrlParams) => {
    navigate({
      pathname: '/onboarding/preferences',
      params: urlParams,
    });
  };

  return (
    <ProfileSetupContainer
      children={props.children}
      urlParams={urlParams}
      setNavigationOptions={setOptions}
      onNavigateNextPage={onNavigateNextPage}
    />
  );
}

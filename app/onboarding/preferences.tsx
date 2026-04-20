/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams } from 'expo-router';

import { useNav } from '@/comp-lib/navigation/useNav';
import { type TabsDiscoverUrlParams } from '@/app/(tabs)/discover';
import PreferencesContainer from '@/app-pages/onboarding/PreferencesContainer';

export type OnboardingPreferencesUrlParams = UnknownOutputParams;

export interface PreferencesProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: OnboardingPreferencesUrlParams;
  /**
   * Sets the navigation options using navigation.setOptions()
   * @param options The options to set
   * @returns void
   */
  setNavigationOptions: (options?: Record<string, any>) => void;

  /**
   * Return to profile setup to make changes
   */
  onGoBack: () => void;
  /**
   * Complete onboarding and enter main app
   */
  onNavigateNextPage: (urlParams?: TabsDiscoverUrlParams) => void;
}

/**
 * Collect activity preferences to personalize discovery feed
 */
export default function PreferencesPage(props: PreferencesProps): ReactNode {
  const { urlParams, setOptions, back, replace } = useNav<OnboardingPreferencesUrlParams>({ auth: true });
  /**
   * Return to profile setup to make changes
   */
  const onGoBack = () => {
    back();
  };
  /**
   * Complete onboarding and enter main app
   */
  const onNavigateNextPage = (urlParams?: TabsDiscoverUrlParams) => {
    replace({
      pathname: '/(tabs)/discover',
      params: urlParams,
    });
  };

  return (
    <PreferencesContainer
      children={props.children}
      urlParams={urlParams}
      setNavigationOptions={setOptions}
      onGoBack={onGoBack}
      onNavigateNextPage={onNavigateNextPage}
    />
  );
}

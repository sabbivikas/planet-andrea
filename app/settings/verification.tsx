/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams } from 'expo-router';

import { useNav } from '@/comp-lib/navigation/useNav';
import { type TabsProfileUrlParams } from '@/app/(tabs)/profile';
import VerificationContainer from '@/app-pages/settings/VerificationContainer';

export type SettingsVerificationUrlParams = UnknownOutputParams;

export interface VerificationProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: SettingsVerificationUrlParams;
  /**
   * Sets the navigation options using navigation.setOptions()
   * @param options The options to set
   * @returns void
   */
  setNavigationOptions: (options?: Record<string, any>) => void;

  /**
   * Return to settings
   */
  onGoBack: () => void;
  /**
   * Return to profile after verification complete
   */
  onNavigateToProfile: (urlParams?: TabsProfileUrlParams) => void;
}

/**
 * User verification for joining open groups
 */
export default function VerificationPage(props: VerificationProps): ReactNode {
  const { urlParams, setOptions, back, dismissTo } = useNav<SettingsVerificationUrlParams>({ auth: true });
  /**
   * Return to settings
   */
  const onGoBack = () => {
    back();
  };
  /**
   * Return to profile after verification complete
   */
  const onNavigateToProfile = (urlParams?: TabsProfileUrlParams) => {
    dismissTo({
      pathname: '/(tabs)/profile',
      params: urlParams,
    });
  };

  return (
    <VerificationContainer
      children={props.children}
      urlParams={urlParams}
      setNavigationOptions={setOptions}
      onGoBack={onGoBack}
      onNavigateToProfile={onNavigateToProfile}
    />
  );
}

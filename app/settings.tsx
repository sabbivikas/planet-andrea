/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams } from 'expo-router';

import { useNav } from '@/comp-lib/navigation/useNav';
import { type SettingsVerificationUrlParams } from '@/app/settings/verification';
import SettingsContainer from '@/app-pages/SettingsContainer';

export type SettingsUrlParams = UnknownOutputParams;

export interface SettingsProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: SettingsUrlParams;
  /**
   * Sets the navigation options using navigation.setOptions()
   * @param options The options to set
   * @returns void
   */
  setNavigationOptions: (options?: Record<string, any>) => void;

  /**
   * Return to profile
   */
  onGoBack: () => void;
  /**
   * Start verification process
   */
  onNavigateToVerification: (urlParams?: SettingsVerificationUrlParams) => void;
}

/**
 * App settings and preferences
 */
export default function SettingsPage(props: SettingsProps): ReactNode {
  const { urlParams, setOptions, back, navigate } = useNav<SettingsUrlParams>({ auth: true });
  /**
   * Return to profile
   */
  const onGoBack = () => {
    back();
  };
  /**
   * Start verification process
   */
  const onNavigateToVerification = (urlParams?: SettingsVerificationUrlParams) => {
    navigate({
      pathname: '/settings/verification',
      params: urlParams,
    });
  };

  return (
    <SettingsContainer
      children={props.children}
      urlParams={urlParams}
      setNavigationOptions={setOptions}
      onGoBack={onGoBack}
      onNavigateToVerification={onNavigateToVerification}
    />
  );
}

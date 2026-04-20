/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams } from 'expo-router';

import { useNav } from '@/comp-lib/navigation/useNav';
import { type SettingsUrlParams } from '@/app/settings';
import { type SettingsVerificationUrlParams } from '@/app/settings/verification';
import { type BusinessDashboardUrlParams } from '@/app/business/dashboard';
import { type AuthSignupUrlParams } from '@/app/auth/signup';
import ProfileContainer from '@/app-pages/(tabs)/ProfileContainer';

export type TabsProfileUrlParams = UnknownOutputParams;

export interface ProfileProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: TabsProfileUrlParams;
  /**
   * Sets the navigation options using navigation.setOptions()
   * @param options The options to set
   * @returns void
   */
  setNavigationOptions: (options?: Record<string, any>) => void;

  /**
   * Open app settings
   */
  onNavigateToSettings: (urlParams?: SettingsUrlParams) => void;
  /**
   * Start verification process
   */
  onNavigateToVerification: (urlParams?: SettingsVerificationUrlParams) => void;
  /**
   * Access business dashboard for venue owners
   */
  onNavigateToBusinessDashboard: (urlParams?: BusinessDashboardUrlParams) => void;
  /**
   * Log out and return to signup
   */
  onNavigateToAuth: (urlParams?: AuthSignupUrlParams) => void;
}

/**
 * User profile and settings
 */
export default function ProfilePage(props: ProfileProps): ReactNode {
  const { urlParams, setOptions, navigate } = useNav<TabsProfileUrlParams>({ auth: true });
  /**
   * Open app settings
   */
  const onNavigateToSettings = (urlParams?: SettingsUrlParams) => {
    navigate({
      pathname: '/settings',
      params: urlParams,
    });
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
  /**
   * Access business dashboard for venue owners
   */
  const onNavigateToBusinessDashboard = (urlParams?: BusinessDashboardUrlParams) => {
    navigate({
      pathname: '/business/dashboard',
      params: urlParams,
    });
  };
  /**
   * Log out and return to signup
   */
  const onNavigateToAuth = (urlParams?: AuthSignupUrlParams) => {
    navigate({
      pathname: '/auth/signup',
      params: urlParams,
    });
  };

  return (
    <ProfileContainer
      children={props.children}
      urlParams={urlParams}
      setNavigationOptions={setOptions}
      onNavigateToSettings={onNavigateToSettings}
      onNavigateToVerification={onNavigateToVerification}
      onNavigateToBusinessDashboard={onNavigateToBusinessDashboard}
      onNavigateToAuth={onNavigateToAuth}
    />
  );
}

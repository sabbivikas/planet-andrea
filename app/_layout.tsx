/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import '@/comp-lib/assets/customAssetResolver';

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams, Stack } from 'expo-router';

import { useStackLayoutStyles } from '@/comp-lib/styles/useStackLayoutStyles';
import { useNav } from '@/comp-lib/navigation/useNav';
import { type TabsDiscoverUrlParams } from '@/app/(tabs)/discover';
import { type OnboardingProfileSetupUrlParams } from '@/app/onboarding/profile-setup';
import { type AuthLoginUrlParams } from '@/app/auth/login';
import { type AuthUpdatePasswordUrlParams } from '@/app/auth/update-password';
import { AppContextProviders } from '@/comp-app/common/AppContextProviders';
import { useAppStateHandler } from '@/comp-app/common/useAppStateHandler';
import LayoutContainer from '@/app-pages/LayoutContainer';

export type LayoutUrlParams = UnknownOutputParams;

export interface LayoutProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: LayoutUrlParams;
  /**
   * Sets the navigation options using navigation.setOptions()
   * @param options The options to set
   * @returns void
   */
  setNavigationOptions: (options?: Record<string, any>) => void;

  /**
   * Navigate to main app after startup when user is authenticated and onboarded
   */
  onNavigateToHome: (urlParams?: TabsDiscoverUrlParams) => void;
  /**
   * Navigate to onboarding when user is authenticated but not onboarded
   */
  onNavigateToOnboarding: (urlParams?: OnboardingProfileSetupUrlParams) => void;
  /**
   * Navigate to login when user is not authenticated
   */
  onNavigateToLogin: (urlParams?: AuthLoginUrlParams) => void;
  /**
   * Navigate to update password after reset flow
   */
  onNavigateToUpdatePassword: (urlParams?: AuthUpdatePasswordUrlParams) => void;
}

/**
 * Root layout for the Planet app
 */
export default function Layout(): ReactNode {
  useAppStateHandler();

  const { defaultScreenOptions: defaultStackLayoutOptions } = useStackLayoutStyles();
  const { urlParams, setOptions, navigate } = useNav<LayoutUrlParams>({ auth: false });
  /**
   * Navigate to main app after startup when user is authenticated and onboarded
   */
  const onNavigateToHome = (urlParams?: TabsDiscoverUrlParams) => {
    navigate({
      pathname: '/(tabs)/discover',
      params: urlParams,
    });
  };
  /**
   * Navigate to onboarding when user is authenticated but not onboarded
   */
  const onNavigateToOnboarding = (urlParams?: OnboardingProfileSetupUrlParams) => {
    navigate({
      pathname: '/onboarding/profile-setup',
      params: urlParams,
    });
  };
  /**
   * Navigate to login when user is not authenticated
   */
  const onNavigateToLogin = (urlParams?: AuthLoginUrlParams) => {
    navigate({
      pathname: '/auth/login',
      params: urlParams,
    });
  };
  /**
   * Navigate to update password after reset flow
   */
  const onNavigateToUpdatePassword = (urlParams?: AuthUpdatePasswordUrlParams) => {
    navigate({
      pathname: '/auth/update-password',
      params: urlParams,
    });
  };

  return (
    <AppContextProviders>
      <LayoutContainer
        urlParams={urlParams}
        setNavigationOptions={setOptions}
        onNavigateToHome={onNavigateToHome}
        onNavigateToOnboarding={onNavigateToOnboarding}
        onNavigateToLogin={onNavigateToLogin}
        onNavigateToUpdatePassword={onNavigateToUpdatePassword}
      >
        <Stack screenOptions={{ ...defaultStackLayoutOptions, headerShown: false }}>
          <Stack.Screen
            name="index"
            options={{
              title: 'Welcome',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="+html"
            options={{
              title: 'Planet Web',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="+not-found"
            options={{
              title: 'Page Not Found',
              headerShown: false,
            }}
          />
          <Stack.Screen name="auth" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="group" />
          <Stack.Screen name="activity" />
          <Stack.Screen
            name="chat"
            options={{
              title: 'Group Chat',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="notifications"
            options={{
              title: 'Notifications',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              title: 'Settings',
              headerShown: false,
            }}
          />
          <Stack.Screen name="business" />
        </Stack>
      </LayoutContainer>
    </AppContextProviders>
  );
}

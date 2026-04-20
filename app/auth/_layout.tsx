/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams, Stack } from 'expo-router';

import { useStackLayoutStyles } from '@/comp-lib/styles/useStackLayoutStyles';
import { useNav } from '@/comp-lib/navigation/useNav';
import AuthLayoutContainer from '@/app-pages/auth/AuthLayoutContainer';

export type AuthLayoutUrlParams = UnknownOutputParams;

export interface AuthLayoutProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: AuthLayoutUrlParams;
  /**
   * Sets the navigation options using navigation.setOptions()
   * @param options The options to set
   * @returns void
   */
  setNavigationOptions: (options?: Record<string, any>) => void;
}

/**
 * Authentication layout
 */
export default function AuthLayout(): ReactNode {
  const { defaultScreenOptions: defaultStackLayoutOptions } = useStackLayoutStyles();
  const { urlParams, setOptions } = useNav<AuthLayoutUrlParams>({ auth: false });

  return (
    <AuthLayoutContainer urlParams={urlParams} setNavigationOptions={setOptions}>
      <Stack screenOptions={{ ...defaultStackLayoutOptions, headerShown: false }}>
        <Stack.Screen
          name="login"
          options={{
            title: 'Login',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="signup"
          options={{
            title: 'Sign Up',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="reset-password"
          options={{
            title: 'Reset Password',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="update-password"
          options={{
            title: 'Update Password',
            headerShown: false,
          }}
        />
      </Stack>
    </AuthLayoutContainer>
  );
}

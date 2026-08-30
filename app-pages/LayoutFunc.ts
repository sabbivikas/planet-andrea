/**
 * Layout component that handles app state changes, font loading and app startup redirection
 * @todo AUTO-GENERATED STUB - replace with actual implementation
 */

import * as SplashScreen from 'expo-splash-screen';
import { type PropsWithChildren } from 'react';

import { LayoutProps } from '@/app/_layout';
import { useLoadFonts } from '@/comp-lib/styles/useLoadFonts';

SplashScreen.preventAutoHideAsync().catch((err) => {
  console.log('Error prevent hiding splash screen:', err);
});

export interface LayoutFunc extends PropsWithChildren {
  /**
   * Indicates whether fonts have been loaded
   */
  loaded: boolean;
}

export function useLayout(props: LayoutProps): LayoutFunc {
  const { loaded } = useLoadFonts();

  return { loaded };
}

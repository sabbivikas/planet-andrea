import { type PropsWithChildren, type ReactNode } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { useSafeAreaProviderWrapper } from './SafeAreaProviderWrapperFunc';

// Web browsers don't provide safe-area insets, so we simulate them for layout parity with iOS.
// We override SafeAreaInsetsContext directly because SafeAreaProvider's initialMetrics is only
// the initial state and gets overwritten by the native measurement (which returns 0 on web).
const WEB_SAFE_TOP = 62;
const WEB_SAFE_BOTTOM = 34;

const WEB_INSETS = { top: WEB_SAFE_TOP, bottom: WEB_SAFE_BOTTOM, left: 0, right: 0 };

export function SafeAreaProviderWrapper({ children }: PropsWithChildren): ReactNode {
  const { enableFakeSafeArea } = useSafeAreaProviderWrapper();

  if (Platform.OS === 'web' && enableFakeSafeArea) {
    return (
      <SafeAreaProvider>
        <SafeAreaInsetsContext.Provider value={WEB_INSETS}>{children}</SafeAreaInsetsContext.Provider>
      </SafeAreaProvider>
    );
  }

  // On native, react-native-safe-area-context reads insets directly from the native module
  // without needing a SafeAreaProvider in the tree.
  return <>{children}</>;
}

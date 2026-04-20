import { type PropsWithChildren, type ReactNode } from 'react';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { useTabSafeAreaWrapper } from './TabSafeAreaWrapperFunc';

/**
 * Wraps tab navigator children to zero out the bottom safe area inset.
 * The tab bar already applies paddingBottom for the bottom safe area,
 * so child pages must not apply it again (which would cause double padding).
 */
export function TabSafeAreaWrapper({ children }: PropsWithChildren): ReactNode {
  const sceneInsets = useTabSafeAreaWrapper();
  return <SafeAreaInsetsContext.Provider value={sceneInsets}>{children}</SafeAreaInsetsContext.Provider>;
}

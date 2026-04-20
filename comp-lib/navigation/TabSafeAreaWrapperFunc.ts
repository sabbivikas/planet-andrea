import { useMemo } from 'react';
import { type EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Returns safe area insets with `bottom` zeroed out.
 * The tab bar already applies paddingBottom for the bottom safe area,
 * so child pages must not apply it again (which would cause double padding).
 */
export function useTabSafeAreaWrapper(): EdgeInsets {
  const insets = useSafeAreaInsets();
  return useMemo(
    () => ({ top: insets.top, left: insets.left, right: insets.right, bottom: 0 }),
    [insets.top, insets.left, insets.right],
  );
}

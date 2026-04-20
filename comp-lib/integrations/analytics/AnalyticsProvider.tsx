import type { PropsWithChildren, ReactNode } from 'react';

import { useAnalyticsProviderFunc } from './AnalyticsProviderFunc.ts';

/**
 * Thin wrapper that syncs the Supabase session identity with PostHog.
 * Renders children unconditionally — safe to mount even when PostHog is
 * disabled (the void client will no-op every call).
 */
export function AnalyticsProvider({ children }: PropsWithChildren): ReactNode {
  useAnalyticsProviderFunc();
  return <>{children}</>;
}

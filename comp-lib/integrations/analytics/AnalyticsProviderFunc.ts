import { useEffect, useRef } from 'react';
import { useSession } from '@supabase/auth-helpers-react';

import { posthogConfig } from './posthog.config.ts';
import { posthogClient } from './posthogClient.ts';

/**
 * Syncs the Supabase session identity with PostHog.
 * No-ops when PostHog is disabled (the void client handles it safely).
 */
export function useAnalyticsProviderFunc(): void {
  const session = useSession();
  const user = session?.user;
  const previousUserIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!posthogConfig.enabled) return;

    const currentUserId = user?.id;
    const previousUserId = previousUserIdRef.current;

    if (currentUserId && currentUserId !== previousUserId) {
      posthogClient.identify(currentUserId, { email: user.email });
    }

    if (!currentUserId && previousUserId) {
      posthogClient.reset();
    }

    previousUserIdRef.current = currentUserId;
  }, [user]);
}

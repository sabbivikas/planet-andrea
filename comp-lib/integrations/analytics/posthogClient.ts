import PostHog from 'posthog-react-native';

import { posthogConfig } from './posthog.config.ts';

function createVoidClient(): PostHog {
  let warned = false;
  return new Proxy({} as PostHog, {
    get(_target, prop): ((...args: unknown[]) => void) | undefined {
      if (typeof prop === 'symbol') return undefined;
      return (..._args: unknown[]) => {
        if (!warned) {
          console.debug(`[PostHog] Not configured — "${String(prop)}" call ignored`);
          warned = true;
        }
      };
    },
  });
}

function createClient(): PostHog {
  if (!posthogConfig.enabled || !posthogConfig.projectToken || !posthogConfig.host) {
    return createVoidClient();
  }
  return new PostHog(posthogConfig.projectToken, {
    host: posthogConfig.host,
    persistence: 'memory',
    preloadFeatureFlags: false,
  });
}

export const posthogClient: PostHog = createClient();

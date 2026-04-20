---
name: analytics-posthog
description: Use this skill when implementing or fixing analytics in generated Woz apps with PostHog. Covers provider wiring checks, frontend env verification, and event/screen tracking with posthogClient.
---
# Analytics + PostHog Integration

**REQUIRED: Read [integration-patterns.md](references/integration-patterns.md) for general integration workflow before making changes.**


Use this skill for generated apps that might be missing analytics setup or need PostHog usage guidance.

## Setup Verification

You MUST check the frontend `.env.local` file.

Required variables:
- `EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN`
- `EXPO_PUBLIC_POSTHOG_PROJECT_ID`
- `EXPO_PUBLIC_POSTHOG_PROJECT_REGION`
- `EXPO_PUBLIC_POSTHOG_ENABLED`

If any required variable is missing, manual PostHog setup in Woz Dashboard is incomplete. Stop and tell the user to complete the dashboard connection first.

## Architecture

Analytics uses a **singleton client** pattern — no hooks, no context needed for tracking events.

| Module | Purpose |
|--------|---------|
| `posthogClient.ts` | Singleton PostHog client (or no-op void proxy when disabled). Import and call directly. |
| `AnalyticsProvider.tsx` | Mounted in `DefaultAppContextProviders`. Syncs Supabase session identity with PostHog (identify/reset). |
| `posthog.config.ts` | Reads `EXPO_PUBLIC_POSTHOG_*` env vars, exports `posthogConfig`. |

**Key design:** When PostHog is disabled or env vars are missing, `posthogClient` is a Proxy-based void client that no-ops every method call. This means callers never need to check `isEnabled` — every call is always safe.

## Using Analytics in Components

Import `posthogClient` directly and call `capture` / `screen`:

### Example Component Func file (`ExampleComponentFunc.ts`)

```ts
import { useCallback } from 'react';

import { posthogClient } from '@/comp-lib/integrations/analytics/posthogClient';

interface ExampleComponentFunc {
  onCtaPress: () => void;
}

export function useExampleComponent(): ExampleComponentFunc {
  const onCtaPress = useCallback(() => {
    posthogClient.capture('cta_clicked', {
      cta_name: 'cta_name',
      property: 'example_property',
    });
  }, []);

  return { onCtaPress };
}
```

### Non-hook / plain function usage

Because `posthogClient` is a plain module singleton, it works outside React components too:

```ts
import { posthogClient } from '@/comp-lib/integrations/analytics/posthogClient';

export function trackPurchase(productId: string) {
  posthogClient.capture('purchase_completed', { product_id: productId });
}
```

## Event Naming Conventions

- Use lowercase snake_case for event names (example: `cta_clicked`, `signup_started`)
- Keep property names stable and descriptive (example: `source`, `surface`, `plan_id`)
- Avoid high-cardinality user-generated text in event properties
- Reuse existing event names/properties instead of creating near-duplicates

## Troubleshooting

1. **Events not appearing:** Confirm all 4 required `.env.local` variables are present and non-empty.
2. **Identity not syncing:** Verify `DefaultAppContextProviders.tsx` includes `AnalyticsProvider` (handles identify/reset).
3. **Unexpected no-op behavior:** The void client intentionally no-ops when setup is incomplete — this is by design, not a bug.


**For full implementation patterns (architecture, edge functions, error handling):**
→ See the `integration-patterns` skill

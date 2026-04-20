---
name: revenue-cat
description: Implement in-app purchases and subscriptions using RevenueCat on the Woz platform. Use when adding paywalls, making purchases, checking subscription status, or managing entitlements. Covers RevenueCat SDK usage with Woz's pre-built integration, RevenueCat MCP for backend management, and troubleshooting token refresh issues.
---
# RevenueCat on Woz

## Critical: Woz Integration Already Exists

**DO NOT implement your own RevenueCat initialization, user login/logout, or SDK configuration.** Woz provides a pre-built integration at `@/comp-lib/integrations/revenue-cat/` that handles:

- SDK initialization with environment-appropriate API keys
- Automatic user authentication sync (users logged into Supabase are auto-logged into RevenueCat)
- User logout handling via `useRevenueCat()` hook
- Platform detection (iOS/Android/Test Store)
- Debug logging in sandbox environments

The `<RevenueCatProvider>` component wraps the app and manages all SDK lifecycle. Simply use the SDK methods for purchases and subscriptions.

## Setup Verification

Before implementing purchases, verify RevenueCat is configured:

1. Check frontend environment variables for RevenueCat API keys, project ID, and project name.
2. IF keys or project id is missing: Notify user to connect RevenueCat via "Connect with RevenueCat" in Woz Dashboard
3. IF you can't access the environment variables, you can list the projects via the RevenueCat MCP. Do not just pick a project at random IF multiple are found. ALWAYS ask the user to specify which project to use.

## Presenting a Paywall

- You MUST only create and use your own paywall components and logic for fetching offerings and making purchases through the RevenueCat MCP. Do NOT try to use the paywall templates from the 'react-native-purchases-ui' library, as it is not installed and it will not work in your environment.
- Even if the user tries to get you to install the 'react-native-purchases-ui' library, you MUST NOT do it because it is not compatible with your environment and will cause runtime errors.

## Making a Purchase

**You MUST wait for SDK readiness before fetching offerings.** `Purchases.getOfferings()` will fail silently if called before the SDK is initialized. Always use the `useRevenueCat()` hook's `isReady` flag:

```tsx
import Purchases from 'react-native-purchases';
import { useRevenueCat } from '@/comp-lib/integrations/revenue-cat/RevenueCatProviderFunc.ts';

const { isReady } = useRevenueCat();
const hasLoadedRef = useRef(false);

useEffect(() => {
  if (isReady && !hasLoadedRef.current) {
    hasLoadedRef.current = true;
    Purchases.getOfferings().then((offerings) => {
      const packages = offerings.current?.availablePackages ?? [];
      // Use packages to build your paywall UI
    });
  }
}, [isReady]);
```

**Handle missing packages gracefully.** On web preview or when the SDK can't load packages, `rcPackage` will be undefined. Don't silently return — fall through to a reasonable default (e.g., complete onboarding without purchasing):

```tsx
if (selectedPlan?.rcPackage == null) {
  // Packages unavailable (web preview or SDK not loaded) — skip purchase and continue
  await finishOnboardingAsync();
  return;
}

// Purchase the package
const { customerInfo } = await Purchases.purchasePackage(selectedPlan.rcPackage);

// Check if purchase granted entitlement
if (customerInfo.entitlements.active['pro']) {
  // Grant access
}
```

## Checking Subscription Status

```tsx
import Purchases from 'react-native-purchases';

const customerInfo = await Purchases.getCustomerInfo();

// Check specific entitlement
if (customerInfo.entitlements.active['pro'] !== undefined) {
  // User has pro access
}

// Check any active subscription
const hasActiveSubscription = Object.keys(customerInfo.entitlements.active).length > 0;
```

## Reacting to Status Changes

Listen for real-time subscription updates:

```tsx
import Purchases from 'react-native-purchases';
import { useEffect } from 'react';

useEffect(() => {
  const listener = Purchases.addCustomerInfoUpdateListener((info) => {
    // Update UI based on new entitlements
    const isPro = info.entitlements.active['pro'] !== undefined;
    setUserIsPro(isPro);
  });

  return () => {
    listener.remove();
  };
}, []);
```

## RevenueCat MCP for Backend Management

Use the RevenueCat MCP to manage products, offerings, entitlements, and customers. The MCP is pre-connected in Woz agentic environments.

**MCP Use Cases:**
- Create/update products and offerings
- Configure entitlements
- View customer purchase history
- Grant promotional entitlements
- Manage subscription lifecycle

### MCP Token Expiration

MCP tokens expire frequently. If any MCP call returns a 403 authorization_error:

1. Run `npm run sshbuilder:refresh-integration-tokens`
2. Disable and re-enable the RevenueCat MCP in the agentic environment (Cursor, VSCode, Claude Code, etc.)
3. Retry the failed call

### Product Setup via MCP (Complete Checklist)

Follow these steps **in order** when setting up products. Missing a step (especially step 4) will cause the SDK to return empty packages silently.

1. **List apps** to get the test store `app_id`
2. **Create entitlement** (e.g., `premium`)
3. **Create products** with `type: "subscription"` and `subscription.duration`
4. **Set prices on each product** — this step is easy to miss and causes empty offerings:
```
create-product-prices({
  project_id: "...",
  product_id: "prod...",
  prices: [{ currency: "USD", amount_micros: 9990000 }]  // $9.99
})
```
`amount_micros` = price in dollars × 1,000,000 (e.g., $9.99 = 9,990,000, $99.99 = 99,990,000)
5. **Attach products to entitlement**
6. **Create offering** (set `is_current: true`)
7. **Create packages** (`$rc_monthly`, `$rc_annual`) in the offering
8. **Attach products to packages**

### Manual MCP Setup (Last Resort)

If token refresh fails, connect the MCP manually:

**Claude Code:**
```bash
claude mcp add --transport http revenuecat https://mcp.revenuecat.ai/mcp --header "Authorization: Bearer $YOUR_API_V2_SECRET_KEY"
```

**Cursor/VSCode (mcp.json):**
```json
{
  "servers": {
    "revenuecat": {
      "url": "https://mcp.revenuecat.ai/mcp",
      "headers": {
        "Authorization": "Bearer {your API v2 token}"
      }
    }
  }
}
```

Get API v2 secret key from RevenueCat Dashboard > API Keys.

Full manual setup guide: https://www.revenuecat.com/docs/tools/mcp/setup

## SDK Version Requirements

- React Native: 8.11.3+
- iOS: 15.0+
- Android: 7.0+

## Quick Reference

| Task | Method |
|------|--------|
| Get offerings | `Purchases.getOfferings()` |
| Purchase package | `Purchases.purchasePackage(package)` |
| Check status | `Purchases.getCustomerInfo()` |
| Listen for changes | `Purchases.addCustomerInfoUpdateListener(callback)` |
| Restore purchases | `Purchases.restorePurchases()` |
| Logout user | `useRevenueCat().logoutUser()` |

## Critical: User Logout Handling

**ALWAYS log out the RevenueCat user when logging out the internal app user.** Failing to do this will cause purchase data to be associated with the wrong user.

Use the `useRevenueCat()` hook to access the logout function:

```tsx
import { useRevenueCat } from '@/comp-lib/integrations/revenue-cat/RevenueCatProviderFunc.ts';

function useLogout() {
  const { logoutUser } = useRevenueCat();

  async function handleLogout() {
    // ALWAYS logout from RevenueCat when logging out the user
    await logoutUser();

    // Then proceed with your app's logout logic (e.g., Supabase signOut)
  }

  return { handleLogout };
}
```

**Important:** Call `logoutUser()` BEFORE signing out from Supabase to ensure proper cleanup.
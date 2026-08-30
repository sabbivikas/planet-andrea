# Planet Andrea

Planet Andrea is an Expo + React Native + TypeScript app backed by Supabase. The app keeps the existing product surface: Discover, activity swiping, Groups/Planets, battles and voting, chat and reactions, profiles, notifications, and business functionality.

## Prerequisites

- Node.js and npm
- EAS CLI for cloud builds: `npm install -g eas-cli`
- Supabase CLI for backend work
- Xcode/iOS Simulator or Android Studio for native development

## Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create frontend env:

   ```sh
   cp .env-template .env.local
   ```

3. Create Supabase Edge Function env:

   ```sh
   cp supabase/.env-template supabase/.env.local
   ```

4. For local Supabase, start the stack and copy local anon/service-role values from `supabase status` into the env files:

   ```sh
   npm run supabase:start
   npm run supabase:status
   ```

5. Reset and seed the local database:

   ```sh
   npm run db:local-reset
   ```

6. Start Expo:

   ```sh
   npm start
   ```

## Development

- iOS: `npm run ios`
- Android: `npm run android`
- Web: `npm run web`
- Edge Functions: `npm run edge-functions`
- TypeScript: `npm run typecheck`
- Lint: `npm run lint`
- Tests: `npm test`

## Maps

Activity maps use MapLibre (`@maplibre/maplibre-react-native`) with OpenFreeMap tiles. This removes the need for a Google Maps API key for the current map surface.

Web builds use a MapLibre GL shim in `comp-lib/shims/MapLibre.web.tsx`, wired through `metro.config.js`. The MapLibre web worker is served from `public/maplibre-gl-worker.mjs`; hosts must serve `.mjs` files with a JavaScript content type or the map can render blank. Native maps need a dev-client or EAS build; they do not run in Expo Go.

## Production Supabase

The current production Supabase project is:

```text
planet-andrea
Project ref: bxqvzqwoqziliuachtra
URL: https://bxqvzqwoqziliuachtra.supabase.co
```

Link the project once:

```sh
supabase link --project-ref bxqvzqwoqziliuachtra
```

Apply database migrations:

```sh
supabase db push
```

Deploy Edge Functions:

```sh
supabase functions deploy email --use-api --import-map supabase/functions/import_map.json
supabase functions deploy user --use-api --import-map supabase/functions/import_map.json
supabase functions deploy planet-admin --use-api --import-map supabase/functions/import_map.json
supabase functions deploy streams --use-api --import-map supabase/functions/import_map.json --no-verify-jwt
supabase functions deploy supabase-auth-hook --use-api --import-map supabase/functions/import_map.json --no-verify-jwt
```

Set backend secrets with the Supabase CLI:

```sh
supabase secrets set --project-ref bxqvzqwoqziliuachtra RESEND_API_KEY=...
```

The local `supabase/config.toml` leaves the custom send-email auth hook disabled so a fresh clone can start Supabase without private webhook secrets. Enable `[auth.hook.send_email]` and set `SB_AUTH_HOOK_SECRETS_SEND_EMAIL`, `SB_AUTH_HOOK_SEND_EMAIL_FROM`, and `RESEND_API_KEY` when you are ready to use the custom email hook.

## EAS Builds

The Expo/EAS project is:

```text
@vikas_sabbi/planet-andrea
Project ID: d37486d9-0fc2-4715-87f8-0b5351f613df
```

Production EAS env currently needs:

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
```

Build:

```sh
npm run eas:build:ios
npm run eas:build:android
```

Keep private backend secrets in Supabase secrets. Do not put service-role keys or private provider keys in `EXPO_PUBLIC_*` variables.

## Environment Variables

Required now:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Required when auth email hook is enabled:

- `SB_AUTH_HOOK_SECRETS_SEND_EMAIL`
- `SB_AUTH_HOOK_SEND_EMAIL_FROM`
- `RESEND_API_KEY`

Optional integrations:

- PostHog: `EXPO_PUBLIC_POSTHOG_ENABLED`, `EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN`, `EXPO_PUBLIC_POSTHOG_PROJECT_ID`, `EXPO_PUBLIC_POSTHOG_PROJECT_REGION`, `POSTHOG_PROJECT_TOKEN`, `POSTHOG_PROJECT_ID`, `POSTHOG_PROJECT_REGION`
- Sentry: `EXPO_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`
- RevenueCat: `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS`, `EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID`, `EXPO_PUBLIC_REVENUECAT_API_KEY_TEST_STORE`, `REVENUE_CAT_API_KEY`
- Stripe publishable keys: `EXPO_PUBLIC_STRIPE_API_SANDBOX_PUBLISHABLE_KEY`, `EXPO_PUBLIC_STRIPE_API_LIVE_PUBLISHABLE_KEY`, `EXPO_PUBLIC_STRIPE_CALLBACK_URL`
- Native app identifiers: `EXPO_PUBLIC_APP_SCHEME`, `IOS_BUNDLE_IDENTIFIER`, `ANDROID_PACKAGE`, `EAS_PROJECT_ID`
- Backend-only providers already represented in code: `OPENAI_API_KEY`, `GEMINI_API_KEY`, `GROK_API_KEY`, `GOOGLE_VERTEX_API_KEY`, `GOOGLE_CLOUD_PROJECT_ID`, `OPENWEATHER_API_KEY`, `FINNHUB_API_KEY`, `ELEVENLABS_API_KEY`, `MAPBOX_ACCESS_TOKEN`
- AWS/email extras: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_SES_REGION`, `WAITLIST_INFO_WEBHOOK_URL`

Obsolete Woz variables:

- `SUPABASE_WOZ_URL`
- `SUPABASE_AUTH_TOKEN`
- `EXPO_PUBLIC_INSPECTOR_ENABLED`
- `EXPO_PUBLIC_CRASH_ANALYTICS_PARENT_WINDOW_ENABLED`
- `EXPO_PUBLIC_BUNDLE_URL`
- `EXPO_PUBLIC_BUNDLE_URL_SSL`

## Repo Notes

- App code lives in `app-pages/` and `comp-app/`.
- Routes live in `app/`.
- Shared generated components in `comp-lib/` are preserved when they are still used by the app.
- Woz build, preview, dashboard, MCP, inspector, and deployment tooling has been removed.

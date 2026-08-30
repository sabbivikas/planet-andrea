# Planet

Planet is a social night-out planning app. Friend groups ("planets") swipe on
local activities, vote in "battles" to decide the plan, and can merge with
other crews heading to the same place. Businesses can post deals.

- React Native / Expo (SDK 54) frontend
- Supabase backend (Postgres + edge functions)
- Generated with the Woz app builder (April 2026)

## Status

**Snapshot, not yet deployed.** The code typechecks and unit tests pass, but
no live backend is connected and the app has never been built for the stores.

## Running locally

1. `npm ci`
2. Copy `.env-template` to `.env.local` and fill in at least:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   `.env.local` and `.env` are gitignored - never commit real keys.
3. `npm run compile` (generates typed routes, then typechecks)
4. `npm start`

## Maps

Maps use MapLibre (`@maplibre/maplibre-react-native`) with free OpenFreeMap
tiles (OpenStreetMap data) - no API key, no billing account, no usage limits.
Web builds are served by a maplibre-gl shim (`comp-lib/shims/MapLibre.web.tsx`,
wired in `metro.config.js`). The maplibre-gl web worker ships as a static file
in `public/` (maplibre-gl can't bundle it through Metro); hosts must serve
`.mjs` files with a JavaScript content type or the map renders blank. Native
maps need a dev-client build (`eas build --profile development`), they don't
run in Expo Go.

## Checks

- `npm run compile` - TypeScript typecheck (run this first; it generates
  `expo-env.d.ts`, which plain `tsc` needs)
- `npm test` - jest unit tests (4 suites need a local Supabase running:
  `npm run supabase`)
- `npm run lint` - eslint

## Before App Store submission (TODO)

1. **Expo account**: `app.json` still has `owner: "withwoz"` (the Woz
   account). Change it to your own Expo account before `eas build`, then run
   `eas init` to link a new EAS project.
2. **Backend**: deploy `supabase/` to a live Supabase project and set the env
   vars from `.env-template` / `supabase/.env-template` (Woz dashboard or
   Supabase project settings).
3. **Payments**: RevenueCat keys (`EXPO_PUBLIC_REVENUECAT_API_KEY_*`) and
   `EXPO_PUBLIC_PURCHASE_ENV=production`.
4. **Privacy**: the app uses contacts, location, and government-ID
   verification - it needs a privacy policy, privacy manifest, and in-app
   account deletion before review.
5. **Email template**: `email/confirm.html` is the Supabase auth confirmation
   email - paste it into the Supabase dashboard (Authentication > Email
   Templates). The old Woz logo image was replaced with a text header; swap in
   real branding when it exists.

## Repo notes

- App code lives in `app-pages/` and `comp-app/` (routes in `app/` are
  auto-generated - don't edit them directly). See `AGENTS.md` for the full
  layout rules.
- `comp-lib/` and `supabase/schemas/0_lib/` are Woz library code - treat as
  read-only.
- The Woz license allows building and shipping apps with this code, but not
  redistributing the code itself - keep this repo private.

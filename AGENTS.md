# Agent Notes

Planet Andrea is a standard Expo + React Native + TypeScript app with a Supabase backend. It no longer depends on Woz build, preview, dashboard, MCP, or deployment tooling.

## Project Shape

- `app/`: Expo Router route files.
- `app-pages/`: route containers, business logic hooks, and route styles.
- `comp-app/`: app-specific shared components.
- `comp-lib/`: shared component library used by the app. Do not remove working components just because they were generated.
- `api/`: frontend API wrappers and Supabase client setup.
- `supabase/schemas/`: desired database schema source files.
- `supabase/migrations/`: Supabase migration files.
- `supabase/seed/`: local seed data.
- `supabase/functions/`: Edge Functions and shared backend/client code.
- `i18n/`: localization files and generated translation types.

## Standard Commands

- Install dependencies: `npm install`
- Expo dev server: `npm start`
- iOS simulator: `npm run ios`
- Android emulator: `npm run android`
- Web: `npm run web`
- TypeScript: `npm run typecheck`
- Lint: `npm run lint`
- Tests: `npm test`
- Start local Supabase: `npm run supabase:start`
- Reset local database: `npm run db:local-reset`
- Serve Edge Functions locally: `npm run edge-functions`
- EAS iOS build: `npm run eas:build:ios`
- EAS Android build: `npm run eas:build:android`

## Security

- Client-safe variables must use `EXPO_PUBLIC_*`.
- Never put `SUPABASE_SERVICE_ROLE_KEY`, provider secret API keys, auth hook secrets, or private tokens in `EXPO_PUBLIC_*`.
- Service-role access belongs only in Supabase Edge Functions or trusted server environments.

## Database Types

The repository preserves the checked-in custom `supabase/functions/_shared-client/generated-db-types.ts` used by the app. The standard Supabase CLI type generator is available through `npm run db:gen-types`, which writes `supabase/functions/_shared-client/supabase-types.ts`.

If you change SQL schema files, verify whether the custom generated type file also needs a project-specific regeneration strategy before replacing it.

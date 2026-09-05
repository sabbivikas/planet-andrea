import { hasLocalSupabase } from '@shared/utils/supabase-local-env.ts';

export * from '@shared/utils/supabase-local-env.ts';
export * from './test-constants';

/**
 * `describe` for suites that talk to a live local Supabase (`npm run supabase`).
 * Skips automatically on machines/CI without one instead of failing at import.
 */
export const describeSupabase: typeof describe = hasLocalSupabase ? describe : describe.skip;

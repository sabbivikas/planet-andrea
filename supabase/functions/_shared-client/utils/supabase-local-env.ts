import { execSync } from 'child_process';
import { createSigner } from 'fast-jwt';

import { type emailstr, type uuidstr } from '../generated-db-types.ts';

export interface SupabaseEnvironment {
  ANON_KEY: string;
  API_URL: string;
  DB_URL: string;
  GRAPHQL_URL: string;
  INBUCKET_URL: string;
  JWT_SECRET: string;
  S3_PROTOCOL_ACCESS_KEY_ID: string;
  S3_PROTOCOL_ACCESS_KEY_SECRET: string;
  S3_PROTOCOL_REGION: string;
  SERVICE_ROLE_KEY: string;
  STORAGE_S3_URL: string;
  STUDIO_URL: string;
}

// Load Supabase environment values once and cache the result.
// Empty when no local Supabase stack is running (or the CLI is absent) -
// DB-backed test suites skip themselves in that case (see describeSupabase).
export const supabaseTestingEnv: SupabaseEnvironment | null = (() => {
  try {
    // suppress errors such as `/bin/sh: supabase: command not found` or
    // `WARN: no SMS provider is enabled. Disabling phone login` or
    // `Stopped services: [supabase_edge_runtime_WozTest supabase_pooler_WozTest]`
    const output = execSync('supabase status -o json 2>/dev/null', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const status = JSON.parse(output) satisfies SupabaseEnvironment;

    // Set environment variables
    for (const [key, value] of Object.entries(status)) {
      process.env[key] = String(value);
    }

    return status;
  } catch {
    return null;
  }
})();

export const hasLocalSupabase: boolean = supabaseTestingEnv !== null;

export const testingUrl = process.env.TESTING_SUPABASE_URL ?? supabaseTestingEnv?.API_URL;
export const testingAnonKey = process.env.TESTING_SUPABASE_ANON_KEY ?? supabaseTestingEnv?.ANON_KEY;

type Signer = (payload: unknown) => string;

let signer: Signer | undefined;

function getSigner(): Signer {
  if (!signer) {
    const key = supabaseTestingEnv?.JWT_SECRET;
    if (!key) {
      throw new Error(
        'No local Supabase environment found. Start one with `npm run supabase` before running DB-backed tests.',
      );
    }
    signer = createSigner({ key, algorithm: 'HS256' }) as unknown as Signer;
  }
  return signer;
}

// https://catjam.fi/articles/supabase-gen-access-token
export function createSupabaseTestingToken(userEmail: emailstr, userId: uuidstr): string {
  const ONE_HOUR = 60 * 60;
  const exp = Math.round(Date.now() / 1000) + ONE_HOUR;
  const payload = {
    exp,
    /**
     * Set the 'aud' field to prevent an error on some function calls:
     * "AuthApiError: Token audience doesn't match request audience"
     */
    aud: 'authenticated',
    sub: userId,
    email: userEmail,
    role: 'authenticated',
  };
  return getSigner()(payload);
}

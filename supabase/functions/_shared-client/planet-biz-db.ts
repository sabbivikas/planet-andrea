import { SupabaseClient } from '@supabase/supabase-js';

import type { BusinessV1, Database, uuidstr } from './generated-db-types.ts';

export async function readBusiness(
  supabaseClient: SupabaseClient<Database>,
): Promise<BusinessV1 | undefined> {
  const res = await supabaseClient.rpc('app:planetBiz:read');
  if (res.error) {
    throw res.error;
  }
  return res.data ?? undefined;
}

export async function createBusiness(
  supabaseClient: SupabaseClient<Database>,
  name: string,
  logoUrl?: string,
): Promise<BusinessV1> {
  const res = await supabaseClient.rpc('app:planetBiz:create', {
    name,
    logoUrl: logoUrl ?? null,
  });
  if (res.error) {
    throw res.error;
  }
  return res.data;
}

export async function updateBusiness(
  supabaseClient: SupabaseClient<Database>,
  businessId: uuidstr,
  params: {
    name?: string
    logoUrl?: string
  },
): Promise<BusinessV1> {
  const res = await supabaseClient.rpc('app:planetBiz:update', {
    businessId,
    name: params.name ?? null,
    logoUrl: params.logoUrl ?? '___UNSET___',
  });
  if (res.error) {
    throw res.error;
  }
  return res.data;
}

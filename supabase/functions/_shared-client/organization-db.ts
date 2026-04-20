import { SupabaseClient } from '@supabase/supabase-js';

import type { Database, uuidstr, OrganizationMembershipV1 } from './generated-db-types.ts';

// Creates a new organization for the current user.
export async function createNewOrganization(
  supabaseClient: SupabaseClient<Database>,
  name = 'My Organization',
): Promise<uuidstr> {
  const { data: newOrgId, error: orgError } = await supabaseClient.rpc('app:organization:user:create', { name });

  if (orgError) throw orgError;
  if (!newOrgId) throw new Error('Failed to create organization');

  return newOrgId;
}

// Creates a default organization for a user if they don't have one already.
export async function createUserDefaultOrgIfMissing(supabaseClient: SupabaseClient<Database>): Promise<uuidstr> {
  try {
    // First try to get existing default org
    const defaultMembership = await readDefaultOrgMembershipForUser(supabaseClient);
    const orgId = defaultMembership.organizationId;
    if (!orgId) throw new Error('Organization ID is null');
    return orgId;
  } catch (error) {
    // If no default org exists, create a new one
    const newOrgId = await createNewOrganization(supabaseClient);
    return newOrgId;
  }
}

// Fetches organization memberships for the current user.
export async function readUserOrgMemberships(
  supabaseClient: SupabaseClient<Database>,
): Promise<OrganizationMembershipV1[]> {
  const { data: user } = await supabaseClient.auth.getUser();
  if (!user.user) throw new Error('Cannot fetch memberships: User is not authenticated');
  const res = await supabaseClient.rpc('app:organization:membership:user:readAll');

  if (res.error) {
    throw res.error;
  }

  return res.data ?? [];
}

// Gets the default organization for the current user.
export async function readDefaultOrgMembershipForUser(
  supabaseClient: SupabaseClient<Database>,
): Promise<OrganizationMembershipV1> {
  const memberships = await readUserOrgMemberships(supabaseClient);

  if (memberships?.length === 0) {
    throw new Error('No organizations found for user');
  }

  return memberships[0];
}

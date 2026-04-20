import { SupabaseClient } from '@supabase/supabase-js';

import {
  toDoubleNum,
  toIntNum,
  type ActivityCategory,
  type Database,
  type NearbyUserV1,
  type PlanetUserSearchResultV1,
  type UserAppProfileV1,
  type UserPreferenceV1,
  type UserStatsV1,
  type VerificationStatus,
  type uuidstr,
} from './generated-db-types.ts';

// ── User App Profile ──

export async function readUserAppProfile(
  supabaseClient: SupabaseClient<Database>,
): Promise<UserAppProfileV1 | undefined> {
  const res = await supabaseClient.rpc('app:planetUser:read');
  if (res.error) {
    throw res.error;
  }
  return res.data ?? undefined;
}

export async function updateUserAppProfile(
  supabaseClient: SupabaseClient<Database>,
  params: {
    isOnboarded?: boolean
    isBusinessOwner?: boolean
    locationLatitude?: number
    locationLongitude?: number
    phoneNumber?: string
  },
): Promise<UserAppProfileV1> {
  const res = await supabaseClient.rpc('app:planetUser:update', {
    isOnboarded: params.isOnboarded,
    isBusinessOwner: params.isBusinessOwner,
    locationLatitude: params.locationLatitude != null ? toDoubleNum(params.locationLatitude) : undefined,
    locationLongitude: params.locationLongitude != null ? toDoubleNum(params.locationLongitude) : undefined,
    phoneNumber: params.phoneNumber,
  });
  if (res.error) {
    throw res.error;
  }
  return res.data;
}

export async function readUserStats(
  supabaseClient: SupabaseClient<Database>,
): Promise<UserStatsV1 | undefined> {
  const res = await supabaseClient.rpc('app:planetUser:readStats');
  if (res.error) {
    throw res.error;
  }
  return res.data ?? undefined;
}

export async function adminUpdateUserVerification(
  supabaseAdminClient: SupabaseClient<Database>,
  userId: uuidstr,
  newVerificationStatus: VerificationStatus,
): Promise<void> {
  const res = await supabaseAdminClient.rpc('admin:planetUser:updateVerification', {
    userId,
    newVerificationStatus,
  });
  if (res.error) {
    throw res.error;
  }
}

// ── User Search ──

export async function searchPlanetUsers(
  supabaseClient: SupabaseClient<Database>,
  query: string,
  excludeGroupId?: uuidstr,
  limitCount?: number,
): Promise<PlanetUserSearchResultV1[]> {
  const res = await supabaseClient.rpc('app:planetUser:search', {
    query,
    excludeGroupId: excludeGroupId ?? null,
    limitCount: toIntNum(limitCount ?? 20),
  });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? [];
}

export async function readNearbyUsers(
  supabaseClient: SupabaseClient<Database>,
  params: {
    userLatitude: number
    userLongitude: number
    radiusInKm?: number
    excludeGroupId?: uuidstr
    limitCount?: number
  },
): Promise<NearbyUserV1[]> {
  const res = await supabaseClient.rpc('app:planetUser:readNearby', {
    userLatitude: toDoubleNum(params.userLatitude),
    userLongitude: toDoubleNum(params.userLongitude),
    radiusInKm: toDoubleNum(params.radiusInKm ?? 10),
    excludeGroupId: params.excludeGroupId ?? null,
    limitCount: toIntNum(params.limitCount ?? 20),
  });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? [];
}

// ── User Preferences ──

export async function readUserPreference(
  supabaseClient: SupabaseClient<Database>,
): Promise<UserPreferenceV1 | undefined> {
  const res = await supabaseClient.rpc('app:planetPref:read');
  if (res.error) {
    throw res.error;
  }
  return res.data ?? undefined;
}

export async function updateUserPreference(
  supabaseClient: SupabaseClient<Database>,
  params: {
    activityCategories?: ActivityCategory[]
    locationPermissionGranted?: boolean
    pushNotificationsEnabled?: boolean
    battleNotificationsEnabled?: boolean
    groupActivityNotificationsEnabled?: boolean
    dealNotificationsEnabled?: boolean
    friendActivityNotificationsEnabled?: boolean
  },
): Promise<UserPreferenceV1> {
  const res = await supabaseClient.rpc('app:planetPref:update', params);
  if (res.error) {
    throw res.error;
  }
  return res.data;
}

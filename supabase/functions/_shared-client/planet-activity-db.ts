import { SupabaseClient } from '@supabase/supabase-js';

import {
  toDoubleNum,
  toIntNum,
  type ActivityCategory,
  type ActivityDiscoverCardV1,
  type ActivityEditDetailV1,
  type ActivityStatus,
  type ActivityV1,
  type ActivityWithDealV1,
  type Database,
  type DealActivityV1,
  type DealRedeemDetailV1,
  type DealRedemptionV1,
  type DealStatus,
  type DealType,
  type DealV1,
  type DealWithMetricsV1,
  type PriceRange,
  type datestr,
  type doublenum,
  type intnum,
  type timestr,
  type uuidstr,
} from './generated-db-types.ts';

// ── Activities ──

export async function readDiscoverFeed(
  supabaseClient: SupabaseClient<Database>,
  params?: {
    userLatitude?: number
    userLongitude?: number
    limitCount?: number
    offsetCount?: number
  },
): Promise<ActivityDiscoverCardV1[]> {
  const res = await supabaseClient.rpc('app:planetActivity:readDiscoverFeed', {
    userLatitude: params?.userLatitude != null ? toDoubleNum(params.userLatitude) : null,
    userLongitude: params?.userLongitude != null ? toDoubleNum(params.userLongitude) : null,
    limitCount: toIntNum(params?.limitCount ?? 20),
    offsetCount: toIntNum(params?.offsetCount ?? 0),
  });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? [];
}

export async function readAllActiveActivities(
  supabaseClient: SupabaseClient<Database>,
  params?: {
    userLatitude?: number
    userLongitude?: number
    limitCount?: number
    offsetCount?: number
  },
): Promise<ActivityWithDealV1[]> {
  const res = await supabaseClient.rpc('app:planetActivity:readAllActive', {
    userLatitude: params?.userLatitude != null ? toDoubleNum(params.userLatitude) : null,
    userLongitude: params?.userLongitude != null ? toDoubleNum(params.userLongitude) : null,
    limitCount: toIntNum(params?.limitCount ?? 20),
    offsetCount: toIntNum(params?.offsetCount ?? 0),
  });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? [];
}

export async function readActivityById(
  supabaseClient: SupabaseClient<Database>,
  activityId: uuidstr,
): Promise<ActivityWithDealV1 | undefined> {
  const res = await supabaseClient.rpc('app:planetActivity:readById', { activityId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? undefined;
}

export async function readAllActivitiesByBusiness(
  supabaseClient: SupabaseClient<Database>,
  businessId: uuidstr,
): Promise<ActivityV1[]> {
  const res = await supabaseClient.rpc('app:planetActivity:readAllByBusiness', { businessId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? [];
}

export async function createActivity(
  supabaseClient: SupabaseClient<Database>,
  params: {
    businessId: uuidstr
    title: string
    description: string
    category: ActivityCategory
    primaryImageUrl: string
    priceRange: PriceRange
    address: string
    latitude: number
    longitude: number
    additionalImageUrls?: string[]
    operatingHours?: string
    tags?: string[]
  },
): Promise<ActivityV1> {
  const res = await supabaseClient.rpc('app:planetActivity:create', {
    businessId: params.businessId,
    title: params.title,
    description: params.description,
    category: params.category,
    primaryImageUrl: params.primaryImageUrl,
    priceRange: params.priceRange,
    address: params.address,
    latitude: toDoubleNum(params.latitude),
    longitude: toDoubleNum(params.longitude),
    additionalImageUrls: params.additionalImageUrls ?? [],
    operatingHours: params.operatingHours ?? null,
    tags: params.tags ?? [],
  });
  if (res.error) {
    throw res.error;
  }
  return res.data;
}

export async function updateActivity(
  supabaseClient: SupabaseClient<Database>,
  activityId: uuidstr,
  params: {
    title?: string
    description?: string
    category?: ActivityCategory
    primaryImageUrl?: string
    priceRange?: PriceRange
    address?: string
    latitude?: number
    longitude?: number
    additionalImageUrls?: string[]
    operatingHours?: string
    tags?: string[]
    status?: ActivityStatus
  },
): Promise<ActivityV1> {
  const res = await supabaseClient.rpc('app:planetActivity:update', {
    activityId,
    title: params.title ?? null,
    description: params.description ?? null,
    category: params.category ?? null,
    primaryImageUrl: params.primaryImageUrl ?? null,
    priceRange: params.priceRange ?? null,
    address: params.address ?? null,
    latitude: params.latitude != null ? toDoubleNum(params.latitude) : null,
    longitude: params.longitude != null ? toDoubleNum(params.longitude) : null,
    additionalImageUrls: params.additionalImageUrls ?? null,
    operatingHours: params.operatingHours ?? '___UNSET___',
    tags: params.tags ?? null,
    status: params.status ?? null,
  });
  if (res.error) {
    throw res.error;
  }
  return res.data;
}

export async function readActivityEditDetail(
  supabaseClient: SupabaseClient<Database>,
  activityId: uuidstr,
): Promise<ActivityEditDetailV1 | undefined> {
  const res = await supabaseClient.rpc('app:planetActivity:readEditDetail', { activityId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? undefined;
}

export async function deleteActivity(
  supabaseClient: SupabaseClient<Database>,
  activityId: uuidstr,
): Promise<boolean> {
  const res = await supabaseClient.rpc('app:planetActivity:delete', { activityId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? false;
}

// ── Deals ──

export async function readAllDealsByBusiness(
  supabaseClient: SupabaseClient<Database>,
  businessId: uuidstr,
): Promise<DealV1[]> {
  const res = await supabaseClient.rpc('app:planetDeal:readAllByBusiness', { businessId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? [];
}

export async function readDealById(
  supabaseClient: SupabaseClient<Database>,
  dealId: uuidstr,
): Promise<DealV1 | undefined> {
  const res = await supabaseClient.rpc('app:planetDeal:readById', { dealId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? undefined;
}

export async function createDeal(
  supabaseClient: SupabaseClient<Database>,
  params: {
    businessId: uuidstr
    headline: string
    dealType: DealType
    termsAndConditions: string
    startDate: datestr
    endDate: datestr
    redemptionCode: string
    discountValueInPercent?: number
    discountValueInCents?: number
    minimumGroupSize?: number
    minimumSpendInCents?: number
    validTimeStart?: timestr
    validTimeEnd?: timestr
    totalRedemptionLimit?: number
    perUserRedemptionLimit?: number
    activityIds?: uuidstr[]
  },
): Promise<DealV1> {
  const res = await supabaseClient.rpc('app:planetDeal:create', {
    businessId: params.businessId,
    headline: params.headline,
    dealType: params.dealType,
    termsAndConditions: params.termsAndConditions,
    startDate: params.startDate,
    endDate: params.endDate,
    redemptionCode: params.redemptionCode,
    discountValueInPercent: params.discountValueInPercent != null ? toDoubleNum(params.discountValueInPercent) : null,
    discountValueInCents: params.discountValueInCents != null ? toIntNum(params.discountValueInCents) : null,
    minimumGroupSize: params.minimumGroupSize != null ? toIntNum(params.minimumGroupSize) : null,
    minimumSpendInCents: params.minimumSpendInCents != null ? toIntNum(params.minimumSpendInCents) : null,
    validTimeStart: params.validTimeStart ?? null,
    validTimeEnd: params.validTimeEnd ?? null,
    totalRedemptionLimit: params.totalRedemptionLimit != null ? toIntNum(params.totalRedemptionLimit) : null,
    perUserRedemptionLimit: toIntNum(params.perUserRedemptionLimit ?? 1),
    activityIds: params.activityIds ?? [],
  });
  if (res.error) {
    throw res.error;
  }
  return res.data;
}

export async function redeemDeal(
  supabaseClient: SupabaseClient<Database>,
  dealId: uuidstr,
): Promise<DealRedemptionV1> {
  const res = await supabaseClient.rpc('app:planetDeal:redeem', { dealId });
  if (res.error) {
    throw res.error;
  }
  return res.data;
}

export async function readDealRedeemDetailByActivity(
  supabaseClient: SupabaseClient<Database>,
  activityId: uuidstr,
): Promise<DealRedeemDetailV1 | undefined> {
  const res = await supabaseClient.rpc('app:planetDeal:readRedeemDetailByActivity', { activityId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? undefined;
}

export async function linkDealToActivity(
  supabaseClient: SupabaseClient<Database>,
  dealId: uuidstr | string,
  activityId: uuidstr | string,
): Promise<boolean> {
  const res = await supabaseClient.rpc('app:planetDeal:linkActivity', {
    dealId: dealId as uuidstr,
    activityId: activityId as uuidstr,
  });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? false;
}

export async function unlinkDealFromActivity(
  supabaseClient: SupabaseClient<Database>,
  dealId: uuidstr | string,
  activityId: uuidstr | string,
): Promise<boolean> {
  const res = await supabaseClient.rpc('app:planetDeal:unlinkActivity', {
    dealId: dealId as uuidstr,
    activityId: activityId as uuidstr,
  });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? false;
}

export async function readAllDealsByBusinessWithMetrics(
  supabaseClient: SupabaseClient<Database>,
  businessId: uuidstr,
): Promise<DealWithMetricsV1[]> {
  const res = await supabaseClient.rpc('app:planetDeal:readAllByBusinessWithMetrics', { businessId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? [];
}

export async function updateDealStatus(
  supabaseClient: SupabaseClient<Database>,
  dealId: uuidstr,
  newStatus: DealStatus,
): Promise<DealV1> {
  const res = await supabaseClient.rpc('app:planetDeal:updateStatus', { dealId, newStatus });
  if (res.error) {
    throw res.error;
  }
  return res.data;
}

export async function deleteDeal(
  supabaseClient: SupabaseClient<Database>,
  dealId: uuidstr,
): Promise<boolean> {
  const res = await supabaseClient.rpc('app:planetDeal:delete', { dealId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? false;
}

export async function duplicateDeal(
  supabaseClient: SupabaseClient<Database>,
  dealId: uuidstr,
): Promise<DealV1> {
  const res = await supabaseClient.rpc('app:planetDeal:duplicate', { dealId });
  if (res.error) {
    throw res.error;
  }
  return res.data;
}

export async function readDealActivities(
  supabaseClient: SupabaseClient<Database>,
  dealId: uuidstr,
): Promise<DealActivityV1[]> {
  const res = await supabaseClient.rpc('app:planetDeal:readActivities', { dealId });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? [];
}

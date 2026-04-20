import { SupabaseClient } from '@supabase/supabase-js';

import type {
  BizActivityAnalyticsV1,
  BizAnalyticsDailyV1,
  BizAnalyticsOverviewV1,
  BizDealAnalyticsV1,
  Database,
  datestr,
  uuidstr,
} from './generated-db-types.ts';

export async function readBizAnalyticsOverview(
  supabaseClient: SupabaseClient<Database>,
  businessId: uuidstr,
  startDate: datestr,
  endDate: datestr,
): Promise<BizAnalyticsOverviewV1 | undefined> {
  const res = await supabaseClient.rpc('app:planetBizDash:readOverview', {
    businessId,
    startDate,
    endDate,
  });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? undefined;
}

export async function readBizAnalyticsDailyMetrics(
  supabaseClient: SupabaseClient<Database>,
  businessId: uuidstr,
  startDate: datestr,
  endDate: datestr,
): Promise<BizAnalyticsDailyV1[]> {
  const res = await supabaseClient.rpc('app:planetBizDash:readDailyMetrics', {
    businessId,
    startDate,
    endDate,
  });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? [];
}

export async function readBizActivityBreakdown(
  supabaseClient: SupabaseClient<Database>,
  businessId: uuidstr,
): Promise<BizActivityAnalyticsV1[]> {
  const res = await supabaseClient.rpc('app:planetBizDash:readActivityBreakdown', {
    businessId,
  });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? [];
}

export async function readBizDealPerformance(
  supabaseClient: SupabaseClient<Database>,
  businessId: uuidstr,
): Promise<BizDealAnalyticsV1[]> {
  const res = await supabaseClient.rpc('app:planetBizDash:readDealPerformance', {
    businessId,
  });
  if (res.error) {
    throw res.error;
  }
  return res.data ?? [];
}

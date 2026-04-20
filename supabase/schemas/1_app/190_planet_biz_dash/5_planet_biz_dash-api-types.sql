-- Single day of analytics data for charts
CREATE TYPE public."BizAnalyticsDailyV1" AS (
  date date_notnull,
  impressions int_notnull,
  "uniqueViewers" int_notnull,
  swipes int_notnull,
  "dealRedemptions" int_notnull,
  "revenueEstimateInCents" int_notnull
);

-- Overview metrics with trend comparison against previous period
CREATE TYPE public."BizAnalyticsOverviewV1" AS (
  "totalImpressions" int_notnull,
  "totalUniqueViewers" int_notnull,
  "totalSwipes" int_notnull,
  "swipeRatePercent" double precision,
  "totalDealRedemptions" int_notnull,
  "revenueEstimateInCents" int_notnull,
  "prevTotalImpressions" int_notnull,
  "prevTotalUniqueViewers" int_notnull,
  "prevTotalSwipes" int_notnull,
  "prevSwipeRatePercent" double precision,
  "prevTotalDealRedemptions" int_notnull,
  "prevRevenueEstimateInCents" int_notnull
);

-- Per-activity analytics breakdown
CREATE TYPE public."BizActivityAnalyticsV1" AS (
  "activityId" uuid_notnull,
  title text,
  impressions int_notnull,
  swipes int_notnull,
  "conversionPercent" double precision
);

-- Per-deal analytics with peak redemption time
CREATE TYPE public."BizDealAnalyticsV1" AS (
  "dealId" uuid_notnull,
  headline text,
  "redemptionRatePercent" double precision,
  "peakHour" int_notnull,
  "totalRedemptions" int_notnull
);

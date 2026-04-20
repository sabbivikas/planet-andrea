CREATE TYPE public."ActivityV1" AS (
  id uuid_notnull,
  "createdAt" timestamptz_notnull,
  "updatedAt" timestamptz_notnull,
  "businessId" uuid_notnull,
  title text,
  description text,
  category public.activity_category,
  "primaryImageUrl" text,
  "additionalImageUrls" text[],
  "priceRange" public.price_range,
  "operatingHours" text,
  tags text[],
  status public.activity_status,
  latitude double precision,
  longitude double precision,
  address text,
  rating double precision
);

CREATE TYPE public."DealV1" AS (
  id uuid_notnull,
  "createdAt" timestamptz_notnull,
  "updatedAt" timestamptz_notnull,
  "businessId" uuid_notnull,
  headline text,
  "dealType" public.deal_type,
  "discountValueInPercent" double precision,
  "discountValueInCents" integer,
  "termsAndConditions" text,
  "minimumGroupSize" integer,
  "minimumSpendInCents" integer,
  "startDate" date_notnull,
  "endDate" date_notnull,
  "validTimeStart" time,
  "validTimeEnd" time,
  "totalRedemptionLimit" integer,
  "perUserRedemptionLimit" int_notnull,
  status public.deal_status,
  "redemptionCode" text
);

CREATE TYPE public."DealActivityV1" AS (
  id uuid_notnull,
  "dealId" uuid_notnull,
  "activityId" uuid_notnull
);

CREATE TYPE public."DealRedemptionV1" AS (
  id uuid_notnull,
  "dealId" uuid_notnull,
  "userId" uuid_notnull,
  "redeemedAt" timestamptz_notnull
);

CREATE TYPE public."ActivityWithDealV1" AS (
  activity public."ActivityV1",
  deal public."DealV1"
);

CREATE TYPE public."DealRedeemDetailV1" AS (
  deal public."DealV1",
  "businessName" text,
  "redemptionsUsed" int_notnull,
  "userAlreadyRedeemed" bool_notnull
);

CREATE TYPE public."ActivityDiscoverCardV1" AS (
  activity public."ActivityV1",
  deal public."DealV1",
  "businessName" text
);

CREATE TYPE public."ActivityMetricsV1" AS (
  "activityId" uuid_notnull,
  "totalImpressions" int_notnull,
  "totalSwipes" int_notnull,
  "conversionRatePercent" double precision,
  "updatedAt" timestamptz_notnull
);

CREATE TYPE public."ActivityBoostV1" AS (
  id uuid_notnull,
  "activityId" uuid_notnull,
  "isActive" bool_notnull,
  tier text,
  "dailyBudgetInCents" int_notnull,
  "remainingBudgetInCents" int_notnull,
  "boostedImpressions" int_notnull,
  "createdAt" timestamptz_notnull,
  "updatedAt" timestamptz_notnull
);

CREATE TYPE public."DealMetricsV1" AS (
  "dealId" uuid_notnull,
  "totalViews" int_notnull,
  "totalRedemptions" int_notnull,
  "conversionRatePercent" double precision,
  "updatedAt" timestamptz_notnull
);

CREATE TYPE public."DealWithMetricsV1" AS (
  deal public."DealV1",
  "totalViews" int_notnull,
  "totalRedemptions" int_notnull,
  "conversionRatePercent" double precision,
  "linkedActivitiesCount" int_notnull
);

CREATE TYPE public."ActivityEditDetailV1" AS (
  activity public."ActivityV1",
  deal public."DealV1",
  metrics public."ActivityMetricsV1",
  boost public."ActivityBoostV1",
  "businessDeals" public."DealV1"[]
);

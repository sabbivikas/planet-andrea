-- Read overview analytics for a business within a date range, with comparison to previous period
CREATE OR REPLACE FUNCTION public."app:planetBizDash:readOverview"(
  "businessId" uuid,
  "startDate" date,
  "endDate" date
)
RETURNS public."BizAnalyticsOverviewV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  WITH period_days AS (
    SELECT ("endDate" - "startDate" + 1) AS day_count
  ),
  current_period AS (
    SELECT
      COALESCE(SUM(bad.impressions), 0)::integer AS total_impressions,
      COALESCE(SUM(bad.unique_viewers), 0)::integer AS total_unique_viewers,
      COALESCE(SUM(bad.swipes), 0)::integer AS total_swipes,
      COALESCE(SUM(bad.deal_redemptions), 0)::integer AS total_deal_redemptions,
      COALESCE(SUM(bad.revenue_estimate_in_cents), 0)::integer AS total_revenue
    FROM private.biz_analytics_daily bad
    WHERE bad.business_id = "businessId"
      AND bad.date >= "startDate"
      AND bad.date <= "endDate"
  ),
  prev_period AS (
    SELECT
      COALESCE(SUM(bad.impressions), 0)::integer AS total_impressions,
      COALESCE(SUM(bad.unique_viewers), 0)::integer AS total_unique_viewers,
      COALESCE(SUM(bad.swipes), 0)::integer AS total_swipes,
      COALESCE(SUM(bad.deal_redemptions), 0)::integer AS total_deal_redemptions,
      COALESCE(SUM(bad.revenue_estimate_in_cents), 0)::integer AS total_revenue
    FROM private.biz_analytics_daily bad
    CROSS JOIN period_days pd
    WHERE bad.business_id = "businessId"
      AND bad.date >= ("startDate" - pd.day_count)
      AND bad.date < "startDate"
  )
  SELECT ROW(
    COALESCE(cp.total_impressions, 0)::int_notnull,
    COALESCE(cp.total_unique_viewers, 0)::int_notnull,
    COALESCE(cp.total_swipes, 0)::int_notnull,
    CASE WHEN cp.total_impressions > 0
      THEN ROUND((cp.total_swipes::double precision / cp.total_impressions * 100)::numeric, 1)::double precision
      ELSE 0
    END,
    COALESCE(cp.total_deal_redemptions, 0)::int_notnull,
    COALESCE(cp.total_revenue, 0)::int_notnull,
    COALESCE(pp.total_impressions, 0)::int_notnull,
    COALESCE(pp.total_unique_viewers, 0)::int_notnull,
    COALESCE(pp.total_swipes, 0)::int_notnull,
    CASE WHEN pp.total_impressions > 0
      THEN ROUND((pp.total_swipes::double precision / pp.total_impressions * 100)::numeric, 1)::double precision
      ELSE 0
    END,
    COALESCE(pp.total_deal_redemptions, 0)::int_notnull,
    COALESCE(pp.total_revenue, 0)::int_notnull
  )::public."BizAnalyticsOverviewV1"
  FROM current_period cp, prev_period pp
  WHERE EXISTS (
    SELECT 1 FROM private.business b
    WHERE b.id = "businessId" AND b.owner_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBizDash:readOverview" TO authenticated;

-- Read daily metrics for charts
CREATE OR REPLACE FUNCTION public."app:planetBizDash:readDailyMetrics"(
  "businessId" uuid,
  "startDate" date,
  "endDate" date
)
RETURNS SETOF public."BizAnalyticsDailyV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    bad.date,
    bad.impressions,
    bad.unique_viewers,
    bad.swipes,
    bad.deal_redemptions,
    bad.revenue_estimate_in_cents
  FROM private.biz_analytics_daily bad
  WHERE bad.business_id = "businessId"
    AND bad.date >= "startDate"
    AND bad.date <= "endDate"
    AND EXISTS (
      SELECT 1 FROM private.business b
      WHERE b.id = "businessId" AND b.owner_id = auth.uid()
    )
  ORDER BY bad.date ASC;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBizDash:readDailyMetrics" TO authenticated;

-- Read per-activity analytics breakdown for a business within a date range
CREATE OR REPLACE FUNCTION public."app:planetBizDash:readActivityBreakdown"(
  "businessId" uuid
)
RETURNS SETOF public."BizActivityAnalyticsV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    a.id,
    a.title,
    COALESCE(am.total_impressions, 0),
    COALESCE(am.total_swipes, 0),
    COALESCE(am.conversion_rate_percent, 0)
  FROM private.activity a
  LEFT JOIN private.activity_metrics am ON am.activity_id = a.id
  WHERE a.business_id = "businessId"
    AND a.status = 'ACTIVE'
    AND EXISTS (
      SELECT 1 FROM private.business b
      WHERE b.id = "businessId" AND b.owner_id = auth.uid()
    )
  ORDER BY COALESCE(am.total_impressions, 0) DESC;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBizDash:readActivityBreakdown" TO authenticated;

-- Read per-deal analytics with peak redemption hour
CREATE OR REPLACE FUNCTION public."app:planetBizDash:readDealPerformance"(
  "businessId" uuid
)
RETURNS SETOF public."BizDealAnalyticsV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    d.id,
    d.headline,
    COALESCE(dm.conversion_rate_percent, 0),
    COALESCE((
      SELECT EXTRACT(HOUR FROM dr.redeemed_at)::integer
      FROM private.deal_redemption dr
      WHERE dr.deal_id = d.id
      GROUP BY EXTRACT(HOUR FROM dr.redeemed_at)
      ORDER BY count(*) DESC
      LIMIT 1
    ), 0),
    COALESCE(dm.total_redemptions, 0)
  FROM private.deal d
  LEFT JOIN private.deal_metrics dm ON dm.deal_id = d.id
  WHERE d.business_id = "businessId"
    AND d.status = 'ACTIVE'
    AND EXISTS (
      SELECT 1 FROM private.business b
      WHERE b.id = "businessId" AND b.owner_id = auth.uid()
    )
  ORDER BY COALESCE(dm.total_redemptions, 0) DESC;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBizDash:readDealPerformance" TO authenticated;

-- Daily aggregated analytics per business for time-series charts and trend calculations
CREATE TABLE IF NOT EXISTS private.biz_analytics_daily (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES private.business(id) ON DELETE CASCADE,
  date date NOT NULL,
  impressions integer NOT NULL DEFAULT 0,
  unique_viewers integer NOT NULL DEFAULT 0,
  swipes integer NOT NULL DEFAULT 0,
  deal_redemptions integer NOT NULL DEFAULT 0,
  revenue_estimate_in_cents integer NOT NULL DEFAULT 0,

  UNIQUE(business_id, date),
  CONSTRAINT biz_analytics_daily_impressions_min CHECK (impressions >= 0),
  CONSTRAINT biz_analytics_daily_unique_viewers_min CHECK (unique_viewers >= 0),
  CONSTRAINT biz_analytics_daily_swipes_min CHECK (swipes >= 0),
  CONSTRAINT biz_analytics_daily_deal_redemptions_min CHECK (deal_redemptions >= 0),
  CONSTRAINT biz_analytics_daily_revenue_min CHECK (revenue_estimate_in_cents >= 0)
);

CREATE INDEX IF NOT EXISTS biz_analytics_daily_idx_business_id ON private.biz_analytics_daily(business_id);
CREATE INDEX IF NOT EXISTS biz_analytics_daily_idx_date ON private.biz_analytics_daily(date);
CREATE INDEX IF NOT EXISTS biz_analytics_daily_idx_business_date ON private.biz_analytics_daily(business_id, date);

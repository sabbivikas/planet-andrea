CREATE TABLE IF NOT EXISTS private.activity (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  business_id uuid NOT NULL REFERENCES private.business(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category public.activity_category NOT NULL,
  primary_image_url text NOT NULL,
  additional_image_urls text[] DEFAULT '{}',
  price_range public.price_range NOT NULL,
  operating_hours text,
  tags text[] DEFAULT '{}',
  status public.activity_status NOT NULL DEFAULT 'PENDING_REVIEW',
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  address text NOT NULL,
  rating double precision,

  CONSTRAINT activity_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 60),
  CONSTRAINT activity_description_length CHECK (char_length(description) >= 1 AND char_length(description) <= 500),
  CONSTRAINT activity_operating_hours_length CHECK (operating_hours IS NULL OR char_length(operating_hours) <= 500),
  CONSTRAINT activity_address_length CHECK (char_length(address) <= 200),
  CONSTRAINT activity_additional_images_max CHECK (array_length(additional_image_urls, 1) IS NULL OR array_length(additional_image_urls, 1) <= 5),
  CONSTRAINT activity_tags_max CHECK (array_length(tags, 1) IS NULL OR array_length(tags, 1) <= 10),
  CONSTRAINT activity_latitude_range CHECK (latitude >= -90 AND latitude <= 90),
  CONSTRAINT activity_longitude_range CHECK (longitude >= -180 AND longitude <= 180),
  CONSTRAINT activity_rating_range CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5))
);

CREATE INDEX IF NOT EXISTS activity_idx_business_id ON private.activity(business_id);
CREATE INDEX IF NOT EXISTS activity_idx_category ON private.activity(category);
CREATE INDEX IF NOT EXISTS activity_idx_status ON private.activity(status);

CREATE TABLE IF NOT EXISTS private.deal (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  business_id uuid NOT NULL REFERENCES private.business(id) ON DELETE CASCADE,
  headline text NOT NULL,
  deal_type public.deal_type NOT NULL,
  discount_value_in_percent double precision,
  discount_value_in_cents integer,
  terms_and_conditions text NOT NULL,
  minimum_group_size integer,
  minimum_spend_in_cents integer,
  start_date date NOT NULL,
  end_date date NOT NULL,
  valid_time_start time,
  valid_time_end time,
  total_redemption_limit integer,
  per_user_redemption_limit integer NOT NULL DEFAULT 1,
  status public.deal_status NOT NULL DEFAULT 'ACTIVE',
  redemption_code text NOT NULL,

  CONSTRAINT deal_headline_length CHECK (char_length(headline) >= 1 AND char_length(headline) <= 60),
  CONSTRAINT deal_terms_length CHECK (char_length(terms_and_conditions) >= 1 AND char_length(terms_and_conditions) <= 1000),
  CONSTRAINT deal_discount_percent_range CHECK (discount_value_in_percent IS NULL OR (discount_value_in_percent >= 1 AND discount_value_in_percent <= 100)),
  CONSTRAINT deal_discount_cents_min CHECK (discount_value_in_cents IS NULL OR discount_value_in_cents >= 1),
  CONSTRAINT deal_min_group_size_range CHECK (minimum_group_size IS NULL OR (minimum_group_size >= 1 AND minimum_group_size <= 20)),
  CONSTRAINT deal_min_spend_min CHECK (minimum_spend_in_cents IS NULL OR minimum_spend_in_cents >= 0),
  CONSTRAINT deal_total_redemption_min CHECK (total_redemption_limit IS NULL OR total_redemption_limit >= 1),
  CONSTRAINT deal_per_user_redemption_min CHECK (per_user_redemption_limit >= 1),
  CONSTRAINT deal_redemption_code_length CHECK (char_length(redemption_code) >= 6 AND char_length(redemption_code) <= 20),
  CONSTRAINT deal_date_range CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS deal_idx_business_id ON private.deal(business_id);
CREATE INDEX IF NOT EXISTS deal_idx_status ON private.deal(status);

-- Junction table linking deals to activities
CREATE TABLE IF NOT EXISTS private.deal_activity (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES private.deal(id) ON DELETE CASCADE,
  activity_id uuid NOT NULL REFERENCES private.activity(id) ON DELETE CASCADE,

  UNIQUE(deal_id, activity_id)
);

CREATE INDEX IF NOT EXISTS deal_activity_idx_deal_id ON private.deal_activity(deal_id);
CREATE INDEX IF NOT EXISTS deal_activity_idx_activity_id ON private.deal_activity(activity_id);

CREATE TABLE IF NOT EXISTS private.deal_redemption (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES private.deal(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redeemed_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS deal_redemption_idx_deal_id ON private.deal_redemption(deal_id);
CREATE INDEX IF NOT EXISTS deal_redemption_idx_user_id ON private.deal_redemption(user_id);

-- Aggregated performance metrics for an activity card
CREATE TABLE IF NOT EXISTS private.activity_metrics (
  activity_id uuid NOT NULL PRIMARY KEY REFERENCES private.activity(id) ON DELETE CASCADE,
  total_impressions integer NOT NULL DEFAULT 0,
  total_swipes integer NOT NULL DEFAULT 0,
  conversion_rate_percent double precision NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT activity_metrics_impressions_min CHECK (total_impressions >= 0),
  CONSTRAINT activity_metrics_swipes_min CHECK (total_swipes >= 0),
  CONSTRAINT activity_metrics_conversion_range CHECK (conversion_rate_percent >= 0 AND conversion_rate_percent <= 100)
);

-- Boost / promotion status for an activity card
CREATE TABLE IF NOT EXISTS private.activity_boost (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL UNIQUE REFERENCES private.activity(id) ON DELETE CASCADE,
  is_active boolean NOT NULL DEFAULT false,
  tier text NOT NULL DEFAULT 'BASIC',
  daily_budget_in_cents integer NOT NULL DEFAULT 0,
  remaining_budget_in_cents integer NOT NULL DEFAULT 0,
  boosted_impressions integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT activity_boost_tier_values CHECK (tier IN ('BASIC', 'PRO', 'MAX')),
  CONSTRAINT activity_boost_daily_budget_min CHECK (daily_budget_in_cents >= 0),
  CONSTRAINT activity_boost_remaining_budget_min CHECK (remaining_budget_in_cents >= 0),
  CONSTRAINT activity_boost_impressions_min CHECK (boosted_impressions >= 0)
);

CREATE INDEX IF NOT EXISTS activity_boost_idx_activity_id ON private.activity_boost(activity_id);

-- Aggregated performance metrics for a deal
CREATE TABLE IF NOT EXISTS private.deal_metrics (
  deal_id uuid NOT NULL PRIMARY KEY REFERENCES private.deal(id) ON DELETE CASCADE,
  total_views integer NOT NULL DEFAULT 0,
  total_redemptions integer NOT NULL DEFAULT 0,
  conversion_rate_percent double precision NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT deal_metrics_views_min CHECK (total_views >= 0),
  CONSTRAINT deal_metrics_redemptions_min CHECK (total_redemptions >= 0),
  CONSTRAINT deal_metrics_conversion_range CHECK (conversion_rate_percent >= 0 AND conversion_rate_percent <= 100)
);

-- Read discover feed is defined in 150_planet_swipe/7_planet_swipe-api-funcs.sql
-- because it depends on the private.swipe table created in that schema.

-- Read active activities for discovery feed (with optional deal)
CREATE OR REPLACE FUNCTION public."app:planetActivity:readAllActive"(
  "userLatitude" double precision DEFAULT NULL,
  "userLongitude" double precision DEFAULT NULL,
  "limitCount" integer DEFAULT 20,
  "offsetCount" integer DEFAULT 0
)
RETURNS SETOF public."ActivityWithDealV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    ROW(
      a.id, a.created_at, a.updated_at, a.business_id,
      a.title, a.description, a.category, a.primary_image_url,
      a.additional_image_urls, a.price_range, a.operating_hours,
      a.tags, a.status, a.latitude, a.longitude, a.address, a.rating
    )::public."ActivityV1",
    (
      SELECT ROW(
        d.id, d.created_at, d.updated_at, d.business_id,
        d.headline, d.deal_type, d.discount_value_in_percent,
        d.discount_value_in_cents, d.terms_and_conditions,
        d.minimum_group_size, d.minimum_spend_in_cents,
        d.start_date, d.end_date, d.valid_time_start, d.valid_time_end,
        d.total_redemption_limit, d.per_user_redemption_limit,
        d.status, d.redemption_code
      )::public."DealV1"
      FROM private.deal d
      JOIN private.deal_activity da ON da.deal_id = d.id
      WHERE da.activity_id = a.id
        AND d.status = 'ACTIVE'
      LIMIT 1
    )
  )::public."ActivityWithDealV1"
  FROM private.activity a
  WHERE a.status = 'ACTIVE'
    AND auth.uid() IS NOT NULL
  ORDER BY a.created_at DESC
  LIMIT "limitCount"
  OFFSET "offsetCount";
$$;

GRANT EXECUTE ON FUNCTION public."app:planetActivity:readAllActive" TO authenticated;

-- Read a single activity by ID
CREATE OR REPLACE FUNCTION public."app:planetActivity:readById"(
  "activityId" uuid
)
RETURNS public."ActivityWithDealV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    ROW(
      a.id, a.created_at, a.updated_at, a.business_id,
      a.title, a.description, a.category, a.primary_image_url,
      a.additional_image_urls, a.price_range, a.operating_hours,
      a.tags, a.status, a.latitude, a.longitude, a.address, a.rating
    )::public."ActivityV1",
    (
      SELECT ROW(
        d.id, d.created_at, d.updated_at, d.business_id,
        d.headline, d.deal_type, d.discount_value_in_percent,
        d.discount_value_in_cents, d.terms_and_conditions,
        d.minimum_group_size, d.minimum_spend_in_cents,
        d.start_date, d.end_date, d.valid_time_start, d.valid_time_end,
        d.total_redemption_limit, d.per_user_redemption_limit,
        d.status, d.redemption_code
      )::public."DealV1"
      FROM private.deal d
      JOIN private.deal_activity da ON da.deal_id = d.id
      WHERE da.activity_id = a.id
        AND d.status = 'ACTIVE'
      LIMIT 1
    )
  )::public."ActivityWithDealV1"
  FROM private.activity a
  WHERE a.id = "activityId"
    AND auth.uid() IS NOT NULL
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetActivity:readById" TO authenticated;

-- Read activities owned by the current user's business
CREATE OR REPLACE FUNCTION public."app:planetActivity:readAllByBusiness"(
  "businessId" uuid
)
RETURNS SETOF public."ActivityV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    a.id, a.created_at, a.updated_at, a.business_id,
    a.title, a.description, a.category, a.primary_image_url,
    a.additional_image_urls, a.price_range, a.operating_hours,
    a.tags, a.status, a.latitude, a.longitude, a.address, a.rating
  FROM private.activity a
  JOIN private.business b ON b.id = a.business_id
  WHERE a.business_id = "businessId"
    AND b.owner_id = auth.uid()
  ORDER BY a.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetActivity:readAllByBusiness" TO authenticated;

-- Create a new activity
CREATE OR REPLACE FUNCTION public."app:planetActivity:create"(
  "businessId" uuid,
  "title" text,
  "description" text,
  "category" public.activity_category,
  "primaryImageUrl" text,
  "priceRange" public.price_range,
  "address" text,
  "latitude" double precision,
  "longitude" double precision,
  "additionalImageUrls" text[] DEFAULT '{}',
  "operatingHours" text DEFAULT NULL,
  "tags" text[] DEFAULT '{}'
)
RETURNS public."ActivityV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _result public."ActivityV1";
BEGIN
  IF "businessId" IS NULL OR "title" IS NULL OR "description" IS NULL
     OR "category" IS NULL OR "primaryImageUrl" IS NULL OR "priceRange" IS NULL
     OR "address" IS NULL OR "latitude" IS NULL OR "longitude" IS NULL THEN
    RETURN NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM private.business b
    WHERE b.id = "businessId" AND b.owner_id = auth.uid()
  ) THEN
    RETURN NULL;
  END IF;

  INSERT INTO private.activity (
    business_id, title, description, category, primary_image_url,
    additional_image_urls, price_range, operating_hours, tags,
    latitude, longitude, address
  )
  VALUES (
    "businessId", "title", "description", "category", "primaryImageUrl",
    COALESCE("additionalImageUrls", '{}'), "priceRange", "operatingHours", COALESCE("tags", '{}'),
    "latitude", "longitude", "address"
  )
  RETURNING
    id, created_at, updated_at, business_id,
    title, description, category, primary_image_url,
    additional_image_urls, price_range, operating_hours,
    tags, status, latitude, longitude, address, rating
  INTO _result;

  RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetActivity:create" TO authenticated;

-- Update an existing activity
CREATE OR REPLACE FUNCTION public."app:planetActivity:update"(
  "activityId" uuid,
  "title" text DEFAULT NULL,
  "description" text DEFAULT NULL,
  "category" public.activity_category DEFAULT NULL,
  "primaryImageUrl" text DEFAULT NULL,
  "priceRange" public.price_range DEFAULT NULL,
  "address" text DEFAULT NULL,
  "latitude" double precision DEFAULT NULL,
  "longitude" double precision DEFAULT NULL,
  "additionalImageUrls" text[] DEFAULT NULL,
  "operatingHours" text DEFAULT '___UNSET___',
  "tags" text[] DEFAULT NULL,
  "status" public.activity_status DEFAULT NULL
)
RETURNS public."ActivityV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
  UPDATE private.activity a SET
    updated_at = CURRENT_TIMESTAMP,
    title = COALESCE("title", a.title),
    description = COALESCE("description", a.description),
    category = COALESCE("category", a.category),
    primary_image_url = COALESCE("primaryImageUrl", a.primary_image_url),
    price_range = COALESCE("priceRange", a.price_range),
    address = COALESCE("address", a.address),
    latitude = COALESCE("latitude", a.latitude),
    longitude = COALESCE("longitude", a.longitude),
    additional_image_urls = COALESCE("additionalImageUrls", a.additional_image_urls),
    operating_hours = CASE WHEN "operatingHours" IS DISTINCT FROM '___UNSET___' THEN "operatingHours" ELSE a.operating_hours END,
    tags = COALESCE("tags", a.tags),
    status = COALESCE("status", a.status)
  WHERE a.id = "activityId"
    AND EXISTS (
      SELECT 1 FROM private.business b
      WHERE b.id = a.business_id AND b.owner_id = auth.uid()
    )
  RETURNING
    a.id, a.created_at, a.updated_at, a.business_id,
    a.title, a.description, a.category, a.primary_image_url,
    a.additional_image_urls, a.price_range, a.operating_hours,
    a.tags, a.status, a.latitude, a.longitude, a.address, a.rating;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetActivity:update" TO authenticated;

-- Delete an activity
CREATE OR REPLACE FUNCTION public."app:planetActivity:delete"(
  "activityId" uuid
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
  WITH deleted AS (
    DELETE FROM private.activity a
    WHERE a.id = "activityId"
      AND EXISTS (
        SELECT 1 FROM private.business b
        WHERE b.id = a.business_id AND b.owner_id = auth.uid()
      )
    RETURNING id
  )
  SELECT EXISTS(SELECT 1 FROM deleted);
$$;

GRANT EXECUTE ON FUNCTION public."app:planetActivity:delete" TO authenticated;

-- Read deals owned by the current user's business
CREATE OR REPLACE FUNCTION public."app:planetDeal:readAllByBusiness"(
  "businessId" uuid
)
RETURNS SETOF public."DealV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    d.id, d.created_at, d.updated_at, d.business_id,
    d.headline, d.deal_type, d.discount_value_in_percent,
    d.discount_value_in_cents, d.terms_and_conditions,
    d.minimum_group_size, d.minimum_spend_in_cents,
    d.start_date, d.end_date, d.valid_time_start, d.valid_time_end,
    d.total_redemption_limit, d.per_user_redemption_limit,
    d.status, d.redemption_code
  FROM private.deal d
  JOIN private.business b ON b.id = d.business_id
  WHERE d.business_id = "businessId"
    AND b.owner_id = auth.uid()
  ORDER BY d.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetDeal:readAllByBusiness" TO authenticated;

-- Read a single deal by ID
CREATE OR REPLACE FUNCTION public."app:planetDeal:readById"(
  "dealId" uuid
)
RETURNS public."DealV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    d.id, d.created_at, d.updated_at, d.business_id,
    d.headline, d.deal_type, d.discount_value_in_percent,
    d.discount_value_in_cents, d.terms_and_conditions,
    d.minimum_group_size, d.minimum_spend_in_cents,
    d.start_date, d.end_date, d.valid_time_start, d.valid_time_end,
    d.total_redemption_limit, d.per_user_redemption_limit,
    d.status, d.redemption_code
  FROM private.deal d
  WHERE d.id = "dealId"
    AND auth.uid() IS NOT NULL
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetDeal:readById" TO authenticated;

-- Create a new deal
CREATE OR REPLACE FUNCTION public."app:planetDeal:create"(
  "businessId" uuid,
  "headline" text,
  "dealType" public.deal_type,
  "termsAndConditions" text,
  "startDate" date,
  "endDate" date,
  "redemptionCode" text,
  "discountValueInPercent" double precision DEFAULT NULL,
  "discountValueInCents" integer DEFAULT NULL,
  "minimumGroupSize" integer DEFAULT NULL,
  "minimumSpendInCents" integer DEFAULT NULL,
  "validTimeStart" time DEFAULT NULL,
  "validTimeEnd" time DEFAULT NULL,
  "totalRedemptionLimit" integer DEFAULT NULL,
  "perUserRedemptionLimit" integer DEFAULT 1,
  "activityIds" uuid[] DEFAULT '{}'
)
RETURNS public."DealV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _deal_id uuid;
  _result public."DealV1";
BEGIN
  -- Verify required params and business ownership
  IF "businessId" IS NULL OR "headline" IS NULL OR "dealType" IS NULL
     OR "termsAndConditions" IS NULL OR "startDate" IS NULL
     OR "endDate" IS NULL OR "redemptionCode" IS NULL THEN
    RETURN NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM private.business b
    WHERE b.id = "businessId" AND b.owner_id = auth.uid()
  ) THEN
    RETURN NULL;
  END IF;

  INSERT INTO private.deal (
    business_id, headline, deal_type, terms_and_conditions,
    start_date, end_date, redemption_code,
    discount_value_in_percent, discount_value_in_cents,
    minimum_group_size, minimum_spend_in_cents,
    valid_time_start, valid_time_end,
    total_redemption_limit, per_user_redemption_limit
  )
  VALUES (
    "businessId", "headline", "dealType", "termsAndConditions",
    "startDate", "endDate", "redemptionCode",
    "discountValueInPercent", "discountValueInCents",
    "minimumGroupSize", "minimumSpendInCents",
    "validTimeStart", "validTimeEnd",
    "totalRedemptionLimit", "perUserRedemptionLimit"
  )
  RETURNING id INTO STRICT _deal_id;

  -- Link activities to the deal
  IF "activityIds" IS NOT NULL AND array_length("activityIds", 1) > 0 AND _deal_id IS NOT NULL THEN
    INSERT INTO private.deal_activity (deal_id, activity_id)
    SELECT COALESCE(_deal_id, '00000000-0000-0000-0000-000000000000'::uuid),
           COALESCE(_aid, '00000000-0000-0000-0000-000000000000'::uuid)
    FROM unnest("activityIds") AS _aid
    WHERE _aid IS NOT NULL;
  END IF;

  SELECT
    d.id, d.created_at, d.updated_at, d.business_id,
    d.headline, d.deal_type, d.discount_value_in_percent,
    d.discount_value_in_cents, d.terms_and_conditions,
    d.minimum_group_size, d.minimum_spend_in_cents,
    d.start_date, d.end_date, d.valid_time_start, d.valid_time_end,
    d.total_redemption_limit, d.per_user_redemption_limit,
    d.status, d.redemption_code
  INTO _result
  FROM private.deal d
  WHERE d.id = _deal_id;

  RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetDeal:create" TO authenticated;

-- Redeem a deal
CREATE OR REPLACE FUNCTION public."app:planetDeal:redeem"(
  "dealId" uuid
)
RETURNS public."DealRedemptionV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _result public."DealRedemptionV1";
BEGIN
  IF "dealId" IS NULL OR auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM private.deal d
    WHERE d.id = "dealId" AND d.status = 'ACTIVE'
  ) THEN
    RETURN NULL;
  END IF;

  INSERT INTO private.deal_redemption (deal_id, user_id)
  VALUES ("dealId", auth.uid())
  RETURNING id, deal_id, user_id, redeemed_at
  INTO _result;

  RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetDeal:redeem" TO authenticated;

-- Read deal redemption detail by activity ID (for the deal redemption screen)
CREATE OR REPLACE FUNCTION public."app:planetDeal:readRedeemDetailByActivity"(
  "activityId" uuid
)
RETURNS public."DealRedeemDetailV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    ROW(
      d.id, d.created_at, d.updated_at, d.business_id,
      d.headline, d.deal_type, d.discount_value_in_percent,
      d.discount_value_in_cents, d.terms_and_conditions,
      d.minimum_group_size, d.minimum_spend_in_cents,
      d.start_date, d.end_date, d.valid_time_start, d.valid_time_end,
      d.total_redemption_limit, d.per_user_redemption_limit,
      d.status, d.redemption_code
    )::public."DealV1",
    b.name,
    COALESCE((
      SELECT count(*)::integer
      FROM private.deal_redemption dr
      WHERE dr.deal_id = d.id
    ), 0),
    EXISTS (
      SELECT 1
      FROM private.deal_redemption dr
      WHERE dr.deal_id = d.id
        AND dr.user_id = auth.uid()
    )
  )::public."DealRedeemDetailV1"
  FROM private.deal d
  JOIN private.deal_activity da ON da.deal_id = d.id
  JOIN private.business b ON b.id = d.business_id
  WHERE da.activity_id = "activityId"
    AND d.status = 'ACTIVE'
    AND auth.uid() IS NOT NULL
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetDeal:readRedeemDetailByActivity" TO authenticated;

-- Link a deal to an activity (for attaching a deal when creating an activity)
CREATE OR REPLACE FUNCTION public."app:planetDeal:linkActivity"(
  "dealId" uuid,
  "activityId" uuid
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  IF "dealId" IS NULL OR "activityId" IS NULL OR auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  -- Verify the user owns the business that owns both the deal and the activity
  IF NOT EXISTS (
    SELECT 1
    FROM private.deal d
    JOIN private.business b ON b.id = d.business_id
    WHERE d.id = "dealId" AND b.owner_id = auth.uid()
  ) THEN
    RETURN false;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM private.activity a
    JOIN private.business b ON b.id = a.business_id
    WHERE a.id = "activityId" AND b.owner_id = auth.uid()
  ) THEN
    RETURN false;
  END IF;

  INSERT INTO private.deal_activity (deal_id, activity_id)
  VALUES (COALESCE("dealId", '00000000-0000-0000-0000-000000000000'::uuid),
          COALESCE("activityId", '00000000-0000-0000-0000-000000000000'::uuid))
  ON CONFLICT (deal_id, activity_id) DO NOTHING;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetDeal:linkActivity" TO authenticated;

-- Read full edit detail for an activity (activity + deal + metrics + boost + business deals)
CREATE OR REPLACE FUNCTION public."app:planetActivity:readEditDetail"(
  "activityId" uuid
)
RETURNS public."ActivityEditDetailV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    -- activity
    ROW(
      a.id, a.created_at, a.updated_at, a.business_id,
      a.title, a.description, a.category, a.primary_image_url,
      a.additional_image_urls, a.price_range, a.operating_hours,
      a.tags, a.status, a.latitude, a.longitude, a.address, a.rating
    )::public."ActivityV1",
    -- linked deal (first active deal)
    (
      SELECT ROW(
        d.id, d.created_at, d.updated_at, d.business_id,
        d.headline, d.deal_type, d.discount_value_in_percent,
        d.discount_value_in_cents, d.terms_and_conditions,
        d.minimum_group_size, d.minimum_spend_in_cents,
        d.start_date, d.end_date, d.valid_time_start, d.valid_time_end,
        d.total_redemption_limit, d.per_user_redemption_limit,
        d.status, d.redemption_code
      )::public."DealV1"
      FROM private.deal d
      JOIN private.deal_activity da ON da.deal_id = d.id
      WHERE da.activity_id = a.id
        AND d.status = 'ACTIVE'
      LIMIT 1
    ),
    -- metrics
    (
      SELECT ROW(
        am.activity_id,
        am.total_impressions,
        am.total_swipes,
        am.conversion_rate_percent,
        am.updated_at
      )::public."ActivityMetricsV1"
      FROM private.activity_metrics am
      WHERE am.activity_id = a.id
    ),
    -- boost
    (
      SELECT ROW(
        ab.id,
        ab.activity_id,
        ab.is_active,
        ab.tier,
        ab.daily_budget_in_cents,
        ab.remaining_budget_in_cents,
        ab.boosted_impressions,
        ab.created_at,
        ab.updated_at
      )::public."ActivityBoostV1"
      FROM private.activity_boost ab
      WHERE ab.activity_id = a.id
    ),
    -- all deals for this business (for the deal picker)
    COALESCE(
      ARRAY(
        SELECT ROW(
          d2.id, d2.created_at, d2.updated_at, d2.business_id,
          d2.headline, d2.deal_type, d2.discount_value_in_percent,
          d2.discount_value_in_cents, d2.terms_and_conditions,
          d2.minimum_group_size, d2.minimum_spend_in_cents,
          d2.start_date, d2.end_date, d2.valid_time_start, d2.valid_time_end,
          d2.total_redemption_limit, d2.per_user_redemption_limit,
          d2.status, d2.redemption_code
        )::public."DealV1"
        FROM private.deal d2
        WHERE d2.business_id = a.business_id
          AND d2.status = 'ACTIVE'
        ORDER BY d2.created_at DESC
      ),
      '{}'::public."DealV1"[]
    )
  )::public."ActivityEditDetailV1"
  FROM private.activity a
  WHERE a.id = "activityId"
    AND EXISTS (
      SELECT 1 FROM private.business b
      WHERE b.id = a.business_id AND b.owner_id = auth.uid()
    )
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetActivity:readEditDetail" TO authenticated;

-- Unlink a deal from an activity
CREATE OR REPLACE FUNCTION public."app:planetDeal:unlinkActivity"(
  "dealId" uuid,
  "activityId" uuid
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  IF "dealId" IS NULL OR "activityId" IS NULL OR auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  -- Verify the user owns the business that owns the deal
  IF NOT EXISTS (
    SELECT 1
    FROM private.deal d
    JOIN private.business b ON b.id = d.business_id
    WHERE d.id = "dealId" AND b.owner_id = auth.uid()
  ) THEN
    RETURN false;
  END IF;

  DELETE FROM private.deal_activity
  WHERE deal_id = "dealId" AND activity_id = "activityId";

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetDeal:unlinkActivity" TO authenticated;

-- Read all deals for a business with metrics
CREATE OR REPLACE FUNCTION public."app:planetDeal:readAllByBusinessWithMetrics"(
  "businessId" uuid
)
RETURNS SETOF public."DealWithMetricsV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    ROW(
      d.id, d.created_at, d.updated_at, d.business_id,
      d.headline, d.deal_type, d.discount_value_in_percent,
      d.discount_value_in_cents, d.terms_and_conditions,
      d.minimum_group_size, d.minimum_spend_in_cents,
      d.start_date, d.end_date, d.valid_time_start, d.valid_time_end,
      d.total_redemption_limit, d.per_user_redemption_limit,
      d.status, d.redemption_code
    )::public."DealV1",
    COALESCE(dm.total_views, 0),
    COALESCE(dm.total_redemptions, 0),
    COALESCE(dm.conversion_rate_percent, 0),
    COALESCE((
      SELECT count(*)::integer
      FROM private.deal_activity da
      WHERE da.deal_id = d.id
    ), 0)
  )::public."DealWithMetricsV1"
  FROM private.deal d
  JOIN private.business b ON b.id = d.business_id
  LEFT JOIN private.deal_metrics dm ON dm.deal_id = d.id
  WHERE d.business_id = "businessId"
    AND b.owner_id = auth.uid()
  ORDER BY d.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetDeal:readAllByBusinessWithMetrics" TO authenticated;

-- Update deal status
CREATE OR REPLACE FUNCTION public."app:planetDeal:updateStatus"(
  "dealId" uuid,
  "newStatus" public.deal_status
)
RETURNS public."DealV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
  UPDATE private.deal d SET
    updated_at = CURRENT_TIMESTAMP,
    status = COALESCE("newStatus", d.status)
  WHERE d.id = "dealId"
    AND EXISTS (
      SELECT 1 FROM private.business b
      WHERE b.id = d.business_id AND b.owner_id = auth.uid()
    )
  RETURNING
    d.id, d.created_at, d.updated_at, d.business_id,
    d.headline, d.deal_type, d.discount_value_in_percent,
    d.discount_value_in_cents, d.terms_and_conditions,
    d.minimum_group_size, d.minimum_spend_in_cents,
    d.start_date, d.end_date, d.valid_time_start, d.valid_time_end,
    d.total_redemption_limit, d.per_user_redemption_limit,
    d.status, d.redemption_code;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetDeal:updateStatus" TO authenticated;

-- Delete a deal
CREATE OR REPLACE FUNCTION public."app:planetDeal:delete"(
  "dealId" uuid
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
  WITH deleted AS (
    DELETE FROM private.deal d
    WHERE d.id = "dealId"
      AND EXISTS (
        SELECT 1 FROM private.business b
        WHERE b.id = d.business_id AND b.owner_id = auth.uid()
      )
    RETURNING id
  )
  SELECT EXISTS(SELECT 1 FROM deleted);
$$;

GRANT EXECUTE ON FUNCTION public."app:planetDeal:delete" TO authenticated;

-- Duplicate a deal (creates a copy with SCHEDULED status and zero metrics)
CREATE OR REPLACE FUNCTION public."app:planetDeal:duplicate"(
  "dealId" uuid
)
RETURNS public."DealV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _new_deal_id uuid;
  _result public."DealV1";
BEGIN
  IF "dealId" IS NULL OR auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  -- Verify ownership
  IF NOT EXISTS (
    SELECT 1 FROM private.deal d
    JOIN private.business b ON b.id = d.business_id
    WHERE d.id = "dealId" AND b.owner_id = auth.uid()
  ) THEN
    RETURN NULL;
  END IF;

  -- Copy the deal with SCHEDULED status
  INSERT INTO private.deal (
    business_id, headline, deal_type, discount_value_in_percent,
    discount_value_in_cents, terms_and_conditions,
    minimum_group_size, minimum_spend_in_cents,
    start_date, end_date, valid_time_start, valid_time_end,
    total_redemption_limit, per_user_redemption_limit,
    status, redemption_code
  )
  SELECT
    d.business_id, d.headline, d.deal_type, d.discount_value_in_percent,
    d.discount_value_in_cents, d.terms_and_conditions,
    d.minimum_group_size, d.minimum_spend_in_cents,
    d.start_date, d.end_date, d.valid_time_start, d.valid_time_end,
    d.total_redemption_limit, d.per_user_redemption_limit,
    'SCHEDULED'::public.deal_status, d.redemption_code || '_COPY'
  FROM private.deal d
  WHERE d.id = "dealId"
  RETURNING id INTO STRICT _new_deal_id;

  -- Copy deal-activity links
  INSERT INTO private.deal_activity (deal_id, activity_id)
  SELECT COALESCE(_new_deal_id, '00000000-0000-0000-0000-000000000000'::uuid), da.activity_id
  FROM private.deal_activity da
  WHERE da.deal_id = "dealId";

  -- Create empty metrics row
  INSERT INTO private.deal_metrics (deal_id)
  VALUES (COALESCE(_new_deal_id, '00000000-0000-0000-0000-000000000000'::uuid));

  SELECT
    d.id, d.created_at, d.updated_at, d.business_id,
    d.headline, d.deal_type, d.discount_value_in_percent,
    d.discount_value_in_cents, d.terms_and_conditions,
    d.minimum_group_size, d.minimum_spend_in_cents,
    d.start_date, d.end_date, d.valid_time_start, d.valid_time_end,
    d.total_redemption_limit, d.per_user_redemption_limit,
    d.status, d.redemption_code
  INTO _result
  FROM private.deal d
  WHERE d.id = _new_deal_id;

  RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetDeal:duplicate" TO authenticated;

-- Read deal activities (linked activity IDs for a deal)
CREATE OR REPLACE FUNCTION public."app:planetDeal:readActivities"(
  "dealId" uuid
)
RETURNS SETOF public."DealActivityV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT da.id, da.deal_id, da.activity_id
  FROM private.deal_activity da
  WHERE da.deal_id = "dealId"
    AND auth.uid() IS NOT NULL;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetDeal:readActivities" TO authenticated;

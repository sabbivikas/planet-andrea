-- Create a swipe
CREATE OR REPLACE FUNCTION public."app:planetSwipe:create"(
  "activityId" uuid,
  "action" public.swipe_action,
  "groupId" uuid DEFAULT NULL
)
RETURNS public."SwipeV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
  INSERT INTO private.swipe (user_id, activity_id, group_id, action)
  SELECT auth.uid(), "activityId", "groupId", "action"
  WHERE auth.uid() IS NOT NULL AND "activityId" IS NOT NULL AND "action" IS NOT NULL
  RETURNING id, created_at, user_id, activity_id, group_id, action;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetSwipe:create" TO authenticated;

-- Read swipes for the current user (to filter already-swiped activities)
CREATE OR REPLACE FUNCTION public."app:planetSwipe:readAllByUser"(
  "limitCount" integer DEFAULT 100,
  "offsetCount" integer DEFAULT 0
)
RETURNS SETOF public."SwipeV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    s.id, s.created_at, s.user_id, s.activity_id, s.group_id, s.action
  FROM private.swipe s
  WHERE s.user_id = auth.uid()
  ORDER BY s.created_at DESC
  LIMIT "limitCount"
  OFFSET "offsetCount";
$$;

GRANT EXECUTE ON FUNCTION public."app:planetSwipe:readAllByUser" TO authenticated;

-- Read swipes for a group (to compute ranked activities)
CREATE OR REPLACE FUNCTION public."app:planetSwipe:readAllByGroup"(
  "groupId" uuid
)
RETURNS SETOF public."SwipeV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    s.id, s.created_at, s.user_id, s.activity_id, s.group_id, s.action
  FROM private.swipe s
  WHERE s.group_id = "groupId"
    AND private.check_user_is_group_member("groupId", auth.uid())
  ORDER BY s.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetSwipe:readAllByGroup" TO authenticated;

-- Undo last swipe
CREATE OR REPLACE FUNCTION public."app:planetSwipe:undoLast"()
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
  WITH deleted AS (
    DELETE FROM private.swipe s
    WHERE s.id = (
      SELECT s2.id FROM private.swipe s2
      WHERE s2.user_id = auth.uid()
      ORDER BY s2.created_at DESC
      LIMIT 1
    )
    RETURNING id
  )
  SELECT EXISTS(SELECT 1 FROM deleted);
$$;

GRANT EXECUTE ON FUNCTION public."app:planetSwipe:undoLast" TO authenticated;

-- Delete all swipe records for all users (admin only, used for one-time data cleanup)
CREATE OR REPLACE FUNCTION public."admin:planetSwipe:deleteAll"()
RETURNS integer
SET search_path = ''
LANGUAGE sql
AS $$
  WITH deleted AS (
    DELETE FROM private.swipe
    WHERE id IS NOT NULL
    RETURNING id
  )
  SELECT count(*)::integer FROM deleted;
$$;

GRANT EXECUTE ON FUNCTION public."admin:planetSwipe:deleteAll" TO service_role;

-- Delete all swipe records for the current user (to reset their discover feed)
CREATE OR REPLACE FUNCTION public."app:planetSwipe:deleteByUser"()
RETURNS integer
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
  WITH deleted AS (
    DELETE FROM private.swipe s
    WHERE s.user_id = auth.uid()
      AND auth.uid() IS NOT NULL
    RETURNING id
  )
  SELECT count(*)::integer FROM deleted;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetSwipe:deleteByUser" TO authenticated;

-- Read discover feed: active activities with deal + business name, excluding already-swiped.
-- Defined here because it depends on private.swipe table.
CREATE OR REPLACE FUNCTION public."app:planetActivity:readDiscoverFeed"(
  "userLatitude" double precision DEFAULT NULL,
  "userLongitude" double precision DEFAULT NULL,
  "limitCount" integer DEFAULT 20,
  "offsetCount" integer DEFAULT 0
)
RETURNS SETOF public."ActivityDiscoverCardV1"
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
    ),
    b.name
  )::public."ActivityDiscoverCardV1"
  FROM private.activity a
  JOIN private.business b ON b.id = a.business_id
  WHERE a.status = 'ACTIVE'
    AND auth.uid() IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM private.swipe s
      WHERE s.user_id = auth.uid()
        AND s.activity_id = a.id
    )
  ORDER BY a.id ASC
  LIMIT "limitCount"
  OFFSET "offsetCount";
$$;

GRANT EXECUTE ON FUNCTION public."app:planetActivity:readDiscoverFeed" TO authenticated;

-- Read recent liked/super-liked swipes with activity details for profile history
CREATE OR REPLACE FUNCTION public."app:planetSwipe:readRecentWithActivity"(
  "limitCount" integer DEFAULT 20
)
RETURNS SETOF public."SwipeWithActivityV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    ROW(
      s.id, s.created_at, s.user_id, s.activity_id, s.group_id, s.action
    )::public."SwipeV1",
    a.title,
    a.primary_image_url,
    a.category
  )::public."SwipeWithActivityV1"
  FROM private.swipe s
  JOIN private.activity a ON a.id = s.activity_id
  WHERE s.user_id = auth.uid()
    AND s.action IN ('LIKE', 'SUPER_LIKE')
  ORDER BY s.created_at DESC
  LIMIT "limitCount";
$$;

GRANT EXECUTE ON FUNCTION public."app:planetSwipe:readRecentWithActivity" TO authenticated;

-- User search/nearby functions that depend on private.group_member table.
-- Defined here instead of 100_planet_user because group_member is created in schema 140.

-- Search Planet users by name or username (excludes current user and existing group members)
CREATE OR REPLACE FUNCTION public."app:planetUser:search"(
  "query" text,
  "excludeGroupId" uuid DEFAULT NULL,
  "limitCount" integer DEFAULT 20
)
RETURNS SETOF public."PlanetUserSearchResultV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    p.id,
    COALESCE(p.full_name, p.given_name, 'User'),
    p.username,
    p.avatar_url,
    COALESCE(uap.is_verified, false)
  FROM private.profile p
  LEFT JOIN private.user_app_profile uap ON uap.user_id = p.id
  WHERE auth.uid() IS NOT NULL
    AND p.id != auth.uid()
    AND (
      p.full_name ILIKE '%' || "query" || '%'
      OR p.username ILIKE '%' || "query" || '%'
      OR p.given_name ILIKE '%' || "query" || '%'
    )
    AND (
      "excludeGroupId" IS NULL
      OR NOT EXISTS (
        SELECT 1 FROM private.group_member gm
        WHERE gm.group_id = "excludeGroupId" AND gm.user_id = p.id
      )
    )
  ORDER BY p.full_name ASC
  LIMIT "limitCount";
$$;

GRANT EXECUTE ON FUNCTION public."app:planetUser:search" TO authenticated;

-- Read nearby verified users (excludes current user and existing group members)
CREATE OR REPLACE FUNCTION public."app:planetUser:readNearby"(
  "userLatitude" double precision,
  "userLongitude" double precision,
  "radiusInKm" double precision DEFAULT 10.0,
  "excludeGroupId" uuid DEFAULT NULL,
  "limitCount" integer DEFAULT 20
)
RETURNS SETOF public."NearbyUserV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    p.id,
    COALESCE(p.full_name, p.given_name, 'User'),
    p.avatar_url,
    uap.is_verified,
    (
      6371 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians("userLatitude")) * cos(radians(uap.location_latitude))
          * cos(radians(uap.location_longitude) - radians("userLongitude"))
          + sin(radians("userLatitude")) * sin(radians(uap.location_latitude))
        ))
      )
    ) AS distance_km
  FROM private.user_app_profile uap
  JOIN private.profile p ON p.id = uap.user_id
  WHERE auth.uid() IS NOT NULL
    AND uap.user_id != auth.uid()
    AND uap.is_verified = true
    AND uap.location_latitude IS NOT NULL
    AND uap.location_longitude IS NOT NULL
    AND (
      6371 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians("userLatitude")) * cos(radians(uap.location_latitude))
          * cos(radians(uap.location_longitude) - radians("userLongitude"))
          + sin(radians("userLatitude")) * sin(radians(uap.location_latitude))
        ))
      )
    ) <= "radiusInKm"
    AND (
      "excludeGroupId" IS NULL
      OR NOT EXISTS (
        SELECT 1 FROM private.group_member gm
        WHERE gm.group_id = "excludeGroupId" AND gm.user_id = uap.user_id
      )
    )
  ORDER BY distance_km ASC
  LIMIT "limitCount";
$$;

GRANT EXECUTE ON FUNCTION public."app:planetUser:readNearby" TO authenticated;

-- Group-related functions that depend on private.swipe table.
-- Defined here instead of 140_planet_group because the swipe table is created in this schema.

-- Read recent swipe activity for a group with member and activity details
CREATE OR REPLACE FUNCTION public."app:planetGroup:readSwipeActivity"(
  "groupId" uuid,
  "limitCount" integer DEFAULT 10
)
RETURNS SETOF public."GroupSwipeActivityV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    s.id,
    COALESCE(p.full_name, p.given_name, 'User'),
    UPPER(LEFT(COALESCE(p.full_name, p.given_name, 'U'), 1)),
    s.action,
    a.title,
    a.primary_image_url,
    s.created_at
  FROM private.swipe s
  JOIN private.profile p ON p.id = s.user_id
  JOIN private.activity a ON a.id = s.activity_id
  WHERE s.group_id = "groupId"
    AND private.check_user_is_group_member("groupId", auth.uid())
  ORDER BY s.created_at DESC
  LIMIT "limitCount";
$$;

GRANT EXECUTE ON FUNCTION public."app:planetGroup:readSwipeActivity" TO authenticated;

-- Read ranked activities for a group based on aggregated swipes
CREATE OR REPLACE FUNCTION public."app:planetGroup:readRankedActivities"(
  "groupId" uuid,
  "limitCount" integer DEFAULT 10
)
RETURNS SETOF public."GroupRankedActivityV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    a.id,
    a.title,
    a.primary_image_url,
    count(*)::integer,
    EXISTS (
      SELECT 1 FROM private.deal_activity da
      JOIN private.deal d ON d.id = da.deal_id
      WHERE da.activity_id = a.id AND d.status = 'ACTIVE'
    )
  FROM private.swipe s
  JOIN private.activity a ON a.id = s.activity_id
  WHERE s.group_id = "groupId"
    AND s.action IN ('LIKE', 'SUPER_LIKE')
    AND private.check_user_is_group_member("groupId", auth.uid())
  GROUP BY a.id, a.title, a.primary_image_url
  ORDER BY count(*) DESC
  LIMIT "limitCount";
$$;

GRANT EXECUTE ON FUNCTION public."app:planetGroup:readRankedActivities" TO authenticated;

-- Read chat preview (last message) for a group's linked conversation
CREATE OR REPLACE FUNCTION public."app:planetGroup:readChatPreview"(
  "groupId" uuid
)
RETURNS public."GroupChatPreviewV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    COALESCE(p.full_name, p.given_name, 'User'),
    cm.content_text,
    cm.created_at
  )::public."GroupChatPreviewV1"
  FROM private.planet_group g
  JOIN private.conversation_message cm ON cm.conversation_id = g.conversation_id
  LEFT JOIN private.profile p ON p.id = cm.author_entity_id
  WHERE g.id = "groupId"
    AND g.conversation_id IS NOT NULL
    AND private.check_user_is_group_member("groupId", auth.uid())
  ORDER BY cm.created_at DESC
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetGroup:readChatPreview" TO authenticated;

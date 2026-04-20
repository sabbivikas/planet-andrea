-- Read the current user's app profile
CREATE OR REPLACE FUNCTION public."app:planetUser:read"()
RETURNS public."UserAppProfileV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    uap.user_id,
    uap.created_at,
    uap.updated_at,
    uap.is_verified,
    uap.verification_status,
    uap.is_onboarded,
    uap.is_business_owner,
    uap.location_latitude,
    uap.location_longitude,
    uap.phone_number
  FROM private.user_app_profile uap
  WHERE uap.user_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public."app:planetUser:read" TO authenticated;

-- Update the current user's app profile
CREATE OR REPLACE FUNCTION public."app:planetUser:update"(
  "isOnboarded" boolean DEFAULT NULL,
  "isBusinessOwner" boolean DEFAULT NULL,
  "locationLatitude" double precision DEFAULT NULL,
  "locationLongitude" double precision DEFAULT NULL,
  "phoneNumber" text DEFAULT NULL
)
RETURNS public."UserAppProfileV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
  UPDATE private.user_app_profile uap SET
    updated_at = CURRENT_TIMESTAMP,
    is_onboarded = COALESCE("isOnboarded", uap.is_onboarded),
    is_business_owner = COALESCE("isBusinessOwner", uap.is_business_owner),
    location_latitude = COALESCE("locationLatitude", uap.location_latitude),
    location_longitude = COALESCE("locationLongitude", uap.location_longitude),
    phone_number = COALESCE("phoneNumber", uap.phone_number)
  WHERE uap.user_id = auth.uid()
  RETURNING
    uap.user_id,
    uap.created_at,
    uap.updated_at,
    uap.is_verified,
    uap.verification_status,
    uap.is_onboarded,
    uap.is_business_owner,
    uap.location_latitude,
    uap.location_longitude,
    uap.phone_number;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetUser:update" TO authenticated;

-- Admin function to update verification status (called from edge functions after review)
CREATE OR REPLACE FUNCTION public."admin:planetUser:updateVerification"(
  "userId" uuid,
  "newVerificationStatus" public.verification_status
)
RETURNS void
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  IF "userId" IS NULL OR "newVerificationStatus" IS NULL THEN
    RETURN;
  END IF;

  UPDATE private.user_app_profile SET
    updated_at = CURRENT_TIMESTAMP,
    verification_status = COALESCE("newVerificationStatus", verification_status),
    is_verified = (COALESCE("newVerificationStatus", verification_status) = 'VERIFIED')
  WHERE user_id = "userId";
END;
$$;

GRANT EXECUTE ON FUNCTION public."admin:planetUser:updateVerification" TO service_role;

-- NOTE: app:planetUser:search and app:planetUser:readNearby are defined in
-- 150_planet_swipe/7_planet_swipe-api-funcs.sql because they depend on
-- private.group_member table created in schema 140.

-- NOTE: app:planetUser:readStats is defined in 160_planet_battle/7_planet_battle-api-funcs.sql
-- because it depends on private.group_member, private.battle, private.vote, and private.swipe
-- tables created in schemas 140, 150, and 160.

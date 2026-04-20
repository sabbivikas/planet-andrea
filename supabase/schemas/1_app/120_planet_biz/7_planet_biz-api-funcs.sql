-- Read the current user's business
CREATE OR REPLACE FUNCTION public."app:planetBiz:read"()
RETURNS public."BusinessV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    b.id,
    b.created_at,
    b.updated_at,
    b.owner_id,
    b.name,
    b.logo_url,
    b.is_verified,
    b.subscription_tier
  FROM private.business b
  WHERE b.owner_id = auth.uid()
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBiz:read" TO authenticated;

-- Create a new business for the current user
CREATE OR REPLACE FUNCTION public."app:planetBiz:create"(
  "name" text,
  "logoUrl" text DEFAULT NULL
)
RETURNS public."BusinessV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
  WITH inserted AS (
    INSERT INTO private.business (owner_id, name, logo_url)
    SELECT auth.uid(), "name", "logoUrl"
    WHERE auth.uid() IS NOT NULL
    RETURNING *
  ),
  update_owner AS (
    UPDATE private.user_app_profile
    SET is_business_owner = true, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = auth.uid()
  )
  SELECT
    i.id,
    i.created_at,
    i.updated_at,
    i.owner_id,
    i.name,
    i.logo_url,
    i.is_verified,
    i.subscription_tier
  FROM inserted i;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBiz:create" TO authenticated;

-- Update the current user's business
CREATE OR REPLACE FUNCTION public."app:planetBiz:update"(
  "businessId" uuid,
  "name" text DEFAULT NULL,
  "logoUrl" text DEFAULT '___UNSET___'
)
RETURNS public."BusinessV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
  UPDATE private.business b SET
    updated_at = CURRENT_TIMESTAMP,
    name = COALESCE("name", b.name),
    logo_url = CASE WHEN "logoUrl" IS DISTINCT FROM '___UNSET___' THEN "logoUrl" ELSE b.logo_url END
  WHERE b.id = "businessId"
    AND b.owner_id = auth.uid()
  RETURNING
    b.id,
    b.created_at,
    b.updated_at,
    b.owner_id,
    b.name,
    b.logo_url,
    b.is_verified,
    b.subscription_tier;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBiz:update" TO authenticated;

-- Extension table for app-specific user profile data.
-- References auth.users via FK; does NOT modify the library profile table.
CREATE TABLE IF NOT EXISTS private.user_app_profile (
  user_id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_verified boolean NOT NULL DEFAULT false,
  verification_status public.verification_status NOT NULL DEFAULT 'NOT_STARTED',
  is_onboarded boolean NOT NULL DEFAULT false,
  is_business_owner boolean NOT NULL DEFAULT false,
  location_latitude double precision,
  location_longitude double precision,
  phone_number text,

  CONSTRAINT location_latitude_range CHECK (location_latitude IS NULL OR (location_latitude >= -90 AND location_latitude <= 90)),
  CONSTRAINT location_longitude_range CHECK (location_longitude IS NULL OR (location_longitude >= -180 AND location_longitude <= 180))
);

-- Auto-create user_app_profile when a new user signs up
CREATE OR REPLACE FUNCTION private.handle_new_user_app_profile() RETURNS trigger
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO private.user_app_profile (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created_app_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION private.handle_new_user_app_profile();

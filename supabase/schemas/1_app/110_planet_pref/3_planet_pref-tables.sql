CREATE TABLE IF NOT EXISTS private.user_preference (
  user_id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  activity_categories public.activity_category[] NOT NULL DEFAULT '{}',
  location_permission_granted boolean NOT NULL DEFAULT false,
  push_notifications_enabled boolean NOT NULL DEFAULT true,
  battle_notifications_enabled boolean NOT NULL DEFAULT true,
  group_activity_notifications_enabled boolean NOT NULL DEFAULT true,
  deal_notifications_enabled boolean NOT NULL DEFAULT true,
  friend_activity_notifications_enabled boolean NOT NULL DEFAULT true,

  CONSTRAINT activity_categories_min CHECK (array_length(activity_categories, 1) IS NULL OR array_length(activity_categories, 1) >= 0),
  CONSTRAINT activity_categories_max CHECK (array_length(activity_categories, 1) IS NULL OR array_length(activity_categories, 1) <= 8)
);

-- Auto-create user_preference when a new user signs up
CREATE OR REPLACE FUNCTION private.handle_new_user_preference() RETURNS trigger
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO private.user_preference (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created_preference
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION private.handle_new_user_preference();

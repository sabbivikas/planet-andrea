-- Read the current user's preferences
CREATE OR REPLACE FUNCTION public."app:planetPref:read"()
RETURNS public."UserPreferenceV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    up.user_id,
    up.created_at,
    up.updated_at,
    up.activity_categories,
    up.location_permission_granted,
    up.push_notifications_enabled,
    up.battle_notifications_enabled,
    up.group_activity_notifications_enabled,
    up.deal_notifications_enabled,
    up.friend_activity_notifications_enabled
  FROM private.user_preference up
  WHERE up.user_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public."app:planetPref:read" TO authenticated;

-- Update the current user's preferences
CREATE OR REPLACE FUNCTION public."app:planetPref:update"(
  "activityCategories" public.activity_category[] DEFAULT NULL,
  "locationPermissionGranted" boolean DEFAULT NULL,
  "pushNotificationsEnabled" boolean DEFAULT NULL,
  "battleNotificationsEnabled" boolean DEFAULT NULL,
  "groupActivityNotificationsEnabled" boolean DEFAULT NULL,
  "dealNotificationsEnabled" boolean DEFAULT NULL,
  "friendActivityNotificationsEnabled" boolean DEFAULT NULL
)
RETURNS public."UserPreferenceV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
  UPDATE private.user_preference up SET
    updated_at = CURRENT_TIMESTAMP,
    activity_categories = COALESCE("activityCategories", up.activity_categories),
    location_permission_granted = COALESCE("locationPermissionGranted", up.location_permission_granted),
    push_notifications_enabled = COALESCE("pushNotificationsEnabled", up.push_notifications_enabled),
    battle_notifications_enabled = COALESCE("battleNotificationsEnabled", up.battle_notifications_enabled),
    group_activity_notifications_enabled = COALESCE("groupActivityNotificationsEnabled", up.group_activity_notifications_enabled),
    deal_notifications_enabled = COALESCE("dealNotificationsEnabled", up.deal_notifications_enabled),
    friend_activity_notifications_enabled = COALESCE("friendActivityNotificationsEnabled", up.friend_activity_notifications_enabled)
  WHERE up.user_id = auth.uid()
  RETURNING
    up.user_id,
    up.created_at,
    up.updated_at,
    up.activity_categories,
    up.location_permission_granted,
    up.push_notifications_enabled,
    up.battle_notifications_enabled,
    up.group_activity_notifications_enabled,
    up.deal_notifications_enabled,
    up.friend_activity_notifications_enabled;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetPref:update" TO authenticated;

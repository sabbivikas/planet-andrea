CREATE TABLE IF NOT EXISTS private.swipe (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_id uuid NOT NULL REFERENCES private.activity(id) ON DELETE CASCADE,
  group_id uuid REFERENCES private.planet_group(id) ON DELETE SET NULL,
  action public.swipe_action NOT NULL
);

CREATE INDEX IF NOT EXISTS swipe_idx_user_id ON private.swipe(user_id);
CREATE INDEX IF NOT EXISTS swipe_idx_activity_id ON private.swipe(activity_id);
CREATE INDEX IF NOT EXISTS swipe_idx_group_id ON private.swipe(group_id) WHERE group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS swipe_idx_user_activity ON private.swipe(user_id, activity_id);

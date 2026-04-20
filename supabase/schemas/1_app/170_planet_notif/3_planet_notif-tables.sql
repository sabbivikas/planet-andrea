CREATE TABLE IF NOT EXISTS private.notification (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  linked_group_id uuid REFERENCES private.planet_group(id) ON DELETE SET NULL,
  linked_activity_id uuid REFERENCES private.activity(id) ON DELETE SET NULL,
  linked_battle_id uuid REFERENCES private.battle(id) ON DELETE SET NULL,
  linked_merge_request_id uuid REFERENCES private.merge_request(id) ON DELETE SET NULL,
  is_read boolean NOT NULL DEFAULT false,

  CONSTRAINT notification_title_length CHECK (char_length(title) <= 100),
  CONSTRAINT notification_body_length CHECK (char_length(body) <= 300)
);

CREATE INDEX IF NOT EXISTS notification_idx_user_id ON private.notification(user_id);
CREATE INDEX IF NOT EXISTS notification_idx_is_read ON private.notification(user_id, is_read) WHERE is_read = false;

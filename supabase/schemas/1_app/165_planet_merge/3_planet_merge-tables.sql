CREATE TABLE IF NOT EXISTS private.merge_request (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  initiating_group_id uuid NOT NULL REFERENCES private.planet_group(id) ON DELETE CASCADE,
  other_group_id uuid NOT NULL REFERENCES private.planet_group(id) ON DELETE CASCADE,
  activity_id uuid REFERENCES private.activity(id) ON DELETE SET NULL,
  battle_id uuid REFERENCES private.battle(id) ON DELETE SET NULL,
  status public.merge_request_status NOT NULL DEFAULT 'PENDING'
);

CREATE INDEX IF NOT EXISTS merge_request_idx_initiating_group ON private.merge_request(initiating_group_id);
CREATE INDEX IF NOT EXISTS merge_request_idx_other_group ON private.merge_request(other_group_id);
CREATE INDEX IF NOT EXISTS merge_request_idx_status ON private.merge_request(status);

CREATE TABLE IF NOT EXISTS private.orbit_channel (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  group_id_1 uuid NOT NULL REFERENCES private.planet_group(id) ON DELETE CASCADE,
  group_id_2 uuid NOT NULL REFERENCES private.planet_group(id) ON DELETE CASCADE,
  merge_request_id uuid NOT NULL REFERENCES private.merge_request(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES private.conversation(id) ON DELETE SET NULL,
  UNIQUE(merge_request_id)
);

CREATE INDEX IF NOT EXISTS orbit_channel_idx_group_1 ON private.orbit_channel(group_id_1);
CREATE INDEX IF NOT EXISTS orbit_channel_idx_group_2 ON private.orbit_channel(group_id_2);

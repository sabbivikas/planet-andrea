CREATE TABLE IF NOT EXISTS private.planet_group (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  name text NOT NULL,
  photo_url text,
  is_open_to_strangers boolean NOT NULL DEFAULT false,
  max_group_size integer NOT NULL DEFAULT 10,
  visibility public.group_visibility NOT NULL DEFAULT 'PRIVATE',
  created_by_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  next_plan_at timestamptz,

  latitude double precision,
  longitude double precision,
  featured_activity_name text,

  CONSTRAINT group_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 30),
  CONSTRAINT group_max_size_range CHECK (max_group_size >= 4 AND max_group_size <= 20),
  conversation_id uuid REFERENCES private.conversation(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS private.group_orbit (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  group_id uuid NOT NULL REFERENCES private.planet_group(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS group_orbit_idx_group_id ON private.group_orbit(group_id);
CREATE INDEX IF NOT EXISTS group_orbit_idx_user_id ON private.group_orbit(user_id);

CREATE TABLE IF NOT EXISTS private.group_join_request (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  group_id uuid NOT NULL REFERENCES private.planet_group(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text,
  status text NOT NULL DEFAULT 'PENDING',
  UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS group_join_request_idx_group_id ON private.group_join_request(group_id);
CREATE INDEX IF NOT EXISTS group_join_request_idx_user_id ON private.group_join_request(user_id);

CREATE INDEX IF NOT EXISTS planet_group_idx_created_by_id ON private.planet_group(created_by_id);

CREATE TABLE IF NOT EXISTS private.group_member (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES private.planet_group(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_owner boolean NOT NULL DEFAULT false,
  joined_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_online boolean NOT NULL DEFAULT false,

  UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS group_member_idx_group_id ON private.group_member(group_id);
CREATE INDEX IF NOT EXISTS group_member_idx_user_id ON private.group_member(user_id);

CREATE TABLE IF NOT EXISTS private.invite (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  group_id uuid NOT NULL REFERENCES private.planet_group(id) ON DELETE CASCADE,
  invited_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code text NOT NULL,
  expires_at timestamptz,
  is_accepted boolean NOT NULL DEFAULT false,

  CONSTRAINT invite_code_length CHECK (char_length(invite_code) >= 8 AND char_length(invite_code) <= 32)
);

CREATE INDEX IF NOT EXISTS invite_idx_group_id ON private.invite(group_id);
CREATE INDEX IF NOT EXISTS invite_idx_invited_by_user_id ON private.invite(invited_by_user_id);
CREATE INDEX IF NOT EXISTS invite_idx_invite_code ON private.invite(invite_code);

-- Reactions on group chat messages
CREATE TABLE IF NOT EXISTS private.group_chat_reaction (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  message_id uuid NOT NULL REFERENCES private.conversation_message(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji text NOT NULL,

  UNIQUE(message_id, user_id, emoji),
  CONSTRAINT reaction_emoji_length CHECK (char_length(emoji) >= 1 AND char_length(emoji) <= 10)
);

CREATE INDEX IF NOT EXISTS group_chat_reaction_idx_message_id ON private.group_chat_reaction(message_id);
CREATE INDEX IF NOT EXISTS group_chat_reaction_idx_user_id ON private.group_chat_reaction(user_id);

-- Crew nudge tracking: enforces 24-hour per-recipient cooldown
CREATE TABLE IF NOT EXISTS private.crew_nudge (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id uuid NOT NULL REFERENCES private.planet_group(id) ON DELETE CASCADE,
  nudged_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS crew_nudge_idx_recipient_group ON private.crew_nudge(recipient_id, group_id);
CREATE INDEX IF NOT EXISTS crew_nudge_idx_group_id ON private.crew_nudge(group_id);

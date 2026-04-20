CREATE TABLE IF NOT EXISTS private.battle (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  group_id uuid NOT NULL REFERENCES private.planet_group(id) ON DELETE CASCADE,
  phase public.battle_phase NOT NULL DEFAULT 'VOTING_OPEN',
  duration_in_min integer NOT NULL DEFAULT 3,
  started_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ends_at timestamptz NOT NULL,
  winning_activity_id uuid REFERENCES private.activity(id) ON DELETE SET NULL,

  CONSTRAINT battle_duration_range CHECK (duration_in_min >= 1 AND duration_in_min <= 10)
);

CREATE INDEX IF NOT EXISTS battle_idx_group_id ON private.battle(group_id);
CREATE INDEX IF NOT EXISTS battle_idx_phase ON private.battle(phase);

CREATE TABLE IF NOT EXISTS private.battle_finalist (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid NOT NULL REFERENCES private.battle(id) ON DELETE CASCADE,
  activity_id uuid NOT NULL REFERENCES private.activity(id) ON DELETE CASCADE,
  vote_count integer NOT NULL DEFAULT 0,

  UNIQUE(battle_id, activity_id),
  CONSTRAINT vote_count_min CHECK (vote_count >= 0)
);

CREATE INDEX IF NOT EXISTS battle_finalist_idx_battle_id ON private.battle_finalist(battle_id);

CREATE TABLE IF NOT EXISTS private.vote (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  battle_id uuid NOT NULL REFERENCES private.battle(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_id uuid NOT NULL REFERENCES private.activity(id) ON DELETE CASCADE,
  rank integer,

  UNIQUE(battle_id, user_id, activity_id),
  CONSTRAINT vote_rank_range CHECK (rank IS NULL OR (rank >= 1 AND rank <= 10))
);

CREATE INDEX IF NOT EXISTS vote_idx_battle_id ON private.vote(battle_id);
CREATE INDEX IF NOT EXISTS vote_idx_user_id ON private.vote(user_id);

CREATE TABLE IF NOT EXISTS private.battle_mini_game_result (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  battle_id uuid NOT NULL REFERENCES private.battle(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type text NOT NULL,
  won boolean,
  reaction_time_in_ms integer,

  UNIQUE(battle_id, user_id)
);

CREATE INDEX IF NOT EXISTS battle_mini_game_result_idx_battle_id ON private.battle_mini_game_result(battle_id);

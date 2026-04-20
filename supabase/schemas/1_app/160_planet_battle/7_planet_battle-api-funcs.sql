-- Create a new battle for a group
CREATE OR REPLACE FUNCTION public."app:planetBattle:create"(
  "groupId" uuid,
  "durationInMin" integer DEFAULT 3,
  "activityIds" uuid[] DEFAULT '{}'
)
RETURNS public."BattleWithFinalistsV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _battle_id uuid;
  _ends_at timestamptz;
  _result public."BattleWithFinalistsV1";
  _total_members integer;
  _ready_members integer;
BEGIN
  IF NOT private.check_user_is_group_member("groupId", auth.uid()) THEN
    RETURN NULL;
  END IF;

  -- Swipe gate: majority of members must have swiped >= 3 activities
  SELECT
    COUNT(*),
    COUNT(*) FILTER (
      WHERE (
        SELECT COUNT(s.id) FROM private.swipe s
        WHERE s.user_id = gm.user_id
          AND s.group_id = "groupId"
          AND s.action IN ('LIKE', 'SUPER_LIKE')
      ) >= 3
    )
  INTO _total_members, _ready_members
  FROM private.group_member gm
  WHERE gm.group_id = "groupId";

  IF _total_members > 0 AND _ready_members < CEILING(_total_members::numeric / 2) THEN
    RETURN NULL;
  END IF;

  _ends_at := CURRENT_TIMESTAMP + ("durationInMin" || ' minutes')::interval;

  INSERT INTO private.battle (group_id, duration_in_min, ends_at)
  VALUES ("groupId", "durationInMin", _ends_at)
  RETURNING id INTO STRICT _battle_id;

  -- Add finalists
  IF "activityIds" IS NOT NULL AND array_length("activityIds", 1) > 0 THEN
    INSERT INTO private.battle_finalist (battle_id, activity_id)
    SELECT COALESCE(_battle_id, '00000000-0000-0000-0000-000000000000'::uuid),
           COALESCE(_aid, '00000000-0000-0000-0000-000000000000'::uuid)
    FROM unnest("activityIds") AS _aid
    WHERE _aid IS NOT NULL;
  END IF;

  SELECT ROW(
    ROW(
      b.id, b.created_at, b.group_id, b.phase, b.duration_in_min,
      b.started_at, b.ends_at, b.winning_activity_id
    )::public."BattleV1",
    COALESCE(
      ARRAY(
        SELECT ROW(bf.id, bf.battle_id, bf.activity_id, bf.vote_count)::public."BattleFinalistV1"
        FROM private.battle_finalist bf
        WHERE bf.battle_id = b.id
      ),
      '{}'::public."BattleFinalistV1"[]
    )
  )::public."BattleWithFinalistsV1"
  INTO _result
  FROM private.battle b
  WHERE b.id = _battle_id;

  RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBattle:create" TO authenticated;

-- Read a battle with finalists
CREATE OR REPLACE FUNCTION public."app:planetBattle:readWithFinalists"(
  "battleId" uuid
)
RETURNS public."BattleWithFinalistsV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    ROW(
      b.id, b.created_at, b.group_id, b.phase, b.duration_in_min,
      b.started_at, b.ends_at, b.winning_activity_id
    )::public."BattleV1",
    COALESCE(
      ARRAY(
        SELECT ROW(bf.id, bf.battle_id, bf.activity_id, bf.vote_count)::public."BattleFinalistV1"
        FROM private.battle_finalist bf
        WHERE bf.battle_id = b.id
      ),
      '{}'::public."BattleFinalistV1"[]
    )
  )::public."BattleWithFinalistsV1"
  FROM private.battle b
  WHERE b.id = "battleId"
    AND private.check_user_is_group_member(b.group_id, auth.uid())
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBattle:readWithFinalists" TO authenticated;

-- Read all active battles for the current user
CREATE OR REPLACE FUNCTION public."app:planetBattle:readAllActive"()
RETURNS SETOF public."BattleWithFinalistsV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    ROW(
      b.id, b.created_at, b.group_id, b.phase, b.duration_in_min,
      b.started_at, b.ends_at, b.winning_activity_id
    )::public."BattleV1",
    COALESCE(
      ARRAY(
        SELECT ROW(bf.id, bf.battle_id, bf.activity_id, bf.vote_count)::public."BattleFinalistV1"
        FROM private.battle_finalist bf
        WHERE bf.battle_id = b.id
      ),
      '{}'::public."BattleFinalistV1"[]
    )
  )::public."BattleWithFinalistsV1"
  FROM private.battle b
  WHERE b.phase IN ('VOTING_OPEN', 'VOTING_CLOSED', 'CALCULATING')
    AND private.check_user_is_group_member(b.group_id, auth.uid())
  ORDER BY b.ends_at ASC;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBattle:readAllActive" TO authenticated;

-- Read recent battle results for the current user
CREATE OR REPLACE FUNCTION public."app:planetBattle:readAllRecent"(
  "sinceHours" integer DEFAULT 48
)
RETURNS SETOF public."BattleWithFinalistsV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    ROW(
      b.id, b.created_at, b.group_id, b.phase, b.duration_in_min,
      b.started_at, b.ends_at, b.winning_activity_id
    )::public."BattleV1",
    COALESCE(
      ARRAY(
        SELECT ROW(bf.id, bf.battle_id, bf.activity_id, bf.vote_count)::public."BattleFinalistV1"
        FROM private.battle_finalist bf
        WHERE bf.battle_id = b.id
      ),
      '{}'::public."BattleFinalistV1"[]
    )
  )::public."BattleWithFinalistsV1"
  FROM private.battle b
  WHERE b.phase = 'WINNER_REVEALED'
    AND b.started_at >= CURRENT_TIMESTAMP - ("sinceHours" || ' hours')::interval
    AND private.check_user_is_group_member(b.group_id, auth.uid())
  ORDER BY b.started_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBattle:readAllRecent" TO authenticated;

-- Cast a vote in a battle
CREATE OR REPLACE FUNCTION public."app:planetVote:create"(
  "battleId" uuid,
  "activityId" uuid,
  "rank" integer DEFAULT NULL
)
RETURNS public."VoteV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _result public."VoteV1";
  _user_id uuid;
  _battle_id uuid;
  _activity_id uuid;
BEGIN
  IF "battleId" IS NULL OR "activityId" IS NULL OR auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  _user_id := auth.uid();
  _battle_id := "battleId";
  _activity_id := "activityId";

  IF _user_id IS NULL OR _battle_id IS NULL OR _activity_id IS NULL THEN
    RETURN NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM private.battle b
    WHERE b.id = _battle_id
      AND b.phase = 'VOTING_OPEN'
      AND private.check_user_is_group_member(b.group_id, _user_id)
  ) THEN
    RETURN NULL;
  END IF;

  INSERT INTO private.vote (battle_id, user_id, activity_id, rank)
  VALUES (COALESCE(_battle_id, '00000000-0000-0000-0000-000000000000'::uuid),
          COALESCE(_user_id, '00000000-0000-0000-0000-000000000000'::uuid),
          COALESCE(_activity_id, '00000000-0000-0000-0000-000000000000'::uuid),
          "rank")
  ON CONFLICT (battle_id, user_id, activity_id) DO UPDATE SET
    rank = EXCLUDED.rank,
    created_at = CURRENT_TIMESTAMP;

  -- Update vote count on finalist
  UPDATE private.battle_finalist bf SET
      vote_count = COALESCE((
        SELECT count(*)::integer FROM private.vote v
        WHERE v.battle_id = bf.battle_id AND v.activity_id = bf.activity_id
    ), 0)
  WHERE bf.battle_id = COALESCE(_battle_id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND bf.activity_id = COALESCE(_activity_id, '00000000-0000-0000-0000-000000000000'::uuid);

  SELECT
    v.id, v.created_at, v.battle_id, v.user_id, v.activity_id, v.rank
  INTO _result
  FROM private.vote v
  WHERE v.battle_id = COALESCE(_battle_id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND v.user_id = COALESCE(_user_id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND v.activity_id = COALESCE(_activity_id, '00000000-0000-0000-0000-000000000000'::uuid);

  RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetVote:create" TO authenticated;

-- Read votes for a battle
CREATE OR REPLACE FUNCTION public."app:planetVote:readAllByBattle"(
  "battleId" uuid
)
RETURNS SETOF public."VoteV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    v.id, v.created_at, v.battle_id, v.user_id, v.activity_id, v.rank
  FROM private.vote v
  JOIN private.battle b ON b.id = v.battle_id
  WHERE v.battle_id = "battleId"
    AND private.check_user_is_group_member(b.group_id, auth.uid())
  ORDER BY v.created_at ASC;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetVote:readAllByBattle" TO authenticated;

-- Update battle phase (for group members)
-- When phase becomes WINNER_REVEALED, automatically checks for merge opportunities
CREATE OR REPLACE FUNCTION public."app:planetBattle:updatePhase"(
  "battleId" uuid,
  "phase" public.battle_phase,
  "winningActivityId" uuid DEFAULT NULL
)
RETURNS public."BattleV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _battle_id uuid;
  _phase public.battle_phase;
  _group_id uuid;
  _winning_activity_id uuid;
  _merge_request_id uuid;
  _current_host_id uuid;
  _other_group_id uuid;
  _other_host_id uuid;
  _result public."BattleV1";
BEGIN
  IF "battleId" IS NULL OR "phase" IS NULL THEN
    RETURN NULL;
  END IF;

  _battle_id := "battleId";
  _phase := "phase";

  UPDATE private.battle b SET
    phase = COALESCE(_phase, b.phase),
    winning_activity_id = COALESCE("winningActivityId", b.winning_activity_id)
  WHERE b.id = _battle_id
    AND _phase IS NOT NULL
    AND private.check_user_is_group_member(b.group_id, auth.uid());

  SELECT
    b.id, b.created_at, b.group_id, b.phase, b.duration_in_min,
    b.started_at, b.ends_at, b.winning_activity_id
  INTO _result
  FROM private.battle b
  WHERE b.id = _battle_id;

  -- Auto-detect merge opportunities when WINNER_REVEALED
  IF _phase = 'WINNER_REVEALED' AND _result IS NOT NULL THEN
    _group_id := (_result)."groupId";
    _winning_activity_id := (_result)."winningActivityId";

    IF _winning_activity_id IS NOT NULL THEN
      -- Get host of current group
      SELECT gm.user_id INTO _current_host_id
      FROM private.group_member gm
      WHERE gm.group_id = _group_id AND gm.is_owner = true
      LIMIT 1;

      -- Find other open groups that resolved to the same activity today
      FOR _other_group_id, _other_host_id IN
        SELECT DISTINCT b2.group_id, gm2.user_id
        FROM private.battle b2
        JOIN private.group_member gm2 ON gm2.group_id = b2.group_id AND gm2.is_owner = true
        JOIN private.planet_group pg2 ON pg2.id = b2.group_id
        WHERE b2.id != _battle_id
          AND b2.winning_activity_id = _winning_activity_id
          AND b2.phase = 'WINNER_REVEALED'
          AND DATE_TRUNC('day', b2.started_at AT TIME ZONE 'UTC') = DATE_TRUNC('day', CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
          AND pg2.is_open_to_strangers = true
          AND b2.group_id != _group_id
      LOOP
        -- Skip if recent merge request already exists between these groups
        CONTINUE WHEN EXISTS (
          SELECT 1 FROM private.merge_request mr
          WHERE (
            (mr.initiating_group_id = _group_id AND mr.other_group_id = _other_group_id)
            OR (mr.initiating_group_id = _other_group_id AND mr.other_group_id = _group_id)
          )
          AND mr.created_at >= CURRENT_TIMESTAMP - interval '24 hours'
        );

        -- Create merge request
        INSERT INTO private.merge_request (initiating_group_id, other_group_id, activity_id, battle_id, status)
        VALUES (_group_id, _other_group_id, _winning_activity_id, _battle_id, 'PENDING')
        RETURNING id INTO _merge_request_id;

        -- Notify initiating group host
        IF _current_host_id IS NOT NULL THEN
          INSERT INTO private.notification (user_id, type, title, body, linked_group_id, linked_activity_id, linked_merge_request_id)
          VALUES (
            _current_host_id,
            'MERGE_REQUEST',
            'Planet Collision Detected! 🌍',
            '2 crews chose the same spot tonight. Merge your planets?',
            _group_id,
            _winning_activity_id,
            _merge_request_id
          );
        END IF;

        -- Notify other group host
        IF _other_host_id IS NOT NULL THEN
          INSERT INTO private.notification (user_id, type, title, body, linked_group_id, linked_activity_id, linked_merge_request_id)
          VALUES (
            _other_host_id,
            'MERGE_REQUEST',
            'Planet Collision Detected! 🌍',
            '2 crews chose the same spot tonight. Merge your planets?',
            _other_group_id,
            _winning_activity_id,
            _merge_request_id
          );
        END IF;
      END LOOP;
    END IF;
  END IF;

  RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBattle:updatePhase" TO authenticated;

-- Count active battles for the current user
CREATE OR REPLACE FUNCTION public."app:planetBattle:countActive"()
RETURNS integer
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT count(*)::integer
  FROM private.battle b
  WHERE b.phase IN ('VOTING_OPEN', 'VOTING_CLOSED', 'CALCULATING')
    AND private.check_user_is_group_member(b.group_id, auth.uid());
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBattle:countActive" TO authenticated;

-- Read the active battle for a specific group with details
CREATE OR REPLACE FUNCTION public."app:planetBattle:readActiveByGroup"(
  "groupId" uuid
)
RETURNS public."BattleDetailV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    ROW(
      b.id, b.created_at, b.group_id, b.phase, b.duration_in_min,
      b.started_at, b.ends_at, b.winning_activity_id
    )::public."BattleV1",
    g.name,
    COALESCE((SELECT count(*)::integer FROM private.group_member gm WHERE gm.group_id = b.group_id), 0),
    COALESCE((
      SELECT count(DISTINCT v.user_id)::integer
      FROM private.vote v
      WHERE v.battle_id = b.id
    ), 0),
    COALESCE(
      ARRAY(
        SELECT ROW(
          bf.activity_id,
          a.title,
          a.primary_image_url,
          bf.vote_count,
          (
            SELECT d.headline
            FROM private.deal d
            JOIN private.deal_activity da ON da.deal_id = d.id
            WHERE da.activity_id = bf.activity_id
              AND d.status = 'ACTIVE'
            LIMIT 1
          ),
          a.address
        )::public."BattleFinalistDetailV1"
        FROM private.battle_finalist bf
        JOIN private.activity a ON a.id = bf.activity_id
        WHERE bf.battle_id = b.id
        ORDER BY bf.vote_count DESC
      ),
      '{}'::public."BattleFinalistDetailV1"[]
    ),
    NULL,
    NULL
  )::public."BattleDetailV1"
  FROM private.battle b
  JOIN private.planet_group g ON g.id = b.group_id
  WHERE b.group_id = "groupId"
    AND b.phase IN ('VOTING_OPEN', 'VOTING_CLOSED', 'CALCULATING')
    AND private.check_user_is_group_member("groupId", auth.uid())
  ORDER BY b.ends_at ASC
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBattle:readActiveByGroup" TO authenticated;

-- Read all groups for the current user with summary data (member count, initials, status, last activity).
-- Defined here because it depends on private.battle and private.swipe tables created in schemas 150 and 160.
CREATE OR REPLACE FUNCTION public."app:planetGroup:readAllWithSummary"()
RETURNS SETOF public."PlanetGroupSummaryV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    ROW(
      g.id, g.created_at, g.updated_at, g.name, g.photo_url,
      g.is_open_to_strangers, g.max_group_size, g.visibility, g.created_by_id,
      g.conversation_id, g.next_plan_at
    )::public."PlanetGroupV1",
    COALESCE((SELECT count(*)::integer FROM private.group_member gm2 WHERE gm2.group_id = g.id), 0),
    COALESCE(
      ARRAY(
        SELECT UPPER(LEFT(COALESCE(p.full_name, p.given_name, 'U'), 1))
        FROM private.group_member gm3
        LEFT JOIN private.profile p ON p.id = gm3.user_id
        WHERE gm3.group_id = g.id
        ORDER BY gm3.joined_at ASC
      ),
      '{}'::text[]
    ),
    CASE
      WHEN EXISTS (
        SELECT 1 FROM private.battle b
        WHERE b.group_id = g.id
          AND b.phase IN ('VOTING_OPEN', 'VOTING_CLOSED', 'CALCULATING')
      ) THEN 'BATTLE_ACTIVE'
      WHEN EXISTS (
        SELECT 1 FROM private.swipe s
        JOIN private.group_member gm4 ON gm4.user_id = s.user_id AND gm4.group_id = g.id
        WHERE s.group_id = g.id
          AND s.created_at >= CURRENT_TIMESTAMP - interval '24 hours'
      ) THEN 'DECIDING'
      ELSE 'IDLE'
    END,
    COALESCE(
      GREATEST(
        g.updated_at,
        (SELECT MAX(b2.created_at) FROM private.battle b2 WHERE b2.group_id = g.id),
        (SELECT MAX(s2.created_at) FROM private.swipe s2 WHERE s2.group_id = g.id)
      ),
      g.updated_at
    )
  )::public."PlanetGroupSummaryV1"
  FROM private.planet_group g
  JOIN private.group_member gm ON gm.group_id = g.id
  WHERE gm.user_id = auth.uid()
  ORDER BY COALESCE(
    GREATEST(
      g.updated_at,
      (SELECT MAX(b3.created_at) FROM private.battle b3 WHERE b3.group_id = g.id),
      (SELECT MAX(s3.created_at) FROM private.swipe s3 WHERE s3.group_id = g.id)
    ),
    g.updated_at
  ) DESC;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetGroup:readAllWithSummary" TO authenticated;

-- Read all active battles with group name, participant counts, and activity details
CREATE OR REPLACE FUNCTION public."app:planetBattle:readAllActiveWithDetails"()
RETURNS SETOF public."BattleDetailV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    ROW(
      b.id, b.created_at, b.group_id, b.phase, b.duration_in_min,
      b.started_at, b.ends_at, b.winning_activity_id
    )::public."BattleV1",
    g.name,
    COALESCE((SELECT count(*)::integer FROM private.group_member gm WHERE gm.group_id = b.group_id), 0),
    COALESCE((
      SELECT count(DISTINCT v.user_id)::integer
      FROM private.vote v
      WHERE v.battle_id = b.id
    ), 0),
    COALESCE(
      ARRAY(
        SELECT ROW(
          bf.activity_id,
          a.title,
          a.primary_image_url,
          bf.vote_count,
          (
            SELECT d.headline
            FROM private.deal d
            JOIN private.deal_activity da ON da.deal_id = d.id
            WHERE da.activity_id = bf.activity_id
              AND d.status = 'ACTIVE'
            LIMIT 1
          ),
          a.address
        )::public."BattleFinalistDetailV1"
        FROM private.battle_finalist bf
        JOIN private.activity a ON a.id = bf.activity_id
        WHERE bf.battle_id = b.id
        ORDER BY bf.vote_count DESC
      ),
      '{}'::public."BattleFinalistDetailV1"[]
    ),
    NULL,
    NULL
  )::public."BattleDetailV1"
  FROM private.battle b
  JOIN private.planet_group g ON g.id = b.group_id
  WHERE b.phase IN ('VOTING_OPEN', 'VOTING_CLOSED', 'CALCULATING')
    AND private.check_user_is_group_member(b.group_id, auth.uid())
  ORDER BY b.ends_at ASC;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBattle:readAllActiveWithDetails" TO authenticated;

-- Read member voting statuses for a battle
CREATE OR REPLACE FUNCTION public."app:planetBattle:readMemberStatuses"(
  "battleId" uuid
)
RETURNS SETOF public."BattleMemberStatusV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    gm.user_id,
    COALESCE(p.full_name, p.given_name, 'User'),
    UPPER(LEFT(COALESCE(p.full_name, p.given_name, 'U'), 1)),
    EXISTS (
      SELECT 1 FROM private.vote v
      WHERE v.battle_id = "battleId" AND v.user_id = gm.user_id
    )
  FROM private.battle b
  JOIN private.group_member gm ON gm.group_id = b.group_id
  LEFT JOIN private.profile p ON p.id = gm.user_id
  WHERE b.id = "battleId"
    AND private.check_user_is_group_member(b.group_id, auth.uid())
  ORDER BY gm.joined_at ASC;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBattle:readMemberStatuses" TO authenticated;

-- Lock in votes for a battle (batch create votes with ranks)
CREATE OR REPLACE FUNCTION public."app:planetBattle:lockInVotes"(
  "battleId" uuid,
  "activityIds" uuid[]
)
RETURNS SETOF public."VoteV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _activity_id uuid;
  _rank integer;
  _user_id uuid;
  _battle_id uuid;
BEGIN
  IF "battleId" IS NULL OR "activityIds" IS NULL OR auth.uid() IS NULL THEN
    RETURN;
  END IF;

  _user_id := auth.uid();
  _battle_id := "battleId";

  IF _user_id IS NULL OR _battle_id IS NULL THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM private.battle b
    WHERE b.id = _battle_id
      AND b.phase = 'VOTING_OPEN'
      AND private.check_user_is_group_member(b.group_id, _user_id)
  ) THEN
    RETURN;
  END IF;

  _rank := 1;
  FOR i IN 1..array_length("activityIds", 1) LOOP
    IF "activityIds"[i] IS NULL THEN
      CONTINUE;
    END IF;

    _activity_id := "activityIds"[i];

    INSERT INTO private.vote (battle_id, user_id, activity_id, rank)
    VALUES (COALESCE(_battle_id, '00000000-0000-0000-0000-000000000000'::uuid),
            COALESCE(_user_id, '00000000-0000-0000-0000-000000000000'::uuid),
            COALESCE(_activity_id, '00000000-0000-0000-0000-000000000000'::uuid),
            _rank)
    ON CONFLICT (battle_id, user_id, activity_id) DO UPDATE SET
      rank = EXCLUDED.rank,
      created_at = CURRENT_TIMESTAMP;

    -- Update vote count on finalist
    UPDATE private.battle_finalist bf SET
      vote_count = COALESCE((
        SELECT count(*)::integer FROM private.vote v
        WHERE v.battle_id = bf.battle_id AND v.activity_id = bf.activity_id
      ), 0)
    WHERE bf.battle_id = COALESCE(_battle_id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND bf.activity_id = COALESCE(_activity_id, '00000000-0000-0000-0000-000000000000'::uuid);

    _rank := _rank + 1;
  END LOOP;

  RETURN QUERY
    SELECT
      v.id::public.uuid_notnull,
      v.created_at::public.timestamptz_notnull,
      v.battle_id::public.uuid_notnull,
      v.user_id::public.uuid_notnull,
      v.activity_id::public.uuid_notnull,
      v.rank
    FROM private.vote v
    WHERE v.battle_id = COALESCE(_battle_id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND v.user_id = COALESCE(_user_id, '00000000-0000-0000-0000-000000000000'::uuid)
    ORDER BY v.rank ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBattle:lockInVotes" TO authenticated;

-- Read aggregated stats for the current user's profile.
-- Defined here because it depends on private.group_member (140), private.battle (160),
-- private.vote (160), and private.swipe (150) tables.
CREATE OR REPLACE FUNCTION public."app:planetUser:readStats"()
RETURNS public."UserStatsV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    -- groupsCount: number of groups the user belongs to
    COALESCE((
      SELECT count(*)::integer
      FROM private.group_member gm
      WHERE gm.user_id = auth.uid()
    ), 0),
    -- battlesWon: battles where user voted for the winning activity
    COALESCE((
      SELECT count(DISTINCT b.id)::integer
      FROM private.battle b
      JOIN private.vote v ON v.battle_id = b.id AND v.user_id = auth.uid()
      WHERE b.phase = 'WINNER_REVEALED'
        AND b.winning_activity_id = v.activity_id
    ), 0),
    -- activitiesDiscovered: total swipes by the user
    COALESCE((
      SELECT count(*)::integer
      FROM private.swipe s
      WHERE s.user_id = auth.uid()
    ), 0)
  )::public."UserStatsV1";
$$;

GRANT EXECUTE ON FUNCTION public."app:planetUser:readStats" TO authenticated;

-- Read the full battle results for the most recent completed battle in a group
CREATE OR REPLACE FUNCTION public."app:planetBattle:readResultsByGroup"(
  "groupId" uuid
)
RETURNS public."BattleResultsV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    -- battle
    ROW(
      b.id, b.created_at, b.group_id, b.phase, b.duration_in_min,
      b.started_at, b.ends_at, b.winning_activity_id
    )::public."BattleV1",
    -- groupName
    g.name,
    -- winnerActivity
    (
      SELECT ROW(
        wa.id, wa.created_at, wa.updated_at, wa.business_id,
        wa.title, wa.description, wa.category, wa.primary_image_url,
        wa.additional_image_urls, wa.price_range, wa.operating_hours,
        wa.tags, wa.status, wa.latitude, wa.longitude, wa.address, wa.rating
      )::public."ActivityV1"
      FROM private.activity wa
      WHERE wa.id = b.winning_activity_id
    ),
    -- winnerDeal
    (
      SELECT ROW(
        d.id, d.created_at, d.updated_at, d.business_id,
        d.headline, d.deal_type, d.discount_value_in_percent,
        d.discount_value_in_cents, d.terms_and_conditions,
        d.minimum_group_size, d.minimum_spend_in_cents,
        d.start_date, d.end_date, d.valid_time_start, d.valid_time_end,
        d.total_redemption_limit, d.per_user_redemption_limit,
        d.status, d.redemption_code
      )::public."DealV1"
      FROM private.deal d
      JOIN private.deal_activity da ON da.deal_id = d.id
      WHERE da.activity_id = b.winning_activity_id
        AND d.status = 'ACTIVE'
      LIMIT 1
    ),
    -- finalists
    COALESCE(
      ARRAY(
        SELECT ROW(
          bf.activity_id,
          a.title,
          a.primary_image_url,
          bf.vote_count,
          (
            SELECT d.headline
            FROM private.deal d
            JOIN private.deal_activity da ON da.deal_id = d.id
            WHERE da.activity_id = bf.activity_id
              AND d.status = 'ACTIVE'
            LIMIT 1
          ),
          a.address
        )::public."BattleFinalistDetailV1"
        FROM private.battle_finalist bf
        JOIN private.activity a ON a.id = bf.activity_id
        WHERE bf.battle_id = b.id
        ORDER BY bf.vote_count DESC
      ),
      '{}'::public."BattleFinalistDetailV1"[]
    ),
    -- memberVotes
    COALESCE(
      ARRAY(
        SELECT ROW(
          gm.user_id,
          COALESCE(p.full_name, p.given_name, 'User'),
          UPPER(LEFT(COALESCE(p.full_name, p.given_name, 'U'), 1)),
          (
            SELECT v.activity_id
            FROM private.vote v
            WHERE v.battle_id = b.id AND v.user_id = gm.user_id
            ORDER BY v.rank ASC NULLS LAST, v.created_at ASC
            LIMIT 1
          )
        )::public."BattleMemberVoteV1"
        FROM private.group_member gm
        LEFT JOIN private.profile p ON p.id = gm.user_id
        WHERE gm.group_id = b.group_id
        ORDER BY gm.joined_at ASC
      ),
      '{}'::public."BattleMemberVoteV1"[]
    )
  )::public."BattleResultsV1"
  FROM private.battle b
  JOIN private.planet_group g ON g.id = b.group_id
  WHERE b.group_id = "groupId"
    AND b.phase = 'WINNER_REVEALED'
    AND private.check_user_is_group_member("groupId", auth.uid())
  ORDER BY b.started_at DESC
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBattle:readResultsByGroup" TO authenticated;

-- Read recent completed battles with group name, winner details
CREATE OR REPLACE FUNCTION public."app:planetBattle:readAllRecentWithDetails"(
  "sinceHours" integer DEFAULT 48
)
RETURNS SETOF public."BattleDetailV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    ROW(
      b.id, b.created_at, b.group_id, b.phase, b.duration_in_min,
      b.started_at, b.ends_at, b.winning_activity_id
    )::public."BattleV1",
    g.name,
    COALESCE((SELECT count(*)::integer FROM private.group_member gm WHERE gm.group_id = b.group_id), 0),
    COALESCE((
      SELECT count(DISTINCT v.user_id)::integer
      FROM private.vote v
      WHERE v.battle_id = b.id
    ), 0),
    COALESCE(
      ARRAY(
        SELECT ROW(
          bf.activity_id,
          a.title,
          a.primary_image_url,
          bf.vote_count,
          (
            SELECT d.headline
            FROM private.deal d
            JOIN private.deal_activity da ON da.deal_id = d.id
            WHERE da.activity_id = bf.activity_id
              AND d.status = 'ACTIVE'
            LIMIT 1
          ),
          a.address
        )::public."BattleFinalistDetailV1"
        FROM private.battle_finalist bf
        JOIN private.activity a ON a.id = bf.activity_id
        WHERE bf.battle_id = b.id
        ORDER BY bf.vote_count DESC
      ),
      '{}'::public."BattleFinalistDetailV1"[]
    ),
    wa.title,
    wa.primary_image_url
  )::public."BattleDetailV1"
  FROM private.battle b
  JOIN private.planet_group g ON g.id = b.group_id
  LEFT JOIN private.activity wa ON wa.id = b.winning_activity_id
  WHERE b.phase = 'WINNER_REVEALED'
    AND b.started_at >= CURRENT_TIMESTAMP - ("sinceHours" || ' hours')::interval
    AND private.check_user_is_group_member(b.group_id, auth.uid())
  ORDER BY b.started_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBattle:readAllRecentWithDetails" TO authenticated;

-- Start a mini game (marks user as PLAYING)
CREATE OR REPLACE FUNCTION public."app:planetBattle:startMiniGame"(
  "battleId" uuid,
  "gameType" text
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _user_id uuid;
  _battle_id uuid;
BEGIN
  IF "battleId" IS NULL OR "gameType" IS NULL OR auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  _user_id := auth.uid();
  _battle_id := "battleId";

  IF NOT EXISTS (
    SELECT 1 FROM private.battle b
    WHERE b.id = _battle_id
      AND b.phase = 'VOTING_OPEN'
      AND private.check_user_is_group_member(b.group_id, _user_id)
  ) THEN
    RETURN false;
  END IF;

  INSERT INTO private.battle_mini_game_result (battle_id, user_id, game_type)
  VALUES (COALESCE(_battle_id, '00000000-0000-0000-0000-000000000000'::uuid),
          COALESCE(_user_id, '00000000-0000-0000-0000-000000000000'::uuid),
          "gameType")
  ON CONFLICT (battle_id, user_id) DO UPDATE SET
    game_type = EXCLUDED.game_type,
    won = NULL,
    reaction_time_in_ms = NULL,
    created_at = CURRENT_TIMESTAMP;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBattle:startMiniGame" TO authenticated;

-- Complete a mini game with result
CREATE OR REPLACE FUNCTION public."app:planetBattle:completeMiniGame"(
  "battleId" uuid,
  "won" boolean,
  "reactionTimeInMs" integer DEFAULT NULL
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _user_id uuid;
  _battle_id uuid;
  _won boolean;
  _reaction_time_in_ms integer;
BEGIN
  IF "battleId" IS NULL OR auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  _user_id := auth.uid();
  _battle_id := "battleId";
  _won := "won";
  _reaction_time_in_ms := "reactionTimeInMs";

  UPDATE private.battle_mini_game_result
  SET won = _won,
      reaction_time_in_ms = _reaction_time_in_ms
  WHERE battle_id = COALESCE(_battle_id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND user_id = COALESCE(_user_id, '00000000-0000-0000-0000-000000000000'::uuid);

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBattle:completeMiniGame" TO authenticated;

-- Read mini game results for a battle (for reaction time leaderboard)
CREATE OR REPLACE FUNCTION public."app:planetBattle:readMiniGameResults"(
  "battleId" uuid
)
RETURNS SETOF public."BattleMiniGameResultV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    mgr.user_id,
    COALESCE(p.full_name, p.given_name, 'User'),
    mgr.game_type,
    mgr.won,
    mgr.reaction_time_in_ms
  FROM private.battle_mini_game_result mgr
  JOIN private.battle b ON b.id = mgr.battle_id
  LEFT JOIN private.profile p ON p.id = mgr.user_id
  WHERE mgr.battle_id = "battleId"
    AND private.check_user_is_group_member(b.group_id, auth.uid())
  ORDER BY mgr.reaction_time_in_ms ASC NULLS LAST;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBattle:readMiniGameResults" TO authenticated;

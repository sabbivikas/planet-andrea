-- Helper: check if user is host of a group
CREATE OR REPLACE FUNCTION private.check_user_is_group_host(_group_id uuid, _user_id uuid)
RETURNS boolean
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT EXISTS (
    SELECT 1 FROM private.group_member gm
    WHERE gm.group_id = _group_id
      AND gm.user_id = _user_id
      AND gm.is_owner = true
  );
$$;

-- Create a manual merge request (from the ⊕ Merge button on an open planet card)
-- Finds the current user's first host group and creates a merge request with the target group
CREATE OR REPLACE FUNCTION public."app:planetMerge:create"(
  "otherGroupId" uuid
)
RETURNS public."MergeRequestV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _initiating_group_id uuid;
  _merge_request_id uuid;
  _result public."MergeRequestV1";
BEGIN
  IF "otherGroupId" IS NULL OR auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  -- Find first group where user is owner
  SELECT gm.group_id INTO _initiating_group_id
  FROM private.group_member gm
  WHERE gm.user_id = auth.uid()
    AND gm.is_owner = true
    AND gm.group_id != "otherGroupId"
  ORDER BY gm.joined_at DESC
  LIMIT 1;

  IF _initiating_group_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Check no recent pending/initiated merge exists between these groups
  IF EXISTS (
    SELECT 1 FROM private.merge_request mr
    WHERE (
      (mr.initiating_group_id = _initiating_group_id AND mr.other_group_id = "otherGroupId")
      OR (mr.initiating_group_id = "otherGroupId" AND mr.other_group_id = _initiating_group_id)
    )
    AND mr.status IN ('PENDING', 'INITIATED')
    AND mr.created_at >= CURRENT_TIMESTAMP - interval '24 hours'
  ) THEN
    -- Return existing merge request
    SELECT
      mr.id, mr.created_at, mr.updated_at,
      mr.initiating_group_id, mr.other_group_id,
      mr.activity_id, mr.battle_id, mr.status
    INTO _result
    FROM private.merge_request mr
    WHERE (
      (mr.initiating_group_id = _initiating_group_id AND mr.other_group_id = "otherGroupId")
      OR (mr.initiating_group_id = "otherGroupId" AND mr.other_group_id = _initiating_group_id)
    )
    AND mr.status IN ('PENDING', 'INITIATED')
    AND mr.created_at >= CURRENT_TIMESTAMP - interval '24 hours'
    ORDER BY mr.created_at DESC
    LIMIT 1;

    RETURN _result;
  END IF;

  INSERT INTO private.merge_request (initiating_group_id, other_group_id, status)
  VALUES (_initiating_group_id, "otherGroupId", 'PENDING')
  RETURNING id INTO _merge_request_id;

  SELECT
    mr.id, mr.created_at, mr.updated_at,
    mr.initiating_group_id, mr.other_group_id,
    mr.activity_id, mr.battle_id, mr.status
  INTO _result
  FROM private.merge_request mr
  WHERE mr.id = _merge_request_id;

  RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetMerge:create" TO authenticated;

-- Read merge screen data for a given merge request
CREATE OR REPLACE FUNCTION public."app:planetMerge:readScreenData"(
  "mergeRequestId" uuid
)
RETURNS public."MergeScreenDataV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    ROW(
      mr.id, mr.created_at, mr.updated_at,
      mr.initiating_group_id, mr.other_group_id,
      mr.activity_id, mr.battle_id, mr.status
    )::public."MergeRequestV1",
    g1.name,
    COALESCE((SELECT count(*)::integer FROM private.group_member gm1 WHERE gm1.group_id = mr.initiating_group_id), 0),
    g2.name,
    COALESCE((SELECT count(*)::integer FROM private.group_member gm2 WHERE gm2.group_id = mr.other_group_id), 0),
    a.title,
    a.address,
    private.check_user_is_group_member(mr.initiating_group_id, auth.uid())
  )::public."MergeScreenDataV1"
  FROM private.merge_request mr
  JOIN private.planet_group g1 ON g1.id = mr.initiating_group_id
  JOIN private.planet_group g2 ON g2.id = mr.other_group_id
  LEFT JOIN private.activity a ON a.id = mr.activity_id
  WHERE mr.id = "mergeRequestId"
    AND (
      private.check_user_is_group_member(mr.initiating_group_id, auth.uid())
      OR private.check_user_is_group_member(mr.other_group_id, auth.uid())
    )
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetMerge:readScreenData" TO authenticated;

-- Update merge request status (host only)
CREATE OR REPLACE FUNCTION public."app:planetMerge:updateStatus"(
  "mergeRequestId" uuid,
  "newStatus" public.merge_request_status
)
RETURNS public."MergeRequestV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _merge_request_id uuid;
  _initiating_group_id uuid;
  _other_group_id uuid;
  _activity_id uuid;
  _other_host_id uuid;
  _initiating_host_id uuid;
  _activity_name text;
  _orbit_channel_id uuid;
  _result public."MergeRequestV1";
BEGIN
  IF "mergeRequestId" IS NULL OR "newStatus" IS NULL OR auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  _merge_request_id := "mergeRequestId";

  SELECT mr.initiating_group_id, mr.other_group_id, mr.activity_id
  INTO _initiating_group_id, _other_group_id, _activity_id
  FROM private.merge_request mr
  WHERE mr.id = _merge_request_id
    AND (
      private.check_user_is_group_host(mr.initiating_group_id, auth.uid())
      OR private.check_user_is_group_host(mr.other_group_id, auth.uid())
    );

  IF _initiating_group_id IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE private.merge_request SET
    status = "newStatus",
    updated_at = CURRENT_TIMESTAMP
  WHERE id = _merge_request_id;

  -- Get activity name for notifications
  SELECT a.title INTO _activity_name
  FROM private.activity a
  WHERE a.id = _activity_id;

  -- Get host user IDs
  SELECT gm.user_id INTO _initiating_host_id
  FROM private.group_member gm
  WHERE gm.group_id = _initiating_group_id AND gm.is_owner = true
  LIMIT 1;

  SELECT gm.user_id INTO _other_host_id
  FROM private.group_member gm
  WHERE gm.group_id = _other_group_id AND gm.is_owner = true
  LIMIT 1;

  -- When INITIATED: notify the other group host
  IF "newStatus" = 'INITIATED' THEN
    IF _other_host_id IS NOT NULL THEN
      INSERT INTO private.notification (user_id, type, title, body, linked_group_id, linked_merge_request_id)
      VALUES (
        _other_host_id,
        'MERGE_INITIATED',
        'Another crew wants to merge! 🌍',
        'They chose the same spot tonight. Will you collide?',
        _other_group_id,
        _merge_request_id
      );
    END IF;
  END IF;

  -- When MERGED: create orbit channel
  IF "newStatus" = 'MERGED' THEN
    INSERT INTO private.orbit_channel (group_id_1, group_id_2, merge_request_id)
    VALUES (_initiating_group_id, _other_group_id, _merge_request_id)
    ON CONFLICT (merge_request_id) DO NOTHING
    RETURNING id INTO _orbit_channel_id;
  END IF;

  -- When DECLINED: notify initiating group host
  IF "newStatus" = 'DECLINED' THEN
    SELECT g.name INTO _activity_name
    FROM private.planet_group g
    WHERE g.id = _other_group_id;

    IF _initiating_host_id IS NOT NULL THEN
      INSERT INTO private.notification (user_id, type, title, body, linked_group_id, linked_merge_request_id)
      VALUES (
        _initiating_host_id,
        'MERGE_DECLINED',
        'Solo night 🌙',
        COALESCE(_activity_name, 'The other crew') || ' stayed solo tonight.',
        _initiating_group_id,
        _merge_request_id
      );
    END IF;
  END IF;

  SELECT
    mr.id, mr.created_at, mr.updated_at,
    mr.initiating_group_id, mr.other_group_id,
    mr.activity_id, mr.battle_id, mr.status
  INTO _result
  FROM private.merge_request mr
  WHERE mr.id = _merge_request_id;

  RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetMerge:updateStatus" TO authenticated;

-- Read orbit screen data
CREATE OR REPLACE FUNCTION public."app:planetMerge:readOrbitData"(
  "orbitChannelId" uuid
)
RETURNS public."OrbitScreenDataV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    oc.id,
    oc.merge_request_id,
    oc.group_id_1,
    g1.name,
    COALESCE((SELECT count(*)::integer FROM private.group_member gm1 WHERE gm1.group_id = oc.group_id_1), 0),
    oc.group_id_2,
    g2.name,
    COALESCE((SELECT count(*)::integer FROM private.group_member gm2 WHERE gm2.group_id = oc.group_id_2), 0),
    a.title,
    a.address,
    oc.conversation_id,
    COALESCE(
      ARRAY(
        SELECT ROW(
          gm.user_id,
          COALESCE(p.full_name, p.given_name, 'User'),
          UPPER(LEFT(COALESCE(p.full_name, p.given_name, 'U'), 1)),
          gm.group_id,
          gm.group_id = oc.group_id_2
        )::public."OrbitMemberV1"
        FROM private.group_member gm
        LEFT JOIN private.profile p ON p.id = gm.user_id
        WHERE gm.group_id IN (oc.group_id_1, oc.group_id_2)
        ORDER BY gm.group_id, gm.joined_at ASC
      ),
      '{}'::public."OrbitMemberV1"[]
    )
  )::public."OrbitScreenDataV1"
  FROM private.orbit_channel oc
  JOIN private.planet_group g1 ON g1.id = oc.group_id_1
  JOIN private.planet_group g2 ON g2.id = oc.group_id_2
  JOIN private.merge_request mr ON mr.id = oc.merge_request_id
  LEFT JOIN private.activity a ON a.id = mr.activity_id
  WHERE oc.id = "orbitChannelId"
    AND (
      private.check_user_is_group_member(oc.group_id_1, auth.uid())
      OR private.check_user_is_group_member(oc.group_id_2, auth.uid())
    )
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetMerge:readOrbitData" TO authenticated;

-- Read orbit channel by merge request
CREATE OR REPLACE FUNCTION public."app:planetMerge:readOrbitByMergeRequest"(
  "mergeRequestId" uuid
)
RETURNS public."OrbitScreenDataV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    oc.id,
    oc.merge_request_id,
    oc.group_id_1,
    g1.name,
    COALESCE((SELECT count(*)::integer FROM private.group_member gm1 WHERE gm1.group_id = oc.group_id_1), 0),
    oc.group_id_2,
    g2.name,
    COALESCE((SELECT count(*)::integer FROM private.group_member gm2 WHERE gm2.group_id = oc.group_id_2), 0),
    a.title,
    a.address,
    oc.conversation_id,
    COALESCE(
      ARRAY(
        SELECT ROW(
          gm.user_id,
          COALESCE(p.full_name, p.given_name, 'User'),
          UPPER(LEFT(COALESCE(p.full_name, p.given_name, 'U'), 1)),
          gm.group_id,
          gm.group_id = oc.group_id_2
        )::public."OrbitMemberV1"
        FROM private.group_member gm
        LEFT JOIN private.profile p ON p.id = gm.user_id
        WHERE gm.group_id IN (oc.group_id_1, oc.group_id_2)
        ORDER BY gm.group_id, gm.joined_at ASC
      ),
      '{}'::public."OrbitMemberV1"[]
    )
  )::public."OrbitScreenDataV1"
  FROM private.orbit_channel oc
  JOIN private.planet_group g1 ON g1.id = oc.group_id_1
  JOIN private.planet_group g2 ON g2.id = oc.group_id_2
  JOIN private.merge_request mr ON mr.id = oc.merge_request_id
  LEFT JOIN private.activity a ON a.id = mr.activity_id
  WHERE oc.merge_request_id = "mergeRequestId"
    AND (
      private.check_user_is_group_member(oc.group_id_1, auth.uid())
      OR private.check_user_is_group_member(oc.group_id_2, auth.uid())
    )
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetMerge:readOrbitByMergeRequest" TO authenticated;

-- Read the first pending merge opportunity for a given group
-- Returns the other group's details if a PENDING merge request exists
CREATE OR REPLACE FUNCTION public."app:planetMerge:readPendingByGroup"(
  "groupId" uuid
)
RETURNS public."MergeOpportunityV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    mr.id,
    CASE WHEN mr.initiating_group_id = "groupId" THEN mr.other_group_id ELSE mr.initiating_group_id END,
    CASE WHEN mr.initiating_group_id = "groupId" THEN g_other.name ELSE g_init.name END,
    a.title
  )::public."MergeOpportunityV1"
  FROM private.merge_request mr
  JOIN private.planet_group g_init ON g_init.id = mr.initiating_group_id
  JOIN private.planet_group g_other ON g_other.id = mr.other_group_id
  LEFT JOIN private.activity a ON a.id = mr.activity_id
  WHERE (mr.initiating_group_id = "groupId" OR mr.other_group_id = "groupId")
    AND mr.status = 'PENDING'
    AND private.check_user_is_group_member("groupId", auth.uid())
  ORDER BY mr.created_at DESC
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetMerge:readPendingByGroup" TO authenticated;

-- Send a message in an orbit channel chat
CREATE OR REPLACE FUNCTION public."app:planetOrbit:chat:sendMessage"(
  "orbitChannelId" uuid,
  "contentText" text
)
RETURNS public."OrbitChatMessageV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _conversation_id uuid;
  _group_id_1 uuid;
  _group_id_2 uuid;
  _entity_id uuid;
  _message_id uuid;
  _prev_message_id uuid;
  _author_group_id uuid;
  _result public."OrbitChatMessageV1";
BEGIN
  IF "orbitChannelId" IS NULL OR "contentText" IS NULL OR auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT oc.conversation_id, oc.group_id_1, oc.group_id_2
  INTO _conversation_id, _group_id_1, _group_id_2
  FROM private.orbit_channel oc
  WHERE oc.id = "orbitChannelId"
    AND (
      private.check_user_is_group_member(oc.group_id_1, auth.uid())
      OR private.check_user_is_group_member(oc.group_id_2, auth.uid())
    );

  IF _conversation_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Get entity id for current user
  -- entity.id = auth.uid() per table constraint
  _entity_id := auth.uid();

  -- Get latest message id as prev
  SELECT cm.id INTO _prev_message_id
  FROM private.conversation_message cm
  WHERE cm.conversation_id = _conversation_id
  ORDER BY cm.created_at DESC
  LIMIT 1;

  INSERT INTO private.conversation_message (conversation_id, prev_message_id, author_entity_id, content_text)
  VALUES (_conversation_id, _prev_message_id, _entity_id, "contentText")
  RETURNING id INTO _message_id;

  -- Determine which group this author belongs to
  IF private.check_user_is_group_member(_group_id_1, auth.uid()) THEN
    _author_group_id := _group_id_1;
  ELSE
    _author_group_id := _group_id_2;
  END IF;

  SELECT ROW(
    cm.id,
    cm.created_at,
    auth.uid(),
    COALESCE(p.full_name, p.given_name, 'User'),
    UPPER(LEFT(COALESCE(p.full_name, p.given_name, 'U'), 1)),
    cm.content_text,
    _author_group_id
  )::public."OrbitChatMessageV1"
  INTO _result
  FROM private.conversation_message cm
  LEFT JOIN private.profile p ON p.id = auth.uid()
  WHERE cm.id = _message_id;

  RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetOrbit:chat:sendMessage" TO authenticated;

-- Read messages in an orbit channel chat
CREATE OR REPLACE FUNCTION public."app:planetOrbit:chat:readMessages"(
  "orbitChannelId" uuid,
  "limitCount" integer DEFAULT 50
)
RETURNS SETOF public."OrbitChatMessageV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    cm.id,
    cm.created_at,
    e.user_id,
    COALESCE(p.full_name, p.given_name, 'User'),
    UPPER(LEFT(COALESCE(p.full_name, p.given_name, 'U'), 1)),
    cm.content_text,
    CASE
      WHEN private.check_user_is_group_member(oc.group_id_1, e.user_id) THEN oc.group_id_1
      ELSE oc.group_id_2
    END
  )::public."OrbitChatMessageV1"
  FROM private.orbit_channel oc
  JOIN private.conversation_message cm ON cm.conversation_id = oc.conversation_id
  JOIN private.entity e ON e.id = cm.author_entity_id
  LEFT JOIN private.profile p ON p.id = e.user_id
  WHERE oc.id = "orbitChannelId"
    AND (
      private.check_user_is_group_member(oc.group_id_1, auth.uid())
      OR private.check_user_is_group_member(oc.group_id_2, auth.uid())
    )
  ORDER BY cm.created_at DESC
  LIMIT "limitCount";
$$;

GRANT EXECUTE ON FUNCTION public."app:planetOrbit:chat:readMessages" TO authenticated;

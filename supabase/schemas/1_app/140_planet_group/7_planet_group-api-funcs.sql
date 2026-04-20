-- Helper: check if user is a member of a group
CREATE OR REPLACE FUNCTION private.check_user_is_group_member(
  "groupId" uuid,
  "userId" uuid
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT EXISTS (
    SELECT 1 FROM private.group_member gm
    WHERE gm.group_id = "groupId" AND gm.user_id = "userId"
  );
$$;

-- Read all groups for the current user
CREATE OR REPLACE FUNCTION public."app:planetGroup:readAll"()
RETURNS SETOF public."PlanetGroupV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    g.id, g.created_at, g.updated_at, g.name, g.photo_url,
    g.is_open_to_strangers, g.max_group_size, g.visibility, g.created_by_id,
    g.conversation_id, g.next_plan_at
  FROM private.planet_group g
  JOIN private.group_member gm ON gm.group_id = g.id
  WHERE gm.user_id = auth.uid()
  ORDER BY g.updated_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetGroup:readAll" TO authenticated;

-- Read a single group with members
CREATE OR REPLACE FUNCTION public."app:planetGroup:readWithMembers"(
  "groupId" uuid
)
RETURNS public."PlanetGroupWithMembersV1"
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
    COALESCE(
      ARRAY(
        SELECT ROW(
          gm.id, gm.group_id, gm.user_id, gm.is_owner, gm.joined_at, gm.is_online
        )::public."GroupMemberV1"
        FROM private.group_member gm
        WHERE gm.group_id = g.id
        ORDER BY gm.joined_at ASC
      ),
      '{}'::public."GroupMemberV1"[]
    )
  )::public."PlanetGroupWithMembersV1"
  FROM private.planet_group g
  WHERE g.id = "groupId"
    AND private.check_user_is_group_member("groupId", auth.uid())
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetGroup:readWithMembers" TO authenticated;

-- Create a new group
CREATE OR REPLACE FUNCTION public."app:planetGroup:create"(
  "name" text,
  "photoUrl" text DEFAULT NULL,
  "isOpenToStrangers" boolean DEFAULT false,
  "maxGroupSize" integer DEFAULT 10,
  "visibility" public.group_visibility DEFAULT 'PRIVATE'
)
RETURNS public."PlanetGroupV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _group_id uuid;
  _result public."PlanetGroupV1";
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO private.planet_group (name, photo_url, is_open_to_strangers, max_group_size, visibility, created_by_id)
  VALUES ("name", "photoUrl", "isOpenToStrangers", "maxGroupSize", "visibility", auth.uid())
  RETURNING id INTO STRICT _group_id;

  INSERT INTO private.group_member (group_id, user_id, is_owner)
  VALUES (COALESCE(_group_id, '00000000-0000-0000-0000-000000000000'::uuid), auth.uid(), true);

  SELECT
    g.id, g.created_at, g.updated_at, g.name, g.photo_url,
    g.is_open_to_strangers, g.max_group_size, g.visibility, g.created_by_id,
    g.conversation_id, g.next_plan_at
  INTO _result
  FROM private.planet_group g
  WHERE g.id = _group_id;

  RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetGroup:create" TO authenticated;

-- Update a group (owner only)
CREATE OR REPLACE FUNCTION public."app:planetGroup:update"(
  "groupId" uuid,
  "name" text DEFAULT NULL,
  "photoUrl" text DEFAULT '___UNSET___',
  "isOpenToStrangers" boolean DEFAULT NULL,
  "maxGroupSize" integer DEFAULT NULL,
  "visibility" public.group_visibility DEFAULT NULL
)
RETURNS public."PlanetGroupV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
  UPDATE private.planet_group g SET
    updated_at = CURRENT_TIMESTAMP,
    name = COALESCE("name", g.name),
    photo_url = CASE WHEN "photoUrl" IS DISTINCT FROM '___UNSET___' THEN "photoUrl" ELSE g.photo_url END,
    is_open_to_strangers = COALESCE("isOpenToStrangers", g.is_open_to_strangers),
    max_group_size = COALESCE("maxGroupSize", g.max_group_size),
    visibility = COALESCE("visibility", g.visibility)
  WHERE g.id = "groupId"
    AND g.created_by_id = auth.uid()
  RETURNING
    g.id, g.created_at, g.updated_at, g.name, g.photo_url,
    g.is_open_to_strangers, g.max_group_size, g.visibility, g.created_by_id,
    g.conversation_id, g.next_plan_at;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetGroup:update" TO authenticated;

-- Delete a group (owner only)
CREATE OR REPLACE FUNCTION public."app:planetGroup:delete"(
  "groupId" uuid
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
  WITH deleted AS (
    DELETE FROM private.planet_group g
    WHERE g.id = "groupId"
      AND g.created_by_id = auth.uid()
    RETURNING id
  )
  SELECT EXISTS(SELECT 1 FROM deleted);
$$;

GRANT EXECUTE ON FUNCTION public."app:planetGroup:delete" TO authenticated;

-- Leave a group (non-owner)
CREATE OR REPLACE FUNCTION public."app:planetGroup:leave"(
  "groupId" uuid
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
  WITH deleted AS (
    DELETE FROM private.group_member gm
    WHERE gm.group_id = "groupId"
      AND gm.user_id = auth.uid()
      AND gm.is_owner = false
    RETURNING id
  )
  SELECT EXISTS(SELECT 1 FROM deleted);
$$;

GRANT EXECUTE ON FUNCTION public."app:planetGroup:leave" TO authenticated;

-- Read members of a group
CREATE OR REPLACE FUNCTION public."app:planetGroup:member:readAll"(
  "groupId" uuid
)
RETURNS SETOF public."GroupMemberV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    gm.id, gm.group_id, gm.user_id, gm.is_owner, gm.joined_at, gm.is_online
  FROM private.group_member gm
  WHERE gm.group_id = "groupId"
    AND private.check_user_is_group_member("groupId", auth.uid())
  ORDER BY gm.joined_at ASC;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetGroup:member:readAll" TO authenticated;

-- Create an invite
CREATE OR REPLACE FUNCTION public."app:planetInvite:create"(
  "groupId" uuid,
  "inviteCode" text,
  "invitedUserId" uuid DEFAULT NULL,
  "expiresAt" timestamptz DEFAULT NULL
)
RETURNS public."InviteV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _result public."InviteV1";
BEGIN
  IF "groupId" IS NULL OR "inviteCode" IS NULL THEN
    RETURN NULL;
  END IF;

  IF NOT private.check_user_is_group_member("groupId", auth.uid()) THEN
    RETURN NULL;
  END IF;

  INSERT INTO private.invite (group_id, invited_by_user_id, invited_user_id, invite_code, expires_at)
  VALUES ("groupId", auth.uid(), "invitedUserId", "inviteCode", "expiresAt")
  RETURNING
    id, created_at, group_id, invited_by_user_id, invited_user_id,
    invite_code, expires_at, is_accepted
  INTO _result;

  RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetInvite:create" TO authenticated;

-- Accept an invite (join group)
CREATE OR REPLACE FUNCTION public."app:planetInvite:accept"(
  "inviteCode" text
)
RETURNS public."GroupMemberV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _invite record;
  _result public."GroupMemberV1";
BEGIN
  SELECT * INTO _invite
  FROM private.invite i
  WHERE i.invite_code = "inviteCode"
    AND i.is_accepted = false
    AND (i.expires_at IS NULL OR i.expires_at > CURRENT_TIMESTAMP)
  LIMIT 1;

  IF _invite IS NULL OR _invite.group_id IS NULL OR auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  -- Check group size limit
  IF (
    SELECT count(*) FROM private.group_member gm WHERE gm.group_id = _invite.group_id
  ) >= (
    SELECT g.max_group_size FROM private.planet_group g WHERE g.id = _invite.group_id
  ) THEN
    RETURN NULL;
  END IF;

  -- Mark invite as accepted
  UPDATE private.invite SET is_accepted = true WHERE id = _invite.id;

  INSERT INTO private.group_member (group_id, user_id)
  VALUES (COALESCE(_invite.group_id, '00000000-0000-0000-0000-000000000000'::uuid), auth.uid())
  ON CONFLICT (group_id, user_id) DO NOTHING;

  SELECT
    gm.id, gm.group_id, gm.user_id, gm.is_owner, gm.joined_at, gm.is_online
  INTO _result
  FROM private.group_member gm
  WHERE gm.group_id = _invite.group_id AND gm.user_id = auth.uid();

  RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetInvite:accept" TO authenticated;

-- Read pending invites for a group
CREATE OR REPLACE FUNCTION public."app:planetInvite:readAllByGroup"(
  "groupId" uuid
)
RETURNS SETOF public."InviteV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    i.id, i.created_at, i.group_id, i.invited_by_user_id, i.invited_user_id,
    i.invite_code, i.expires_at, i.is_accepted
  FROM private.invite i
  WHERE i.group_id = "groupId"
    AND private.check_user_is_group_member("groupId", auth.uid())
  ORDER BY i.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetInvite:readAllByGroup" TO authenticated;

-- Helper: assign a deterministic color to a member based on uuid hash
CREATE OR REPLACE FUNCTION private.member_color_from_uuid("uid" uuid)
RETURNS text
IMMUTABLE
SET search_path = ''
LANGUAGE sql
AS $$
  SELECT (ARRAY['#FF7669','#34D399','#60A5FA','#FBBF24','#A78BFA','#F472B6'])[
    (abs(('x' || left(replace("uid"::text, '-', ''), 8))::bit(32)::integer) % 6) + 1
  ];
$$;

-- Read full chat data for a group (messages with sender info, reactions, shared activity)
CREATE OR REPLACE FUNCTION public."app:planetGroup:readChatData"(
  "groupId" uuid
)
RETURNS public."GroupChatDataV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    g.name,
    COALESCE((SELECT count(*)::integer FROM private.group_member gm2 WHERE gm2.group_id = g.id), 0),
    COALESCE(
      ARRAY(
        SELECT ROW(
          cm.id,
          cm.created_at,
          cm.content_text,
          (cm.author_entity_id = auth.uid()),
          COALESCE(cm.context->>'messageType', 'TEXT'),
          CASE
            WHEN e.entity_type = 'SYSTEM' THEN NULL
            WHEN cm.author_entity_id = auth.uid() THEN NULL
            ELSE COALESCE(p.full_name, p.given_name, 'User')
          END,
          CASE
            WHEN e.entity_type = 'SYSTEM' THEN NULL
            WHEN cm.author_entity_id = auth.uid() THEN NULL
            ELSE UPPER(LEFT(COALESCE(p.full_name, p.given_name, 'U'), 1))
          END,
          CASE
            WHEN e.entity_type = 'SYSTEM' THEN NULL
            WHEN cm.author_entity_id = auth.uid() THEN NULL
            ELSE private.member_color_from_uuid(cm.author_entity_id)
          END,
          COALESCE(
            ARRAY(
              SELECT ROW(
                gcr_agg.emoji,
                COALESCE(gcr_agg.cnt::integer, 0),
                COALESCE(gcr_agg.user_reacted, false)
              )::public."GroupChatReactionV1"
              FROM (
                SELECT
                  gcr.emoji,
                  count(*)::integer AS cnt,
                  COALESCE(bool_or(gcr.user_id = auth.uid()), false) AS user_reacted
                FROM private.group_chat_reaction gcr
                WHERE gcr.message_id = cm.id
                GROUP BY gcr.emoji
                ORDER BY min(gcr.created_at) ASC
              ) gcr_agg
            ),
            '{}'::public."GroupChatReactionV1"[]
          ),
          (cm.context->>'sharedActivityId')::uuid,
          sa.title,
          COALESCE(sb.name, sa.address),
          sa.primary_image_url,
          sd.headline
        )::public."GroupChatMessageV1"
        FROM private.conversation_message cm
        JOIN private.entity e ON e.id = cm.author_entity_id
        LEFT JOIN private.profile p ON p.id = cm.author_entity_id
        LEFT JOIN private.activity sa ON sa.id = (cm.context->>'sharedActivityId')::uuid
        LEFT JOIN private.business sb ON sb.id = sa.business_id
        LEFT JOIN LATERAL (
          SELECT d.headline
          FROM private.deal d
          JOIN private.deal_activity da ON da.deal_id = d.id
          WHERE da.activity_id = sa.id AND d.status = 'ACTIVE'
          LIMIT 1
        ) sd ON true
        WHERE cm.conversation_id = g.conversation_id
        ORDER BY cm.created_at DESC
      ),
      '{}'::public."GroupChatMessageV1"[]
    )
  )::public."GroupChatDataV1"
  FROM private.planet_group g
  WHERE g.id = "groupId"
    AND g.conversation_id IS NOT NULL
    AND private.check_user_is_group_member("groupId", auth.uid())
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetGroup:readChatData" TO authenticated;

-- Send a text message in a group chat
CREATE OR REPLACE FUNCTION public."app:planetGroup:chat:sendMessage"(
  "groupId" uuid,
  "contentText" text,
  "context" jsonb DEFAULT NULL
)
RETURNS public."GroupChatMessageV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _conversation_id uuid;
  _message_id uuid;
  _result public."GroupChatMessageV1";
BEGIN
  IF "groupId" IS NULL OR auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  IF NOT private.check_user_is_group_member("groupId", auth.uid()) THEN
    RETURN NULL;
  END IF;

  SELECT g.conversation_id INTO _conversation_id
  FROM private.planet_group g
  WHERE g.id = "groupId" AND g.conversation_id IS NOT NULL;

  IF _conversation_id IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO private.conversation_message (conversation_id, author_entity_id, content_text, context)
  VALUES (_conversation_id, auth.uid(), "contentText", "context")
  RETURNING id INTO STRICT _message_id;

  SELECT
    cm.id,
    cm.created_at,
    cm.content_text,
    true,
    COALESCE(cm.context->>'messageType', 'TEXT'),
    NULL::text,
    NULL::text,
    NULL::text,
    '{}'::public."GroupChatReactionV1"[],
    NULL::uuid,
    NULL::text,
    NULL::text,
    NULL::text,
    NULL::text
  INTO _result
  FROM private.conversation_message cm
  WHERE cm.id = _message_id;

  RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetGroup:chat:sendMessage" TO authenticated;

-- Share an activity in a group chat
CREATE OR REPLACE FUNCTION public."app:planetGroup:chat:shareActivity"(
  "groupId" uuid,
  "activityId" uuid,
  "contentText" text DEFAULT NULL
)
RETURNS public."GroupChatMessageV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _conversation_id uuid;
  _message_id uuid;
  _ctx jsonb;
  _result public."GroupChatMessageV1";
BEGIN
  IF "groupId" IS NULL OR "activityId" IS NULL OR auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  IF NOT private.check_user_is_group_member("groupId", auth.uid()) THEN
    RETURN NULL;
  END IF;

  SELECT g.conversation_id INTO _conversation_id
  FROM private.planet_group g
  WHERE g.id = "groupId" AND g.conversation_id IS NOT NULL;

  IF _conversation_id IS NULL THEN
    RETURN NULL;
  END IF;

  _ctx := jsonb_build_object('messageType', 'ACTIVITY_SHARE', 'sharedActivityId', "activityId"::text);

  INSERT INTO private.conversation_message (conversation_id, author_entity_id, content_text, context)
  VALUES (_conversation_id, auth.uid(), "contentText", _ctx)
  RETURNING id INTO STRICT _message_id;

  SELECT ROW(
    cm.id,
    cm.created_at,
    cm.content_text,
    true,
    'ACTIVITY_SHARE',
    NULL::text,
    NULL::text,
    NULL::text,
    '{}'::public."GroupChatReactionV1"[],
    (cm.context->>'sharedActivityId')::uuid,
    sa.title,
    COALESCE(sb.name, sa.address),
    sa.primary_image_url,
    sd.headline
  )::public."GroupChatMessageV1"
  INTO _result
  FROM private.conversation_message cm
  LEFT JOIN private.activity sa ON sa.id = (cm.context->>'sharedActivityId')::uuid
  LEFT JOIN private.business sb ON sb.id = sa.business_id
  LEFT JOIN LATERAL (
    SELECT d.headline
    FROM private.deal d
    JOIN private.deal_activity da ON da.deal_id = d.id
    WHERE da.activity_id = sa.id AND d.status = 'ACTIVE'
    LIMIT 1
  ) sd ON true
  WHERE cm.id = _message_id;

  RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetGroup:chat:shareActivity" TO authenticated;

-- Add a reaction to a message
CREATE OR REPLACE FUNCTION public."app:planetGroup:chat:addReaction"(
  "messageId" uuid,
  "emoji" text
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _user_id uuid;
BEGIN
  IF "messageId" IS NULL OR "emoji" IS NULL OR auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  _user_id := auth.uid();

  -- Verify user is a member of the group that owns this conversation
  IF NOT EXISTS (
    SELECT 1
    FROM private.conversation_message cm
    JOIN private.planet_group g ON g.conversation_id = cm.conversation_id
    JOIN private.group_member gm ON gm.group_id = g.id AND gm.user_id = _user_id
    WHERE cm.id = "messageId"
  ) THEN
    RETURN false;
  END IF;

  INSERT INTO private.group_chat_reaction (message_id, user_id, emoji)
  VALUES (COALESCE("messageId", '00000000-0000-0000-0000-000000000000'::uuid),
          COALESCE(_user_id, '00000000-0000-0000-0000-000000000000'::uuid),
          COALESCE("emoji", ''))
  ON CONFLICT (message_id, user_id, emoji) DO NOTHING;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetGroup:chat:addReaction" TO authenticated;

-- Remove a reaction from a message
CREATE OR REPLACE FUNCTION public."app:planetGroup:chat:removeReaction"(
  "messageId" uuid,
  "emoji" text
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _deleted boolean;
BEGIN
  IF "messageId" IS NULL OR "emoji" IS NULL OR auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  WITH deleted AS (
    DELETE FROM private.group_chat_reaction gcr
    WHERE gcr.message_id = "messageId"
      AND gcr.user_id = auth.uid()
      AND gcr.emoji = "emoji"
    RETURNING id
  )
  SELECT EXISTS(SELECT 1 FROM deleted) INTO _deleted;

  RETURN _deleted;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetGroup:chat:removeReaction" TO authenticated;

-- NOTE: app:planetGroup:readAllWithSummary is defined in 160_planet_battle/7_planet_battle-api-funcs.sql
-- because it depends on private.battle and private.swipe tables created in schemas 150 and 160.

-- Read group detail with enriched member profiles (display name, avatar, verification)
CREATE OR REPLACE FUNCTION public."app:planetGroup:readDetailWithMembers"(
  "groupId" uuid
)
RETURNS public."PlanetGroupDetailV1"
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
    COALESCE(
      ARRAY(
        SELECT ROW(
          ROW(
            gm.id, gm.group_id, gm.user_id, gm.is_owner, gm.joined_at, gm.is_online
          )::public."GroupMemberV1",
          COALESCE(p.full_name, p.given_name, 'User'),
          p.avatar_url,
          COALESCE(uap.is_verified, false)
        )::public."GroupMemberWithProfileV1"
        FROM private.group_member gm
        LEFT JOIN private.profile p ON p.id = gm.user_id
        LEFT JOIN private.user_app_profile uap ON uap.user_id = gm.user_id
        WHERE gm.group_id = g.id
        ORDER BY gm.is_owner DESC, gm.joined_at ASC
      ),
      '{}'::public."GroupMemberWithProfileV1"[]
    )
  )::public."PlanetGroupDetailV1"
  FROM private.planet_group g
  WHERE g.id = "groupId"
    AND private.check_user_is_group_member("groupId", auth.uid())
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetGroup:readDetailWithMembers" TO authenticated;

-- NOTE: app:planetGroup:readSwipeActivity, app:planetGroup:readRankedActivities,
-- and app:planetGroup:readChatPreview are defined in 150_planet_swipe/7_planet_swipe-api-funcs.sql
-- because they depend on private.swipe table created in that schema.

-- Read invites for a group with profile details
CREATE OR REPLACE FUNCTION public."app:planetInvite:readAllByGroupWithProfile"(
  "groupId" uuid
)
RETURNS SETOF public."InviteWithProfileV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    ROW(
      i.id, i.created_at, i.group_id, i.invited_by_user_id, i.invited_user_id,
      i.invite_code, i.expires_at, i.is_accepted
    )::public."InviteV1",
    COALESCE(pi.full_name, pi.given_name, 'User'),
    pi.avatar_url,
    COALESCE(pb.full_name, pb.given_name, 'User')
  )::public."InviteWithProfileV1"
  FROM private.invite i
  LEFT JOIN private.profile pi ON pi.id = i.invited_user_id
  LEFT JOIN private.profile pb ON pb.id = i.invited_by_user_id
  WHERE i.group_id = "groupId"
    AND private.check_user_is_group_member("groupId", auth.uid())
  ORDER BY i.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetInvite:readAllByGroupWithProfile" TO authenticated;

-- Update the next plan scheduled time for a group (any member can reschedule)
CREATE OR REPLACE FUNCTION public."app:planetGroup:updateNextPlanAt"(
  "groupId" uuid,
  "nextPlanAt" timestamptz
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
  WITH updated AS (
    UPDATE private.planet_group g SET
      next_plan_at = "nextPlanAt",
      updated_at = CURRENT_TIMESTAMP
    WHERE g.id = "groupId"
      AND private.check_user_is_group_member("groupId", auth.uid())
    RETURNING g.id
  )
  SELECT EXISTS(SELECT 1 FROM updated);
$$;

GRANT EXECUTE ON FUNCTION public."app:planetGroup:updateNextPlanAt" TO authenticated;

-- Count pending invites for the current user (across all groups)
CREATE OR REPLACE FUNCTION public."app:planetInvite:countPending"()
RETURNS integer
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT count(*)::integer
  FROM private.invite i
  WHERE i.invited_user_id = auth.uid()
    AND i.is_accepted = false
    AND (i.expires_at IS NULL OR i.expires_at > CURRENT_TIMESTAMP);
$$;

GRANT EXECUTE ON FUNCTION public."app:planetInvite:countPending" TO authenticated;

-- Read open planet groups (groups open to strangers that the current user hasn't joined)
CREATE OR REPLACE FUNCTION public."app:planetGroup:readOpenPlanets"(
  "userLatitude" double precision DEFAULT NULL,
  "userLongitude" double precision DEFAULT NULL
)
RETURNS SETOF public."OpenPlanetCardV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    g.id,
    g.name,
    COALESCE((SELECT count(*)::integer FROM private.group_member gm2 WHERE gm2.group_id = g.id), 0),
    g.max_group_size,
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
      WHEN "userLatitude" IS NOT NULL AND "userLongitude" IS NOT NULL
           AND g.latitude IS NOT NULL AND g.longitude IS NOT NULL THEN
        ROUND((6371.0 * acos(
          LEAST(1.0, GREATEST(-1.0,
            cos(radians("userLatitude")) * cos(radians(g.latitude))
            * cos(radians(g.longitude) - radians("userLongitude"))
            + sin(radians("userLatitude")) * sin(radians(g.latitude))
          ))
        ) * 0.621371)::numeric, 1)::double precision
      ELSE NULL
    END,
    g.featured_activity_name,
    EXISTS (
      SELECT 1 FROM private.battle b
      WHERE b.group_id = g.id
        AND b.phase IN ('VOTING_OPEN', 'VOTING_CLOSED', 'CALCULATING')
    ),
    EXISTS (
      SELECT 1 FROM private.group_orbit o
      WHERE o.group_id = g.id AND o.user_id = auth.uid()
    ),
    EXISTS (
      SELECT 1 FROM private.group_join_request r
      WHERE r.group_id = g.id AND r.user_id = auth.uid()
    )
  FROM private.planet_group g
  WHERE g.is_open_to_strangers = true
    AND auth.uid() IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM private.group_member gm
      WHERE gm.group_id = g.id AND gm.user_id = auth.uid()
    )
  ORDER BY
    CASE
      WHEN "userLatitude" IS NOT NULL AND "userLongitude" IS NOT NULL
           AND g.latitude IS NOT NULL AND g.longitude IS NOT NULL THEN
        6371.0 * acos(
          LEAST(1.0, GREATEST(-1.0,
            cos(radians("userLatitude")) * cos(radians(g.latitude))
            * cos(radians(g.longitude) - radians("userLongitude"))
            + sin(radians("userLatitude")) * sin(radians(g.latitude))
          ))
        )
      ELSE 9999
    END ASC;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetGroup:readOpenPlanets" TO authenticated;

-- Toggle orbit on an open group (insert if not orbiting, delete if already orbiting)
CREATE OR REPLACE FUNCTION public."app:planetGroup:toggleOrbit"(
  "groupId" uuid
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  IF EXISTS (
    SELECT 1 FROM private.group_orbit o
    WHERE o.group_id = "groupId" AND o.user_id = auth.uid()
  ) THEN
    DELETE FROM private.group_orbit
    WHERE group_id = "groupId" AND user_id = auth.uid();
    RETURN false;
  ELSE
    INSERT INTO private.group_orbit (group_id, user_id)
    VALUES ("groupId", auth.uid());
    RETURN true;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetGroup:toggleOrbit" TO authenticated;

-- Remove a member from a group (owner only)
CREATE OR REPLACE FUNCTION public."app:planetGroup:member:remove"(
  "groupId" uuid,
  "targetUserId" uuid
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _group_name text;
  _deleted boolean := false;
BEGIN
  IF auth.uid() IS NULL OR "groupId" IS NULL OR "targetUserId" IS NULL THEN
    RETURN false;
  END IF;

  -- Caller must be the group owner
  IF NOT EXISTS (
    SELECT 1 FROM private.group_member gm
    WHERE gm.group_id = "groupId"
      AND gm.user_id = auth.uid()
      AND gm.is_owner = true
  ) THEN
    RETURN false;
  END IF;

  -- Cannot remove the owner
  IF EXISTS (
    SELECT 1 FROM private.group_member gm
    WHERE gm.group_id = "groupId"
      AND gm.user_id = "targetUserId"
      AND gm.is_owner = true
  ) THEN
    RETURN false;
  END IF;

  -- Get group name for notification
  SELECT g.name INTO _group_name
  FROM private.planet_group g
  WHERE g.id = "groupId";

  -- Remove the member
  WITH deleted AS (
    DELETE FROM private.group_member gm
    WHERE gm.group_id = "groupId"
      AND gm.user_id = "targetUserId"
    RETURNING id
  )
  SELECT EXISTS(SELECT 1 FROM deleted) INTO _deleted;

  IF _deleted THEN
    -- Notify the removed user
    INSERT INTO private.notification (user_id, type, title, body, linked_group_id)
    VALUES (
      "targetUserId",
      'GROUP_ACTIVITY',
      'Removed from crew',
      'You have been removed from ' || COALESCE(_group_name, 'the group'),
      "groupId"
    );
  END IF;

  RETURN _deleted;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetGroup:member:remove" TO authenticated;

-- Private helper: ensure a group has a conversation thread, creating one if needed
CREATE OR REPLACE FUNCTION private.ensure_group_conversation("groupId" uuid)
RETURNS uuid
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _conversation_id uuid;
  _owner_entity_id uuid;
BEGIN
  IF "groupId" IS NULL THEN
    RETURN NULL;
  END IF;

  -- Return existing conversation if already set
  SELECT g.conversation_id INTO _conversation_id
  FROM private.planet_group g
  WHERE g.id = "groupId";

  IF _conversation_id IS NOT NULL THEN
    RETURN _conversation_id;
  END IF;

  -- Use the group owner as the conversation owner entity (entity id = user_id)
  SELECT gm.user_id INTO _owner_entity_id
  FROM private.group_member gm
  WHERE gm.group_id = "groupId" AND gm.is_owner = true
  LIMIT 1;

  IF _owner_entity_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Create the conversation
  INSERT INTO private.conversation (owner_entity_id)
  VALUES (_owner_entity_id)
  RETURNING id INTO _conversation_id;

  -- Add all current group members as participants
  INSERT INTO private.conversation_participant (conversation_id, entity_id)
  SELECT _conversation_id, gm.user_id
  FROM private.group_member gm
  WHERE gm.group_id = "groupId";

  -- Link the conversation to the group
  UPDATE private.planet_group g
  SET conversation_id = _conversation_id, updated_at = CURRENT_TIMESTAMP
  WHERE g.id = "groupId";

  RETURN _conversation_id;
END;
$$;

-- Ensure a group has a chat thread (idempotent, callable from authenticated clients)
CREATE OR REPLACE FUNCTION public."app:planetGroup:ensureChat"(
  "groupId" uuid
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  IF "groupId" IS NULL OR auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  IF NOT private.check_user_is_group_member("groupId", auth.uid()) THEN
    RETURN false;
  END IF;

  PERFORM private.ensure_group_conversation("groupId");
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetGroup:ensureChat" TO authenticated;

-- Reschedule a group plan: update next_plan_at, post system message, notify all other members
CREATE OR REPLACE FUNCTION public."app:planetGroup:reschedule"(
  "groupId" uuid,
  "nextPlanAt" timestamptz,
  "dateLabel" text
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _conversation_id uuid;
  _group_name text;
  _rescheduler_name text;
  _msg_text text;
  _member_user_id uuid;
BEGIN
  IF "groupId" IS NULL OR auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  IF NOT private.check_user_is_group_member("groupId", auth.uid()) THEN
    RETURN false;
  END IF;

  -- Update next_plan_at
  UPDATE private.planet_group g SET
    next_plan_at = "nextPlanAt",
    updated_at = CURRENT_TIMESTAMP
  WHERE g.id = "groupId";

  -- Get group name
  SELECT g.name INTO _group_name
  FROM private.planet_group g
  WHERE g.id = "groupId";

  -- Ensure conversation exists (creates one if missing) and get its id
  _conversation_id := private.ensure_group_conversation("groupId");

  -- Get rescheduler display name from profile
  SELECT COALESCE(p.full_name, p.given_name, 'A member') INTO _rescheduler_name
  FROM private.profile p
  WHERE p.id = auth.uid();

  _msg_text := chr(128197) || ' Plan rescheduled to ' || COALESCE("dateLabel", 'a new time')
    || chr(10) || 'Rescheduled by ' || COALESCE(_rescheduler_name, 'A member');

  -- Post system message in group conversation
  IF _conversation_id IS NOT NULL THEN
    INSERT INTO private.conversation_message (conversation_id, author_entity_id, content_text, context)
    VALUES (
      _conversation_id,
      '00000000-0000-0000-0000-000000000000',
      _msg_text,
      jsonb_build_object('messageType', 'SYSTEM')
    );
  END IF;

  -- Notify all other group members
  FOR _member_user_id IN
    SELECT gm.user_id
    FROM private.group_member gm
    WHERE gm.group_id = "groupId"
      AND gm.user_id != auth.uid()
  LOOP
    INSERT INTO private.notification (user_id, type, title, body, linked_group_id)
    VALUES (
      _member_user_id,
      'GROUP_ACTIVITY',
      COALESCE(_group_name, 'Group') || ' plan has been rescheduled',
      COALESCE(_group_name, 'Group') || ' plan has been rescheduled to ' || COALESCE("dateLabel", 'a new time'),
      "groupId"
    );
  END LOOP;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetGroup:reschedule" TO authenticated;

-- Schedule a group plan for the first time: update next_plan_at, post system message, notify all other members
CREATE OR REPLACE FUNCTION public."app:planetGroup:schedulePlan"(
  "groupId" uuid,
  "nextPlanAt" timestamptz,
  "dateLabel" text
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _conversation_id uuid;
  _group_name text;
  _scheduler_name text;
  _msg_text text;
  _member_user_id uuid;
BEGIN
  IF "groupId" IS NULL OR auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  IF NOT private.check_user_is_group_member("groupId", auth.uid()) THEN
    RETURN false;
  END IF;

  -- Update next_plan_at
  UPDATE private.planet_group g SET
    next_plan_at = "nextPlanAt",
    updated_at = CURRENT_TIMESTAMP
  WHERE g.id = "groupId";

  -- Get group name
  SELECT g.name INTO _group_name
  FROM private.planet_group g
  WHERE g.id = "groupId";

  -- Ensure conversation exists and get its id
  _conversation_id := private.ensure_group_conversation("groupId");

  -- Get scheduler display name from profile
  SELECT COALESCE(p.full_name, p.given_name, 'A member') INTO _scheduler_name
  FROM private.profile p
  WHERE p.id = auth.uid();

  _msg_text := chr(128197) || ' ' || COALESCE(_scheduler_name, 'A member')
    || ' scheduled a plan for ' || COALESCE(_group_name, 'the group')
    || ' — ' || COALESCE("dateLabel", 'a new time');

  -- Post system message in group conversation
  IF _conversation_id IS NOT NULL THEN
    INSERT INTO private.conversation_message (conversation_id, author_entity_id, content_text, context)
    VALUES (
      _conversation_id,
      '00000000-0000-0000-0000-000000000000',
      _msg_text,
      jsonb_build_object('messageType', 'SYSTEM')
    );
  END IF;

  -- Notify all other group members
  FOR _member_user_id IN
    SELECT gm.user_id
    FROM private.group_member gm
    WHERE gm.group_id = "groupId"
      AND gm.user_id != auth.uid()
  LOOP
    INSERT INTO private.notification (user_id, type, title, body, linked_group_id)
    VALUES (
      _member_user_id,
      'GROUP_ACTIVITY',
      chr(128197) || ' ' || COALESCE(_scheduler_name, 'A member') || ' scheduled a plan for ' || COALESCE(_group_name, 'your group'),
      chr(128197) || ' ' || COALESCE(_scheduler_name, 'A member') || ' scheduled a plan for ' || COALESCE(_group_name, 'your group') || ' — ' || COALESCE("dateLabel", 'a new time') || '. Go boost some activities before voting opens!',
      "groupId"
    );
  END LOOP;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetGroup:schedulePlan" TO authenticated;

-- Nudge all non-ready group members who haven't been nudged in the last 24 hours
CREATE OR REPLACE FUNCTION public."app:planetGroup:nudgeAll"(
  "groupId" uuid
)
RETURNS integer
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _sender_name text;
  _member_user_id uuid;
  _nudged_count integer := 0;
BEGIN
  IF "groupId" IS NULL OR auth.uid() IS NULL THEN
    RETURN 0;
  END IF;

  IF NOT private.check_user_is_group_member("groupId", auth.uid()) THEN
    RETURN 0;
  END IF;

  SELECT COALESCE(p.full_name, p.given_name, 'Someone') INTO _sender_name
  FROM private.profile p
  WHERE p.id = auth.uid();

  -- Nudge members who are not ready and have not been nudged in the last 24 hours
  FOR _member_user_id IN
    SELECT gm.user_id
    FROM private.group_member gm
    WHERE gm.group_id = "groupId"
      AND gm.user_id != auth.uid()
      AND NOT EXISTS(
        SELECT 1 FROM private.crew_nudge cn
        WHERE cn.recipient_id = gm.user_id
          AND cn.group_id = "groupId"
          AND cn.nudged_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
      )
      AND (
        SELECT COUNT(s.id) FROM private.swipe s
        WHERE s.user_id = gm.user_id
          AND s.group_id = "groupId"
          AND s.action IN ('LIKE', 'SUPER_LIKE')
      ) < 3
  LOOP
    INSERT INTO private.crew_nudge (sender_id, recipient_id, group_id)
    VALUES (auth.uid(), _member_user_id, "groupId");

    INSERT INTO private.notification (user_id, type, title, body, linked_group_id)
    VALUES (
      _member_user_id,
      'GROUP_ACTIVITY',
      COALESCE(_sender_name, 'Someone') || ' is waiting on you',
      COALESCE(_sender_name, 'Someone') || ' is waiting on you — go boost some activities on Planet 🚀 Your crew needs your picks!',
      "groupId"
    );

    _nudged_count := _nudged_count + 1;
  END LOOP;

  RETURN _nudged_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetGroup:nudgeAll" TO authenticated;

-- Request to join an open group
CREATE OR REPLACE FUNCTION public."app:planetGroup:requestToJoin"(
  "groupId" uuid,
  "message" text DEFAULT NULL
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
  INSERT INTO private.group_join_request (group_id, user_id, message)
  SELECT "groupId", auth.uid(), "message"
  WHERE auth.uid() IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM private.group_member gm
      WHERE gm.group_id = "groupId" AND gm.user_id = auth.uid()
    )
  ON CONFLICT (group_id, user_id) DO UPDATE SET message = EXCLUDED.message
  RETURNING true;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetGroup:requestToJoin" TO authenticated;

-- Read per-member swipe readiness for a group (LIKE/SUPER_LIKE count per member, or has voted in a battle)
CREATE OR REPLACE FUNCTION public."app:planetGroup:readMemberReadiness"(
  "groupId" uuid
)
RETURNS SETOF public."MemberReadinessV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    gm.user_id,
    count(s.id)::integer,
    count(s.id)::integer >= 3
    OR EXISTS(
      SELECT 1 FROM private.vote v
      JOIN private.battle b ON b.id = v.battle_id
      WHERE v.user_id = gm.user_id
        AND b.group_id = "groupId"
    ),
    EXISTS(
      SELECT 1 FROM private.crew_nudge cn
      WHERE cn.recipient_id = gm.user_id
        AND cn.group_id = "groupId"
        AND cn.nudged_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
    )
  FROM private.group_member gm
  LEFT JOIN private.swipe s ON s.user_id = gm.user_id
    AND s.group_id = "groupId"
    AND s.action IN ('LIKE', 'SUPER_LIKE')
  WHERE gm.group_id = "groupId"
    AND private.check_user_is_group_member("groupId", auth.uid())
  GROUP BY gm.user_id;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetGroup:readMemberReadiness" TO authenticated;

-- Send a nudge to a group member (enforces 24-hour per-recipient cooldown)
CREATE OR REPLACE FUNCTION public."app:planetGroup:nudgeMember"(
  "groupId" uuid,
  "recipientId" uuid
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _sender_name text;
  _already_nudged boolean;
BEGIN
  IF auth.uid() IS NULL OR "groupId" IS NULL OR "recipientId" IS NULL THEN
    RETURN false;
  END IF;

  IF NOT private.check_user_is_group_member("groupId", auth.uid()) THEN
    RETURN false;
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM private.crew_nudge cn
    WHERE cn.recipient_id = "recipientId"
      AND cn.group_id = "groupId"
      AND cn.nudged_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
  ) INTO _already_nudged;

  IF _already_nudged THEN
    RETURN false;
  END IF;

  SELECT COALESCE(p.full_name, p.given_name, 'Someone') INTO _sender_name
  FROM private.profile p
  WHERE p.id = auth.uid();

  INSERT INTO private.crew_nudge (sender_id, recipient_id, group_id)
  VALUES (auth.uid(), "recipientId", "groupId");

  INSERT INTO private.notification (user_id, type, title, body, linked_group_id)
  VALUES (
    "recipientId",
    'GROUP_ACTIVITY',
    COALESCE(_sender_name, 'Someone') || ' is waiting on you',
    COALESCE(_sender_name, 'Someone') || ' is waiting on you — go boost some activities on Planet 🚀 Your crew needs your picks!',
    "groupId"
  );

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetGroup:nudgeMember" TO authenticated;

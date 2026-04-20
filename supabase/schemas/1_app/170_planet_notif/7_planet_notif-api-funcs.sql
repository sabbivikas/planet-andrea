-- Read notifications for the current user
CREATE OR REPLACE FUNCTION public."app:planetNotif:readAll"(
  "limitCount" integer DEFAULT 50,
  "offsetCount" integer DEFAULT 0
)
RETURNS SETOF public."NotificationV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    n.id, n.created_at, n.user_id, n.type, n.title, n.body,
    n.linked_group_id, n.linked_activity_id, n.linked_battle_id,
    n.linked_merge_request_id, n.is_read
  FROM private.notification n
  WHERE n.user_id = auth.uid()
  ORDER BY n.created_at DESC
  LIMIT "limitCount"
  OFFSET "offsetCount";
$$;

GRANT EXECUTE ON FUNCTION public."app:planetNotif:readAll" TO authenticated;

-- Count unread notifications
CREATE OR REPLACE FUNCTION public."app:planetNotif:countUnread"()
RETURNS integer
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT count(*)::integer
  FROM private.notification n
  WHERE n.user_id = auth.uid()
    AND n.is_read = false;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetNotif:countUnread" TO authenticated;

-- Mark a notification as read
CREATE OR REPLACE FUNCTION public."app:planetNotif:markRead"(
  "notificationId" uuid
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
  WITH updated AS (
    UPDATE private.notification n SET
      is_read = true
    WHERE n.id = "notificationId"
      AND n.user_id = auth.uid()
    RETURNING id
  )
  SELECT EXISTS(SELECT 1 FROM updated);
$$;

GRANT EXECUTE ON FUNCTION public."app:planetNotif:markRead" TO authenticated;

-- Mark all notifications as read
CREATE OR REPLACE FUNCTION public."app:planetNotif:markAllRead"()
RETURNS integer
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
  WITH updated AS (
    UPDATE private.notification n SET
      is_read = true
    WHERE n.user_id = auth.uid()
      AND n.is_read = false
    RETURNING id
  )
  SELECT count(*)::integer FROM updated;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetNotif:markAllRead" TO authenticated;

-- Dismiss (delete) a notification
CREATE OR REPLACE FUNCTION public."app:planetNotif:dismiss"(
  "notificationId" uuid
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
  WITH deleted AS (
    DELETE FROM private.notification n
    WHERE n.id = "notificationId"
      AND n.user_id = auth.uid()
    RETURNING id
  )
  SELECT EXISTS(SELECT 1 FROM deleted);
$$;

GRANT EXECUTE ON FUNCTION public."app:planetNotif:dismiss" TO authenticated;

-- Admin: create a notification (from edge functions)
CREATE OR REPLACE FUNCTION public."admin:planetNotif:create"(
  "userId" uuid,
  "type" public.notification_type,
  "title" text,
  "body" text,
  "linkedGroupId" uuid DEFAULT NULL,
  "linkedActivityId" uuid DEFAULT NULL,
  "linkedBattleId" uuid DEFAULT NULL,
  "linkedMergeRequestId" uuid DEFAULT NULL
)
RETURNS public."NotificationV1"
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _result public."NotificationV1";
BEGIN
  IF "userId" IS NULL OR "type" IS NULL OR "title" IS NULL OR "body" IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO private.notification (user_id, type, title, body, linked_group_id, linked_activity_id, linked_battle_id, linked_merge_request_id)
  VALUES ("userId", "type", "title", "body", "linkedGroupId", "linkedActivityId", "linkedBattleId", "linkedMergeRequestId")
  RETURNING
    id, created_at, user_id, type, title, body,
    linked_group_id, linked_activity_id, linked_battle_id,
    linked_merge_request_id, is_read
  INTO _result;

  RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public."admin:planetNotif:create" TO service_role;

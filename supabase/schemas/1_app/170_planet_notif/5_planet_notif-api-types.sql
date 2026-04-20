CREATE TYPE public."NotificationV1" AS (
  id uuid_notnull,
  "createdAt" timestamptz_notnull,
  "userId" uuid_notnull,
  type public.notification_type,
  title text,
  body text,
  "linkedGroupId" uuid,
  "linkedActivityId" uuid,
  "linkedBattleId" uuid,
  "linkedMergeRequestId" uuid,
  "isRead" bool_notnull
);

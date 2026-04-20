CREATE TYPE public."SwipeV1" AS (
  id uuid_notnull,
  "createdAt" timestamptz_notnull,
  "userId" uuid_notnull,
  "activityId" uuid_notnull,
  "groupId" uuid,
  action public.swipe_action
);

CREATE TYPE public."SwipeWithActivityV1" AS (
  swipe public."SwipeV1",
  "activityTitle" text,
  "activityImageUrl" text,
  "activityCategory" public.activity_category
);

-- Group-related composite types that depend on public.swipe_action.
-- Defined here instead of 140_planet_group because swipe_action is created in this schema.

CREATE TYPE public."GroupSwipeActivityV1" AS (
  id uuid_notnull,
  "memberName" text,
  "memberInitial" text,
  action public.swipe_action,
  "activityTitle" text,
  "activityThumbnailUrl" text,
  "createdAt" timestamptz_notnull
);

CREATE TYPE public."GroupRankedActivityV1" AS (
  "activityId" uuid_notnull,
  title text,
  "thumbnailUrl" text,
  "swipeCount" int_notnull,
  "hasDeal" bool_notnull
);

CREATE TYPE public."GroupChatPreviewV1" AS (
  "senderName" text,
  "lastMessage" text,
  "sentAt" timestamptz
);

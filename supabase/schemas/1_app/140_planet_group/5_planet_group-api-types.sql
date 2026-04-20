CREATE TYPE public."PlanetGroupV1" AS (
  id uuid_notnull,
  "createdAt" timestamptz_notnull,
  "updatedAt" timestamptz_notnull,
  name text,
  "photoUrl" text,
  "isOpenToStrangers" bool_notnull,
  "maxGroupSize" int_notnull,
  visibility public.group_visibility,
  "createdById" uuid_notnull,
  "conversationId" uuid,
  "nextPlanAt" timestamptz
);

CREATE TYPE public."GroupMemberV1" AS (
  id uuid_notnull,
  "groupId" uuid_notnull,
  "userId" uuid_notnull,
  "isOwner" bool_notnull,
  "joinedAt" timestamptz_notnull,
  "isOnline" bool_notnull
);

CREATE TYPE public."InviteV1" AS (
  id uuid_notnull,
  "createdAt" timestamptz_notnull,
  "groupId" uuid_notnull,
  "invitedByUserId" uuid_notnull,
  "invitedUserId" uuid,
  "inviteCode" text,
  "expiresAt" timestamptz,
  "isAccepted" bool_notnull
);

CREATE TYPE public."PlanetGroupWithMembersV1" AS (
  "group" public."PlanetGroupV1",
  members public."GroupMemberV1"[]
);

CREATE TYPE public."PlanetGroupSummaryV1" AS (
  "group" public."PlanetGroupV1",
  "memberCount" int_notnull,
  "memberInitials" text[],
  status text,
  "lastActivityAt" timestamptz_notnull
);

CREATE TYPE public."GroupMemberWithProfileV1" AS (
  member public."GroupMemberV1",
  "displayName" text,
  "avatarUrl" text,
  "isVerified" bool_notnull
);

CREATE TYPE public."PlanetGroupDetailV1" AS (
  "group" public."PlanetGroupV1",
  members public."GroupMemberWithProfileV1"[]
);

CREATE TYPE public."InviteWithProfileV1" AS (
  invite public."InviteV1",
  "inviteeName" text,
  "inviteeAvatarUrl" text,
  "inviterName" text
);

CREATE TYPE public."GroupChatReactionV1" AS (
  emoji text,
  count int_notnull,
  "hasReacted" bool_notnull
);

CREATE TYPE public."GroupChatMessageV1" AS (
  id uuid_notnull,
  "createdAt" timestamptz_notnull,
  "contentText" text,
  "isCurrentUser" bool_notnull,
  "messageType" text,
  "senderName" text,
  "senderInitial" text,
  "senderColor" text,
  reactions public."GroupChatReactionV1"[],
  "sharedActivityId" uuid,
  "sharedActivityTitle" text,
  "sharedActivityVenue" text,
  "sharedActivityImageUrl" text,
  "sharedActivityDealLabel" text
);

CREATE TYPE public."GroupChatDataV1" AS (
  "groupName" text,
  "memberCount" int_notnull,
  messages public."GroupChatMessageV1"[]
);

CREATE TYPE public."OpenPlanetCardV1" AS (
  id uuid_notnull,
  "name" text,
  "memberCount" int_notnull,
  "maxGroupSize" int_notnull,
  "memberInitials" text[],
  "distanceInMiles" double precision,
  "featuredActivityName" text,
  "isVoting" bool_notnull,
  "hasOrbited" bool_notnull,
  "hasRequestedToJoin" bool_notnull
);

-- Per-member swipe readiness for a group
CREATE TYPE public."MemberReadinessV1" AS (
  "userId" uuid_notnull,
  "swipeCount" int_notnull,
  "isReady" bool_notnull,
  "wasNudgedRecently" bool_notnull
);

-- NOTE: GroupSwipeActivityV1, GroupRankedActivityV1, and GroupChatPreviewV1
-- are defined in 150_planet_swipe/5_planet_swipe-api-types.sql because they
-- depend on public.swipe_action which is created in that schema.

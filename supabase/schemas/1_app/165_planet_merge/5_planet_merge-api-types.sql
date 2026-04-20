CREATE TYPE public."MergeRequestV1" AS (
  id public.uuid_notnull,
  "createdAt" public.timestamptz_notnull,
  "updatedAt" public.timestamptz_notnull,
  "initiatingGroupId" public.uuid_notnull,
  "otherGroupId" public.uuid_notnull,
  "activityId" uuid,
  "battleId" uuid,
  status public.merge_request_status
);

CREATE TYPE public."OrbitMemberV1" AS (
  "userId" public.uuid_notnull,
  "displayName" text,
  "initial" text,
  "groupId" public.uuid_notnull,
  "isFromOtherGroup" public.bool_notnull
);

CREATE TYPE public."MergeScreenDataV1" AS (
  "mergeRequest" public."MergeRequestV1",
  "initiatingGroupName" text,
  "initiatingGroupMemberCount" public.int_notnull,
  "otherGroupName" text,
  "otherGroupMemberCount" public.int_notnull,
  "activityName" text,
  "activityAddress" text,
  "isInitiatingGroup" public.bool_notnull
);

CREATE TYPE public."OrbitScreenDataV1" AS (
  "orbitChannelId" public.uuid_notnull,
  "mergeRequestId" public.uuid_notnull,
  "group1Id" public.uuid_notnull,
  "group1Name" text,
  "group1MemberCount" public.int_notnull,
  "group2Id" public.uuid_notnull,
  "group2Name" text,
  "group2MemberCount" public.int_notnull,
  "activityName" text,
  "activityAddress" text,
  "conversationId" uuid,
  "members" public."OrbitMemberV1"[]
);

-- Represents a pending merge opportunity found for a group after battle resolution
CREATE TYPE public."MergeOpportunityV1" AS (
  "mergeRequestId" public.uuid_notnull,
  "otherGroupId" public.uuid_notnull,
  "otherGroupName" text,
  "activityName" text
);

CREATE TYPE public."OrbitChatMessageV1" AS (
  id public.uuid_notnull,
  "createdAt" public.timestamptz_notnull,
  "authorUserId" public.uuid_notnull,
  "authorName" text,
  "authorInitial" text,
  "contentText" text,
  "authorGroupId" public.uuid_notnull
);

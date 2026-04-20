CREATE TYPE public."BattleV1" AS (
  id uuid_notnull,
  "createdAt" timestamptz_notnull,
  "groupId" uuid_notnull,
  phase public.battle_phase,
  "durationInMin" int_notnull,
  "startedAt" timestamptz_notnull,
  "endsAt" timestamptz_notnull,
  "winningActivityId" uuid
);

CREATE TYPE public."BattleFinalistV1" AS (
  id uuid_notnull,
  "battleId" uuid_notnull,
  "activityId" uuid_notnull,
  "voteCount" int_notnull
);

CREATE TYPE public."VoteV1" AS (
  id uuid_notnull,
  "createdAt" timestamptz_notnull,
  "battleId" uuid_notnull,
  "userId" uuid_notnull,
  "activityId" uuid_notnull,
  rank integer
);

CREATE TYPE public."BattleWithFinalistsV1" AS (
  battle public."BattleV1",
  finalists public."BattleFinalistV1"[]
);

CREATE TYPE public."BattleFinalistDetailV1" AS (
  "activityId" uuid_notnull,
  title text,
  "primaryImageUrl" text,
  "voteCount" int_notnull,
  "dealHeadline" text,
  address text
);

CREATE TYPE public."BattleMemberStatusV1" AS (
  "userId" uuid_notnull,
  "displayName" text,
  "avatarInitial" text,
  "hasVoted" bool_notnull
);

CREATE TYPE public."BattleMemberVoteV1" AS (
  "userId" uuid_notnull,
  "displayName" text,
  "avatarInitial" text,
  "votedActivityId" uuid
);

CREATE TYPE public."BattleResultsV1" AS (
  battle public."BattleV1",
  "groupName" text,
  "winnerActivity" public."ActivityV1",
  "winnerDeal" public."DealV1",
  finalists public."BattleFinalistDetailV1"[],
  "memberVotes" public."BattleMemberVoteV1"[]
);

CREATE TYPE public."BattleDetailV1" AS (
  battle public."BattleV1",
  "groupName" text,
  "totalParticipants" int_notnull,
  "votedParticipants" int_notnull,
  finalists public."BattleFinalistDetailV1"[],
  "winnerTitle" text,
  "winnerImageUrl" text
);

CREATE TYPE public."BattleMiniGameResultV1" AS (
  "userId" uuid_notnull,
  "displayName" text,
  "gameType" text,
  won boolean,
  "reactionTimeInMs" integer
);

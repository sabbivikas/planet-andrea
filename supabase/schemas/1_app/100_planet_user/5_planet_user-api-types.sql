CREATE TYPE public."UserStatsV1" AS (
  "groupsCount" int_notnull,
  "battlesWon" int_notnull,
  "activitiesDiscovered" int_notnull
);

CREATE TYPE public."UserAppProfileV1" AS (
  "userId" uuid_notnull,
  "createdAt" timestamptz_notnull,
  "updatedAt" timestamptz_notnull,
  "isVerified" bool_notnull,
  "verificationStatus" public.verification_status,
  "isOnboarded" bool_notnull,
  "isBusinessOwner" bool_notnull,
  "locationLatitude" double precision,
  "locationLongitude" double precision,
  "phoneNumber" text
);

CREATE TYPE public."PlanetUserSearchResultV1" AS (
  "userId" uuid_notnull,
  "displayName" text,
  username text,
  "avatarUrl" text,
  "isVerified" bool_notnull
);

CREATE TYPE public."NearbyUserV1" AS (
  "userId" uuid_notnull,
  "displayName" text,
  "avatarUrl" text,
  "isVerified" bool_notnull,
  "distanceInKm" double precision
);

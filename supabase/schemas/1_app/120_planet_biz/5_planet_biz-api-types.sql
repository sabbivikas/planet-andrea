CREATE TYPE public."BusinessV1" AS (
  id uuid_notnull,
  "createdAt" timestamptz_notnull,
  "updatedAt" timestamptz_notnull,
  "ownerId" uuid_notnull,
  name text,
  "logoUrl" text,
  "isVerified" bool_notnull,
  "subscriptionTier" text
);

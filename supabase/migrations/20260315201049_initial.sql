-- 0_lib/000_init/0_init.sql

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
-- Disable this line as otherwise the search path for pgcrypt functions needs to be explicitly specified
-- SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
-- pgjwt not supported anymore by supabase. If needed, use functions from here
---https://github.com/michelp/pgjwt/blob/master/pgjwt--0.2.0.sql
-- CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
-- Supabase vault extension resets the search path causiong "ERROR:  3F000: no schema has been selected to create in"
-- https://woz-crew.slack.com/archives/C09MUU8PXQB/p1761616184946489
-- Remove once supabase resolves this issue
SET search_path to "\$user", public, extensions; 

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

-- The schema we are using to store the actual data
CREATE SCHEMA IF NOT EXISTS private AUTHORIZATION pg_database_owner;
COMMENT ON SCHEMA "public" IS 'standard public schema';

-- https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/api/using-custom-schemas.mdx
GRANT USAGE ON SCHEMA private TO service_role, postgres;
GRANT ALL ON ALL TABLES IN SCHEMA private TO service_role, postgres;
GRANT ALL ON ALL ROUTINES IN SCHEMA private TO service_role, postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA private TO service_role, postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA private GRANT ALL ON TABLES TO service_role, postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA private GRANT ALL ON ROUTINES TO service_role, postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA private GRANT ALL ON SEQUENCES TO service_role, postgres;

-- Change the privileges for all functions created in the future in all schemas. 
-- Currently there is no way to limit it to a single schema. https://postgrest.org/en/v12/explanations/db_authz.html#functions
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM anon, authenticated, service_role;


-- 0_lib/000_init/1_types.sql

-- NOT NULL types to be used in composite types which otherwise don't support it: https://dba.stackexchange.com/a/342852/118434
CREATE DOMAIN public.bool_notnull AS bool NOT NULL;
CREATE DOMAIN public.smallint_notnull AS smallint NOT NULL;
CREATE DOMAIN public.int2_notnull AS int2 NOT NULL; 
CREATE DOMAIN public.int_notnull AS int NOT NULL;
CREATE DOMAIN public.int4_notnull AS int4 NOT NULL;
CREATE DOMAIN public.bigint_notnull AS bigint NOT NULL;
CREATE DOMAIN public.int8_notnull AS int8 NOT NULL; 
CREATE DOMAIN public.real_notnull AS real NOT NULL;
CREATE DOMAIN public.float4_notnull AS float4 NOT NULL;
CREATE DOMAIN public.double_notnull AS double precision NOT NULL;
CREATE DOMAIN public.float8_notnull AS float8 NOT NULL;
CREATE DOMAIN public.decimal_notnull AS decimal NOT NULL;
CREATE DOMAIN public.numeric_notnull AS numeric NOT NULL;
CREATE DOMAIN public.money_notnull AS money NOT NULL;

CREATE DOMAIN public.interval_notnull AS interval NOT NULL;
CREATE DOMAIN public.date_notnull AS date NOT NULL;
CREATE DOMAIN public.timetz_notnull AS timetz NOT NULL;
CREATE DOMAIN public.time_notnull AS time NOT NULL;
CREATE DOMAIN public.timestamptz_notnull AS timestamptz NOT NULL;
CREATE DOMAIN public.timestamp_notnull AS timestamp NOT NULL;
CREATE DOMAIN public.uuid_notnull AS uuid NOT NULL;

CREATE DOMAIN public.text_notnull AS text NOT NULL;
CREATE DOMAIN public.bytea_notnull AS bytea NOT NULL;
CREATE DOMAIN public.varchar_notnull AS varchar NOT NULL;
CREATE DOMAIN public.jsonb_notnull AS jsonb NOT NULL;

-- First, create the email domain for testing
CREATE DOMAIN public.email AS TEXT
CHECK (
    VALUE ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND LENGTH(VALUE) <= 254
    AND VALUE NOT LIKE '%..%'  -- No consecutive dots
    AND VALUE NOT LIKE '.%'    -- No leading dot
    AND VALUE NOT LIKE '%.'    -- No trailing dot
);

CREATE DOMAIN public.url AS TEXT;
-- CHECK (
    -- VALUE ~* '^(https?|ftp|ftps|file)://[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*(:(\d{1,5}))?(/.*)?(\?.*)?(\#.*)?$'
    -- OR VALUE ~* '^file:///[a-zA-Z0-9/._\-~%]+$'  -- Special handling for file:// URLs
    -- AND LENGTH(VALUE) <= 2048
-- )


-- 0_lib/000_init/7-uuid-api-funcs.sql

-- Implements a UUID "similar" to type v7 (without the version tag) to generate sortable UUIDs using a timestamp and random number:
-- https://www.ietf.org/archive/id/draft-peabody-dispatch-new-uuid-format-04.html#name-uuid-version-7
-- https://uuid7.com/
-- http://www.codeproject.com/Articles/388157/GUIDs-as-fast-primary-keys-under-multiple-database
--
-- We use 6 bytes (signed) for milliseconds since 1970 = 1628906 days = 4462 years
-- The remaining 10 bytes are random numbers

CREATE OR REPLACE FUNCTION public.uuid_from_millis(millis_since_1970 bigint, uuid1 uuid)
RETURNS uuid
RETURNS NULL ON NULL INPUT
IMMUTABLE
SET search_path = ''
LANGUAGE SQL
AS $$ SELECT (lpad(to_hex(millis_since_1970), 12, '0') || substring(uuid1::text from 14))::UUID; $$;
-- SELECT text('007bdc9c-'||substr(md5(random()::text), 9))::uuid

GRANT EXECUTE ON FUNCTION public.uuid_from_millis TO PUBLIC;

CREATE OR REPLACE FUNCTION public.uuid_from_timestamp(ts timestamptz = now(), uuid1 uuid = gen_random_uuid())
RETURNS uuid
RETURNS NULL ON NULL INPUT
IMMUTABLE
SET search_path = ''
LANGUAGE SQL
AS $$ SELECT public.uuid_from_millis((EXTRACT(EPOCH FROM ts)*1000)::bigint, uuid1);$$;

GRANT EXECUTE ON FUNCTION public.uuid_from_timestamp TO PUBLIC;


CREATE OR REPLACE FUNCTION public.uuid_from_longs(msb bigint, lsb bigint)
RETURNS uuid
RETURNS NULL ON NULL INPUT
IMMUTABLE
SET search_path = ''
LANGUAGE SQL
AS $$ SELECT (lpad(to_hex(msb), 16, '0') || lpad(to_hex(lsb), 16, '0'))::UUID; $$;

GRANT EXECUTE ON FUNCTION public.uuid_from_longs TO PUBLIC;

-- set the time and space component of the uuid to fixed values
CREATE OR REPLACE FUNCTION public.uuid_at(time_id bigint, space_id bigint = 0)
RETURNS uuid
RETURNS NULL ON NULL INPUT
IMMUTABLE
SET search_path = ''
LANGUAGE SQL
AS $$ SELECT (lpad(to_hex(time_id), 12, '0') || lpad(to_hex(space_id), 20, '0'))::UUID; $$;

GRANT EXECUTE ON FUNCTION public.uuid_at TO PUBLIC;


CREATE OR REPLACE FUNCTION public.int_id_from_millis(millis_since_1970 bigint) 
RETURNS integer
RETURNS NULL ON NULL INPUT
IMMUTABLE
SET search_path = ''
LANGUAGE SQL
-- use seconds since epoch, which is 2025-01-01 00:00:00 UTC
AS $$ SELECT (millis_since_1970 - 1735689600000)/1000; $$;

GRANT EXECUTE ON FUNCTION public.int_id_from_millis TO PUBLIC;


CREATE OR REPLACE FUNCTION public.int_id_from_timestamp(ts timestamptz = now()) 
RETURNS integer
RETURNS NULL ON NULL INPUT
IMMUTABLE
SET search_path = ''
LANGUAGE SQL 
-- epoch is 2025-01-01 00:00:00 UTC
AS $$ SELECT public.int_id_from_millis((EXTRACT(EPOCH FROM ts)*1000)::bigint); $$;

GRANT EXECUTE ON FUNCTION public.int_id_from_timestamp TO PUBLIC;


CREATE OR REPLACE FUNCTION private.bytea_to_int8(ba BYTEA, start_pos INT, num_bytes INT)
RETURNS int8
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  result int8 := 0;
  msb_bit int;
BEGIN
  IF num_bytes < 1 OR num_bytes > 8 THEN RETURN NULL; END IF;

  -- Get the most significant bit of the first byte
  msb_bit := (get_byte(ba, start_pos) >> 7) & 1;

  -- If MSB is 1 and we're reading less than 8 bytes, start with all 1s in upper bits
  IF msb_bit = 1 AND num_bytes < 8 THEN
    result := -1 << (num_bytes * 8);
  END IF;

  FOR i IN 0..num_bytes-1 LOOP
    result := result | (get_byte(ba, start_pos + i)::int8 << (8 * (num_bytes - 1 - i)));
  END LOOP;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.uuid_to_millis(uuid1 uuid)
RETURNS bigint
RETURNS NULL ON NULL INPUT
IMMUTABLE
SET search_path = ''
LANGUAGE SQL
AS $$ SELECT private.bytea_to_int8(uuid_send(uuid1), 0, 6); $$;
-- AS $$ SELECT ('x' || translate(uuid1::text, '-', ''))::bit(46)::bigint; $$;
-- AS $$ SELECT ('x' || translate(uuid1::text, '-', ''))::bit(64)::bigint; $$;

GRANT EXECUTE ON FUNCTION public.uuid_to_millis TO PUBLIC;


-- Combine an existing uuid and given millis into a new uuid. The millis will define the time part of
-- the uuid. The random part inside the uuid will be combined using XOR. We also include the millis into
-- XOR to make sure that a uuid with a timestamp part equal to the given millis will not just return the given uuid.
CREATE OR REPLACE FUNCTION public.uuid_add_millis_and_id(uuid1 uuid, millis_since1970 bigint = NULL, uuid2 uuid = NULL) 
RETURNS uuid
IMMUTABLE
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  v_bytea1 bytea;
  v_bytea2 bytea;
  v_millis_shifted bigint;
  v_tmp int;
BEGIN
    -- swap in case only one is null
  IF uuid1 IS NULL THEN
    uuid1 := uuid2;
    uuid2 := NULL;
  END IF;
  -- v_bytea1 := decode(replace(uuid1::text, '-', ''), 'hex');
  -- v_bytea2 := decode(replace(uuid2::text, '-', ''), 'hex');
  v_bytea1 := uuid_send(uuid1);
  v_bytea2 := uuid_send(uuid2);

  -- RAISE NOTICE '%', octet_length(v_bytea1);
  IF millis_since1970 IS NOT NULL THEN
    v_millis_shifted := (millis_since1970) << 16;
    FOR i IN 0..5 LOOP
      -- Write milliseconds to first 6 bytes
      v_tmp := (v_millis_shifted >> ((7 - (i % 8)) * 8) & 255)::int;
      v_bytea1 := set_byte(v_bytea1, i, v_tmp);
    END LOOP;
  END IF;

  FOR i IN 6..15 LOOP
    v_tmp := get_byte(v_bytea1, i);
    -- Apply milliseconds XOR if provided
    IF millis_since1970 IS NOT NULL THEN
      v_tmp := v_tmp # (millis_since1970 >> ((7 - (i % 8)) * 8) & 255)::int;
    END IF;

    -- Apply milliseconds XOR if provided
    IF v_bytea2 IS NOT NULL THEN
      v_tmp := v_tmp # get_byte(v_bytea2, i);
    END IF;
    v_bytea1 := set_byte(v_bytea1, i, v_tmp);
  END LOOP;

  RETURN encode(v_bytea1, 'hex')::uuid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.uuid_add_millis_and_id TO PUBLIC;


CREATE OR REPLACE FUNCTION public.uuid_add_timestamp_and_id(uuid1 uuid, ts timestamptz = NULL, uuid2 uuid = NULL)
RETURNS uuid
IMMUTABLE
SET search_path = ''
LANGUAGE SQL
AS $$ SELECT public.uuid_add_millis_and_id(uuid1, (EXTRACT(EPOCH FROM ts)*1000)::bigint, uuid2); $$;

GRANT EXECUTE ON FUNCTION public.uuid_add_timestamp_and_id TO PUBLIC;


-- Convert UUID into url safe base64 ID
CREATE OR REPLACE FUNCTION public.uuid_to_base64(uuid1 uuid)
RETURNS text
IMMUTABLE
SET search_path = ''
LANGUAGE SQL
AS $$ SELECT substring(translate(encode(decode(replace(uuid1::text, '-', ''), 'hex'), 'base64'), '+/', '-_') for 22); $$;

GRANT EXECUTE ON FUNCTION public.uuid_to_base64 TO PUBLIC;

-- Convert url safe base64 ID into UUID
CREATE OR REPLACE FUNCTION public.uuid_from_base64(uuid_base64 text)
RETURNS uuid
IMMUTABLE
SET search_path = ''
LANGUAGE SQL 
-- add the trailing '==' characters to base64 string if missing
AS $$ SELECT encode(decode(translate(CASE WHEN right(uuid_base64, 2) != '==' THEN uuid_base64 || '==' ELSE uuid_base64 END, '-_', '+/'), 'base64'), 'hex')::UUID; $$;

GRANT EXECUTE ON FUNCTION public.uuid_from_base64 TO PUBLIC;

-- 0_lib/010_user/5_user-api-types.sql

CREATE TYPE public."UserV1" AS (
  id uuid_notnull,
  email public.email,
  "role" varchar(255),
  "emailConfirmedAt" timestamptz,
  "lastSignInAt" timestamptz,
  "createdAt" timestamptz,
  "updatedAt" timestamptz,
  phone text,
  "isSsoUser" bool_notnull,
  "deletedAt" timestamptz
);

-- 0_lib/010_user/7_user-api-funcs.sql

-- Method to be called by the client to delete user related data
CREATE OR REPLACE FUNCTION public."admin:user:deleteRelatedData"(
  "userId" UUID
)
RETURNS void
-- No SECURITY DEFINER, caller is admin
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete organization
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'private' 
      AND table_name = 'organization'
  ) THEN
    DELETE FROM private.organization
    WHERE owner_entity_id = "userId";

    DELETE FROM private.organization_membership
    WHERE entity_id = "userId";
  END IF;

  -- Delete entity
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'private'
      AND table_name = 'entity'
  ) THEN
    DELETE FROM private.entity
    WHERE user_id = "userId";
  END IF;

  -- Delete profile
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'private'
      AND table_name = 'profile'
  ) THEN
    DELETE FROM private.profile
    WHERE id = "userId";
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public."admin:user:deleteRelatedData" TO service_role;

-- 0_lib/020_entity/1_entity-types.sql

CREATE TYPE public.entity_type AS ENUM (
  'PERSON', -- A user or person not in the system. We can tell if a person is a "user" if the user_id in the entity table is not null. Other use-case specific roles should probably be expressed through additional tables 
  'SYSTEM', -- Any system generated content that doesn't represent a "Bot". For example status messages
  'BOT' -- Has a persona and possibly a name and the user engages with it
);

COMMENT ON TYPE public.entity_type IS '
description: Entities that are used throughout the system
values:
  PERSON: A user or person not in the system. We can tell if a person is a "user" if the user_id in the entity table is not null. Other use-case specific roles should probably be expressed through additional tables 
  SYSTEM: Any system generated content that doesn''t represent a "Bot". For example status messages
  BOT: Has a persona and possibly a name and the user engages with it
';

-- 0_lib/020_entity/3_entity-tables.sql

CREATE TABLE IF NOT EXISTS private.entity (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  entity_type public.entity_type NOT NULL,
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE, -- make this index unique so we prevent more than one entity per user
  name text, -- can be used to name the system or bots or persons not registered in the system

  -- whenever user_id is not null, the id and user id should be equal. This makes querying easier in some cases since we usually have the user id available
  CONSTRAINT id_matches_user_id CHECK (user_id IS NULL OR id = user_id)
);

-- make this index unique so we prevent more than one entity per user
--CREATE UNIQUE INDEX IF NOT EXISTS entity_idx_user_id ON private.entity(user_id) WHERE user_id IS NOT NULL;

-- Add fixed entities
INSERT INTO private.entity (id, entity_type, name)
VALUES ('00000000-0000-0000-0000-000000000000', 'SYSTEM', 'system');

-- 0_lib/020_entity/5_entity-api-types.sql

CREATE TYPE public."EntityV1" AS (
  id uuid_notnull,
  "createdAt" timestamptz_notnull,
  "updatedAt" timestamptz_notnull,
  "entityType" public.entity_type,
  "userId" uuid,
  name text
);

-- 0_lib/020_entity/7_entity-api-funcs.sql

-- Function to check if entity exists
CREATE OR REPLACE FUNCTION public."app:entity:exists"("entityId" uuid)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
SELECT EXISTS(
  SELECT 1 
  FROM private.entity e
  WHERE e.id = "entityId"
  -- any authenticated user can read entities
  AND auth.uid() IS NOT NULL
);
$$;

GRANT EXECUTE ON FUNCTION public."app:entity:exists" TO authenticated;

-- Function to create user entity
CREATE OR REPLACE FUNCTION public."app:entity:user:create"()
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
WITH inserted AS (
  INSERT INTO private.entity (id, entity_type, user_id)
  SELECT auth.uid(), 'PERSON', auth.uid()
  -- Only allow if user is authenticated and creating their own entity
  WHERE auth.uid() IS NOT NULL 
  ON CONFLICT (id) DO NOTHING
  RETURNING id
)
SELECT EXISTS(SELECT 1 FROM inserted) OR EXISTS(
  SELECT 1 FROM private.entity WHERE id = auth.uid()
);
$$;

GRANT EXECUTE ON FUNCTION public."app:entity:user:create" TO authenticated;

-- Function to update user entity
CREATE OR REPLACE FUNCTION public."app:entity:user:update"(
  "newEntityType" public.entity_type DEFAULT NULL,
  "newName" text DEFAULT NULL
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
WITH updated AS (
  UPDATE private.entity
  SET 
    entity_type = COALESCE("newEntityType", entity_type),
    name = COALESCE("newName", name),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = auth.uid()
    -- Only allow users to update their own entity
    AND user_id = auth.uid()
    AND auth.uid() IS NOT NULL
  RETURNING id
)
SELECT EXISTS(SELECT 1 FROM updated);
$$;

GRANT EXECUTE ON FUNCTION public."app:entity:user:update" TO authenticated;

-- Function to read user entity data
CREATE OR REPLACE FUNCTION public."app:entity:user:read"()
RETURNS public."EntityV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
SELECT ROW(
  e.id,
  e.created_at,
  e.updated_at,
  e.entity_type,
  e.user_id,
  e.name
)::public."EntityV1"
FROM private.entity e
WHERE e.id = auth.uid()
  AND e.user_id = auth.uid()
  AND auth.uid() IS NOT NULL
LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public."app:entity:user:read" TO authenticated;

-- Get entity by email (case-insensitive)
CREATE OR REPLACE FUNCTION public."admin:entity:getByEmail"("userEmail" TEXT)
RETURNS TABLE("entityId" UUID, email TEXT)
SECURITY DEFINER -- Added SECURITY DEFINER to access auth.users from admin function with service_role
SET search_path = ''
LANGUAGE sql
STABLE
AS $$
  SELECT e.id, u.email
  FROM private.entity e
  JOIN auth.users u ON u.id = e.user_id
  WHERE LOWER(u.email) = LOWER("userEmail")
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public."admin:entity:getByEmail" TO service_role;
-- 0_lib/030_asset/5_asset-api-types.sql

CREATE TYPE public."AssetV1" AS (
  id uuid_notnull,
  "bucketId" text,
  name text,
  "ownerId" text,
  "mimeType" text
);


-- 0_lib/030_asset/7_asset-api-funcs.sql


CREATE OR REPLACE FUNCTION public."app:assets:user:read"()
RETURNS SETOF public."AssetV1"
STABLE
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$    
SELECT 
  id,
  bucket_id,
  name,
  owner_id,
  metadata->>'mimetype'
FROM "storage".objects
-- Can only read your own
WHERE owner_id = auth.uid()::text;
$$;

GRANT EXECUTE ON FUNCTION public."app:assets:user:read" TO authenticated;

CREATE OR REPLACE FUNCTION public."admin:assets:user:read"("ownerId" uuid)
RETURNS SETOF public."AssetV1"
STABLE
-- No SECURITY DEFINER, caller is admin
SET search_path = ''
LANGUAGE sql
AS $$    
SELECT 
  id,
  bucket_id,
  name,
  owner_id,
  metadata->>'mimetype'
FROM "storage".objects
-- Admin can read all
WHERE owner_id = "ownerId"::text;
$$;

-- Restrict admin access to service role 
GRANT EXECUTE ON FUNCTION public."admin:assets:user:read" TO service_role;

-- 0_lib/040_profile/1_profile-types.sql


CREATE TYPE public.gender_type AS ENUM (
  'MALE',
  'FEMALE',
  'NON_BINARY'
);
COMMENT ON TYPE public.gender_type IS '
description: Available genders
values:
  MALE: Male gender
  FEMALE: Female gender
  NON_BINARY: Non-binary gender
';

-- 0_lib/040_profile/3_profile-tables.sql

-- Based on https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native
-- Create a table for user profiles
CREATE TABLE IF NOT EXISTS private.profile (
  id uuid NOT NULL primary key REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  username text unique,
  full_name text,
  avatar_url text,
  -- gender_type_id int2 REFERENCES private.gender_type(id),
  gender public.gender_type,
  given_name text, -- use also for "first_name"
  family_name text, -- use also for "last_name"
  birth_date date,

  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Add structured comment with metadata
COMMENT ON COLUMN private.profile.avatar_url IS '
description: URL to user''s profile picture
type: imageUrl
';


-- 0_lib/040_profile/4_profile-funcs.sql


-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
-- See https://supabase.com/docs/guides/auth/managing-user-data#using-triggers for more details.
CREATE OR REPLACE FUNCTION private.handle_new_user() RETURNS trigger
SECURITY DEFINER -- need security definer for RLS
SET "search_path" TO ''
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO private.profile (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');

  INSERT INTO private.entity (id, entity_type, user_id)
  VALUES (NEW.id, 'PERSON', NEW.id);
  RETURN NEW;
END;
$$;
CREATE OR REPLACE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION private.handle_new_user();

-- 0_lib/040_profile/5_profile-api-types.sql


CREATE TYPE public."ProfileV1" AS (
  id uuid_notnull,
  "createdAt" timestamptz_notnull,
  "updatedAt" timestamptz_notnull,
  username text,
  "fullName" text,
  "avatarUrl" text,
  gender public.gender_type,
  "givenName" text, -- use also for "firstName"
  "familyName" text, -- use also for "lastName"
  "birthDate" date
);

CREATE TYPE public."ProfileWithEmailV1" AS (
  profile public."ProfileV1",
  email public.email
);

CREATE TYPE public."ProfileUpdateV1" AS (
  "updatedAt" timestamptz,
  username text,
  "fullName" text,
  "avatarUrl" text,
  gender public.gender_type,
  "givenName" text,
  "familyName" text,
  "birthDate" date
);

-- 0_lib/040_profile/7_profile-api-funcs.sql



CREATE OR REPLACE FUNCTION public."app:profile:user:read"()
RETURNS public."ProfileV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
SELECT p.*
FROM private.profile p
-- Can only read your own
WHERE p.id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public."app:profile:user:read" TO authenticated;

CREATE OR REPLACE FUNCTION public."app:profile:user:readWithEmail"()
RETURNS public."ProfileWithEmailV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
SELECT ROW(
  ROW(p.*)::public."ProfileV1",
  u.email
)::public."ProfileWithEmailV1"
FROM private.profile p
INNER JOIN auth.users u ON u.id = p.id
-- Can only read your own
WHERE p.id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public."app:profile:user:readWithEmail" TO authenticated;


CREATE OR REPLACE FUNCTION public."app:profile:user:update"(
  "avatarUrl" text DEFAULT '___UNSET___',
  username TEXT DEFAULT '___UNSET___',
  "fullName" TEXT DEFAULT '___UNSET___',
  "givenName" TEXT DEFAULT '___UNSET___',
  "familyName" TEXT DEFAULT '___UNSET___',
  "birthDate" DATE DEFAULT '1900-01-01'::DATE,
  gender public.gender_type DEFAULT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT '1900-01-01 00:00:00+00'::TIMESTAMPTZ
)
RETURNS public."ProfileV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
UPDATE private.profile p SET
  updated_at = CASE WHEN "updatedAt" != '1900-01-01 00:00:00+00'::TIMESTAMPTZ THEN "updatedAt" ELSE CURRENT_TIMESTAMP END,
  username = CASE WHEN username IS DISTINCT FROM '___UNSET___' THEN username ELSE p.username END,
  full_name = CASE WHEN "fullName" IS DISTINCT FROM '___UNSET___' THEN "fullName" ELSE p.full_name END,
  avatar_url = CASE WHEN "avatarUrl" IS DISTINCT FROM '___UNSET___' THEN "avatarUrl" ELSE p.avatar_url END,
  gender = CASE WHEN gender IS NOT NULL THEN gender ELSE p.gender END,
  given_name = CASE WHEN "givenName" IS DISTINCT FROM '___UNSET___' THEN "givenName" ELSE p.given_name END,
  family_name = CASE WHEN "familyName" IS DISTINCT FROM '___UNSET___' THEN "familyName" ELSE p.family_name END,
  birth_date = CASE WHEN "birthDate" != '1900-01-01'::DATE THEN "birthDate" ELSE p.birth_date END
-- Can only update your own
WHERE p.id = auth.uid()
RETURNING *;
$$;

GRANT EXECUTE ON FUNCTION public."app:profile:user:update" TO authenticated;

-- 0_lib/040_profile/8_profile-buckets.sql

INSERT INTO storage.buckets (id, name)
  VALUES ('avatars', 'avatars')
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name)
  VALUES ('app-assets', 'app-assets')
  ON CONFLICT (id) DO NOTHING;


-- Set up access controls for storage.
-- See https://supabase.com/docs/guides/storage/security/access-control#policy-examples for more details.
-- https://www.postgresql.org/docs/current/sql-createpolicy.html
-- Note: these policies don't restrict to specific roles such as 
-- https://supabase.com/docs/guides/database/postgres/roles#supabase-roles
-- TODO: restrict these more to logged-in users by using `TO authenticated`? 
-- https://supabase.com/docs/guides/storage/security/access-control#policy-examples
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload an avatar." ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

-- The USING expression determines which records the UPDATE command will see to operate against, 
-- while the WITH CHECK expression defines which modified rows are allowed to be stored back into the relation.
CREATE POLICY "Anyone can update their own avatar." ON storage.objects
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = owner_id::uuid) WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "service role has full access to app-assets bucket" ON storage.objects
FOR ALL 
TO service_role
USING (bucket_id = 'app-assets')
WITH CHECK (bucket_id = 'app-assets');

-- 0_lib/050_organization/1_org-types.sql

CREATE TYPE public.organization_role AS ENUM ('OWNER', 'ADMIN', 'MEMBER');
COMMENT ON TYPE public.organization_role IS '
description: Roles and access permissions associated with an organization.
values:
  OWNER: The entity that created the organization. Has most permissions
  ADMIN: An administrator with extended levels of access permissions
  MEMBER: A regular member of an organization with restricted access
';

-- 0_lib/050_organization/3_org-tables.sql

CREATE TABLE private.organization (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT,
  logo_url TEXT,
  owner_entity_id UUID REFERENCES private.entity(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS organization_idx_owner_entity_id ON private.organization(owner_entity_id);

CREATE TABLE private.organization_membership (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  organization_id UUID NOT NULL REFERENCES private.organization(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES private.entity(id) ON DELETE CASCADE,
  role public.organization_role NOT NULL DEFAULT 'MEMBER',

  UNIQUE (organization_id, entity_id) -- Only one role per organization
);

CREATE INDEX IF NOT EXISTS organization_membership_idx_organization_id ON private.organization_membership(organization_id);
CREATE INDEX IF NOT EXISTS organization_membership_idx_entity_id ON private.organization_membership(entity_id);
CREATE INDEX IF NOT EXISTS organization_membership_idx_role ON private.organization_membership(role);

-- 0_lib/050_organization/5_org-api-types.sql

CREATE TYPE public."OrganizationV1" AS (
  id uuid_notnull,
  "createdAt" timestamptz_notnull,
  "updatedAt" timestamptz_notnull,
  name text,
  "logoUrl" text,
  "ownerEntityId" uuid
);

CREATE TYPE public."OrganizationMembershipV1" AS (
  id uuid_notnull,
  "createdAt" timestamptz_notnull,
  "updatedAt" timestamptz_notnull,
  "organizationId" uuid_notnull,
  "entityId" uuid_notnull,
  role public.organization_role
);

-- 0_lib/050_organization/7_org-api-funcs.sql

CREATE OR REPLACE FUNCTION public."app:organization:membership:user:readAll"()
RETURNS SETOF public."OrganizationMembershipV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
SELECT 
  om.id,
  om.created_at,
  om.updated_at,
  om.organization_id,
  om.entity_id,
  om.role
FROM private.organization_membership om
WHERE 
  -- Owners and admins can see all memberships of their org
  (
    EXISTS (
      SELECT 1 
      FROM private.organization_membership owner_admin_check
      WHERE owner_admin_check.organization_id = om.organization_id
        AND owner_admin_check.entity_id = auth.uid()
        AND owner_admin_check.role IN ('OWNER', 'ADMIN')
    )
  )
  OR
  -- Members can see their own memberships only
  (
    om.entity_id = auth.uid()
    AND
    EXISTS (
      SELECT 1 
      FROM private.organization_membership member_check
      WHERE member_check.organization_id = om.organization_id
        AND member_check.entity_id = auth.uid()
        AND member_check.role = 'MEMBER'
    )
  );
$$;

GRANT EXECUTE ON FUNCTION public."app:organization:membership:user:readAll" TO authenticated;

-- Organization Membership :: Helper Functions
CREATE OR REPLACE FUNCTION private.check_user_has_organization_role(
  "orgId" UUID,
  "roles" public.organization_role[]
)
RETURNS BOOLEAN
SECURITY DEFINER -- Need to bypass RLS to prevent infinite loop when checking roles
SET search_path = ''
STABLE
LANGUAGE SQL
AS $$
  /*
    Checks whether the current user (auth.uid()) has exactly `_role`
    in the organization `_orgId`.
  */
  SELECT EXISTS (
    SELECT 1
    FROM private.organization_membership om
    WHERE om.organization_id = "orgId"
      AND om.entity_id = (SELECT auth.uid())
      AND om.role = ANY("roles")
  );
$$;

-- Organization :: Helper Functions
-- Creates a new organization with the given name
CREATE OR REPLACE FUNCTION private.create_new_organization(
  "ownerEntityId" UUID,
  "name" TEXT
)
RETURNS UUID -- Returns the conversation id
SET search_path = ''
LANGUAGE SQL
AS $$
  WITH inserted_organization AS (
    INSERT INTO private.organization (owner_entity_id, name)
    VALUES ("ownerEntityId", "name")
    RETURNING id, owner_entity_id
  ),
  inserted_organization_membership AS (
    INSERT INTO private.organization_membership (organization_id, entity_id, role)
    SELECT id, "ownerEntityId", 'OWNER'
    FROM inserted_organization
  )
  SELECT id FROM inserted_organization;
$$;

-- Method to be called by the client to create a new organization, current user will be the owner
CREATE OR REPLACE FUNCTION public."app:organization:user:create"(
  "name" TEXT
)
RETURNS UUID
SECURITY DEFINER
SET search_path = ''
LANGUAGE SQL
AS $$
  SELECT private.create_new_organization((SELECT auth.uid()), "name");
$$;

GRANT EXECUTE ON FUNCTION public."app:organization:user:create" TO authenticated;


-- Checks if a user is part of an organization at any capacity
CREATE OR REPLACE FUNCTION private.check_entity_is_in_organization(
  "orgId" UUID,
  "entityId" UUID
)
RETURNS BOOLEAN
SECURITY DEFINER -- Need to bypass RLS to prevent infinite loop when checking roles
SET search_path = ''
STABLE
LANGUAGE SQL
AS $$
  /*
    Checks whether the current user (auth.uid()) has exactly `_role`
    in the organization `_orgId`.
  */
  SELECT EXISTS (
    SELECT 1
    FROM private.organization_membership om
    WHERE om.organization_id = "orgId"
      AND om.entity_id = "entityId"
  );
$$;

-- 0_lib/060_conversation/3_conv-tables.sql

-- Conversation

CREATE TABLE IF NOT EXISTS private.conversation (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  owner_entity_id UUID NOT NULL REFERENCES private.entity(id) ON DELETE CASCADE,
  subject TEXT
);

-- Conversation Participant

CREATE TABLE IF NOT EXISTS private.conversation_participant (
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  conversation_id uuid NOT NULL REFERENCES private.conversation(id) ON DELETE CASCADE,
  entity_id uuid NOT NULL REFERENCES private.entity(id) ON DELETE CASCADE,
  deactivated_at TIMESTAMPTZ DEFAULT NULL, -- Useful for soft-deleting participants/leaving the conversation, if set to null, user is active

  PRIMARY KEY(conversation_id, entity_id)
);

-- only create index for the entity since we already have one for conversation,entity due to the primary key
CREATE INDEX IF NOT EXISTS conversation_participant_idx_entity_id ON private.conversation_participant(entity_id);

-- Conversation Message

CREATE TABLE IF NOT EXISTS private.conversation_message (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  conversation_id UUID NOT NULL REFERENCES private.conversation(id) ON DELETE CASCADE,
  prev_message_id UUID REFERENCES private.conversation_message(id) ON DELETE CASCADE,
  author_entity_id UUID NOT NULL REFERENCES private.entity(id) ON DELETE CASCADE,
  content_text TEXT,
  context JSONB
);

CREATE INDEX IF NOT EXISTS conversation_message_idx_conversation_id ON private.conversation_message(conversation_id);
CREATE INDEX IF NOT EXISTS conversation_message_idx_prev_message_id ON private.conversation_message(prev_message_id) WHERE prev_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS conversation_message_idx_author_entity_id ON private.conversation_message(author_entity_id);


-- Conversation Message Asset

CREATE TABLE IF NOT EXISTS private.conversation_message_asset (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  conversation_message_id UUID NOT NULL REFERENCES private.conversation_message(id) ON DELETE CASCADE,
  object_id UUID NOT NULL REFERENCES storage.objects(id) ON DELETE CASCADE,
  order_index SMALLINT NOT NULL,

  UNIQUE(conversation_message_id, object_id) -- Ensure only one message per object
);

CREATE INDEX IF NOT EXISTS conversation_message_asset_idx_conversation_message_id ON private.conversation_message_asset(conversation_message_id);
CREATE INDEX IF NOT EXISTS conversation_message_asset_idx_object_id ON private.conversation_message_asset(object_id);

-- 0_lib/060_conversation/5_conv-api-types.sql

CREATE TYPE public."ConversationV1" AS (
  id uuid_notnull,
  "createdAt" timestamptz_notnull,
  "updatedAt" timestamptz_notnull,
  "ownerEntityId" uuid_notnull,
  subject TEXT
);

CREATE TYPE public."ConversationParticipantV1" AS (
  "createdAt" timestamptz_notnull,
  "updatedAt" timestamptz_notnull,
  "conversationId" uuid_notnull,
  "entityId" uuid_notnull,
  "deactivatedAt" TIMESTAMPTZ
);

CREATE TYPE public."ConversationMessageV1" AS (
  id uuid_notnull,
  "createdAt" timestamptz_notnull,
  "updatedAt" timestamptz_notnull,
  "conversationId" uuid_notnull,
  "prevMessageId" uuid,
  "authorEntityId" uuid_notnull,
  "contentText" text,
  context JSONB
);

CREATE TYPE public."ConversationMessageAssetV1" AS (
  id uuid_notnull,
  "createdAt" timestamptz_notnull,
  "updatedAt" timestamptz_notnull,
  "conversationMessageId" uuid_notnull,
  "objectId" uuid_notnull,
  "orderIndex" smallint_notnull
);

CREATE TYPE public."ConversationMessageWithEntityTypeV1" AS (
  message public."ConversationMessageV1",
  "entityType" public.entity_type
);

CREATE TYPE public."ConversationWithMessagesAndEntityTypeV1" AS (
  conversation public."ConversationV1",
  messages public."ConversationMessageWithEntityTypeV1"[]
);

CREATE TYPE public."ConversationMessageAssetWithDetailsV1" AS (
  "objectId" uuid_notnull,
  "orderIndex" smallint_notnull,
  "bucketId" text,
  name text,
  "mimeType" text
);

CREATE TYPE public."ConversationMessageWithDetailsV1" AS (
  message public."ConversationMessageV1",
  "entityType" public.entity_type,
  assets public."ConversationMessageAssetWithDetailsV1"[]
);

CREATE TYPE public."ConversationParticipantWithDetailsV1" AS (
  participant public."ConversationParticipantV1",
  "entityType" public.entity_type,
  profile public."ProfileV1"
);

CREATE TYPE public."ConversationWithContentV1" AS (
  conversation public."ConversationV1",
  messages public."ConversationMessageWithDetailsV1"[],
  participants public."ConversationParticipantWithDetailsV1"[]
);

CREATE TYPE public."ConversationMessageAssetWithObjectV1" AS (
  "objectId" uuid_notnull,
  "orderIndex" smallint_notnull,
  "bucketId" text,
  name text,
  "mimeType" text
);

-- 0_lib/060_conversation/7_conv-api-funcs.sql


-- This function creates a conversation and a list of conversation participants provided.
CREATE OR REPLACE FUNCTION public."admin:conversation:user:create"(
  "authorEntityId" UUID,
  "otherEntityIds" uuid[]
)
RETURNS UUID -- Returns the conversation id
-- No SECURITY DEFINER, admin uses service_role
SET search_path = ''
LANGUAGE plpgsql
AS $$
  DECLARE
    _conversation_id UUID;
  BEGIN

    -- Ensure authorEntityId is provided
    IF "authorEntityId" IS NULL THEN
      RAISE EXCEPTION 'authorEntityId cannot be null';
    END IF;

    -- Ensure authorEntityId exists
    IF NOT EXISTS (
      SELECT 1
      FROM private.entity e
      WHERE e.id = "authorEntityId"
    ) THEN
      RAISE EXCEPTION 'authorEntityId does not exist';
    END IF;

    -- Ensure authorEntityId is not in otherEntityIds
    IF "otherEntityIds" IS NOT NULL AND "otherEntityIds" @> ARRAY["authorEntityId"] THEN
      RAISE EXCEPTION 'authorEntityId cannot be in otherEntityIds';
    END IF;

    -- Ensure otherEntityIds are unique
    IF "otherEntityIds" IS NOT NULL AND array_length("otherEntityIds", 1) <> array_length(ARRAY(SELECT DISTINCT unnest("otherEntityIds")), 1) THEN
      RAISE EXCEPTION 'otherEntityIds must be unique';
    END IF;

    -- Ensure all other entity IDs exist if provided
    -- Ensure all entity IDs exist
    IF "otherEntityIds" IS NOT NULL
       AND array_length("otherEntityIds", 1) > 0
       AND EXISTS (
      SELECT 1
      FROM unnest("otherEntityIds") AS _entity_id
      LEFT JOIN private.entity e ON e.id = _entity_id
      WHERE e.id IS NULL
    ) THEN
      RAISE EXCEPTION 'One or more entity IDs in otherEntityIds do not exist';
    END IF;

    -- Create the conversation (user will be the owner)
    INSERT INTO private.conversation (owner_entity_id)
    VALUES ("authorEntityId")
    RETURNING id INTO _conversation_id;

    -- Add the owner as the first participant (only owner can insert participants)
    INSERT INTO private.conversation_participant (conversation_id, entity_id)
    SELECT _conversation_id, "authorEntityId"
    WHERE EXISTS (
      SELECT 1
      FROM private.conversation c
      WHERE c.id = _conversation_id
        AND c.owner_entity_id = "authorEntityId"
    );

    -- Add the other participants (only owner can insert participants)
    INSERT INTO private.conversation_participant (conversation_id, entity_id)
    SELECT _conversation_id, _other_entity_id
    FROM unnest("otherEntityIds") AS _other_entity_id
    WHERE EXISTS (
      SELECT 1
      FROM private.conversation c
      WHERE c.id = _conversation_id
        AND c.owner_entity_id = "authorEntityId"
    );

    -- Return conversationId
    RETURN _conversation_id;
  END;
$$;

GRANT EXECUTE ON FUNCTION public."admin:conversation:user:create" TO service_role;

-- This function creates a conversation and a list of conversation participants provided.
CREATE OR REPLACE FUNCTION public."app:conversation:user:create"(
  "otherEntityIds" uuid[]
)
RETURNS UUID -- Returns the conversation id
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
  SELECT public."admin:conversation:user:create"(auth.uid(), "otherEntityIds")::UUID;
$$;

GRANT EXECUTE ON FUNCTION public."app:conversation:user:create" TO authenticated;



CREATE OR REPLACE FUNCTION public."app:conversation:message:upsertAllWithAssets"(
  messages public."ConversationMessageV1"[],
  assets public."ConversationMessageAssetV1"[]
)
RETURNS TABLE("messageCount" int, "assetCount" int) ROWS 1
SECURITY DEFINER
SET search_path = ''
LANGUAGE SQL
BEGIN ATOMIC
  INSERT INTO private.conversation_message(
    id,
    created_at,
    updated_at,
    conversation_id,
    prev_message_id,
    author_entity_id,
    content_text,
    context)
  SELECT
    s.id, 
    s."createdAt",
    s."updatedAt",
    s."conversationId",
    s."prevMessageId",
    s."authorEntityId",
    s."contentText",
    s."context"
  FROM unnest(messages) s
  -- Only insert messages where user is an active participant
  WHERE EXISTS (
    SELECT 1
    FROM private.conversation_participant cp
    WHERE cp.conversation_id = s."conversationId"
      AND cp.entity_id = auth.uid()
      AND cp.deactivated_at IS NULL
  )
  ON CONFLICT (id) DO UPDATE SET
    created_at = EXCLUDED.created_at,
    updated_at = EXCLUDED.updated_at,
    conversation_id = EXCLUDED.conversation_id,
    prev_message_id = EXCLUDED.prev_message_id,
    author_entity_id = EXCLUDED.author_entity_id,
    content_text = EXCLUDED.content_text,
    context = EXCLUDED.context
  -- Only update if user is the original author
  WHERE private.conversation_message.author_entity_id = auth.uid();

  INSERT INTO private.conversation_message_asset(
    id,
    created_at,
    updated_at,
    conversation_message_id,
    object_id,
    order_index)
  SELECT 
    s.id, s."createdAt", s."updatedAt", s."conversationMessageId", s."objectId", s."orderIndex"
  FROM unnest(assets) s
  -- Only insert assets where user is the message author and active participant
  WHERE EXISTS (
    SELECT 1
    FROM private.conversation_message cm
    JOIN private.conversation_participant cp 
      ON cp.conversation_id = cm.conversation_id
    WHERE cm.id = s."conversationMessageId"
      AND cm.author_entity_id = auth.uid()
      AND cp.entity_id = auth.uid()
      AND cp.deactivated_at IS NULL
  )
  ON CONFLICT (id) DO UPDATE SET
    created_at = EXCLUDED.created_at,
    updated_at = EXCLUDED.updated_at,
    conversation_message_id = EXCLUDED.conversation_message_id,
    object_id = EXCLUDED.object_id,
    order_index = EXCLUDED.order_index
  -- Only update if user is the author of the message
  WHERE EXISTS (
    SELECT 1
    FROM private.conversation_message cm
    WHERE cm.id = private.conversation_message_asset.conversation_message_id
      AND cm.author_entity_id = auth.uid()
  );

  RETURN (array_length(messages, 1), array_length(assets, 1));
END;

GRANT EXECUTE ON FUNCTION public."app:conversation:message:upsertAllWithAssets" TO authenticated;

-- Returns true if the given user is the owner of a given conversation
CREATE OR REPLACE FUNCTION private.check_user_is_conversation_owner(
  "conversationId" uuid, -- The conversation to check
  "userId" uuid          -- The user to check for ownership
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE SQL
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM private.conversation c
    WHERE c.id = "conversationId"
      AND c.owner_entity_id = "userId"
  );
$$;

-- Is called by auth user when checking bucket storage RLS 
GRANT EXECUTE ON FUNCTION private.check_user_is_conversation_owner TO authenticated;


-- Returns true if the given user is part of the conversation
CREATE OR REPLACE FUNCTION private.check_user_is_active_conversation_participant(
  "conversationId" uuid, -- The conversation to check
  "userId" uuid          -- The user to check for participation
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
LANGUAGE SQL
AS $$
SELECT EXISTS (
  SELECT 1
  FROM private.conversation_participant cp
  WHERE cp.conversation_id = "conversationId"
    AND cp.entity_id = "userId"
    AND cp.deactivated_at IS NULL -- Only active participants
);
$$;

-- Is called by auth user when checking bucket storage RLS 
GRANT EXECUTE ON FUNCTION private.check_user_is_active_conversation_participant TO authenticated;


-- Returns true if the given user is the author of a given message.
CREATE OR REPLACE FUNCTION private.check_is_active_message_author(
  "messageId" uuid,
  "userId" uuid
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE SQL
AS $$
SELECT EXISTS (
  SELECT 1
  FROM private.conversation_message cm
  JOIN private.conversation_participant cp ON cm.conversation_id = cp.conversation_id
  WHERE cm.id = "messageId"
    AND cm.author_entity_id = "userId"
    AND cp.entity_id = "userId"
    AND cp.deactivated_at IS NULL -- Only active participants
)
$$;

-- Is called by auth user when checking bucket storage RLS 
GRANT EXECUTE ON FUNCTION private.check_is_active_message_author TO authenticated;


-- we need this function with security definer for the bucket RLS rules - a regular user has no access to private tables
CREATE OR REPLACE FUNCTION private.check_message_not_exists(
  "messageId" uuid
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE SQL
AS $$
SELECT NOT EXISTS (
  SELECT 1
  FROM private.conversation_message
  WHERE id = "messageId"
)
$$;

-- Is called by auth user when checking bucket storage RLS 
GRANT EXECUTE ON FUNCTION private.check_message_not_exists TO authenticated;


CREATE OR REPLACE FUNCTION public."app:conversation:message:create"(
  "conversationId" uuid,
  "contentText" text,
  "botEntityId" uuid,
  "prevMessageId" uuid DEFAULT NULL
)
RETURNS public."ConversationMessageV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
WITH message_insert AS (
  INSERT INTO private.conversation_message (
    conversation_id,
    author_entity_id,
    content_text,
    prev_message_id,
    created_at,
    updated_at
  )
  SELECT 
    "conversationId",
    "botEntityId",
    "contentText",
    "prevMessageId",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  WHERE EXISTS (
    -- User is the conversation owner
    SELECT 1 
    FROM private.conversation c
    WHERE c.id = "conversationId"
    AND c.owner_entity_id = auth.uid()
  )
  OR EXISTS (
    -- User is an active participant
    SELECT 1
    FROM private.conversation_participant cp
    WHERE cp.conversation_id = "conversationId"
    AND cp.entity_id = auth.uid()
    AND cp.deactivated_at IS NULL
  )
  RETURNING *
)
SELECT ROW(mi.*)::public."ConversationMessageV1"
FROM message_insert mi;
$$;

GRANT EXECUTE ON FUNCTION public."app:conversation:message:create" TO authenticated;


CREATE OR REPLACE FUNCTION public."app:conversation:user:readAll"()
RETURNS SETOF public."ConversationV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
SELECT
  c.id,
  c.created_at,
  c.updated_at, 
  c.owner_entity_id,
  c.subject
FROM private.conversation c
WHERE
  -- User owns the conversation
  c.owner_entity_id = auth.uid()
  OR
  -- User is an active participant
  EXISTS (
    SELECT 1 
    FROM private.conversation_participant cp
    WHERE 
      cp.conversation_id = c.id 
      AND cp.entity_id = auth.uid()
      AND cp.deactivated_at IS NULL -- Only active participants
  );
$$;

GRANT EXECUTE ON FUNCTION public."app:conversation:user:readAll" TO authenticated;


-- Exact match: participants must be EXACTLY (auth user + otherEntityIds)
CREATE OR REPLACE FUNCTION public."app:conversation:user:readWithOtherParticipantsExact"(
"otherParticipantEntityIds" uuid[]
)
RETURNS SETOF public."ConversationV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
WITH active_participants AS (
  SELECT 
    cp.conversation_id,
    ARRAY_AGG(DISTINCT cp.entity_id ORDER BY cp.entity_id) AS participant_ids
  FROM private.conversation_participant cp
  WHERE cp.deactivated_at IS NULL
  GROUP BY cp.conversation_id
)
SELECT c.*
FROM private.conversation c
JOIN active_participants ap
  ON ap.conversation_id = c.id
  AND ap.participant_ids = ARRAY(
    SELECT DISTINCT x 
    FROM unnest(ARRAY_APPEND(COALESCE("otherParticipantEntityIds", '{}'::uuid[]), auth.uid())) AS t(x) 
    ORDER BY x
  )
WHERE auth.uid() = ANY(ap.participant_ids);
$$;

GRANT EXECUTE ON FUNCTION public."app:conversation:user:readWithOtherParticipantsExact" TO authenticated;


-- Admin function to read conversation with messages and entity types
CREATE OR REPLACE FUNCTION public."admin:conversation:readWithMessagesAndEntityTypes"("conversationId" uuid)
RETURNS public."ConversationWithMessagesAndEntityTypeV1"
-- No SECURITY DEFINER, caller is admin
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
SELECT ROW(
  -- conversation field (wrap existing conversation in composite type)
  ROW(c.*)::public."ConversationV1",
  COALESCE(
    ARRAY(
      SELECT ROW(
        ROW(cm.*)::public."ConversationMessageV1",
        e.entity_type
      )::public."ConversationMessageWithEntityTypeV1"
      FROM private.conversation_message cm
      JOIN private.entity e ON e.id = cm.author_entity_id
      WHERE cm.conversation_id = c.id
      ORDER BY cm.created_at ASC
    ),
    '{}'::public."ConversationMessageWithEntityTypeV1"[]
  )
)::public."ConversationWithMessagesAndEntityTypeV1"
FROM private.conversation c
WHERE c.id = "conversationId"
$$;

GRANT EXECUTE ON FUNCTION public."admin:conversation:readWithMessagesAndEntityTypes" TO service_role;

-- Function to read conversation with messages and entity types
CREATE OR REPLACE FUNCTION public."app:conversation:user:readWithMessagesAndEntityTypes"("conversationId" uuid)
RETURNS public."ConversationWithMessagesAndEntityTypeV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM private.conversation c
      WHERE c.id = "conversationId"
      AND (
        -- User owns the conversation
        c.owner_entity_id = auth.uid()
        OR
        -- User is an active participant
        EXISTS (
          SELECT 1 
          FROM private.conversation_participant cp
          WHERE 
            cp.conversation_id = c.id 
            AND cp.entity_id = auth.uid()
            AND cp.deactivated_at IS NULL -- Only active participants
        )
      )
    ) THEN public."admin:conversation:readWithMessagesAndEntityTypes"("conversationId")
    ELSE NULL
  END;
$$;

GRANT EXECUTE ON FUNCTION public."app:conversation:user:readWithMessagesAndEntityTypes" TO authenticated;


CREATE OR REPLACE FUNCTION public."app:conversation:user:readWithContent"("conversationId" uuid)
RETURNS public."ConversationWithContentV1"
STABLE
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$ 
SELECT ROW(
  -- conversation field (wrap existing conversation in composite type)
  ROW(c.*)::public."ConversationV1",
  -- messages array
  COALESCE(
    ARRAY(
      SELECT ROW(
        ROW(cm.*)::public."ConversationMessageV1",
        e.entity_type,
        COALESCE(
          ARRAY(
            SELECT ROW(
              cma.object_id,
              cma.order_index, 
              a.bucket_id,
              a.name,
              a.metadata->>'mimetype'
            )::public."ConversationMessageAssetWithDetailsV1"
            FROM private.conversation_message_asset cma
            JOIN "storage".objects a ON cma.object_id = a.id
            WHERE cma.conversation_message_id = cm.id
            ORDER BY cma.order_index ASC
          ),
          '{}'::public."ConversationMessageAssetWithDetailsV1"[]
        )
      )::public."ConversationMessageWithDetailsV1"
      FROM private.conversation_message cm
      JOIN private.entity e ON cm.author_entity_id = e.id
      WHERE cm.conversation_id = c.id
      ORDER BY cm.created_at ASC
    ),
    '{}'::public."ConversationMessageWithDetailsV1"[]
  ),
  -- participants array
  COALESCE(
    ARRAY(
      SELECT ROW(
        ROW(cp.*)::public."ConversationParticipantV1",
        e.entity_type,
        CASE WHEN p.id IS NOT NULL THEN ROW(p.*)::public."ProfileV1" ELSE NULL END
      )::public."ConversationParticipantWithDetailsV1"
      FROM private.conversation_participant cp
      JOIN private.entity e ON cp.entity_id = e.id
      LEFT JOIN auth.users u ON e.user_id = u.id
      LEFT JOIN private.profile p ON u.id = p.id
      WHERE cp.conversation_id = c.id
    ),
    '{}'::public."ConversationParticipantWithDetailsV1"[]
  )
)::public."ConversationWithContentV1"
FROM private.conversation c
WHERE c.id = "conversationId"
-- Only return conversation if user is owner or active participant
AND (
  -- User owns the conversation
  c.owner_entity_id = auth.uid()
  OR
  -- User is an active participant
  EXISTS (
    SELECT 1 
    FROM private.conversation_participant cp
    WHERE 
      cp.conversation_id = c.id 
      AND cp.entity_id = auth.uid()
      AND cp.deactivated_at IS NULL -- Only active participants
  )
);
$$;

GRANT EXECUTE ON FUNCTION public."app:conversation:user:readWithContent" TO authenticated;

CREATE OR REPLACE FUNCTION public."app:conversation:message:asset:user:readAllWithObject"("conversationMessageId" uuid)
RETURNS SETOF public."ConversationMessageAssetWithObjectV1" 
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
SELECT
  cma.object_id,
  cma.order_index,
  a.bucket_id,
  a.name,
  a.metadata->>'mimetype'
FROM private.conversation_message_asset cma
JOIN storage.objects a ON cma.object_id = a.id
JOIN private.conversation_message cm ON cm.id = cma.conversation_message_id
JOIN private.conversation c ON c.id = cm.conversation_id
WHERE cma.conversation_message_id = "conversationMessageId"
-- Only return assets if user is active participant in the conversation
AND (
  -- User owns the conversation
  c.owner_entity_id = auth.uid()
  OR
  -- User is an active participant
  EXISTS (
    SELECT 1 
    FROM private.conversation_participant cp
    WHERE 
      cp.conversation_id = cm.conversation_id 
      AND cp.entity_id = auth.uid()
      AND cp.deactivated_at IS NULL -- Only active participants
  )
)
ORDER BY cma.order_index ASC;
$$;

GRANT EXECUTE ON FUNCTION public."app:conversation:message:asset:user:readAllWithObject" TO authenticated;

-- 0_lib/060_conversation/8_conv-buckets.sql


-- Create objects bucket for conversation assets
INSERT INTO storage.buckets (id, name)
VALUES ('conversations', 'conversations')
ON CONFLICT (id) DO NOTHING;

-- Storage Access Control Policies (RLS)

-- Only participants can read the conversation message assets
CREATE POLICY "Active Participants can READ all conversation message assets"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'conversations'
    AND
    private.check_user_is_active_conversation_participant(
      ((storage.foldername(name))[1])::uuid, -- conversation id
      (SELECT auth.uid())
    )
  );

-- Only active participants can INSERT assets to non-existing messages they will create the message-id for in the client.
CREATE POLICY "Active Participants can INSERT assets to non-existing messages that they will create soon"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'conversations'
    AND
    -- Make sure the author is still active in the conversation
    private.check_user_is_active_conversation_participant(
      ((storage.foldername(name))[1])::uuid, -- conversation id
      (SELECT auth.uid())
    )
    AND
    (
      -- Make sure the message-id generated by the client does not exist yet
      private.check_message_not_exists(((storage.foldername(name))[2])::uuid)
      OR
      -- Or, if the message-id exists, make sure user is message author and still active
      private.check_is_active_message_author(
        ((storage.foldername(name))[2])::uuid, -- client generated message id
        (SELECT auth.uid())
      )
    )
  );

-- Only message authors can UPDATE the conversation message assets
CREATE POLICY "Active Message Authors can UPDATE assets (not their ownership)"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'conversations'
    AND
    private.check_is_active_message_author(
      ((storage.foldername(name))[2])::uuid, -- message id
      (SELECT auth.uid())
    )
  )
  -- Make sure the author can't change ownership of the asset
  WITH CHECK (
    bucket_id = 'conversations'
    AND
    private.check_is_active_message_author(
      ((storage.foldername(name))[2])::uuid, -- message id
      (SELECT auth.uid())
    )
  );

-- Only active message authors can DELETE the conversation message assets
CREATE POLICY "Active Message authors can DELETE their assets"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'conversations'
    AND
    private.check_is_active_message_author(
      ((storage.foldername(name))[2])::uuid, -- message id
      (SELECT auth.uid())
    )
  );

-- Conversation owners can delete all conversation message assets
CREATE POLICY "Conversation Owners can DELETE all conversation message assets"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'conversations'
    AND
    private.check_user_is_conversation_owner(
      ((storage.foldername(name))[1])::uuid, -- conversation id
      (SELECT auth.uid())
    )
  );

-- 0_lib/080_social_feed/8_feed-buckets.sql

INSERT INTO storage.buckets (id, name)
  VALUES ('social-feed', 'social-feed')
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Social Feed Images are publicly accessible" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'social-feed');

CREATE POLICY "Anyone can upload a photo to the social feed bucket" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'social-feed');

-- The USING expression determines which records the UPDATE command will see to operate against, 
-- while the WITH CHECK expression defines which modified rows are allowed to be stored back into the relation.
CREATE POLICY "Anyone can update their own images in the social feed" ON storage.objects
  FOR UPDATE 
  TO authenticated
  USING ((SELECT auth.uid()) = owner_id::uuid)
  WITH CHECK (bucket_id = 'social-feed');

-- 1_app/100_planet_user/1_planet_user-types.sql

CREATE TYPE public.verification_status AS ENUM (
  'NOT_STARTED',
  'PENDING',
  'VERIFIED',
  'FAILED'
);

COMMENT ON TYPE public.verification_status IS '
description: Status of user identity verification
values:
  NOT_STARTED: User has not begun verification
  PENDING: Verification documents submitted and under review
  VERIFIED: User identity verified
  FAILED: Verification failed
';

-- 1_app/100_planet_user/3_planet_user-tables.sql

-- Extension table for app-specific user profile data.
-- References auth.users via FK; does NOT modify the library profile table.
CREATE TABLE IF NOT EXISTS private.user_app_profile (
  user_id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_verified boolean NOT NULL DEFAULT false,
  verification_status public.verification_status NOT NULL DEFAULT 'NOT_STARTED',
  is_onboarded boolean NOT NULL DEFAULT false,
  is_business_owner boolean NOT NULL DEFAULT false,
  location_latitude double precision,
  location_longitude double precision,
  phone_number text,

  CONSTRAINT location_latitude_range CHECK (location_latitude IS NULL OR (location_latitude >= -90 AND location_latitude <= 90)),
  CONSTRAINT location_longitude_range CHECK (location_longitude IS NULL OR (location_longitude >= -180 AND location_longitude <= 180))
);

-- Auto-create user_app_profile when a new user signs up
CREATE OR REPLACE FUNCTION private.handle_new_user_app_profile() RETURNS trigger
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO private.user_app_profile (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created_app_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION private.handle_new_user_app_profile();

-- 1_app/100_planet_user/5_planet_user-api-types.sql

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

-- 1_app/100_planet_user/7_planet_user-api-funcs.sql

-- Read the current user's app profile
CREATE OR REPLACE FUNCTION public."app:planetUser:read"()
RETURNS public."UserAppProfileV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    uap.user_id,
    uap.created_at,
    uap.updated_at,
    uap.is_verified,
    uap.verification_status,
    uap.is_onboarded,
    uap.is_business_owner,
    uap.location_latitude,
    uap.location_longitude,
    uap.phone_number
  FROM private.user_app_profile uap
  WHERE uap.user_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public."app:planetUser:read" TO authenticated;

-- Update the current user's app profile
CREATE OR REPLACE FUNCTION public."app:planetUser:update"(
  "isOnboarded" boolean DEFAULT NULL,
  "isBusinessOwner" boolean DEFAULT NULL,
  "locationLatitude" double precision DEFAULT NULL,
  "locationLongitude" double precision DEFAULT NULL,
  "phoneNumber" text DEFAULT NULL
)
RETURNS public."UserAppProfileV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
  UPDATE private.user_app_profile uap SET
    updated_at = CURRENT_TIMESTAMP,
    is_onboarded = COALESCE("isOnboarded", uap.is_onboarded),
    is_business_owner = COALESCE("isBusinessOwner", uap.is_business_owner),
    location_latitude = COALESCE("locationLatitude", uap.location_latitude),
    location_longitude = COALESCE("locationLongitude", uap.location_longitude),
    phone_number = COALESCE("phoneNumber", uap.phone_number)
  WHERE uap.user_id = auth.uid()
  RETURNING
    uap.user_id,
    uap.created_at,
    uap.updated_at,
    uap.is_verified,
    uap.verification_status,
    uap.is_onboarded,
    uap.is_business_owner,
    uap.location_latitude,
    uap.location_longitude,
    uap.phone_number;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetUser:update" TO authenticated;

-- Admin function to update verification status (called from edge functions after review)
CREATE OR REPLACE FUNCTION public."admin:planetUser:updateVerification"(
  "userId" uuid,
  "newVerificationStatus" public.verification_status
)
RETURNS void
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  IF "userId" IS NULL OR "newVerificationStatus" IS NULL THEN
    RETURN;
  END IF;

  UPDATE private.user_app_profile SET
    updated_at = CURRENT_TIMESTAMP,
    verification_status = COALESCE("newVerificationStatus", verification_status),
    is_verified = (COALESCE("newVerificationStatus", verification_status) = 'VERIFIED')
  WHERE user_id = "userId";
END;
$$;

GRANT EXECUTE ON FUNCTION public."admin:planetUser:updateVerification" TO service_role;

-- NOTE: app:planetUser:search and app:planetUser:readNearby are defined in
-- 150_planet_swipe/7_planet_swipe-api-funcs.sql because they depend on
-- private.group_member table created in schema 140.

-- NOTE: app:planetUser:readStats is defined in 160_planet_battle/7_planet_battle-api-funcs.sql
-- because it depends on private.group_member, private.battle, private.vote, and private.swipe
-- tables created in schemas 140, 150, and 160.

-- 1_app/110_planet_pref/1_planet_pref-types.sql

CREATE TYPE public.activity_category AS ENUM (
  'NIGHTLIFE',
  'FOOD_AND_DRINKS',
  'OUTDOOR',
  'LIVE_MUSIC',
  'SPORTS',
  'ARTS',
  'GAMING',
  'WELLNESS',
  'COMEDY'
);

COMMENT ON TYPE public.activity_category IS '
description: Categories of activities available on Planet
values:
  NIGHTLIFE: Bars, clubs, and late-night venues
  FOOD_AND_DRINKS: Restaurants, cafes, and eateries
  OUTDOOR: Parks, hiking, and outdoor activities
  LIVE_MUSIC: Concerts, live performances, and music venues
  SPORTS: Sports events and athletic activities
  ARTS: Museums, galleries, and cultural experiences
  GAMING: Arcades, board game cafes, trivia, and escape rooms
  WELLNESS: Spas, yoga, and wellness activities
  COMEDY: Stand-up, improv, and comedy shows
';

-- 1_app/110_planet_pref/3_planet_pref-tables.sql

CREATE TABLE IF NOT EXISTS private.user_preference (
  user_id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  activity_categories public.activity_category[] NOT NULL DEFAULT '{}',
  location_permission_granted boolean NOT NULL DEFAULT false,
  push_notifications_enabled boolean NOT NULL DEFAULT true,
  battle_notifications_enabled boolean NOT NULL DEFAULT true,
  group_activity_notifications_enabled boolean NOT NULL DEFAULT true,
  deal_notifications_enabled boolean NOT NULL DEFAULT true,
  friend_activity_notifications_enabled boolean NOT NULL DEFAULT true,

  CONSTRAINT activity_categories_min CHECK (array_length(activity_categories, 1) IS NULL OR array_length(activity_categories, 1) >= 0),
  CONSTRAINT activity_categories_max CHECK (array_length(activity_categories, 1) IS NULL OR array_length(activity_categories, 1) <= 8)
);

-- Auto-create user_preference when a new user signs up
CREATE OR REPLACE FUNCTION private.handle_new_user_preference() RETURNS trigger
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO private.user_preference (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created_preference
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION private.handle_new_user_preference();

-- 1_app/110_planet_pref/5_planet_pref-api-types.sql

CREATE TYPE public."UserPreferenceV1" AS (
  "userId" uuid_notnull,
  "createdAt" timestamptz_notnull,
  "updatedAt" timestamptz_notnull,
  "activityCategories" public.activity_category[],
  "locationPermissionGranted" bool_notnull,
  "pushNotificationsEnabled" bool_notnull,
  "battleNotificationsEnabled" bool_notnull,
  "groupActivityNotificationsEnabled" bool_notnull,
  "dealNotificationsEnabled" bool_notnull,
  "friendActivityNotificationsEnabled" bool_notnull
);

-- 1_app/110_planet_pref/7_planet_pref-api-funcs.sql

-- Read the current user's preferences
CREATE OR REPLACE FUNCTION public."app:planetPref:read"()
RETURNS public."UserPreferenceV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    up.user_id,
    up.created_at,
    up.updated_at,
    up.activity_categories,
    up.location_permission_granted,
    up.push_notifications_enabled,
    up.battle_notifications_enabled,
    up.group_activity_notifications_enabled,
    up.deal_notifications_enabled,
    up.friend_activity_notifications_enabled
  FROM private.user_preference up
  WHERE up.user_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public."app:planetPref:read" TO authenticated;

-- Update the current user's preferences
CREATE OR REPLACE FUNCTION public."app:planetPref:update"(
  "activityCategories" public.activity_category[] DEFAULT NULL,
  "locationPermissionGranted" boolean DEFAULT NULL,
  "pushNotificationsEnabled" boolean DEFAULT NULL,
  "battleNotificationsEnabled" boolean DEFAULT NULL,
  "groupActivityNotificationsEnabled" boolean DEFAULT NULL,
  "dealNotificationsEnabled" boolean DEFAULT NULL,
  "friendActivityNotificationsEnabled" boolean DEFAULT NULL
)
RETURNS public."UserPreferenceV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
  UPDATE private.user_preference up SET
    updated_at = CURRENT_TIMESTAMP,
    activity_categories = COALESCE("activityCategories", up.activity_categories),
    location_permission_granted = COALESCE("locationPermissionGranted", up.location_permission_granted),
    push_notifications_enabled = COALESCE("pushNotificationsEnabled", up.push_notifications_enabled),
    battle_notifications_enabled = COALESCE("battleNotificationsEnabled", up.battle_notifications_enabled),
    group_activity_notifications_enabled = COALESCE("groupActivityNotificationsEnabled", up.group_activity_notifications_enabled),
    deal_notifications_enabled = COALESCE("dealNotificationsEnabled", up.deal_notifications_enabled),
    friend_activity_notifications_enabled = COALESCE("friendActivityNotificationsEnabled", up.friend_activity_notifications_enabled)
  WHERE up.user_id = auth.uid()
  RETURNING
    up.user_id,
    up.created_at,
    up.updated_at,
    up.activity_categories,
    up.location_permission_granted,
    up.push_notifications_enabled,
    up.battle_notifications_enabled,
    up.group_activity_notifications_enabled,
    up.deal_notifications_enabled,
    up.friend_activity_notifications_enabled;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetPref:update" TO authenticated;

-- 1_app/120_planet_biz/3_planet_biz-tables.sql

CREATE TABLE IF NOT EXISTS private.business (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  logo_url text,
  is_verified boolean NOT NULL DEFAULT false,
  subscription_tier text NOT NULL DEFAULT 'FREE',

  CONSTRAINT business_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  CONSTRAINT business_subscription_tier_values CHECK (subscription_tier IN ('FREE', 'PREMIUM'))
);

CREATE INDEX IF NOT EXISTS business_idx_owner_id ON private.business(owner_id);

-- 1_app/120_planet_biz/5_planet_biz-api-types.sql

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

-- 1_app/120_planet_biz/7_planet_biz-api-funcs.sql

-- Read the current user's business
CREATE OR REPLACE FUNCTION public."app:planetBiz:read"()
RETURNS public."BusinessV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    b.id,
    b.created_at,
    b.updated_at,
    b.owner_id,
    b.name,
    b.logo_url,
    b.is_verified,
    b.subscription_tier
  FROM private.business b
  WHERE b.owner_id = auth.uid()
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBiz:read" TO authenticated;

-- Create a new business for the current user
CREATE OR REPLACE FUNCTION public."app:planetBiz:create"(
  "name" text,
  "logoUrl" text DEFAULT NULL
)
RETURNS public."BusinessV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
  WITH inserted AS (
    INSERT INTO private.business (owner_id, name, logo_url)
    SELECT auth.uid(), "name", "logoUrl"
    WHERE auth.uid() IS NOT NULL
    RETURNING *
  ),
  update_owner AS (
    UPDATE private.user_app_profile
    SET is_business_owner = true, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = auth.uid()
  )
  SELECT
    i.id,
    i.created_at,
    i.updated_at,
    i.owner_id,
    i.name,
    i.logo_url,
    i.is_verified,
    i.subscription_tier
  FROM inserted i;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBiz:create" TO authenticated;

-- Update the current user's business
CREATE OR REPLACE FUNCTION public."app:planetBiz:update"(
  "businessId" uuid,
  "name" text DEFAULT NULL,
  "logoUrl" text DEFAULT '___UNSET___'
)
RETURNS public."BusinessV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
  UPDATE private.business b SET
    updated_at = CURRENT_TIMESTAMP,
    name = COALESCE("name", b.name),
    logo_url = CASE WHEN "logoUrl" IS DISTINCT FROM '___UNSET___' THEN "logoUrl" ELSE b.logo_url END
  WHERE b.id = "businessId"
    AND b.owner_id = auth.uid()
  RETURNING
    b.id,
    b.created_at,
    b.updated_at,
    b.owner_id,
    b.name,
    b.logo_url,
    b.is_verified,
    b.subscription_tier;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBiz:update" TO authenticated;

-- 1_app/130_planet_activity/1_planet_activity-types.sql

CREATE TYPE public.activity_status AS ENUM (
  'ACTIVE',
  'PAUSED',
  'PENDING_REVIEW'
);

COMMENT ON TYPE public.activity_status IS '
description: Current status of an activity card
values:
  ACTIVE: Activity card is live and visible
  PAUSED: Temporarily hidden
  PENDING_REVIEW: Awaiting approval
';

CREATE TYPE public.price_range AS ENUM (
  'FREE',
  'LOW',
  'MEDIUM',
  'HIGH',
  'VERY_HIGH'
);

COMMENT ON TYPE public.price_range IS '
description: Price level indicator for activities
values:
  FREE: No cost
  LOW: Budget friendly
  MEDIUM: Moderate pricing
  HIGH: Premium pricing
  VERY_HIGH: Luxury pricing
';

CREATE TYPE public.deal_type AS ENUM (
  'PERCENTAGE_OFF',
  'FIXED_AMOUNT',
  'BOGO',
  'FREE_ITEM'
);

COMMENT ON TYPE public.deal_type IS '
description: Type of discount offered by a deal
values:
  PERCENTAGE_OFF: Percentage discount
  FIXED_AMOUNT: Fixed dollar amount off
  BOGO: Buy one get one
  FREE_ITEM: Free item with purchase
';

CREATE TYPE public.deal_status AS ENUM (
  'ACTIVE',
  'EXPIRED',
  'SCHEDULED'
);

COMMENT ON TYPE public.deal_status IS '
description: Current status of a deal
values:
  ACTIVE: Deal is currently available
  EXPIRED: Deal has passed its end date
  SCHEDULED: Deal starts in the future
';

-- 1_app/130_planet_activity/3_planet_activity-tables.sql

CREATE TABLE IF NOT EXISTS private.activity (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  business_id uuid NOT NULL REFERENCES private.business(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category public.activity_category NOT NULL,
  primary_image_url text NOT NULL,
  additional_image_urls text[] DEFAULT '{}',
  price_range public.price_range NOT NULL,
  operating_hours text,
  tags text[] DEFAULT '{}',
  status public.activity_status NOT NULL DEFAULT 'PENDING_REVIEW',
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  address text NOT NULL,
  rating double precision,

  CONSTRAINT activity_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 60),
  CONSTRAINT activity_description_length CHECK (char_length(description) >= 1 AND char_length(description) <= 500),
  CONSTRAINT activity_operating_hours_length CHECK (operating_hours IS NULL OR char_length(operating_hours) <= 500),
  CONSTRAINT activity_address_length CHECK (char_length(address) <= 200),
  CONSTRAINT activity_additional_images_max CHECK (array_length(additional_image_urls, 1) IS NULL OR array_length(additional_image_urls, 1) <= 5),
  CONSTRAINT activity_tags_max CHECK (array_length(tags, 1) IS NULL OR array_length(tags, 1) <= 10),
  CONSTRAINT activity_latitude_range CHECK (latitude >= -90 AND latitude <= 90),
  CONSTRAINT activity_longitude_range CHECK (longitude >= -180 AND longitude <= 180),
  CONSTRAINT activity_rating_range CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5))
);

CREATE INDEX IF NOT EXISTS activity_idx_business_id ON private.activity(business_id);
CREATE INDEX IF NOT EXISTS activity_idx_category ON private.activity(category);
CREATE INDEX IF NOT EXISTS activity_idx_status ON private.activity(status);

CREATE TABLE IF NOT EXISTS private.deal (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  business_id uuid NOT NULL REFERENCES private.business(id) ON DELETE CASCADE,
  headline text NOT NULL,
  deal_type public.deal_type NOT NULL,
  discount_value_in_percent double precision,
  discount_value_in_cents integer,
  terms_and_conditions text NOT NULL,
  minimum_group_size integer,
  minimum_spend_in_cents integer,
  start_date date NOT NULL,
  end_date date NOT NULL,
  valid_time_start time,
  valid_time_end time,
  total_redemption_limit integer,
  per_user_redemption_limit integer NOT NULL DEFAULT 1,
  status public.deal_status NOT NULL DEFAULT 'ACTIVE',
  redemption_code text NOT NULL,

  CONSTRAINT deal_headline_length CHECK (char_length(headline) >= 1 AND char_length(headline) <= 60),
  CONSTRAINT deal_terms_length CHECK (char_length(terms_and_conditions) >= 1 AND char_length(terms_and_conditions) <= 1000),
  CONSTRAINT deal_discount_percent_range CHECK (discount_value_in_percent IS NULL OR (discount_value_in_percent >= 1 AND discount_value_in_percent <= 100)),
  CONSTRAINT deal_discount_cents_min CHECK (discount_value_in_cents IS NULL OR discount_value_in_cents >= 1),
  CONSTRAINT deal_min_group_size_range CHECK (minimum_group_size IS NULL OR (minimum_group_size >= 1 AND minimum_group_size <= 20)),
  CONSTRAINT deal_min_spend_min CHECK (minimum_spend_in_cents IS NULL OR minimum_spend_in_cents >= 0),
  CONSTRAINT deal_total_redemption_min CHECK (total_redemption_limit IS NULL OR total_redemption_limit >= 1),
  CONSTRAINT deal_per_user_redemption_min CHECK (per_user_redemption_limit >= 1),
  CONSTRAINT deal_redemption_code_length CHECK (char_length(redemption_code) >= 6 AND char_length(redemption_code) <= 20),
  CONSTRAINT deal_date_range CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS deal_idx_business_id ON private.deal(business_id);
CREATE INDEX IF NOT EXISTS deal_idx_status ON private.deal(status);

-- Junction table linking deals to activities
CREATE TABLE IF NOT EXISTS private.deal_activity (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES private.deal(id) ON DELETE CASCADE,
  activity_id uuid NOT NULL REFERENCES private.activity(id) ON DELETE CASCADE,

  UNIQUE(deal_id, activity_id)
);

CREATE INDEX IF NOT EXISTS deal_activity_idx_deal_id ON private.deal_activity(deal_id);
CREATE INDEX IF NOT EXISTS deal_activity_idx_activity_id ON private.deal_activity(activity_id);

CREATE TABLE IF NOT EXISTS private.deal_redemption (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES private.deal(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redeemed_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS deal_redemption_idx_deal_id ON private.deal_redemption(deal_id);
CREATE INDEX IF NOT EXISTS deal_redemption_idx_user_id ON private.deal_redemption(user_id);

-- Aggregated performance metrics for an activity card
CREATE TABLE IF NOT EXISTS private.activity_metrics (
  activity_id uuid NOT NULL PRIMARY KEY REFERENCES private.activity(id) ON DELETE CASCADE,
  total_impressions integer NOT NULL DEFAULT 0,
  total_swipes integer NOT NULL DEFAULT 0,
  conversion_rate_percent double precision NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT activity_metrics_impressions_min CHECK (total_impressions >= 0),
  CONSTRAINT activity_metrics_swipes_min CHECK (total_swipes >= 0),
  CONSTRAINT activity_metrics_conversion_range CHECK (conversion_rate_percent >= 0 AND conversion_rate_percent <= 100)
);

-- Boost / promotion status for an activity card
CREATE TABLE IF NOT EXISTS private.activity_boost (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL UNIQUE REFERENCES private.activity(id) ON DELETE CASCADE,
  is_active boolean NOT NULL DEFAULT false,
  tier text NOT NULL DEFAULT 'BASIC',
  daily_budget_in_cents integer NOT NULL DEFAULT 0,
  remaining_budget_in_cents integer NOT NULL DEFAULT 0,
  boosted_impressions integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT activity_boost_tier_values CHECK (tier IN ('BASIC', 'PRO', 'MAX')),
  CONSTRAINT activity_boost_daily_budget_min CHECK (daily_budget_in_cents >= 0),
  CONSTRAINT activity_boost_remaining_budget_min CHECK (remaining_budget_in_cents >= 0),
  CONSTRAINT activity_boost_impressions_min CHECK (boosted_impressions >= 0)
);

CREATE INDEX IF NOT EXISTS activity_boost_idx_activity_id ON private.activity_boost(activity_id);

-- Aggregated performance metrics for a deal
CREATE TABLE IF NOT EXISTS private.deal_metrics (
  deal_id uuid NOT NULL PRIMARY KEY REFERENCES private.deal(id) ON DELETE CASCADE,
  total_views integer NOT NULL DEFAULT 0,
  total_redemptions integer NOT NULL DEFAULT 0,
  conversion_rate_percent double precision NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT deal_metrics_views_min CHECK (total_views >= 0),
  CONSTRAINT deal_metrics_redemptions_min CHECK (total_redemptions >= 0),
  CONSTRAINT deal_metrics_conversion_range CHECK (conversion_rate_percent >= 0 AND conversion_rate_percent <= 100)
);

-- 1_app/130_planet_activity/5_planet_activity-api-types.sql

CREATE TYPE public."ActivityV1" AS (
  id uuid_notnull,
  "createdAt" timestamptz_notnull,
  "updatedAt" timestamptz_notnull,
  "businessId" uuid_notnull,
  title text,
  description text,
  category public.activity_category,
  "primaryImageUrl" text,
  "additionalImageUrls" text[],
  "priceRange" public.price_range,
  "operatingHours" text,
  tags text[],
  status public.activity_status,
  latitude double precision,
  longitude double precision,
  address text,
  rating double precision
);

CREATE TYPE public."DealV1" AS (
  id uuid_notnull,
  "createdAt" timestamptz_notnull,
  "updatedAt" timestamptz_notnull,
  "businessId" uuid_notnull,
  headline text,
  "dealType" public.deal_type,
  "discountValueInPercent" double precision,
  "discountValueInCents" integer,
  "termsAndConditions" text,
  "minimumGroupSize" integer,
  "minimumSpendInCents" integer,
  "startDate" date_notnull,
  "endDate" date_notnull,
  "validTimeStart" time,
  "validTimeEnd" time,
  "totalRedemptionLimit" integer,
  "perUserRedemptionLimit" int_notnull,
  status public.deal_status,
  "redemptionCode" text
);

CREATE TYPE public."DealActivityV1" AS (
  id uuid_notnull,
  "dealId" uuid_notnull,
  "activityId" uuid_notnull
);

CREATE TYPE public."DealRedemptionV1" AS (
  id uuid_notnull,
  "dealId" uuid_notnull,
  "userId" uuid_notnull,
  "redeemedAt" timestamptz_notnull
);

CREATE TYPE public."ActivityWithDealV1" AS (
  activity public."ActivityV1",
  deal public."DealV1"
);

CREATE TYPE public."DealRedeemDetailV1" AS (
  deal public."DealV1",
  "businessName" text,
  "redemptionsUsed" int_notnull,
  "userAlreadyRedeemed" bool_notnull
);

CREATE TYPE public."ActivityDiscoverCardV1" AS (
  activity public."ActivityV1",
  deal public."DealV1",
  "businessName" text
);

CREATE TYPE public."ActivityMetricsV1" AS (
  "activityId" uuid_notnull,
  "totalImpressions" int_notnull,
  "totalSwipes" int_notnull,
  "conversionRatePercent" double precision,
  "updatedAt" timestamptz_notnull
);

CREATE TYPE public."ActivityBoostV1" AS (
  id uuid_notnull,
  "activityId" uuid_notnull,
  "isActive" bool_notnull,
  tier text,
  "dailyBudgetInCents" int_notnull,
  "remainingBudgetInCents" int_notnull,
  "boostedImpressions" int_notnull,
  "createdAt" timestamptz_notnull,
  "updatedAt" timestamptz_notnull
);

CREATE TYPE public."DealMetricsV1" AS (
  "dealId" uuid_notnull,
  "totalViews" int_notnull,
  "totalRedemptions" int_notnull,
  "conversionRatePercent" double precision,
  "updatedAt" timestamptz_notnull
);

CREATE TYPE public."DealWithMetricsV1" AS (
  deal public."DealV1",
  "totalViews" int_notnull,
  "totalRedemptions" int_notnull,
  "conversionRatePercent" double precision,
  "linkedActivitiesCount" int_notnull
);

CREATE TYPE public."ActivityEditDetailV1" AS (
  activity public."ActivityV1",
  deal public."DealV1",
  metrics public."ActivityMetricsV1",
  boost public."ActivityBoostV1",
  "businessDeals" public."DealV1"[]
);

-- 1_app/130_planet_activity/7_planet_activity-api-funcs.sql

-- Read discover feed is defined in 150_planet_swipe/7_planet_swipe-api-funcs.sql
-- because it depends on the private.swipe table created in that schema.

-- Read active activities for discovery feed (with optional deal)
CREATE OR REPLACE FUNCTION public."app:planetActivity:readAllActive"(
  "userLatitude" double precision DEFAULT NULL,
  "userLongitude" double precision DEFAULT NULL,
  "limitCount" integer DEFAULT 20,
  "offsetCount" integer DEFAULT 0
)
RETURNS SETOF public."ActivityWithDealV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    ROW(
      a.id, a.created_at, a.updated_at, a.business_id,
      a.title, a.description, a.category, a.primary_image_url,
      a.additional_image_urls, a.price_range, a.operating_hours,
      a.tags, a.status, a.latitude, a.longitude, a.address, a.rating
    )::public."ActivityV1",
    (
      SELECT ROW(
        d.id, d.created_at, d.updated_at, d.business_id,
        d.headline, d.deal_type, d.discount_value_in_percent,
        d.discount_value_in_cents, d.terms_and_conditions,
        d.minimum_group_size, d.minimum_spend_in_cents,
        d.start_date, d.end_date, d.valid_time_start, d.valid_time_end,
        d.total_redemption_limit, d.per_user_redemption_limit,
        d.status, d.redemption_code
      )::public."DealV1"
      FROM private.deal d
      JOIN private.deal_activity da ON da.deal_id = d.id
      WHERE da.activity_id = a.id
        AND d.status = 'ACTIVE'
      LIMIT 1
    )
  )::public."ActivityWithDealV1"
  FROM private.activity a
  WHERE a.status = 'ACTIVE'
    AND auth.uid() IS NOT NULL
  ORDER BY a.created_at DESC
  LIMIT "limitCount"
  OFFSET "offsetCount";
$$;

GRANT EXECUTE ON FUNCTION public."app:planetActivity:readAllActive" TO authenticated;

-- Read a single activity by ID
CREATE OR REPLACE FUNCTION public."app:planetActivity:readById"(
  "activityId" uuid
)
RETURNS public."ActivityWithDealV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    ROW(
      a.id, a.created_at, a.updated_at, a.business_id,
      a.title, a.description, a.category, a.primary_image_url,
      a.additional_image_urls, a.price_range, a.operating_hours,
      a.tags, a.status, a.latitude, a.longitude, a.address, a.rating
    )::public."ActivityV1",
    (
      SELECT ROW(
        d.id, d.created_at, d.updated_at, d.business_id,
        d.headline, d.deal_type, d.discount_value_in_percent,
        d.discount_value_in_cents, d.terms_and_conditions,
        d.minimum_group_size, d.minimum_spend_in_cents,
        d.start_date, d.end_date, d.valid_time_start, d.valid_time_end,
        d.total_redemption_limit, d.per_user_redemption_limit,
        d.status, d.redemption_code
      )::public."DealV1"
      FROM private.deal d
      JOIN private.deal_activity da ON da.deal_id = d.id
      WHERE da.activity_id = a.id
        AND d.status = 'ACTIVE'
      LIMIT 1
    )
  )::public."ActivityWithDealV1"
  FROM private.activity a
  WHERE a.id = "activityId"
    AND auth.uid() IS NOT NULL
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetActivity:readById" TO authenticated;

-- Read activities owned by the current user's business
CREATE OR REPLACE FUNCTION public."app:planetActivity:readAllByBusiness"(
  "businessId" uuid
)
RETURNS SETOF public."ActivityV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    a.id, a.created_at, a.updated_at, a.business_id,
    a.title, a.description, a.category, a.primary_image_url,
    a.additional_image_urls, a.price_range, a.operating_hours,
    a.tags, a.status, a.latitude, a.longitude, a.address, a.rating
  FROM private.activity a
  JOIN private.business b ON b.id = a.business_id
  WHERE a.business_id = "businessId"
    AND b.owner_id = auth.uid()
  ORDER BY a.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetActivity:readAllByBusiness" TO authenticated;

-- Create a new activity
CREATE OR REPLACE FUNCTION public."app:planetActivity:create"(
  "businessId" uuid,
  "title" text,
  "description" text,
  "category" public.activity_category,
  "primaryImageUrl" text,
  "priceRange" public.price_range,
  "address" text,
  "latitude" double precision,
  "longitude" double precision,
  "additionalImageUrls" text[] DEFAULT '{}',
  "operatingHours" text DEFAULT NULL,
  "tags" text[] DEFAULT '{}'
)
RETURNS public."ActivityV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _result public."ActivityV1";
BEGIN
  IF "businessId" IS NULL OR "title" IS NULL OR "description" IS NULL
     OR "category" IS NULL OR "primaryImageUrl" IS NULL OR "priceRange" IS NULL
     OR "address" IS NULL OR "latitude" IS NULL OR "longitude" IS NULL THEN
    RETURN NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM private.business b
    WHERE b.id = "businessId" AND b.owner_id = auth.uid()
  ) THEN
    RETURN NULL;
  END IF;

  INSERT INTO private.activity (
    business_id, title, description, category, primary_image_url,
    additional_image_urls, price_range, operating_hours, tags,
    latitude, longitude, address
  )
  VALUES (
    "businessId", "title", "description", "category", "primaryImageUrl",
    COALESCE("additionalImageUrls", '{}'), "priceRange", "operatingHours", COALESCE("tags", '{}'),
    "latitude", "longitude", "address"
  )
  RETURNING
    id, created_at, updated_at, business_id,
    title, description, category, primary_image_url,
    additional_image_urls, price_range, operating_hours,
    tags, status, latitude, longitude, address, rating
  INTO _result;

  RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetActivity:create" TO authenticated;

-- Update an existing activity
CREATE OR REPLACE FUNCTION public."app:planetActivity:update"(
  "activityId" uuid,
  "title" text DEFAULT NULL,
  "description" text DEFAULT NULL,
  "category" public.activity_category DEFAULT NULL,
  "primaryImageUrl" text DEFAULT NULL,
  "priceRange" public.price_range DEFAULT NULL,
  "address" text DEFAULT NULL,
  "latitude" double precision DEFAULT NULL,
  "longitude" double precision DEFAULT NULL,
  "additionalImageUrls" text[] DEFAULT NULL,
  "operatingHours" text DEFAULT '___UNSET___',
  "tags" text[] DEFAULT NULL,
  "status" public.activity_status DEFAULT NULL
)
RETURNS public."ActivityV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
  UPDATE private.activity a SET
    updated_at = CURRENT_TIMESTAMP,
    title = COALESCE("title", a.title),
    description = COALESCE("description", a.description),
    category = COALESCE("category", a.category),
    primary_image_url = COALESCE("primaryImageUrl", a.primary_image_url),
    price_range = COALESCE("priceRange", a.price_range),
    address = COALESCE("address", a.address),
    latitude = COALESCE("latitude", a.latitude),
    longitude = COALESCE("longitude", a.longitude),
    additional_image_urls = COALESCE("additionalImageUrls", a.additional_image_urls),
    operating_hours = CASE WHEN "operatingHours" IS DISTINCT FROM '___UNSET___' THEN "operatingHours" ELSE a.operating_hours END,
    tags = COALESCE("tags", a.tags),
    status = COALESCE("status", a.status)
  WHERE a.id = "activityId"
    AND EXISTS (
      SELECT 1 FROM private.business b
      WHERE b.id = a.business_id AND b.owner_id = auth.uid()
    )
  RETURNING
    a.id, a.created_at, a.updated_at, a.business_id,
    a.title, a.description, a.category, a.primary_image_url,
    a.additional_image_urls, a.price_range, a.operating_hours,
    a.tags, a.status, a.latitude, a.longitude, a.address, a.rating;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetActivity:update" TO authenticated;

-- Delete an activity
CREATE OR REPLACE FUNCTION public."app:planetActivity:delete"(
  "activityId" uuid
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
  WITH deleted AS (
    DELETE FROM private.activity a
    WHERE a.id = "activityId"
      AND EXISTS (
        SELECT 1 FROM private.business b
        WHERE b.id = a.business_id AND b.owner_id = auth.uid()
      )
    RETURNING id
  )
  SELECT EXISTS(SELECT 1 FROM deleted);
$$;

GRANT EXECUTE ON FUNCTION public."app:planetActivity:delete" TO authenticated;

-- Read deals owned by the current user's business
CREATE OR REPLACE FUNCTION public."app:planetDeal:readAllByBusiness"(
  "businessId" uuid
)
RETURNS SETOF public."DealV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    d.id, d.created_at, d.updated_at, d.business_id,
    d.headline, d.deal_type, d.discount_value_in_percent,
    d.discount_value_in_cents, d.terms_and_conditions,
    d.minimum_group_size, d.minimum_spend_in_cents,
    d.start_date, d.end_date, d.valid_time_start, d.valid_time_end,
    d.total_redemption_limit, d.per_user_redemption_limit,
    d.status, d.redemption_code
  FROM private.deal d
  JOIN private.business b ON b.id = d.business_id
  WHERE d.business_id = "businessId"
    AND b.owner_id = auth.uid()
  ORDER BY d.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetDeal:readAllByBusiness" TO authenticated;

-- Read a single deal by ID
CREATE OR REPLACE FUNCTION public."app:planetDeal:readById"(
  "dealId" uuid
)
RETURNS public."DealV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    d.id, d.created_at, d.updated_at, d.business_id,
    d.headline, d.deal_type, d.discount_value_in_percent,
    d.discount_value_in_cents, d.terms_and_conditions,
    d.minimum_group_size, d.minimum_spend_in_cents,
    d.start_date, d.end_date, d.valid_time_start, d.valid_time_end,
    d.total_redemption_limit, d.per_user_redemption_limit,
    d.status, d.redemption_code
  FROM private.deal d
  WHERE d.id = "dealId"
    AND auth.uid() IS NOT NULL
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetDeal:readById" TO authenticated;

-- Create a new deal
CREATE OR REPLACE FUNCTION public."app:planetDeal:create"(
  "businessId" uuid,
  "headline" text,
  "dealType" public.deal_type,
  "termsAndConditions" text,
  "startDate" date,
  "endDate" date,
  "redemptionCode" text,
  "discountValueInPercent" double precision DEFAULT NULL,
  "discountValueInCents" integer DEFAULT NULL,
  "minimumGroupSize" integer DEFAULT NULL,
  "minimumSpendInCents" integer DEFAULT NULL,
  "validTimeStart" time DEFAULT NULL,
  "validTimeEnd" time DEFAULT NULL,
  "totalRedemptionLimit" integer DEFAULT NULL,
  "perUserRedemptionLimit" integer DEFAULT 1,
  "activityIds" uuid[] DEFAULT '{}'
)
RETURNS public."DealV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _deal_id uuid;
  _result public."DealV1";
BEGIN
  -- Verify required params and business ownership
  IF "businessId" IS NULL OR "headline" IS NULL OR "dealType" IS NULL
     OR "termsAndConditions" IS NULL OR "startDate" IS NULL
     OR "endDate" IS NULL OR "redemptionCode" IS NULL THEN
    RETURN NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM private.business b
    WHERE b.id = "businessId" AND b.owner_id = auth.uid()
  ) THEN
    RETURN NULL;
  END IF;

  INSERT INTO private.deal (
    business_id, headline, deal_type, terms_and_conditions,
    start_date, end_date, redemption_code,
    discount_value_in_percent, discount_value_in_cents,
    minimum_group_size, minimum_spend_in_cents,
    valid_time_start, valid_time_end,
    total_redemption_limit, per_user_redemption_limit
  )
  VALUES (
    "businessId", "headline", "dealType", "termsAndConditions",
    "startDate", "endDate", "redemptionCode",
    "discountValueInPercent", "discountValueInCents",
    "minimumGroupSize", "minimumSpendInCents",
    "validTimeStart", "validTimeEnd",
    "totalRedemptionLimit", "perUserRedemptionLimit"
  )
  RETURNING id INTO STRICT _deal_id;

  -- Link activities to the deal
  IF "activityIds" IS NOT NULL AND array_length("activityIds", 1) > 0 AND _deal_id IS NOT NULL THEN
    INSERT INTO private.deal_activity (deal_id, activity_id)
    SELECT COALESCE(_deal_id, '00000000-0000-0000-0000-000000000000'::uuid),
           COALESCE(_aid, '00000000-0000-0000-0000-000000000000'::uuid)
    FROM unnest("activityIds") AS _aid
    WHERE _aid IS NOT NULL;
  END IF;

  SELECT
    d.id, d.created_at, d.updated_at, d.business_id,
    d.headline, d.deal_type, d.discount_value_in_percent,
    d.discount_value_in_cents, d.terms_and_conditions,
    d.minimum_group_size, d.minimum_spend_in_cents,
    d.start_date, d.end_date, d.valid_time_start, d.valid_time_end,
    d.total_redemption_limit, d.per_user_redemption_limit,
    d.status, d.redemption_code
  INTO _result
  FROM private.deal d
  WHERE d.id = _deal_id;

  RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetDeal:create" TO authenticated;

-- Redeem a deal
CREATE OR REPLACE FUNCTION public."app:planetDeal:redeem"(
  "dealId" uuid
)
RETURNS public."DealRedemptionV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _result public."DealRedemptionV1";
BEGIN
  IF "dealId" IS NULL OR auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM private.deal d
    WHERE d.id = "dealId" AND d.status = 'ACTIVE'
  ) THEN
    RETURN NULL;
  END IF;

  INSERT INTO private.deal_redemption (deal_id, user_id)
  VALUES ("dealId", auth.uid())
  RETURNING id, deal_id, user_id, redeemed_at
  INTO _result;

  RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetDeal:redeem" TO authenticated;

-- Read deal redemption detail by activity ID (for the deal redemption screen)
CREATE OR REPLACE FUNCTION public."app:planetDeal:readRedeemDetailByActivity"(
  "activityId" uuid
)
RETURNS public."DealRedeemDetailV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    ROW(
      d.id, d.created_at, d.updated_at, d.business_id,
      d.headline, d.deal_type, d.discount_value_in_percent,
      d.discount_value_in_cents, d.terms_and_conditions,
      d.minimum_group_size, d.minimum_spend_in_cents,
      d.start_date, d.end_date, d.valid_time_start, d.valid_time_end,
      d.total_redemption_limit, d.per_user_redemption_limit,
      d.status, d.redemption_code
    )::public."DealV1",
    b.name,
    COALESCE((
      SELECT count(*)::integer
      FROM private.deal_redemption dr
      WHERE dr.deal_id = d.id
    ), 0),
    EXISTS (
      SELECT 1
      FROM private.deal_redemption dr
      WHERE dr.deal_id = d.id
        AND dr.user_id = auth.uid()
    )
  )::public."DealRedeemDetailV1"
  FROM private.deal d
  JOIN private.deal_activity da ON da.deal_id = d.id
  JOIN private.business b ON b.id = d.business_id
  WHERE da.activity_id = "activityId"
    AND d.status = 'ACTIVE'
    AND auth.uid() IS NOT NULL
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetDeal:readRedeemDetailByActivity" TO authenticated;

-- Link a deal to an activity (for attaching a deal when creating an activity)
CREATE OR REPLACE FUNCTION public."app:planetDeal:linkActivity"(
  "dealId" uuid,
  "activityId" uuid
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  IF "dealId" IS NULL OR "activityId" IS NULL OR auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  -- Verify the user owns the business that owns both the deal and the activity
  IF NOT EXISTS (
    SELECT 1
    FROM private.deal d
    JOIN private.business b ON b.id = d.business_id
    WHERE d.id = "dealId" AND b.owner_id = auth.uid()
  ) THEN
    RETURN false;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM private.activity a
    JOIN private.business b ON b.id = a.business_id
    WHERE a.id = "activityId" AND b.owner_id = auth.uid()
  ) THEN
    RETURN false;
  END IF;

  INSERT INTO private.deal_activity (deal_id, activity_id)
  VALUES (COALESCE("dealId", '00000000-0000-0000-0000-000000000000'::uuid),
          COALESCE("activityId", '00000000-0000-0000-0000-000000000000'::uuid))
  ON CONFLICT (deal_id, activity_id) DO NOTHING;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetDeal:linkActivity" TO authenticated;

-- Read full edit detail for an activity (activity + deal + metrics + boost + business deals)
CREATE OR REPLACE FUNCTION public."app:planetActivity:readEditDetail"(
  "activityId" uuid
)
RETURNS public."ActivityEditDetailV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    -- activity
    ROW(
      a.id, a.created_at, a.updated_at, a.business_id,
      a.title, a.description, a.category, a.primary_image_url,
      a.additional_image_urls, a.price_range, a.operating_hours,
      a.tags, a.status, a.latitude, a.longitude, a.address, a.rating
    )::public."ActivityV1",
    -- linked deal (first active deal)
    (
      SELECT ROW(
        d.id, d.created_at, d.updated_at, d.business_id,
        d.headline, d.deal_type, d.discount_value_in_percent,
        d.discount_value_in_cents, d.terms_and_conditions,
        d.minimum_group_size, d.minimum_spend_in_cents,
        d.start_date, d.end_date, d.valid_time_start, d.valid_time_end,
        d.total_redemption_limit, d.per_user_redemption_limit,
        d.status, d.redemption_code
      )::public."DealV1"
      FROM private.deal d
      JOIN private.deal_activity da ON da.deal_id = d.id
      WHERE da.activity_id = a.id
        AND d.status = 'ACTIVE'
      LIMIT 1
    ),
    -- metrics
    (
      SELECT ROW(
        am.activity_id,
        am.total_impressions,
        am.total_swipes,
        am.conversion_rate_percent,
        am.updated_at
      )::public."ActivityMetricsV1"
      FROM private.activity_metrics am
      WHERE am.activity_id = a.id
    ),
    -- boost
    (
      SELECT ROW(
        ab.id,
        ab.activity_id,
        ab.is_active,
        ab.tier,
        ab.daily_budget_in_cents,
        ab.remaining_budget_in_cents,
        ab.boosted_impressions,
        ab.created_at,
        ab.updated_at
      )::public."ActivityBoostV1"
      FROM private.activity_boost ab
      WHERE ab.activity_id = a.id
    ),
    -- all deals for this business (for the deal picker)
    COALESCE(
      ARRAY(
        SELECT ROW(
          d2.id, d2.created_at, d2.updated_at, d2.business_id,
          d2.headline, d2.deal_type, d2.discount_value_in_percent,
          d2.discount_value_in_cents, d2.terms_and_conditions,
          d2.minimum_group_size, d2.minimum_spend_in_cents,
          d2.start_date, d2.end_date, d2.valid_time_start, d2.valid_time_end,
          d2.total_redemption_limit, d2.per_user_redemption_limit,
          d2.status, d2.redemption_code
        )::public."DealV1"
        FROM private.deal d2
        WHERE d2.business_id = a.business_id
          AND d2.status = 'ACTIVE'
        ORDER BY d2.created_at DESC
      ),
      '{}'::public."DealV1"[]
    )
  )::public."ActivityEditDetailV1"
  FROM private.activity a
  WHERE a.id = "activityId"
    AND EXISTS (
      SELECT 1 FROM private.business b
      WHERE b.id = a.business_id AND b.owner_id = auth.uid()
    )
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetActivity:readEditDetail" TO authenticated;

-- Unlink a deal from an activity
CREATE OR REPLACE FUNCTION public."app:planetDeal:unlinkActivity"(
  "dealId" uuid,
  "activityId" uuid
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  IF "dealId" IS NULL OR "activityId" IS NULL OR auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  -- Verify the user owns the business that owns the deal
  IF NOT EXISTS (
    SELECT 1
    FROM private.deal d
    JOIN private.business b ON b.id = d.business_id
    WHERE d.id = "dealId" AND b.owner_id = auth.uid()
  ) THEN
    RETURN false;
  END IF;

  DELETE FROM private.deal_activity
  WHERE deal_id = "dealId" AND activity_id = "activityId";

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetDeal:unlinkActivity" TO authenticated;

-- Read all deals for a business with metrics
CREATE OR REPLACE FUNCTION public."app:planetDeal:readAllByBusinessWithMetrics"(
  "businessId" uuid
)
RETURNS SETOF public."DealWithMetricsV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    ROW(
      d.id, d.created_at, d.updated_at, d.business_id,
      d.headline, d.deal_type, d.discount_value_in_percent,
      d.discount_value_in_cents, d.terms_and_conditions,
      d.minimum_group_size, d.minimum_spend_in_cents,
      d.start_date, d.end_date, d.valid_time_start, d.valid_time_end,
      d.total_redemption_limit, d.per_user_redemption_limit,
      d.status, d.redemption_code
    )::public."DealV1",
    COALESCE(dm.total_views, 0),
    COALESCE(dm.total_redemptions, 0),
    COALESCE(dm.conversion_rate_percent, 0),
    COALESCE((
      SELECT count(*)::integer
      FROM private.deal_activity da
      WHERE da.deal_id = d.id
    ), 0)
  )::public."DealWithMetricsV1"
  FROM private.deal d
  JOIN private.business b ON b.id = d.business_id
  LEFT JOIN private.deal_metrics dm ON dm.deal_id = d.id
  WHERE d.business_id = "businessId"
    AND b.owner_id = auth.uid()
  ORDER BY d.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetDeal:readAllByBusinessWithMetrics" TO authenticated;

-- Update deal status
CREATE OR REPLACE FUNCTION public."app:planetDeal:updateStatus"(
  "dealId" uuid,
  "newStatus" public.deal_status
)
RETURNS public."DealV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
  UPDATE private.deal d SET
    updated_at = CURRENT_TIMESTAMP,
    status = COALESCE("newStatus", d.status)
  WHERE d.id = "dealId"
    AND EXISTS (
      SELECT 1 FROM private.business b
      WHERE b.id = d.business_id AND b.owner_id = auth.uid()
    )
  RETURNING
    d.id, d.created_at, d.updated_at, d.business_id,
    d.headline, d.deal_type, d.discount_value_in_percent,
    d.discount_value_in_cents, d.terms_and_conditions,
    d.minimum_group_size, d.minimum_spend_in_cents,
    d.start_date, d.end_date, d.valid_time_start, d.valid_time_end,
    d.total_redemption_limit, d.per_user_redemption_limit,
    d.status, d.redemption_code;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetDeal:updateStatus" TO authenticated;

-- Delete a deal
CREATE OR REPLACE FUNCTION public."app:planetDeal:delete"(
  "dealId" uuid
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
  WITH deleted AS (
    DELETE FROM private.deal d
    WHERE d.id = "dealId"
      AND EXISTS (
        SELECT 1 FROM private.business b
        WHERE b.id = d.business_id AND b.owner_id = auth.uid()
      )
    RETURNING id
  )
  SELECT EXISTS(SELECT 1 FROM deleted);
$$;

GRANT EXECUTE ON FUNCTION public."app:planetDeal:delete" TO authenticated;

-- Duplicate a deal (creates a copy with SCHEDULED status and zero metrics)
CREATE OR REPLACE FUNCTION public."app:planetDeal:duplicate"(
  "dealId" uuid
)
RETURNS public."DealV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _new_deal_id uuid;
  _result public."DealV1";
BEGIN
  IF "dealId" IS NULL OR auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  -- Verify ownership
  IF NOT EXISTS (
    SELECT 1 FROM private.deal d
    JOIN private.business b ON b.id = d.business_id
    WHERE d.id = "dealId" AND b.owner_id = auth.uid()
  ) THEN
    RETURN NULL;
  END IF;

  -- Copy the deal with SCHEDULED status
  INSERT INTO private.deal (
    business_id, headline, deal_type, discount_value_in_percent,
    discount_value_in_cents, terms_and_conditions,
    minimum_group_size, minimum_spend_in_cents,
    start_date, end_date, valid_time_start, valid_time_end,
    total_redemption_limit, per_user_redemption_limit,
    status, redemption_code
  )
  SELECT
    d.business_id, d.headline, d.deal_type, d.discount_value_in_percent,
    d.discount_value_in_cents, d.terms_and_conditions,
    d.minimum_group_size, d.minimum_spend_in_cents,
    d.start_date, d.end_date, d.valid_time_start, d.valid_time_end,
    d.total_redemption_limit, d.per_user_redemption_limit,
    'SCHEDULED'::public.deal_status, d.redemption_code || '_COPY'
  FROM private.deal d
  WHERE d.id = "dealId"
  RETURNING id INTO STRICT _new_deal_id;

  -- Copy deal-activity links
  INSERT INTO private.deal_activity (deal_id, activity_id)
  SELECT COALESCE(_new_deal_id, '00000000-0000-0000-0000-000000000000'::uuid), da.activity_id
  FROM private.deal_activity da
  WHERE da.deal_id = "dealId";

  -- Create empty metrics row
  INSERT INTO private.deal_metrics (deal_id)
  VALUES (COALESCE(_new_deal_id, '00000000-0000-0000-0000-000000000000'::uuid));

  SELECT
    d.id, d.created_at, d.updated_at, d.business_id,
    d.headline, d.deal_type, d.discount_value_in_percent,
    d.discount_value_in_cents, d.terms_and_conditions,
    d.minimum_group_size, d.minimum_spend_in_cents,
    d.start_date, d.end_date, d.valid_time_start, d.valid_time_end,
    d.total_redemption_limit, d.per_user_redemption_limit,
    d.status, d.redemption_code
  INTO _result
  FROM private.deal d
  WHERE d.id = _new_deal_id;

  RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetDeal:duplicate" TO authenticated;

-- Read deal activities (linked activity IDs for a deal)
CREATE OR REPLACE FUNCTION public."app:planetDeal:readActivities"(
  "dealId" uuid
)
RETURNS SETOF public."DealActivityV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT da.id, da.deal_id, da.activity_id
  FROM private.deal_activity da
  WHERE da.deal_id = "dealId"
    AND auth.uid() IS NOT NULL;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetDeal:readActivities" TO authenticated;

-- 1_app/130_planet_activity/8_planet_activity-buckets.sql

INSERT INTO storage.buckets (id, name)
  VALUES ('activity-images', 'activity-images')
  ON CONFLICT (id) DO NOTHING;

-- Activity images are publicly accessible for discovery feed
CREATE POLICY "Activity images are publicly accessible" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'activity-images');

-- Authenticated users can upload activity images
CREATE POLICY "Authenticated users can upload activity images" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'activity-images');

-- Users can update their own activity images
CREATE POLICY "Users can update their own activity images" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = owner_id::uuid)
  WITH CHECK (bucket_id = 'activity-images');

-- 1_app/140_planet_group/1_planet_group-types.sql

CREATE TYPE public.group_visibility AS ENUM (
  'PUBLIC',
  'PRIVATE'
);

COMMENT ON TYPE public.group_visibility IS '
description: Visibility setting for a group
values:
  PUBLIC: Appears in nearby searches for verified users
  PRIVATE: Invite only access
';

-- 1_app/140_planet_group/3_planet_group-tables.sql

CREATE TABLE IF NOT EXISTS private.planet_group (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  name text NOT NULL,
  photo_url text,
  is_open_to_strangers boolean NOT NULL DEFAULT false,
  max_group_size integer NOT NULL DEFAULT 10,
  visibility public.group_visibility NOT NULL DEFAULT 'PRIVATE',
  created_by_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  next_plan_at timestamptz,

  latitude double precision,
  longitude double precision,
  featured_activity_name text,

  CONSTRAINT group_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 30),
  CONSTRAINT group_max_size_range CHECK (max_group_size >= 4 AND max_group_size <= 20),
  conversation_id uuid REFERENCES private.conversation(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS private.group_orbit (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  group_id uuid NOT NULL REFERENCES private.planet_group(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS group_orbit_idx_group_id ON private.group_orbit(group_id);
CREATE INDEX IF NOT EXISTS group_orbit_idx_user_id ON private.group_orbit(user_id);

CREATE TABLE IF NOT EXISTS private.group_join_request (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  group_id uuid NOT NULL REFERENCES private.planet_group(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text,
  status text NOT NULL DEFAULT 'PENDING',
  UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS group_join_request_idx_group_id ON private.group_join_request(group_id);
CREATE INDEX IF NOT EXISTS group_join_request_idx_user_id ON private.group_join_request(user_id);

CREATE INDEX IF NOT EXISTS planet_group_idx_created_by_id ON private.planet_group(created_by_id);

CREATE TABLE IF NOT EXISTS private.group_member (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES private.planet_group(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_owner boolean NOT NULL DEFAULT false,
  joined_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_online boolean NOT NULL DEFAULT false,

  UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS group_member_idx_group_id ON private.group_member(group_id);
CREATE INDEX IF NOT EXISTS group_member_idx_user_id ON private.group_member(user_id);

CREATE TABLE IF NOT EXISTS private.invite (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  group_id uuid NOT NULL REFERENCES private.planet_group(id) ON DELETE CASCADE,
  invited_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code text NOT NULL,
  expires_at timestamptz,
  is_accepted boolean NOT NULL DEFAULT false,

  CONSTRAINT invite_code_length CHECK (char_length(invite_code) >= 8 AND char_length(invite_code) <= 32)
);

CREATE INDEX IF NOT EXISTS invite_idx_group_id ON private.invite(group_id);
CREATE INDEX IF NOT EXISTS invite_idx_invited_by_user_id ON private.invite(invited_by_user_id);
CREATE INDEX IF NOT EXISTS invite_idx_invite_code ON private.invite(invite_code);

-- Reactions on group chat messages
CREATE TABLE IF NOT EXISTS private.group_chat_reaction (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  message_id uuid NOT NULL REFERENCES private.conversation_message(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji text NOT NULL,

  UNIQUE(message_id, user_id, emoji),
  CONSTRAINT reaction_emoji_length CHECK (char_length(emoji) >= 1 AND char_length(emoji) <= 10)
);

CREATE INDEX IF NOT EXISTS group_chat_reaction_idx_message_id ON private.group_chat_reaction(message_id);
CREATE INDEX IF NOT EXISTS group_chat_reaction_idx_user_id ON private.group_chat_reaction(user_id);

-- Crew nudge tracking: enforces 24-hour per-recipient cooldown
CREATE TABLE IF NOT EXISTS private.crew_nudge (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id uuid NOT NULL REFERENCES private.planet_group(id) ON DELETE CASCADE,
  nudged_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS crew_nudge_idx_recipient_group ON private.crew_nudge(recipient_id, group_id);
CREATE INDEX IF NOT EXISTS crew_nudge_idx_group_id ON private.crew_nudge(group_id);

-- 1_app/140_planet_group/5_planet_group-api-types.sql

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

-- 1_app/140_planet_group/7_planet_group-api-funcs.sql

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

-- 1_app/150_planet_swipe/1_planet_swipe-types.sql

CREATE TYPE public.swipe_action AS ENUM (
  'LIKE',
  'PASS',
  'SUPER_LIKE'
);

COMMENT ON TYPE public.swipe_action IS '
description: Type of swipe action on an activity card
values:
  LIKE: User is interested in the activity
  PASS: User is not interested
  SUPER_LIKE: User strongly wants this for the group
';

-- 1_app/150_planet_swipe/3_planet_swipe-tables.sql

CREATE TABLE IF NOT EXISTS private.swipe (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_id uuid NOT NULL REFERENCES private.activity(id) ON DELETE CASCADE,
  group_id uuid REFERENCES private.planet_group(id) ON DELETE SET NULL,
  action public.swipe_action NOT NULL
);

CREATE INDEX IF NOT EXISTS swipe_idx_user_id ON private.swipe(user_id);
CREATE INDEX IF NOT EXISTS swipe_idx_activity_id ON private.swipe(activity_id);
CREATE INDEX IF NOT EXISTS swipe_idx_group_id ON private.swipe(group_id) WHERE group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS swipe_idx_user_activity ON private.swipe(user_id, activity_id);

-- 1_app/150_planet_swipe/5_planet_swipe-api-types.sql

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

-- 1_app/150_planet_swipe/7_planet_swipe-api-funcs.sql

-- Create a swipe
CREATE OR REPLACE FUNCTION public."app:planetSwipe:create"(
  "activityId" uuid,
  "action" public.swipe_action,
  "groupId" uuid DEFAULT NULL
)
RETURNS public."SwipeV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
  INSERT INTO private.swipe (user_id, activity_id, group_id, action)
  SELECT auth.uid(), "activityId", "groupId", "action"
  WHERE auth.uid() IS NOT NULL AND "activityId" IS NOT NULL AND "action" IS NOT NULL
  RETURNING id, created_at, user_id, activity_id, group_id, action;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetSwipe:create" TO authenticated;

-- Read swipes for the current user (to filter already-swiped activities)
CREATE OR REPLACE FUNCTION public."app:planetSwipe:readAllByUser"(
  "limitCount" integer DEFAULT 100,
  "offsetCount" integer DEFAULT 0
)
RETURNS SETOF public."SwipeV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    s.id, s.created_at, s.user_id, s.activity_id, s.group_id, s.action
  FROM private.swipe s
  WHERE s.user_id = auth.uid()
  ORDER BY s.created_at DESC
  LIMIT "limitCount"
  OFFSET "offsetCount";
$$;

GRANT EXECUTE ON FUNCTION public."app:planetSwipe:readAllByUser" TO authenticated;

-- Read swipes for a group (to compute ranked activities)
CREATE OR REPLACE FUNCTION public."app:planetSwipe:readAllByGroup"(
  "groupId" uuid
)
RETURNS SETOF public."SwipeV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    s.id, s.created_at, s.user_id, s.activity_id, s.group_id, s.action
  FROM private.swipe s
  WHERE s.group_id = "groupId"
    AND private.check_user_is_group_member("groupId", auth.uid())
  ORDER BY s.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetSwipe:readAllByGroup" TO authenticated;

-- Undo last swipe
CREATE OR REPLACE FUNCTION public."app:planetSwipe:undoLast"()
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
  WITH deleted AS (
    DELETE FROM private.swipe s
    WHERE s.id = (
      SELECT s2.id FROM private.swipe s2
      WHERE s2.user_id = auth.uid()
      ORDER BY s2.created_at DESC
      LIMIT 1
    )
    RETURNING id
  )
  SELECT EXISTS(SELECT 1 FROM deleted);
$$;

GRANT EXECUTE ON FUNCTION public."app:planetSwipe:undoLast" TO authenticated;

-- Delete all swipe records for all users (admin only, used for one-time data cleanup)
CREATE OR REPLACE FUNCTION public."admin:planetSwipe:deleteAll"()
RETURNS integer
SET search_path = ''
LANGUAGE sql
AS $$
  WITH deleted AS (
    DELETE FROM private.swipe
    WHERE id IS NOT NULL
    RETURNING id
  )
  SELECT count(*)::integer FROM deleted;
$$;

GRANT EXECUTE ON FUNCTION public."admin:planetSwipe:deleteAll" TO service_role;

-- Delete all swipe records for the current user (to reset their discover feed)
CREATE OR REPLACE FUNCTION public."app:planetSwipe:deleteByUser"()
RETURNS integer
SECURITY DEFINER
SET search_path = ''
LANGUAGE sql
AS $$
  WITH deleted AS (
    DELETE FROM private.swipe s
    WHERE s.user_id = auth.uid()
      AND auth.uid() IS NOT NULL
    RETURNING id
  )
  SELECT count(*)::integer FROM deleted;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetSwipe:deleteByUser" TO authenticated;

-- Read discover feed: active activities with deal + business name, excluding already-swiped.
-- Defined here because it depends on private.swipe table.
CREATE OR REPLACE FUNCTION public."app:planetActivity:readDiscoverFeed"(
  "userLatitude" double precision DEFAULT NULL,
  "userLongitude" double precision DEFAULT NULL,
  "limitCount" integer DEFAULT 20,
  "offsetCount" integer DEFAULT 0
)
RETURNS SETOF public."ActivityDiscoverCardV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    ROW(
      a.id, a.created_at, a.updated_at, a.business_id,
      a.title, a.description, a.category, a.primary_image_url,
      a.additional_image_urls, a.price_range, a.operating_hours,
      a.tags, a.status, a.latitude, a.longitude, a.address, a.rating
    )::public."ActivityV1",
    (
      SELECT ROW(
        d.id, d.created_at, d.updated_at, d.business_id,
        d.headline, d.deal_type, d.discount_value_in_percent,
        d.discount_value_in_cents, d.terms_and_conditions,
        d.minimum_group_size, d.minimum_spend_in_cents,
        d.start_date, d.end_date, d.valid_time_start, d.valid_time_end,
        d.total_redemption_limit, d.per_user_redemption_limit,
        d.status, d.redemption_code
      )::public."DealV1"
      FROM private.deal d
      JOIN private.deal_activity da ON da.deal_id = d.id
      WHERE da.activity_id = a.id
        AND d.status = 'ACTIVE'
      LIMIT 1
    ),
    b.name
  )::public."ActivityDiscoverCardV1"
  FROM private.activity a
  JOIN private.business b ON b.id = a.business_id
  WHERE a.status = 'ACTIVE'
    AND auth.uid() IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM private.swipe s
      WHERE s.user_id = auth.uid()
        AND s.activity_id = a.id
    )
  ORDER BY a.id ASC
  LIMIT "limitCount"
  OFFSET "offsetCount";
$$;

GRANT EXECUTE ON FUNCTION public."app:planetActivity:readDiscoverFeed" TO authenticated;

-- Read recent liked/super-liked swipes with activity details for profile history
CREATE OR REPLACE FUNCTION public."app:planetSwipe:readRecentWithActivity"(
  "limitCount" integer DEFAULT 20
)
RETURNS SETOF public."SwipeWithActivityV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    ROW(
      s.id, s.created_at, s.user_id, s.activity_id, s.group_id, s.action
    )::public."SwipeV1",
    a.title,
    a.primary_image_url,
    a.category
  )::public."SwipeWithActivityV1"
  FROM private.swipe s
  JOIN private.activity a ON a.id = s.activity_id
  WHERE s.user_id = auth.uid()
    AND s.action IN ('LIKE', 'SUPER_LIKE')
  ORDER BY s.created_at DESC
  LIMIT "limitCount";
$$;

GRANT EXECUTE ON FUNCTION public."app:planetSwipe:readRecentWithActivity" TO authenticated;

-- User search/nearby functions that depend on private.group_member table.
-- Defined here instead of 100_planet_user because group_member is created in schema 140.

-- Search Planet users by name or username (excludes current user and existing group members)
CREATE OR REPLACE FUNCTION public."app:planetUser:search"(
  "query" text,
  "excludeGroupId" uuid DEFAULT NULL,
  "limitCount" integer DEFAULT 20
)
RETURNS SETOF public."PlanetUserSearchResultV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    p.id,
    COALESCE(p.full_name, p.given_name, 'User'),
    p.username,
    p.avatar_url,
    COALESCE(uap.is_verified, false)
  FROM private.profile p
  LEFT JOIN private.user_app_profile uap ON uap.user_id = p.id
  WHERE auth.uid() IS NOT NULL
    AND p.id != auth.uid()
    AND (
      p.full_name ILIKE '%' || "query" || '%'
      OR p.username ILIKE '%' || "query" || '%'
      OR p.given_name ILIKE '%' || "query" || '%'
    )
    AND (
      "excludeGroupId" IS NULL
      OR NOT EXISTS (
        SELECT 1 FROM private.group_member gm
        WHERE gm.group_id = "excludeGroupId" AND gm.user_id = p.id
      )
    )
  ORDER BY p.full_name ASC
  LIMIT "limitCount";
$$;

GRANT EXECUTE ON FUNCTION public."app:planetUser:search" TO authenticated;

-- Read nearby verified users (excludes current user and existing group members)
CREATE OR REPLACE FUNCTION public."app:planetUser:readNearby"(
  "userLatitude" double precision,
  "userLongitude" double precision,
  "radiusInKm" double precision DEFAULT 10.0,
  "excludeGroupId" uuid DEFAULT NULL,
  "limitCount" integer DEFAULT 20
)
RETURNS SETOF public."NearbyUserV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    p.id,
    COALESCE(p.full_name, p.given_name, 'User'),
    p.avatar_url,
    uap.is_verified,
    (
      6371 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians("userLatitude")) * cos(radians(uap.location_latitude))
          * cos(radians(uap.location_longitude) - radians("userLongitude"))
          + sin(radians("userLatitude")) * sin(radians(uap.location_latitude))
        ))
      )
    ) AS distance_km
  FROM private.user_app_profile uap
  JOIN private.profile p ON p.id = uap.user_id
  WHERE auth.uid() IS NOT NULL
    AND uap.user_id != auth.uid()
    AND uap.is_verified = true
    AND uap.location_latitude IS NOT NULL
    AND uap.location_longitude IS NOT NULL
    AND (
      6371 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians("userLatitude")) * cos(radians(uap.location_latitude))
          * cos(radians(uap.location_longitude) - radians("userLongitude"))
          + sin(radians("userLatitude")) * sin(radians(uap.location_latitude))
        ))
      )
    ) <= "radiusInKm"
    AND (
      "excludeGroupId" IS NULL
      OR NOT EXISTS (
        SELECT 1 FROM private.group_member gm
        WHERE gm.group_id = "excludeGroupId" AND gm.user_id = uap.user_id
      )
    )
  ORDER BY distance_km ASC
  LIMIT "limitCount";
$$;

GRANT EXECUTE ON FUNCTION public."app:planetUser:readNearby" TO authenticated;

-- Group-related functions that depend on private.swipe table.
-- Defined here instead of 140_planet_group because the swipe table is created in this schema.

-- Read recent swipe activity for a group with member and activity details
CREATE OR REPLACE FUNCTION public."app:planetGroup:readSwipeActivity"(
  "groupId" uuid,
  "limitCount" integer DEFAULT 10
)
RETURNS SETOF public."GroupSwipeActivityV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    s.id,
    COALESCE(p.full_name, p.given_name, 'User'),
    UPPER(LEFT(COALESCE(p.full_name, p.given_name, 'U'), 1)),
    s.action,
    a.title,
    a.primary_image_url,
    s.created_at
  FROM private.swipe s
  JOIN private.profile p ON p.id = s.user_id
  JOIN private.activity a ON a.id = s.activity_id
  WHERE s.group_id = "groupId"
    AND private.check_user_is_group_member("groupId", auth.uid())
  ORDER BY s.created_at DESC
  LIMIT "limitCount";
$$;

GRANT EXECUTE ON FUNCTION public."app:planetGroup:readSwipeActivity" TO authenticated;

-- Read ranked activities for a group based on aggregated swipes
CREATE OR REPLACE FUNCTION public."app:planetGroup:readRankedActivities"(
  "groupId" uuid,
  "limitCount" integer DEFAULT 10
)
RETURNS SETOF public."GroupRankedActivityV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    a.id,
    a.title,
    a.primary_image_url,
    count(*)::integer,
    EXISTS (
      SELECT 1 FROM private.deal_activity da
      JOIN private.deal d ON d.id = da.deal_id
      WHERE da.activity_id = a.id AND d.status = 'ACTIVE'
    )
  FROM private.swipe s
  JOIN private.activity a ON a.id = s.activity_id
  WHERE s.group_id = "groupId"
    AND s.action IN ('LIKE', 'SUPER_LIKE')
    AND private.check_user_is_group_member("groupId", auth.uid())
  GROUP BY a.id, a.title, a.primary_image_url
  ORDER BY count(*) DESC
  LIMIT "limitCount";
$$;

GRANT EXECUTE ON FUNCTION public."app:planetGroup:readRankedActivities" TO authenticated;

-- Read chat preview (last message) for a group's linked conversation
CREATE OR REPLACE FUNCTION public."app:planetGroup:readChatPreview"(
  "groupId" uuid
)
RETURNS public."GroupChatPreviewV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    COALESCE(p.full_name, p.given_name, 'User'),
    cm.content_text,
    cm.created_at
  )::public."GroupChatPreviewV1"
  FROM private.planet_group g
  JOIN private.conversation_message cm ON cm.conversation_id = g.conversation_id
  LEFT JOIN private.profile p ON p.id = cm.author_entity_id
  WHERE g.id = "groupId"
    AND g.conversation_id IS NOT NULL
    AND private.check_user_is_group_member("groupId", auth.uid())
  ORDER BY cm.created_at DESC
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetGroup:readChatPreview" TO authenticated;

-- 1_app/160_planet_battle/1_planet_battle-types.sql

CREATE TYPE public.battle_phase AS ENUM (
  'VOTING_OPEN',
  'VOTING_CLOSED',
  'CALCULATING',
  'WINNER_REVEALED'
);

COMMENT ON TYPE public.battle_phase IS '
description: Phases of a voting battle
values:
  VOTING_OPEN: Members can submit votes
  VOTING_CLOSED: Voting period ended
  CALCULATING: Processing final results
  WINNER_REVEALED: Battle complete with winner
';

-- 1_app/160_planet_battle/3_planet_battle-tables.sql

CREATE TABLE IF NOT EXISTS private.battle (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  group_id uuid NOT NULL REFERENCES private.planet_group(id) ON DELETE CASCADE,
  phase public.battle_phase NOT NULL DEFAULT 'VOTING_OPEN',
  duration_in_min integer NOT NULL DEFAULT 3,
  started_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ends_at timestamptz NOT NULL,
  winning_activity_id uuid REFERENCES private.activity(id) ON DELETE SET NULL,

  CONSTRAINT battle_duration_range CHECK (duration_in_min >= 1 AND duration_in_min <= 10)
);

CREATE INDEX IF NOT EXISTS battle_idx_group_id ON private.battle(group_id);
CREATE INDEX IF NOT EXISTS battle_idx_phase ON private.battle(phase);

CREATE TABLE IF NOT EXISTS private.battle_finalist (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid NOT NULL REFERENCES private.battle(id) ON DELETE CASCADE,
  activity_id uuid NOT NULL REFERENCES private.activity(id) ON DELETE CASCADE,
  vote_count integer NOT NULL DEFAULT 0,

  UNIQUE(battle_id, activity_id),
  CONSTRAINT vote_count_min CHECK (vote_count >= 0)
);

CREATE INDEX IF NOT EXISTS battle_finalist_idx_battle_id ON private.battle_finalist(battle_id);

CREATE TABLE IF NOT EXISTS private.vote (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  battle_id uuid NOT NULL REFERENCES private.battle(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_id uuid NOT NULL REFERENCES private.activity(id) ON DELETE CASCADE,
  rank integer,

  UNIQUE(battle_id, user_id, activity_id),
  CONSTRAINT vote_rank_range CHECK (rank IS NULL OR (rank >= 1 AND rank <= 10))
);

CREATE INDEX IF NOT EXISTS vote_idx_battle_id ON private.vote(battle_id);
CREATE INDEX IF NOT EXISTS vote_idx_user_id ON private.vote(user_id);

CREATE TABLE IF NOT EXISTS private.battle_mini_game_result (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  battle_id uuid NOT NULL REFERENCES private.battle(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type text NOT NULL,
  won boolean,
  reaction_time_in_ms integer,

  UNIQUE(battle_id, user_id)
);

CREATE INDEX IF NOT EXISTS battle_mini_game_result_idx_battle_id ON private.battle_mini_game_result(battle_id);

-- 1_app/160_planet_battle/5_planet_battle-api-types.sql

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

-- 1_app/160_planet_battle/7_planet_battle-api-funcs.sql

-- Create a new battle for a group
CREATE OR REPLACE FUNCTION public."app:planetBattle:create"(
  "groupId" uuid,
  "durationInMin" integer DEFAULT 3,
  "activityIds" uuid[] DEFAULT '{}'
)
RETURNS public."BattleWithFinalistsV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _battle_id uuid;
  _ends_at timestamptz;
  _result public."BattleWithFinalistsV1";
  _total_members integer;
  _ready_members integer;
BEGIN
  IF NOT private.check_user_is_group_member("groupId", auth.uid()) THEN
    RETURN NULL;
  END IF;

  -- Swipe gate: majority of members must have swiped >= 3 activities
  SELECT
    COUNT(*),
    COUNT(*) FILTER (
      WHERE (
        SELECT COUNT(s.id) FROM private.swipe s
        WHERE s.user_id = gm.user_id
          AND s.group_id = "groupId"
          AND s.action IN ('LIKE', 'SUPER_LIKE')
      ) >= 3
    )
  INTO _total_members, _ready_members
  FROM private.group_member gm
  WHERE gm.group_id = "groupId";

  IF _total_members > 0 AND _ready_members < CEILING(_total_members::numeric / 2) THEN
    RETURN NULL;
  END IF;

  _ends_at := CURRENT_TIMESTAMP + ("durationInMin" || ' minutes')::interval;

  INSERT INTO private.battle (group_id, duration_in_min, ends_at)
  VALUES ("groupId", "durationInMin", _ends_at)
  RETURNING id INTO STRICT _battle_id;

  -- Add finalists
  IF "activityIds" IS NOT NULL AND array_length("activityIds", 1) > 0 THEN
    INSERT INTO private.battle_finalist (battle_id, activity_id)
    SELECT COALESCE(_battle_id, '00000000-0000-0000-0000-000000000000'::uuid),
           COALESCE(_aid, '00000000-0000-0000-0000-000000000000'::uuid)
    FROM unnest("activityIds") AS _aid
    WHERE _aid IS NOT NULL;
  END IF;

  SELECT ROW(
    ROW(
      b.id, b.created_at, b.group_id, b.phase, b.duration_in_min,
      b.started_at, b.ends_at, b.winning_activity_id
    )::public."BattleV1",
    COALESCE(
      ARRAY(
        SELECT ROW(bf.id, bf.battle_id, bf.activity_id, bf.vote_count)::public."BattleFinalistV1"
        FROM private.battle_finalist bf
        WHERE bf.battle_id = b.id
      ),
      '{}'::public."BattleFinalistV1"[]
    )
  )::public."BattleWithFinalistsV1"
  INTO _result
  FROM private.battle b
  WHERE b.id = _battle_id;

  RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBattle:create" TO authenticated;

-- Read a battle with finalists
CREATE OR REPLACE FUNCTION public."app:planetBattle:readWithFinalists"(
  "battleId" uuid
)
RETURNS public."BattleWithFinalistsV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    ROW(
      b.id, b.created_at, b.group_id, b.phase, b.duration_in_min,
      b.started_at, b.ends_at, b.winning_activity_id
    )::public."BattleV1",
    COALESCE(
      ARRAY(
        SELECT ROW(bf.id, bf.battle_id, bf.activity_id, bf.vote_count)::public."BattleFinalistV1"
        FROM private.battle_finalist bf
        WHERE bf.battle_id = b.id
      ),
      '{}'::public."BattleFinalistV1"[]
    )
  )::public."BattleWithFinalistsV1"
  FROM private.battle b
  WHERE b.id = "battleId"
    AND private.check_user_is_group_member(b.group_id, auth.uid())
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBattle:readWithFinalists" TO authenticated;

-- Read all active battles for the current user
CREATE OR REPLACE FUNCTION public."app:planetBattle:readAllActive"()
RETURNS SETOF public."BattleWithFinalistsV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    ROW(
      b.id, b.created_at, b.group_id, b.phase, b.duration_in_min,
      b.started_at, b.ends_at, b.winning_activity_id
    )::public."BattleV1",
    COALESCE(
      ARRAY(
        SELECT ROW(bf.id, bf.battle_id, bf.activity_id, bf.vote_count)::public."BattleFinalistV1"
        FROM private.battle_finalist bf
        WHERE bf.battle_id = b.id
      ),
      '{}'::public."BattleFinalistV1"[]
    )
  )::public."BattleWithFinalistsV1"
  FROM private.battle b
  WHERE b.phase IN ('VOTING_OPEN', 'VOTING_CLOSED', 'CALCULATING')
    AND private.check_user_is_group_member(b.group_id, auth.uid())
  ORDER BY b.ends_at ASC;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBattle:readAllActive" TO authenticated;

-- Read recent battle results for the current user
CREATE OR REPLACE FUNCTION public."app:planetBattle:readAllRecent"(
  "sinceHours" integer DEFAULT 48
)
RETURNS SETOF public."BattleWithFinalistsV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    ROW(
      b.id, b.created_at, b.group_id, b.phase, b.duration_in_min,
      b.started_at, b.ends_at, b.winning_activity_id
    )::public."BattleV1",
    COALESCE(
      ARRAY(
        SELECT ROW(bf.id, bf.battle_id, bf.activity_id, bf.vote_count)::public."BattleFinalistV1"
        FROM private.battle_finalist bf
        WHERE bf.battle_id = b.id
      ),
      '{}'::public."BattleFinalistV1"[]
    )
  )::public."BattleWithFinalistsV1"
  FROM private.battle b
  WHERE b.phase = 'WINNER_REVEALED'
    AND b.started_at >= CURRENT_TIMESTAMP - ("sinceHours" || ' hours')::interval
    AND private.check_user_is_group_member(b.group_id, auth.uid())
  ORDER BY b.started_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBattle:readAllRecent" TO authenticated;

-- Cast a vote in a battle
CREATE OR REPLACE FUNCTION public."app:planetVote:create"(
  "battleId" uuid,
  "activityId" uuid,
  "rank" integer DEFAULT NULL
)
RETURNS public."VoteV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _result public."VoteV1";
  _user_id uuid;
  _battle_id uuid;
  _activity_id uuid;
BEGIN
  IF "battleId" IS NULL OR "activityId" IS NULL OR auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  _user_id := auth.uid();
  _battle_id := "battleId";
  _activity_id := "activityId";

  IF _user_id IS NULL OR _battle_id IS NULL OR _activity_id IS NULL THEN
    RETURN NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM private.battle b
    WHERE b.id = _battle_id
      AND b.phase = 'VOTING_OPEN'
      AND private.check_user_is_group_member(b.group_id, _user_id)
  ) THEN
    RETURN NULL;
  END IF;

  INSERT INTO private.vote (battle_id, user_id, activity_id, rank)
  VALUES (COALESCE(_battle_id, '00000000-0000-0000-0000-000000000000'::uuid),
          COALESCE(_user_id, '00000000-0000-0000-0000-000000000000'::uuid),
          COALESCE(_activity_id, '00000000-0000-0000-0000-000000000000'::uuid),
          "rank")
  ON CONFLICT (battle_id, user_id, activity_id) DO UPDATE SET
    rank = EXCLUDED.rank,
    created_at = CURRENT_TIMESTAMP;

  -- Update vote count on finalist
  UPDATE private.battle_finalist bf SET
      vote_count = COALESCE((
        SELECT count(*)::integer FROM private.vote v
        WHERE v.battle_id = bf.battle_id AND v.activity_id = bf.activity_id
    ), 0)
  WHERE bf.battle_id = COALESCE(_battle_id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND bf.activity_id = COALESCE(_activity_id, '00000000-0000-0000-0000-000000000000'::uuid);

  SELECT
    v.id, v.created_at, v.battle_id, v.user_id, v.activity_id, v.rank
  INTO _result
  FROM private.vote v
  WHERE v.battle_id = COALESCE(_battle_id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND v.user_id = COALESCE(_user_id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND v.activity_id = COALESCE(_activity_id, '00000000-0000-0000-0000-000000000000'::uuid);

  RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetVote:create" TO authenticated;

-- Read votes for a battle
CREATE OR REPLACE FUNCTION public."app:planetVote:readAllByBattle"(
  "battleId" uuid
)
RETURNS SETOF public."VoteV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    v.id, v.created_at, v.battle_id, v.user_id, v.activity_id, v.rank
  FROM private.vote v
  JOIN private.battle b ON b.id = v.battle_id
  WHERE v.battle_id = "battleId"
    AND private.check_user_is_group_member(b.group_id, auth.uid())
  ORDER BY v.created_at ASC;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetVote:readAllByBattle" TO authenticated;

-- Update battle phase (for group members)
-- When phase becomes WINNER_REVEALED, automatically checks for merge opportunities
CREATE OR REPLACE FUNCTION public."app:planetBattle:updatePhase"(
  "battleId" uuid,
  "phase" public.battle_phase,
  "winningActivityId" uuid DEFAULT NULL
)
RETURNS public."BattleV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _battle_id uuid;
  _phase public.battle_phase;
  _group_id uuid;
  _winning_activity_id uuid;
  _merge_request_id uuid;
  _current_host_id uuid;
  _other_group_id uuid;
  _other_host_id uuid;
  _result public."BattleV1";
BEGIN
  IF "battleId" IS NULL OR "phase" IS NULL THEN
    RETURN NULL;
  END IF;

  _battle_id := "battleId";
  _phase := "phase";

  UPDATE private.battle b SET
    phase = COALESCE(_phase, b.phase),
    winning_activity_id = COALESCE("winningActivityId", b.winning_activity_id)
  WHERE b.id = _battle_id
    AND _phase IS NOT NULL
    AND private.check_user_is_group_member(b.group_id, auth.uid());

  SELECT
    b.id, b.created_at, b.group_id, b.phase, b.duration_in_min,
    b.started_at, b.ends_at, b.winning_activity_id
  INTO _result
  FROM private.battle b
  WHERE b.id = _battle_id;

  -- Auto-detect merge opportunities when WINNER_REVEALED
  IF _phase = 'WINNER_REVEALED' AND _result IS NOT NULL THEN
    _group_id := (_result)."groupId";
    _winning_activity_id := (_result)."winningActivityId";

    IF _winning_activity_id IS NOT NULL THEN
      -- Get host of current group
      SELECT gm.user_id INTO _current_host_id
      FROM private.group_member gm
      WHERE gm.group_id = _group_id AND gm.is_owner = true
      LIMIT 1;

      -- Find other open groups that resolved to the same activity today
      FOR _other_group_id, _other_host_id IN
        SELECT DISTINCT b2.group_id, gm2.user_id
        FROM private.battle b2
        JOIN private.group_member gm2 ON gm2.group_id = b2.group_id AND gm2.is_owner = true
        JOIN private.planet_group pg2 ON pg2.id = b2.group_id
        WHERE b2.id != _battle_id
          AND b2.winning_activity_id = _winning_activity_id
          AND b2.phase = 'WINNER_REVEALED'
          AND DATE_TRUNC('day', b2.started_at AT TIME ZONE 'UTC') = DATE_TRUNC('day', CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
          AND pg2.is_open_to_strangers = true
          AND b2.group_id != _group_id
      LOOP
        -- Skip if recent merge request already exists between these groups
        CONTINUE WHEN EXISTS (
          SELECT 1 FROM private.merge_request mr
          WHERE (
            (mr.initiating_group_id = _group_id AND mr.other_group_id = _other_group_id)
            OR (mr.initiating_group_id = _other_group_id AND mr.other_group_id = _group_id)
          )
          AND mr.created_at >= CURRENT_TIMESTAMP - interval '24 hours'
        );

        -- Create merge request
        INSERT INTO private.merge_request (initiating_group_id, other_group_id, activity_id, battle_id, status)
        VALUES (_group_id, _other_group_id, _winning_activity_id, _battle_id, 'PENDING')
        RETURNING id INTO _merge_request_id;

        -- Notify initiating group host
        IF _current_host_id IS NOT NULL THEN
          INSERT INTO private.notification (user_id, type, title, body, linked_group_id, linked_activity_id, linked_merge_request_id)
          VALUES (
            _current_host_id,
            'MERGE_REQUEST',
            'Planet Collision Detected! 🌍',
            '2 crews chose the same spot tonight. Merge your planets?',
            _group_id,
            _winning_activity_id,
            _merge_request_id
          );
        END IF;

        -- Notify other group host
        IF _other_host_id IS NOT NULL THEN
          INSERT INTO private.notification (user_id, type, title, body, linked_group_id, linked_activity_id, linked_merge_request_id)
          VALUES (
            _other_host_id,
            'MERGE_REQUEST',
            'Planet Collision Detected! 🌍',
            '2 crews chose the same spot tonight. Merge your planets?',
            _other_group_id,
            _winning_activity_id,
            _merge_request_id
          );
        END IF;
      END LOOP;
    END IF;
  END IF;

  RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBattle:updatePhase" TO authenticated;

-- Count active battles for the current user
CREATE OR REPLACE FUNCTION public."app:planetBattle:countActive"()
RETURNS integer
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT count(*)::integer
  FROM private.battle b
  WHERE b.phase IN ('VOTING_OPEN', 'VOTING_CLOSED', 'CALCULATING')
    AND private.check_user_is_group_member(b.group_id, auth.uid());
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBattle:countActive" TO authenticated;

-- Read the active battle for a specific group with details
CREATE OR REPLACE FUNCTION public."app:planetBattle:readActiveByGroup"(
  "groupId" uuid
)
RETURNS public."BattleDetailV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    ROW(
      b.id, b.created_at, b.group_id, b.phase, b.duration_in_min,
      b.started_at, b.ends_at, b.winning_activity_id
    )::public."BattleV1",
    g.name,
    COALESCE((SELECT count(*)::integer FROM private.group_member gm WHERE gm.group_id = b.group_id), 0),
    COALESCE((
      SELECT count(DISTINCT v.user_id)::integer
      FROM private.vote v
      WHERE v.battle_id = b.id
    ), 0),
    COALESCE(
      ARRAY(
        SELECT ROW(
          bf.activity_id,
          a.title,
          a.primary_image_url,
          bf.vote_count,
          (
            SELECT d.headline
            FROM private.deal d
            JOIN private.deal_activity da ON da.deal_id = d.id
            WHERE da.activity_id = bf.activity_id
              AND d.status = 'ACTIVE'
            LIMIT 1
          ),
          a.address
        )::public."BattleFinalistDetailV1"
        FROM private.battle_finalist bf
        JOIN private.activity a ON a.id = bf.activity_id
        WHERE bf.battle_id = b.id
        ORDER BY bf.vote_count DESC
      ),
      '{}'::public."BattleFinalistDetailV1"[]
    ),
    NULL,
    NULL
  )::public."BattleDetailV1"
  FROM private.battle b
  JOIN private.planet_group g ON g.id = b.group_id
  WHERE b.group_id = "groupId"
    AND b.phase IN ('VOTING_OPEN', 'VOTING_CLOSED', 'CALCULATING')
    AND private.check_user_is_group_member("groupId", auth.uid())
  ORDER BY b.ends_at ASC
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBattle:readActiveByGroup" TO authenticated;

-- Read all groups for the current user with summary data (member count, initials, status, last activity).
-- Defined here because it depends on private.battle and private.swipe tables created in schemas 150 and 160.
CREATE OR REPLACE FUNCTION public."app:planetGroup:readAllWithSummary"()
RETURNS SETOF public."PlanetGroupSummaryV1"
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
    COALESCE((SELECT count(*)::integer FROM private.group_member gm2 WHERE gm2.group_id = g.id), 0),
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
      WHEN EXISTS (
        SELECT 1 FROM private.battle b
        WHERE b.group_id = g.id
          AND b.phase IN ('VOTING_OPEN', 'VOTING_CLOSED', 'CALCULATING')
      ) THEN 'BATTLE_ACTIVE'
      WHEN EXISTS (
        SELECT 1 FROM private.swipe s
        JOIN private.group_member gm4 ON gm4.user_id = s.user_id AND gm4.group_id = g.id
        WHERE s.group_id = g.id
          AND s.created_at >= CURRENT_TIMESTAMP - interval '24 hours'
      ) THEN 'DECIDING'
      ELSE 'IDLE'
    END,
    COALESCE(
      GREATEST(
        g.updated_at,
        (SELECT MAX(b2.created_at) FROM private.battle b2 WHERE b2.group_id = g.id),
        (SELECT MAX(s2.created_at) FROM private.swipe s2 WHERE s2.group_id = g.id)
      ),
      g.updated_at
    )
  )::public."PlanetGroupSummaryV1"
  FROM private.planet_group g
  JOIN private.group_member gm ON gm.group_id = g.id
  WHERE gm.user_id = auth.uid()
  ORDER BY COALESCE(
    GREATEST(
      g.updated_at,
      (SELECT MAX(b3.created_at) FROM private.battle b3 WHERE b3.group_id = g.id),
      (SELECT MAX(s3.created_at) FROM private.swipe s3 WHERE s3.group_id = g.id)
    ),
    g.updated_at
  ) DESC;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetGroup:readAllWithSummary" TO authenticated;

-- Read all active battles with group name, participant counts, and activity details
CREATE OR REPLACE FUNCTION public."app:planetBattle:readAllActiveWithDetails"()
RETURNS SETOF public."BattleDetailV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    ROW(
      b.id, b.created_at, b.group_id, b.phase, b.duration_in_min,
      b.started_at, b.ends_at, b.winning_activity_id
    )::public."BattleV1",
    g.name,
    COALESCE((SELECT count(*)::integer FROM private.group_member gm WHERE gm.group_id = b.group_id), 0),
    COALESCE((
      SELECT count(DISTINCT v.user_id)::integer
      FROM private.vote v
      WHERE v.battle_id = b.id
    ), 0),
    COALESCE(
      ARRAY(
        SELECT ROW(
          bf.activity_id,
          a.title,
          a.primary_image_url,
          bf.vote_count,
          (
            SELECT d.headline
            FROM private.deal d
            JOIN private.deal_activity da ON da.deal_id = d.id
            WHERE da.activity_id = bf.activity_id
              AND d.status = 'ACTIVE'
            LIMIT 1
          ),
          a.address
        )::public."BattleFinalistDetailV1"
        FROM private.battle_finalist bf
        JOIN private.activity a ON a.id = bf.activity_id
        WHERE bf.battle_id = b.id
        ORDER BY bf.vote_count DESC
      ),
      '{}'::public."BattleFinalistDetailV1"[]
    ),
    NULL,
    NULL
  )::public."BattleDetailV1"
  FROM private.battle b
  JOIN private.planet_group g ON g.id = b.group_id
  WHERE b.phase IN ('VOTING_OPEN', 'VOTING_CLOSED', 'CALCULATING')
    AND private.check_user_is_group_member(b.group_id, auth.uid())
  ORDER BY b.ends_at ASC;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBattle:readAllActiveWithDetails" TO authenticated;

-- Read member voting statuses for a battle
CREATE OR REPLACE FUNCTION public."app:planetBattle:readMemberStatuses"(
  "battleId" uuid
)
RETURNS SETOF public."BattleMemberStatusV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    gm.user_id,
    COALESCE(p.full_name, p.given_name, 'User'),
    UPPER(LEFT(COALESCE(p.full_name, p.given_name, 'U'), 1)),
    EXISTS (
      SELECT 1 FROM private.vote v
      WHERE v.battle_id = "battleId" AND v.user_id = gm.user_id
    )
  FROM private.battle b
  JOIN private.group_member gm ON gm.group_id = b.group_id
  LEFT JOIN private.profile p ON p.id = gm.user_id
  WHERE b.id = "battleId"
    AND private.check_user_is_group_member(b.group_id, auth.uid())
  ORDER BY gm.joined_at ASC;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBattle:readMemberStatuses" TO authenticated;

-- Lock in votes for a battle (batch create votes with ranks)
CREATE OR REPLACE FUNCTION public."app:planetBattle:lockInVotes"(
  "battleId" uuid,
  "activityIds" uuid[]
)
RETURNS SETOF public."VoteV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _activity_id uuid;
  _rank integer;
  _user_id uuid;
  _battle_id uuid;
BEGIN
  IF "battleId" IS NULL OR "activityIds" IS NULL OR auth.uid() IS NULL THEN
    RETURN;
  END IF;

  _user_id := auth.uid();
  _battle_id := "battleId";

  IF _user_id IS NULL OR _battle_id IS NULL THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM private.battle b
    WHERE b.id = _battle_id
      AND b.phase = 'VOTING_OPEN'
      AND private.check_user_is_group_member(b.group_id, _user_id)
  ) THEN
    RETURN;
  END IF;

  _rank := 1;
  FOR i IN 1..array_length("activityIds", 1) LOOP
    IF "activityIds"[i] IS NULL THEN
      CONTINUE;
    END IF;

    _activity_id := "activityIds"[i];

    INSERT INTO private.vote (battle_id, user_id, activity_id, rank)
    VALUES (COALESCE(_battle_id, '00000000-0000-0000-0000-000000000000'::uuid),
            COALESCE(_user_id, '00000000-0000-0000-0000-000000000000'::uuid),
            COALESCE(_activity_id, '00000000-0000-0000-0000-000000000000'::uuid),
            _rank)
    ON CONFLICT (battle_id, user_id, activity_id) DO UPDATE SET
      rank = EXCLUDED.rank,
      created_at = CURRENT_TIMESTAMP;

    -- Update vote count on finalist
    UPDATE private.battle_finalist bf SET
      vote_count = COALESCE((
        SELECT count(*)::integer FROM private.vote v
        WHERE v.battle_id = bf.battle_id AND v.activity_id = bf.activity_id
      ), 0)
    WHERE bf.battle_id = COALESCE(_battle_id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND bf.activity_id = COALESCE(_activity_id, '00000000-0000-0000-0000-000000000000'::uuid);

    _rank := _rank + 1;
  END LOOP;

  RETURN QUERY
    SELECT
      v.id::public.uuid_notnull,
      v.created_at::public.timestamptz_notnull,
      v.battle_id::public.uuid_notnull,
      v.user_id::public.uuid_notnull,
      v.activity_id::public.uuid_notnull,
      v.rank
    FROM private.vote v
    WHERE v.battle_id = COALESCE(_battle_id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND v.user_id = COALESCE(_user_id, '00000000-0000-0000-0000-000000000000'::uuid)
    ORDER BY v.rank ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBattle:lockInVotes" TO authenticated;

-- Read aggregated stats for the current user's profile.
-- Defined here because it depends on private.group_member (140), private.battle (160),
-- private.vote (160), and private.swipe (150) tables.
CREATE OR REPLACE FUNCTION public."app:planetUser:readStats"()
RETURNS public."UserStatsV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    -- groupsCount: number of groups the user belongs to
    COALESCE((
      SELECT count(*)::integer
      FROM private.group_member gm
      WHERE gm.user_id = auth.uid()
    ), 0),
    -- battlesWon: battles where user voted for the winning activity
    COALESCE((
      SELECT count(DISTINCT b.id)::integer
      FROM private.battle b
      JOIN private.vote v ON v.battle_id = b.id AND v.user_id = auth.uid()
      WHERE b.phase = 'WINNER_REVEALED'
        AND b.winning_activity_id = v.activity_id
    ), 0),
    -- activitiesDiscovered: total swipes by the user
    COALESCE((
      SELECT count(*)::integer
      FROM private.swipe s
      WHERE s.user_id = auth.uid()
    ), 0)
  )::public."UserStatsV1";
$$;

GRANT EXECUTE ON FUNCTION public."app:planetUser:readStats" TO authenticated;

-- Read the full battle results for the most recent completed battle in a group
CREATE OR REPLACE FUNCTION public."app:planetBattle:readResultsByGroup"(
  "groupId" uuid
)
RETURNS public."BattleResultsV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    -- battle
    ROW(
      b.id, b.created_at, b.group_id, b.phase, b.duration_in_min,
      b.started_at, b.ends_at, b.winning_activity_id
    )::public."BattleV1",
    -- groupName
    g.name,
    -- winnerActivity
    (
      SELECT ROW(
        wa.id, wa.created_at, wa.updated_at, wa.business_id,
        wa.title, wa.description, wa.category, wa.primary_image_url,
        wa.additional_image_urls, wa.price_range, wa.operating_hours,
        wa.tags, wa.status, wa.latitude, wa.longitude, wa.address, wa.rating
      )::public."ActivityV1"
      FROM private.activity wa
      WHERE wa.id = b.winning_activity_id
    ),
    -- winnerDeal
    (
      SELECT ROW(
        d.id, d.created_at, d.updated_at, d.business_id,
        d.headline, d.deal_type, d.discount_value_in_percent,
        d.discount_value_in_cents, d.terms_and_conditions,
        d.minimum_group_size, d.minimum_spend_in_cents,
        d.start_date, d.end_date, d.valid_time_start, d.valid_time_end,
        d.total_redemption_limit, d.per_user_redemption_limit,
        d.status, d.redemption_code
      )::public."DealV1"
      FROM private.deal d
      JOIN private.deal_activity da ON da.deal_id = d.id
      WHERE da.activity_id = b.winning_activity_id
        AND d.status = 'ACTIVE'
      LIMIT 1
    ),
    -- finalists
    COALESCE(
      ARRAY(
        SELECT ROW(
          bf.activity_id,
          a.title,
          a.primary_image_url,
          bf.vote_count,
          (
            SELECT d.headline
            FROM private.deal d
            JOIN private.deal_activity da ON da.deal_id = d.id
            WHERE da.activity_id = bf.activity_id
              AND d.status = 'ACTIVE'
            LIMIT 1
          ),
          a.address
        )::public."BattleFinalistDetailV1"
        FROM private.battle_finalist bf
        JOIN private.activity a ON a.id = bf.activity_id
        WHERE bf.battle_id = b.id
        ORDER BY bf.vote_count DESC
      ),
      '{}'::public."BattleFinalistDetailV1"[]
    ),
    -- memberVotes
    COALESCE(
      ARRAY(
        SELECT ROW(
          gm.user_id,
          COALESCE(p.full_name, p.given_name, 'User'),
          UPPER(LEFT(COALESCE(p.full_name, p.given_name, 'U'), 1)),
          (
            SELECT v.activity_id
            FROM private.vote v
            WHERE v.battle_id = b.id AND v.user_id = gm.user_id
            ORDER BY v.rank ASC NULLS LAST, v.created_at ASC
            LIMIT 1
          )
        )::public."BattleMemberVoteV1"
        FROM private.group_member gm
        LEFT JOIN private.profile p ON p.id = gm.user_id
        WHERE gm.group_id = b.group_id
        ORDER BY gm.joined_at ASC
      ),
      '{}'::public."BattleMemberVoteV1"[]
    )
  )::public."BattleResultsV1"
  FROM private.battle b
  JOIN private.planet_group g ON g.id = b.group_id
  WHERE b.group_id = "groupId"
    AND b.phase = 'WINNER_REVEALED'
    AND private.check_user_is_group_member("groupId", auth.uid())
  ORDER BY b.started_at DESC
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBattle:readResultsByGroup" TO authenticated;

-- Read recent completed battles with group name, winner details
CREATE OR REPLACE FUNCTION public."app:planetBattle:readAllRecentWithDetails"(
  "sinceHours" integer DEFAULT 48
)
RETURNS SETOF public."BattleDetailV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT ROW(
    ROW(
      b.id, b.created_at, b.group_id, b.phase, b.duration_in_min,
      b.started_at, b.ends_at, b.winning_activity_id
    )::public."BattleV1",
    g.name,
    COALESCE((SELECT count(*)::integer FROM private.group_member gm WHERE gm.group_id = b.group_id), 0),
    COALESCE((
      SELECT count(DISTINCT v.user_id)::integer
      FROM private.vote v
      WHERE v.battle_id = b.id
    ), 0),
    COALESCE(
      ARRAY(
        SELECT ROW(
          bf.activity_id,
          a.title,
          a.primary_image_url,
          bf.vote_count,
          (
            SELECT d.headline
            FROM private.deal d
            JOIN private.deal_activity da ON da.deal_id = d.id
            WHERE da.activity_id = bf.activity_id
              AND d.status = 'ACTIVE'
            LIMIT 1
          ),
          a.address
        )::public."BattleFinalistDetailV1"
        FROM private.battle_finalist bf
        JOIN private.activity a ON a.id = bf.activity_id
        WHERE bf.battle_id = b.id
        ORDER BY bf.vote_count DESC
      ),
      '{}'::public."BattleFinalistDetailV1"[]
    ),
    wa.title,
    wa.primary_image_url
  )::public."BattleDetailV1"
  FROM private.battle b
  JOIN private.planet_group g ON g.id = b.group_id
  LEFT JOIN private.activity wa ON wa.id = b.winning_activity_id
  WHERE b.phase = 'WINNER_REVEALED'
    AND b.started_at >= CURRENT_TIMESTAMP - ("sinceHours" || ' hours')::interval
    AND private.check_user_is_group_member(b.group_id, auth.uid())
  ORDER BY b.started_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBattle:readAllRecentWithDetails" TO authenticated;

-- Start a mini game (marks user as PLAYING)
CREATE OR REPLACE FUNCTION public."app:planetBattle:startMiniGame"(
  "battleId" uuid,
  "gameType" text
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _user_id uuid;
  _battle_id uuid;
BEGIN
  IF "battleId" IS NULL OR "gameType" IS NULL OR auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  _user_id := auth.uid();
  _battle_id := "battleId";

  IF NOT EXISTS (
    SELECT 1 FROM private.battle b
    WHERE b.id = _battle_id
      AND b.phase = 'VOTING_OPEN'
      AND private.check_user_is_group_member(b.group_id, _user_id)
  ) THEN
    RETURN false;
  END IF;

  INSERT INTO private.battle_mini_game_result (battle_id, user_id, game_type)
  VALUES (COALESCE(_battle_id, '00000000-0000-0000-0000-000000000000'::uuid),
          COALESCE(_user_id, '00000000-0000-0000-0000-000000000000'::uuid),
          "gameType")
  ON CONFLICT (battle_id, user_id) DO UPDATE SET
    game_type = EXCLUDED.game_type,
    won = NULL,
    reaction_time_in_ms = NULL,
    created_at = CURRENT_TIMESTAMP;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBattle:startMiniGame" TO authenticated;

-- Complete a mini game with result
CREATE OR REPLACE FUNCTION public."app:planetBattle:completeMiniGame"(
  "battleId" uuid,
  "won" boolean,
  "reactionTimeInMs" integer DEFAULT NULL
)
RETURNS boolean
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _user_id uuid;
  _battle_id uuid;
  _won boolean;
  _reaction_time_in_ms integer;
BEGIN
  IF "battleId" IS NULL OR auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  _user_id := auth.uid();
  _battle_id := "battleId";
  _won := "won";
  _reaction_time_in_ms := "reactionTimeInMs";

  UPDATE private.battle_mini_game_result
  SET won = _won,
      reaction_time_in_ms = _reaction_time_in_ms
  WHERE battle_id = COALESCE(_battle_id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND user_id = COALESCE(_user_id, '00000000-0000-0000-0000-000000000000'::uuid);

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBattle:completeMiniGame" TO authenticated;

-- Read mini game results for a battle (for reaction time leaderboard)
CREATE OR REPLACE FUNCTION public."app:planetBattle:readMiniGameResults"(
  "battleId" uuid
)
RETURNS SETOF public."BattleMiniGameResultV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    mgr.user_id,
    COALESCE(p.full_name, p.given_name, 'User'),
    mgr.game_type,
    mgr.won,
    mgr.reaction_time_in_ms
  FROM private.battle_mini_game_result mgr
  JOIN private.battle b ON b.id = mgr.battle_id
  LEFT JOIN private.profile p ON p.id = mgr.user_id
  WHERE mgr.battle_id = "battleId"
    AND private.check_user_is_group_member(b.group_id, auth.uid())
  ORDER BY mgr.reaction_time_in_ms ASC NULLS LAST;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBattle:readMiniGameResults" TO authenticated;

-- 1_app/165_planet_merge/1_planet_merge-types.sql

CREATE TYPE public.merge_request_status AS ENUM (
  'PENDING',
  'INITIATED',
  'MERGED',
  'DECLINED'
);

-- 1_app/165_planet_merge/3_planet_merge-tables.sql

CREATE TABLE IF NOT EXISTS private.merge_request (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  initiating_group_id uuid NOT NULL REFERENCES private.planet_group(id) ON DELETE CASCADE,
  other_group_id uuid NOT NULL REFERENCES private.planet_group(id) ON DELETE CASCADE,
  activity_id uuid REFERENCES private.activity(id) ON DELETE SET NULL,
  battle_id uuid REFERENCES private.battle(id) ON DELETE SET NULL,
  status public.merge_request_status NOT NULL DEFAULT 'PENDING'
);

CREATE INDEX IF NOT EXISTS merge_request_idx_initiating_group ON private.merge_request(initiating_group_id);
CREATE INDEX IF NOT EXISTS merge_request_idx_other_group ON private.merge_request(other_group_id);
CREATE INDEX IF NOT EXISTS merge_request_idx_status ON private.merge_request(status);

CREATE TABLE IF NOT EXISTS private.orbit_channel (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  group_id_1 uuid NOT NULL REFERENCES private.planet_group(id) ON DELETE CASCADE,
  group_id_2 uuid NOT NULL REFERENCES private.planet_group(id) ON DELETE CASCADE,
  merge_request_id uuid NOT NULL REFERENCES private.merge_request(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES private.conversation(id) ON DELETE SET NULL,
  UNIQUE(merge_request_id)
);

CREATE INDEX IF NOT EXISTS orbit_channel_idx_group_1 ON private.orbit_channel(group_id_1);
CREATE INDEX IF NOT EXISTS orbit_channel_idx_group_2 ON private.orbit_channel(group_id_2);

-- 1_app/165_planet_merge/5_planet_merge-api-types.sql

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

-- 1_app/165_planet_merge/7_planet_merge-api-funcs.sql

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

-- 1_app/170_planet_notif/1_planet_notif-types.sql

CREATE TYPE public.notification_type AS ENUM (
  'GROUP_INVITE',
  'BATTLE_STARTED',
  'BATTLE_ENDED',
  'DEAL_EXPIRING',
  'FRIEND_JOINED',
  'GROUP_ACTIVITY',
  'MERGE_REQUEST',
  'MERGE_INITIATED',
  'MERGE_DECLINED',
  'ORBIT_ACTIVITY'
);

COMMENT ON TYPE public.notification_type IS '
description: Types of notifications in the Planet app
values:
  GROUP_INVITE: Invitation to join a group
  BATTLE_STARTED: A voting battle has begun
  BATTLE_ENDED: Battle complete with winner
  DEAL_EXPIRING: A saved deal is expiring soon
  FRIEND_JOINED: A friend joined Planet
  GROUP_ACTIVITY: Activity in a group
  MERGE_REQUEST: Two groups chose the same activity tonight
  MERGE_INITIATED: Initiating host wants to merge
  MERGE_DECLINED: Other group declined the merge
  ORBIT_ACTIVITY: A group you are orbiting has selected an activity
';

-- 1_app/170_planet_notif/3_planet_notif-tables.sql

CREATE TABLE IF NOT EXISTS private.notification (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  linked_group_id uuid REFERENCES private.planet_group(id) ON DELETE SET NULL,
  linked_activity_id uuid REFERENCES private.activity(id) ON DELETE SET NULL,
  linked_battle_id uuid REFERENCES private.battle(id) ON DELETE SET NULL,
  linked_merge_request_id uuid REFERENCES private.merge_request(id) ON DELETE SET NULL,
  is_read boolean NOT NULL DEFAULT false,

  CONSTRAINT notification_title_length CHECK (char_length(title) <= 100),
  CONSTRAINT notification_body_length CHECK (char_length(body) <= 300)
);

CREATE INDEX IF NOT EXISTS notification_idx_user_id ON private.notification(user_id);
CREATE INDEX IF NOT EXISTS notification_idx_is_read ON private.notification(user_id, is_read) WHERE is_read = false;

-- 1_app/170_planet_notif/5_planet_notif-api-types.sql

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

-- 1_app/170_planet_notif/7_planet_notif-api-funcs.sql

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

-- 1_app/180_planet_verify/3_planet_verify-tables.sql

CREATE TABLE IF NOT EXISTS private.verification_document (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  id_document_url text NOT NULL,
  selfie_url text NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at timestamptz
);

CREATE INDEX IF NOT EXISTS verification_document_idx_user_id ON private.verification_document(user_id);

-- 1_app/180_planet_verify/5_planet_verify-api-types.sql

CREATE TYPE public."VerificationDocumentV1" AS (
  id uuid_notnull,
  "userId" uuid_notnull,
  "idDocumentUrl" text,
  "selfieUrl" text,
  "submittedAt" timestamptz_notnull,
  "reviewedAt" timestamptz
);

-- 1_app/180_planet_verify/7_planet_verify-api-funcs.sql

-- Submit verification documents
CREATE OR REPLACE FUNCTION public."app:planetVerify:submit"(
  "idDocumentUrl" text,
  "selfieUrl" text
)
RETURNS public."VerificationDocumentV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _result public."VerificationDocumentV1";
  _user_id uuid;
BEGIN
  _user_id := auth.uid();
  IF "idDocumentUrl" IS NULL OR "selfieUrl" IS NULL OR _user_id IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO private.verification_document (user_id, id_document_url, selfie_url)
  VALUES (_user_id, "idDocumentUrl", "selfieUrl")
  RETURNING id, user_id, id_document_url, selfie_url, submitted_at, reviewed_at
  INTO _result;

  -- Update user verification status to PENDING
  UPDATE private.user_app_profile SET
    verification_status = 'PENDING',
    updated_at = CURRENT_TIMESTAMP
  WHERE user_id = _user_id;

  RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetVerify:submit" TO authenticated;

-- Read the current user's latest verification document
CREATE OR REPLACE FUNCTION public."app:planetVerify:read"()
RETURNS public."VerificationDocumentV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    vd.id, vd.user_id, vd.id_document_url, vd.selfie_url,
    vd.submitted_at, vd.reviewed_at
  FROM private.verification_document vd
  WHERE vd.user_id = auth.uid()
  ORDER BY vd.submitted_at DESC
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetVerify:read" TO authenticated;

-- Admin: review a verification document
CREATE OR REPLACE FUNCTION public."admin:planetVerify:review"(
  "documentId" uuid,
  "approved" boolean
)
RETURNS void
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _user_id uuid;
  _new_status public.verification_status;
  _is_verified boolean;
BEGIN
  IF "documentId" IS NULL OR "approved" IS NULL THEN
    RETURN;
  END IF;

  SELECT vd.user_id INTO _user_id
  FROM private.verification_document vd
  WHERE vd.id = "documentId";

  IF _user_id IS NULL THEN
    RETURN;
  END IF;

  UPDATE private.verification_document SET
    reviewed_at = CURRENT_TIMESTAMP
  WHERE id = "documentId";

  IF "approved" THEN
    _new_status := 'VERIFIED'::public.verification_status;
    _is_verified := true;
  ELSE
    _new_status := 'FAILED'::public.verification_status;
    _is_verified := false;
  END IF;

  UPDATE private.user_app_profile SET
    verification_status = COALESCE(_new_status, verification_status),
    is_verified = COALESCE(_is_verified, is_verified),
    updated_at = CURRENT_TIMESTAMP
  WHERE user_id = _user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public."admin:planetVerify:review" TO service_role;

-- 1_app/180_planet_verify/8_planet_verify-buckets.sql

INSERT INTO storage.buckets (id, name)
  VALUES ('verification-documents', 'verification-documents')
  ON CONFLICT (id) DO NOTHING;

-- Only the document owner can read their own verification documents
CREATE POLICY "Users can read their own verification documents" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'verification-documents'
    AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
  );

-- Authenticated users can upload verification documents to their own folder
CREATE POLICY "Users can upload their own verification documents" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'verification-documents'
    AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
  );

-- Users can update their own verification documents
CREATE POLICY "Users can update their own verification documents" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'verification-documents'
    AND (SELECT auth.uid())::text = owner_id::text
  )
  WITH CHECK (
    bucket_id = 'verification-documents'
    AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
  );

-- Service role has full access for admin review
CREATE POLICY "Service role has full access to verification documents" ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'verification-documents')
  WITH CHECK (bucket_id = 'verification-documents');

-- 1_app/190_planet_biz_dash/3_planet_biz_dash-tables.sql

-- Daily aggregated analytics per business for time-series charts and trend calculations
CREATE TABLE IF NOT EXISTS private.biz_analytics_daily (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES private.business(id) ON DELETE CASCADE,
  date date NOT NULL,
  impressions integer NOT NULL DEFAULT 0,
  unique_viewers integer NOT NULL DEFAULT 0,
  swipes integer NOT NULL DEFAULT 0,
  deal_redemptions integer NOT NULL DEFAULT 0,
  revenue_estimate_in_cents integer NOT NULL DEFAULT 0,

  UNIQUE(business_id, date),
  CONSTRAINT biz_analytics_daily_impressions_min CHECK (impressions >= 0),
  CONSTRAINT biz_analytics_daily_unique_viewers_min CHECK (unique_viewers >= 0),
  CONSTRAINT biz_analytics_daily_swipes_min CHECK (swipes >= 0),
  CONSTRAINT biz_analytics_daily_deal_redemptions_min CHECK (deal_redemptions >= 0),
  CONSTRAINT biz_analytics_daily_revenue_min CHECK (revenue_estimate_in_cents >= 0)
);

CREATE INDEX IF NOT EXISTS biz_analytics_daily_idx_business_id ON private.biz_analytics_daily(business_id);
CREATE INDEX IF NOT EXISTS biz_analytics_daily_idx_date ON private.biz_analytics_daily(date);
CREATE INDEX IF NOT EXISTS biz_analytics_daily_idx_business_date ON private.biz_analytics_daily(business_id, date);

-- 1_app/190_planet_biz_dash/5_planet_biz_dash-api-types.sql

-- Single day of analytics data for charts
CREATE TYPE public."BizAnalyticsDailyV1" AS (
  date date_notnull,
  impressions int_notnull,
  "uniqueViewers" int_notnull,
  swipes int_notnull,
  "dealRedemptions" int_notnull,
  "revenueEstimateInCents" int_notnull
);

-- Overview metrics with trend comparison against previous period
CREATE TYPE public."BizAnalyticsOverviewV1" AS (
  "totalImpressions" int_notnull,
  "totalUniqueViewers" int_notnull,
  "totalSwipes" int_notnull,
  "swipeRatePercent" double precision,
  "totalDealRedemptions" int_notnull,
  "revenueEstimateInCents" int_notnull,
  "prevTotalImpressions" int_notnull,
  "prevTotalUniqueViewers" int_notnull,
  "prevTotalSwipes" int_notnull,
  "prevSwipeRatePercent" double precision,
  "prevTotalDealRedemptions" int_notnull,
  "prevRevenueEstimateInCents" int_notnull
);

-- Per-activity analytics breakdown
CREATE TYPE public."BizActivityAnalyticsV1" AS (
  "activityId" uuid_notnull,
  title text,
  impressions int_notnull,
  swipes int_notnull,
  "conversionPercent" double precision
);

-- Per-deal analytics with peak redemption time
CREATE TYPE public."BizDealAnalyticsV1" AS (
  "dealId" uuid_notnull,
  headline text,
  "redemptionRatePercent" double precision,
  "peakHour" int_notnull,
  "totalRedemptions" int_notnull
);

-- 1_app/190_planet_biz_dash/7_planet_biz_dash-api-funcs.sql

-- Read overview analytics for a business within a date range, with comparison to previous period
CREATE OR REPLACE FUNCTION public."app:planetBizDash:readOverview"(
  "businessId" uuid,
  "startDate" date,
  "endDate" date
)
RETURNS public."BizAnalyticsOverviewV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  WITH period_days AS (
    SELECT ("endDate" - "startDate" + 1) AS day_count
  ),
  current_period AS (
    SELECT
      COALESCE(SUM(bad.impressions), 0)::integer AS total_impressions,
      COALESCE(SUM(bad.unique_viewers), 0)::integer AS total_unique_viewers,
      COALESCE(SUM(bad.swipes), 0)::integer AS total_swipes,
      COALESCE(SUM(bad.deal_redemptions), 0)::integer AS total_deal_redemptions,
      COALESCE(SUM(bad.revenue_estimate_in_cents), 0)::integer AS total_revenue
    FROM private.biz_analytics_daily bad
    WHERE bad.business_id = "businessId"
      AND bad.date >= "startDate"
      AND bad.date <= "endDate"
  ),
  prev_period AS (
    SELECT
      COALESCE(SUM(bad.impressions), 0)::integer AS total_impressions,
      COALESCE(SUM(bad.unique_viewers), 0)::integer AS total_unique_viewers,
      COALESCE(SUM(bad.swipes), 0)::integer AS total_swipes,
      COALESCE(SUM(bad.deal_redemptions), 0)::integer AS total_deal_redemptions,
      COALESCE(SUM(bad.revenue_estimate_in_cents), 0)::integer AS total_revenue
    FROM private.biz_analytics_daily bad
    CROSS JOIN period_days pd
    WHERE bad.business_id = "businessId"
      AND bad.date >= ("startDate" - pd.day_count)
      AND bad.date < "startDate"
  )
  SELECT ROW(
    COALESCE(cp.total_impressions, 0)::int_notnull,
    COALESCE(cp.total_unique_viewers, 0)::int_notnull,
    COALESCE(cp.total_swipes, 0)::int_notnull,
    CASE WHEN cp.total_impressions > 0
      THEN ROUND((cp.total_swipes::double precision / cp.total_impressions * 100)::numeric, 1)::double precision
      ELSE 0
    END,
    COALESCE(cp.total_deal_redemptions, 0)::int_notnull,
    COALESCE(cp.total_revenue, 0)::int_notnull,
    COALESCE(pp.total_impressions, 0)::int_notnull,
    COALESCE(pp.total_unique_viewers, 0)::int_notnull,
    COALESCE(pp.total_swipes, 0)::int_notnull,
    CASE WHEN pp.total_impressions > 0
      THEN ROUND((pp.total_swipes::double precision / pp.total_impressions * 100)::numeric, 1)::double precision
      ELSE 0
    END,
    COALESCE(pp.total_deal_redemptions, 0)::int_notnull,
    COALESCE(pp.total_revenue, 0)::int_notnull
  )::public."BizAnalyticsOverviewV1"
  FROM current_period cp, prev_period pp
  WHERE EXISTS (
    SELECT 1 FROM private.business b
    WHERE b.id = "businessId" AND b.owner_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBizDash:readOverview" TO authenticated;

-- Read daily metrics for charts
CREATE OR REPLACE FUNCTION public."app:planetBizDash:readDailyMetrics"(
  "businessId" uuid,
  "startDate" date,
  "endDate" date
)
RETURNS SETOF public."BizAnalyticsDailyV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    bad.date,
    bad.impressions,
    bad.unique_viewers,
    bad.swipes,
    bad.deal_redemptions,
    bad.revenue_estimate_in_cents
  FROM private.biz_analytics_daily bad
  WHERE bad.business_id = "businessId"
    AND bad.date >= "startDate"
    AND bad.date <= "endDate"
    AND EXISTS (
      SELECT 1 FROM private.business b
      WHERE b.id = "businessId" AND b.owner_id = auth.uid()
    )
  ORDER BY bad.date ASC;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBizDash:readDailyMetrics" TO authenticated;

-- Read per-activity analytics breakdown for a business within a date range
CREATE OR REPLACE FUNCTION public."app:planetBizDash:readActivityBreakdown"(
  "businessId" uuid
)
RETURNS SETOF public."BizActivityAnalyticsV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    a.id,
    a.title,
    COALESCE(am.total_impressions, 0),
    COALESCE(am.total_swipes, 0),
    COALESCE(am.conversion_rate_percent, 0)
  FROM private.activity a
  LEFT JOIN private.activity_metrics am ON am.activity_id = a.id
  WHERE a.business_id = "businessId"
    AND a.status = 'ACTIVE'
    AND EXISTS (
      SELECT 1 FROM private.business b
      WHERE b.id = "businessId" AND b.owner_id = auth.uid()
    )
  ORDER BY COALESCE(am.total_impressions, 0) DESC;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBizDash:readActivityBreakdown" TO authenticated;

-- Read per-deal analytics with peak redemption hour
CREATE OR REPLACE FUNCTION public."app:planetBizDash:readDealPerformance"(
  "businessId" uuid
)
RETURNS SETOF public."BizDealAnalyticsV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    d.id,
    d.headline,
    COALESCE(dm.conversion_rate_percent, 0),
    COALESCE((
      SELECT EXTRACT(HOUR FROM dr.redeemed_at)::integer
      FROM private.deal_redemption dr
      WHERE dr.deal_id = d.id
      GROUP BY EXTRACT(HOUR FROM dr.redeemed_at)
      ORDER BY count(*) DESC
      LIMIT 1
    ), 0),
    COALESCE(dm.total_redemptions, 0)
  FROM private.deal d
  LEFT JOIN private.deal_metrics dm ON dm.deal_id = d.id
  WHERE d.business_id = "businessId"
    AND d.status = 'ACTIVE'
    AND EXISTS (
      SELECT 1 FROM private.business b
      WHERE b.id = "businessId" AND b.owner_id = auth.uid()
    )
  ORDER BY COALESCE(dm.total_redemptions, 0) DESC;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetBizDash:readDealPerformance" TO authenticated;

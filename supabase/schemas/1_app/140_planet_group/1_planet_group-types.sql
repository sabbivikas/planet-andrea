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

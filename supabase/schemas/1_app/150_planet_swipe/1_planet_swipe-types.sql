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

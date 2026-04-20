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

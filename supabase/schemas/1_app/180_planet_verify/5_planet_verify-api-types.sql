CREATE TYPE public."VerificationDocumentV1" AS (
  id uuid_notnull,
  "userId" uuid_notnull,
  "idDocumentUrl" text,
  "selfieUrl" text,
  "submittedAt" timestamptz_notnull,
  "reviewedAt" timestamptz
);

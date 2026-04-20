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

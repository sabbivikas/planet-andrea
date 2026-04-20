CREATE TYPE public.organization_role AS ENUM ('OWNER', 'ADMIN', 'MEMBER');
COMMENT ON TYPE public.organization_role IS '
description: Roles and access permissions associated with an organization.
values:
  OWNER: The entity that created the organization. Has most permissions
  ADMIN: An administrator with extended levels of access permissions
  MEMBER: A regular member of an organization with restricted access
';

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

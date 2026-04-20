-----------------------
-- Organization RLS Tests
-- TODO: upgrade this to use the new function API
-------------------------

BEGIN;
SELECT plan(9);

SET ROLE postgres;
SELECT tests.impersonate_user(uuid_at(1, 2));
SELECT is((SELECT auth.uid()), uuid_at(1, 2), 'User 2 is authenticated');

-- Test: user '2' can create an organization for himself
SELECT public."app:organization:user:create"(
  'Test Organization for User 2'
);

SELECT results_eq(
  $$ SELECT COUNT(*) FROM private.organization $$,
  $$ VALUES (2::bigint) $$,
  'User 2 has access to both his organizations' -- 1 from seed trigger, 1 from this test
);

-- User '2' adds '3' as a member to his organization
INSERT INTO private.organization_membership (organization_id, entity_id, role)
SELECT id, uuid_at(1,3), 'MEMBER'
FROM private.organization
WHERE owner_entity_id = uuid_at(1,2)
LIMIT 1;

-- Test: user '2' can update the organization
UPDATE private.organization
SET name = 'New Organization Name for User 2'
WHERE owner_entity_id = uuid_at(1,2);

SELECT results_eq(
  $$ SELECT name FROM private.organization WHERE owner_entity_id = uuid_at(1,2) ORDER BY updated_at DESC LIMIT 1 $$,
  $$ VALUES (('New Organization Name for User 2')) $$,
  'User 2 can update org'
);

-- Test: user '2' can delete an organization he owns
DELETE FROM private.organization_membership
WHERE organization_id = (
  SELECT id
  FROM private.organization
  WHERE owner_entity_id = uuid_at(1, 2)
  ORDER BY created_at DESC
  LIMIT 1
);

DELETE FROM private.organization
WHERE id = (
  SELECT id
  FROM private.organization
  WHERE owner_entity_id = uuid_at(1, 2)
  ORDER BY created_at DESC
  LIMIT 1
);

SELECT results_eq(
  $$ SELECT COUNT(*) FROM private.organization WHERE owner_entity_id = uuid_at(1,2) $$,
  $$ VALUES (1::bigint) $$,
  'User 2 can delete his organizations'
);

-- Test: user '3' can see his organization and the new organization of user '2'
SET ROLE postgres;
SELECT tests.impersonate_user(uuid_at(1, 3));
SELECT results_eq(
  $$ SELECT COUNT(*) FROM private.organization $$,
  $$ VALUES (2::bigint) $$,
  'User 3 can see his organization and the new organization of user 2'
);

-- Test: user '3' can only see one of the organizations of user '2', the one he is a member of
SELECT results_eq(
  $$ SELECT COUNT(*) FROM private.organization WHERE owner_entity_id = uuid_at(1, 2) $$,
  $$ VALUES (1::bigint) $$,
  'User 3 can only see the org he is a member of that belongs to user 2'
);

-- Test: user '3' cannot update the organization of user '2'
UPDATE private.organization
SET name = 'SHOULD_NOT_CHANGE'
WHERE name = 'New Organization Name for User 2';

SELECT isnt_empty(
  $$ SELECT name FROM private.organization WHERE name = 'New Organization Name for User 2' $$
);

-- Test: user '3' cannot delete the organization of user '2' because he is not the owner
DELETE FROM private.organization
WHERE owner_entity_id = uuid_at(1, 2);

SELECT results_eq(
  $$ SELECT COUNT(*) FROM private.organization WHERE owner_entity_id = uuid_at(1, 2) $$,
  $$ VALUES (1::bigint) $$,
  'User 3 cannot delete the org, only the owner can'
);

-- Test: user '4' cannot see the memberships of organization for user '2' or '3'
SET ROLE postgres;
SELECT tests.impersonate_user(uuid_at(1, 4));
SELECT results_eq(
  $$ SELECT COUNT(*) FROM private.organization_membership $$,
  $$ VALUES (1::bigint) $$,
  'User 4 can only see his own memberships'
);

-- Clear Authentication
SET ROLE postgres;
SELECT tests.clear_authentication();

SELECT * FROM finish();
ROLLBACK;

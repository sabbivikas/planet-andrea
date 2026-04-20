DO $$
DECLARE
  _organization_id UUID;
  _user_id UUID;
BEGIN
  FOR _user_id IN (SELECT id FROM auth.users) LOOP
    -- Initialize the organization for the user
    SELECT private.create_new_organization(
      _user_id,
      'My Organization'
    ) INTO _organization_id;
  END LOOP;
END $$;

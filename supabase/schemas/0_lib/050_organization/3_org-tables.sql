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

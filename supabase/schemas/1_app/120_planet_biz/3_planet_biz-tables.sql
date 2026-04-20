CREATE TABLE IF NOT EXISTS private.business (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  logo_url text,
  is_verified boolean NOT NULL DEFAULT false,
  subscription_tier text NOT NULL DEFAULT 'FREE',

  CONSTRAINT business_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  CONSTRAINT business_subscription_tier_values CHECK (subscription_tier IN ('FREE', 'PREMIUM'))
);

CREATE INDEX IF NOT EXISTS business_idx_owner_id ON private.business(owner_id);

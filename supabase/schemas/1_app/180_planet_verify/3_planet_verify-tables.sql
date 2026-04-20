CREATE TABLE IF NOT EXISTS private.verification_document (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  id_document_url text NOT NULL,
  selfie_url text NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at timestamptz
);

CREATE INDEX IF NOT EXISTS verification_document_idx_user_id ON private.verification_document(user_id);

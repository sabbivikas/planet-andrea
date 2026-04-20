-- Submit verification documents
CREATE OR REPLACE FUNCTION public."app:planetVerify:submit"(
  "idDocumentUrl" text,
  "selfieUrl" text
)
RETURNS public."VerificationDocumentV1"
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _result public."VerificationDocumentV1";
  _user_id uuid;
BEGIN
  _user_id := auth.uid();
  IF "idDocumentUrl" IS NULL OR "selfieUrl" IS NULL OR _user_id IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO private.verification_document (user_id, id_document_url, selfie_url)
  VALUES (_user_id, "idDocumentUrl", "selfieUrl")
  RETURNING id, user_id, id_document_url, selfie_url, submitted_at, reviewed_at
  INTO _result;

  -- Update user verification status to PENDING
  UPDATE private.user_app_profile SET
    verification_status = 'PENDING',
    updated_at = CURRENT_TIMESTAMP
  WHERE user_id = _user_id;

  RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetVerify:submit" TO authenticated;

-- Read the current user's latest verification document
CREATE OR REPLACE FUNCTION public."app:planetVerify:read"()
RETURNS public."VerificationDocumentV1"
SECURITY DEFINER
SET search_path = ''
STABLE
LANGUAGE sql
AS $$
  SELECT
    vd.id, vd.user_id, vd.id_document_url, vd.selfie_url,
    vd.submitted_at, vd.reviewed_at
  FROM private.verification_document vd
  WHERE vd.user_id = auth.uid()
  ORDER BY vd.submitted_at DESC
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public."app:planetVerify:read" TO authenticated;

-- Admin: review a verification document
CREATE OR REPLACE FUNCTION public."admin:planetVerify:review"(
  "documentId" uuid,
  "approved" boolean
)
RETURNS void
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  _user_id uuid;
  _new_status public.verification_status;
  _is_verified boolean;
BEGIN
  IF "documentId" IS NULL OR "approved" IS NULL THEN
    RETURN;
  END IF;

  SELECT vd.user_id INTO _user_id
  FROM private.verification_document vd
  WHERE vd.id = "documentId";

  IF _user_id IS NULL THEN
    RETURN;
  END IF;

  UPDATE private.verification_document SET
    reviewed_at = CURRENT_TIMESTAMP
  WHERE id = "documentId";

  IF "approved" THEN
    _new_status := 'VERIFIED'::public.verification_status;
    _is_verified := true;
  ELSE
    _new_status := 'FAILED'::public.verification_status;
    _is_verified := false;
  END IF;

  UPDATE private.user_app_profile SET
    verification_status = COALESCE(_new_status, verification_status),
    is_verified = COALESCE(_is_verified, is_verified),
    updated_at = CURRENT_TIMESTAMP
  WHERE user_id = _user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public."admin:planetVerify:review" TO service_role;

INSERT INTO storage.buckets (id, name)
  VALUES ('verification-documents', 'verification-documents')
  ON CONFLICT (id) DO NOTHING;

-- Only the document owner can read their own verification documents
CREATE POLICY "Users can read their own verification documents" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'verification-documents'
    AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
  );

-- Authenticated users can upload verification documents to their own folder
CREATE POLICY "Users can upload their own verification documents" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'verification-documents'
    AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
  );

-- Users can update their own verification documents
CREATE POLICY "Users can update their own verification documents" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'verification-documents'
    AND (SELECT auth.uid())::text = owner_id::text
  )
  WITH CHECK (
    bucket_id = 'verification-documents'
    AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
  );

-- Service role has full access for admin review
CREATE POLICY "Service role has full access to verification documents" ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'verification-documents')
  WITH CHECK (bucket_id = 'verification-documents');

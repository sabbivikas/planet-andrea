INSERT INTO storage.buckets (id, name)
  VALUES ('activity-images', 'activity-images')
  ON CONFLICT (id) DO NOTHING;

-- Activity images are publicly accessible for discovery feed
CREATE POLICY "Activity images are publicly accessible" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'activity-images');

-- Authenticated users can upload activity images
CREATE POLICY "Authenticated users can upload activity images" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'activity-images');

-- Users can update their own activity images
CREATE POLICY "Users can update their own activity images" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = owner_id::uuid)
  WITH CHECK (bucket_id = 'activity-images');

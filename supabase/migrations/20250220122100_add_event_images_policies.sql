-- Set up storage for event images
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for event images
CREATE POLICY "Event images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

CREATE POLICY "Authenticated users can upload event images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-images');

CREATE POLICY "Users can update their event images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'event-images');

CREATE POLICY "Users can delete their event images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-images');

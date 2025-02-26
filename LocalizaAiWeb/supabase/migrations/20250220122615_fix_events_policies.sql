-- Drop existing policies for events
DROP POLICY IF EXISTS "Anyone can view events" ON events;
DROP POLICY IF EXISTS "Organizers can create events" ON events;
DROP POLICY IF EXISTS "Organizers can update their events" ON events;

-- Recreate policies for events with proper permissions
CREATE POLICY "Enable read access for all users"
ON events FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON events FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for event owners"
ON events FOR UPDATE
TO authenticated
USING (auth.uid() = organizer_id);

CREATE POLICY "Enable delete for event owners"
ON events FOR DELETE
TO authenticated
USING (auth.uid() = organizer_id);

-- Drop existing storage policies
DROP POLICY IF EXISTS "Event images public read access" ON storage.objects;
DROP POLICY IF EXISTS "Event images upload access" ON storage.objects;
DROP POLICY IF EXISTS "Event images delete access" ON storage.objects;

-- Recreate storage policies with simpler rules
CREATE POLICY "Event images public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

CREATE POLICY "Event images upload access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-images');

CREATE POLICY "Event images delete access"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-images');

-- Ensure event-images bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[];

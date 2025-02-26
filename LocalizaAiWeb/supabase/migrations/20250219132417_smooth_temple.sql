-- Drop existing bucket if it exists
DROP EXTENSION IF EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Recreate the bucket with proper settings
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

-- Add coordinates columns to events table if they don't exist
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS latitude double precision,
ADD COLUMN IF NOT EXISTS longitude double precision;

-- Enable RLS for storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create storage policies
DO $$ 
BEGIN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Event images public read access" ON storage.objects;
    DROP POLICY IF EXISTS "Event images upload access" ON storage.objects;
    DROP POLICY IF EXISTS "Event images delete access" ON storage.objects;
    
    -- Create new policies
    CREATE POLICY "Event images public read access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'event-images');
    
    CREATE POLICY "Event images upload access"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'event-images' 
        AND (auth.uid())::text = (storage.foldername(name))[1]
    );

    CREATE POLICY "Event images delete access"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'event-images' 
        AND (auth.uid())::text = (storage.foldername(name))[1]
    );
END $$;
-- Create storage bucket for event images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create storage policy for event images
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Event images public read access" ON storage.objects;
    DROP POLICY IF EXISTS "Event images upload access" ON storage.objects;
    
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
END $$;
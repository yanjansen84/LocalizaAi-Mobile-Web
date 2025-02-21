-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own data" ON users;
    DROP POLICY IF EXISTS "Users can update their own data" ON users;
    DROP POLICY IF EXISTS "Users can insert their own data" ON users;
    DROP POLICY IF EXISTS "Anyone can insert users" ON users;
END $$;

-- Create new policies
CREATE POLICY "Anyone can insert users"
  ON users
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create storage bucket for avatars if it doesn't exist
DO $$ 
BEGIN
    INSERT INTO storage.buckets (id, name)
    VALUES ('avatars', 'avatars')
    ON CONFLICT (id) DO NOTHING;
END $$;

-- Enable RLS for storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create storage policy for avatars
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Avatar storage access" ON storage.objects;
    
    CREATE POLICY "Avatar storage access"
    ON storage.objects FOR ALL
    TO authenticated
    USING (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1])
    WITH CHECK (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);
END $$;
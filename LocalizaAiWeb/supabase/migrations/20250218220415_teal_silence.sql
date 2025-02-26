-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public users read access" ON users;
    DROP POLICY IF EXISTS "Anyone can insert users" ON users;
    DROP POLICY IF EXISTS "Users can update their own data" ON users;
END $$;

-- Create new policies with better security
CREATE POLICY "Public users read access"
  ON users
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert users"
  ON users
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Ensure email uniqueness is properly enforced
DO $$ 
BEGIN
    ALTER TABLE users 
      DROP CONSTRAINT IF EXISTS users_email_key;
    
    ALTER TABLE users 
      ADD CONSTRAINT users_email_key UNIQUE (email);
END $$;

-- Create storage bucket for avatars if it doesn't exist
DO $$ 
BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('avatars', 'avatars', true)
    ON CONFLICT (id) DO NOTHING;
END $$;

-- Enable RLS for storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create storage policy for avatars
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Avatar storage access" ON storage.objects;
    DROP POLICY IF EXISTS "Avatar public read access" ON storage.objects;
    DROP POLICY IF EXISTS "Avatar upload access" ON storage.objects;
    
    CREATE POLICY "Avatar public read access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');
    
    CREATE POLICY "Avatar upload access"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'avatars' 
        AND (auth.uid())::text = (storage.foldername(name))[1]
    );
END $$;
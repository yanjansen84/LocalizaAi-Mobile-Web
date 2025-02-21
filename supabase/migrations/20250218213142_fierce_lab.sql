/*
  # Update users table policies

  1. Changes
    - Add policy for users to update their own data
    - Add policy for users to insert their own data
    - Update existing select policy

  2. Security
    - Users can only manage their own data
    - Maintains data isolation between users
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own data" ON users;
    DROP POLICY IF EXISTS "Users can update their own data" ON users;
    DROP POLICY IF EXISTS "Users can insert their own data" ON users;
END $$;

-- Create new policies
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

CREATE POLICY "Users can insert their own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

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
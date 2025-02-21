/*
  # Fix database schema and policies

  1. Schema Updates
    - Ensure users table has correct structure
    - Add missing constraints
    - Update RLS policies

  2. Storage
    - Configure avatar storage bucket
    - Set up proper storage policies
*/

-- Recreate users table with proper structure
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public users read access" ON users;
    DROP POLICY IF EXISTS "Anyone can insert users" ON users;
    DROP POLICY IF EXISTS "Users can update their own data" ON users;
END $$;

-- Create new policies
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

-- Set up storage
DO $$ 
BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('avatars', 'avatars', true)
    ON CONFLICT (id) DO NOTHING;
END $$;

-- Storage policies
DO $$ 
BEGIN
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
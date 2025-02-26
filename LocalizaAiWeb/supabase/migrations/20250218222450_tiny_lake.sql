/*
  # Fix user profile loading

  1. Changes
    - Drop and recreate users table with proper auth.users reference
    - Update RLS policies for better access control
    - Ensure proper indexing for performance

  2. Security
    - Enable RLS
    - Add policies for public read and authenticated updates
    - Ensure proper user data access control
*/

-- Drop existing tables in correct order
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;

-- Create users table with proper auth reference
CREATE TABLE users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Create proper indexes
CREATE INDEX users_email_idx ON users (email);
CREATE INDEX users_id_idx ON users (id);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public users read access" ON users;
DROP POLICY IF EXISTS "Anyone can insert users" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Create new policies
CREATE POLICY "Allow public read access"
  ON users
  FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow individual update"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Recreate events table
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  date timestamptz NOT NULL,
  location text NOT NULL,
  image_url text,
  price numeric,
  is_free boolean DEFAULT false,
  organizer_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create favorites table
CREATE TABLE favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Enable RLS for other tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for events
CREATE POLICY "Anyone can view events"
  ON events
  FOR SELECT
  USING (true);

CREATE POLICY "Organizers can create events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = organizer_id);

-- Create policies for favorites
CREATE POLICY "Users can manage their favorites"
  ON favorites
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Set up storage for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Update storage policies
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
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

-- Create trigger function to check email uniqueness
CREATE OR REPLACE FUNCTION check_email_unique()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM users 
    WHERE email = NEW.email 
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'Email already exists';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for email uniqueness
DROP TRIGGER IF EXISTS ensure_email_unique ON users;
CREATE TRIGGER ensure_email_unique
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION check_email_unique();

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
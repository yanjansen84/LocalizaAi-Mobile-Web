-- Add category columns to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES categories(id),
ADD COLUMN IF NOT EXISTS subcategory_id uuid REFERENCES subcategories(id);

-- Update RLS policies to include new columns
DROP POLICY IF EXISTS "Enable read access for all users" ON events;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON events;
DROP POLICY IF EXISTS "Enable update for event owners" ON events;
DROP POLICY IF EXISTS "Enable delete for event owners" ON events;

-- Recreate policies
CREATE POLICY "Enable read access for all users"
ON events FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON events FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Enable update for event owners"
ON events FOR UPDATE
TO authenticated
USING (auth.uid() = organizer_id);

CREATE POLICY "Enable delete for event owners"
ON events FOR DELETE
TO authenticated
USING (auth.uid() = organizer_id);

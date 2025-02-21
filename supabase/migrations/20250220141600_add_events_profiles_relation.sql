-- Add organizer_id column to events table if it doesn't exist
ALTER TABLE events
ADD COLUMN IF NOT EXISTS organizer_id uuid REFERENCES auth.users(id);

-- Create foreign key relationship between events and profiles
ALTER TABLE events
ADD CONSTRAINT fk_events_profiles
FOREIGN KEY (organizer_id) 
REFERENCES auth.users(id)
ON DELETE CASCADE;

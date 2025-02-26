-- Add is_featured column to events table
ALTER TABLE events ADD COLUMN is_featured BOOLEAN DEFAULT false;

-- Create an index for faster queries on featured events
CREATE INDEX idx_events_is_featured ON events(is_featured) WHERE is_featured = true;

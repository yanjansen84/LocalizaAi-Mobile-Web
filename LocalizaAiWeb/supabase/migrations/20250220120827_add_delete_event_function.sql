-- Create a function to safely delete events
CREATE OR REPLACE FUNCTION delete_event(event_id uuid, user_id uuid)
RETURNS void AS $$
BEGIN
  -- Delete the event only if the user is the organizer
  DELETE FROM events
  WHERE id = event_id AND organizer_id = user_id;
  
  -- If no rows were deleted, the event doesn't exist or user is not the organizer
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event not found or you are not authorized to delete it';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set correct search path
SET search_path = public;

-- Create followers table
CREATE TABLE IF NOT EXISTS followers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    followed_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(follower_id, followed_id)
);

-- Add RLS policies
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;

-- Followers policies
CREATE POLICY "Users can view all followers" ON followers
    FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON followers
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" ON followers
    FOR DELETE USING (auth.uid() = follower_id);

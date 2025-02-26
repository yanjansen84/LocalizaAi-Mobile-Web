-- Set correct search path
SET search_path = public;

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create post_likes table
CREATE TABLE IF NOT EXISTS post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(post_id, user_id)
);

-- Create post_comments table
CREATE TABLE IF NOT EXISTS post_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Primeiro, vamos verificar se a função existe
SELECT routine_name, routine_type, specific_schema
FROM information_schema.routines
WHERE routine_name = 'get_user_feed'
  AND specific_schema = 'public';

-- Drop existing function first
DROP FUNCTION IF EXISTS public.get_user_feed(UUID);

-- Create function to get user feed
CREATE OR REPLACE FUNCTION public.get_user_feed(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    image_url TEXT,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    user_full_name TEXT,
    user_avatar_url TEXT,
    likes_count BIGINT,
    is_liked BOOLEAN,
    comments_count BIGINT,
    latest_comment_user_full_name TEXT,
    latest_comment_content TEXT
) LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH followed_users AS (
        SELECT followed_id 
        FROM followers 
        WHERE follower_id = p_user_id
    ),
    post_stats AS (
        SELECT 
            p.id,
            COUNT(DISTINCT pl.id) as likes_count,
            COUNT(DISTINCT pc.id) as comments_count,
            EXISTS (
                SELECT 1 
                FROM post_likes 
                WHERE post_id = p.id AND user_id = p_user_id
            ) as is_liked,
            (
                SELECT row_to_json(comment_info)
                FROM (
                    SELECT 
                        profiles.full_name as user_full_name,
                        pc.content
                    FROM post_comments pc
                    JOIN profiles ON profiles.id = pc.user_id
                    WHERE pc.post_id = p.id
                    ORDER BY pc.created_at DESC
                    LIMIT 1
                ) comment_info
            ) as latest_comment
        FROM posts p
        LEFT JOIN post_likes pl ON pl.post_id = p.id
        LEFT JOIN post_comments pc ON pc.post_id = p.id
        GROUP BY p.id
    )
    SELECT 
        p.id,
        p.image_url,
        p.caption,
        p.created_at,
        profiles.full_name as user_full_name,
        profiles.avatar_url as user_avatar_url,
        COALESCE(ps.likes_count, 0) as likes_count,
        COALESCE(ps.is_liked, false) as is_liked,
        COALESCE(ps.comments_count, 0) as comments_count,
        (ps.latest_comment->>'user_full_name')::TEXT as latest_comment_user_full_name,
        (ps.latest_comment->>'content')::TEXT as latest_comment_content
    FROM posts p
    JOIN profiles ON profiles.id = p.user_id
    LEFT JOIN post_stats ps ON ps.id = p.id
    WHERE p.user_id IN (SELECT * FROM followed_users)
        OR p.user_id = p_user_id
    ORDER BY p.created_at DESC
    LIMIT 10;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_feed(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_feed(UUID) TO service_role;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all posts" ON posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

DROP POLICY IF EXISTS "Users can view all likes" ON post_likes;
DROP POLICY IF EXISTS "Users can like posts" ON post_likes;
DROP POLICY IF EXISTS "Users can unlike posts" ON post_likes;

DROP POLICY IF EXISTS "Users can view all comments" ON post_comments;
DROP POLICY IF EXISTS "Users can comment on posts" ON post_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON post_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON post_comments;

-- Add RLS policies
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Users can view all posts" ON posts
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own posts" ON posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON posts
    FOR DELETE USING (auth.uid() = user_id);

-- Post likes policies
CREATE POLICY "Users can view all likes" ON post_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can like posts" ON post_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts" ON post_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Post comments policies
CREATE POLICY "Users can view all comments" ON post_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can comment on posts" ON post_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON post_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON post_comments
    FOR DELETE USING (auth.uid() = user_id);

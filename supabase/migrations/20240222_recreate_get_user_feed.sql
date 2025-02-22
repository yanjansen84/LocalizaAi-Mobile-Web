-- Set correct search path
SET search_path = public;

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

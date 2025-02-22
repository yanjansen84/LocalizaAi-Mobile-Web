-- Set correct search path
SET search_path = public;

-- Drop existing function first
DROP FUNCTION IF EXISTS public.get_user_feed(UUID);

-- Create a simplified version of the function
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
    -- Retorna apenas os posts do próprio usuário para teste
    RETURN QUERY
    SELECT 
        p.id,
        p.image_url,
        p.caption,
        p.created_at,
        profiles.full_name as user_full_name,
        profiles.avatar_url as user_avatar_url,
        CAST(0 AS BIGINT) as likes_count,
        false as is_liked,
        CAST(0 AS BIGINT) as comments_count,
        NULL::TEXT as latest_comment_user_full_name,
        NULL::TEXT as latest_comment_content
    FROM posts p
    JOIN profiles ON profiles.id = p.user_id
    WHERE p.user_id = p_user_id
    ORDER BY p.created_at DESC
    LIMIT 10;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_feed(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_feed(UUID) TO service_role;

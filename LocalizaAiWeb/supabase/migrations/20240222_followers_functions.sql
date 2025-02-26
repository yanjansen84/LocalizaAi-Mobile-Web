-- Função para buscar seguidores de um usuário
CREATE OR REPLACE FUNCTION get_user_followers(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    avatar_url TEXT,
    is_following BOOLEAN
) LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.avatar_url,
        EXISTS (
            SELECT 1 
            FROM followers f2 
            WHERE f2.follower_id = auth.uid() 
            AND f2.followed_id = p.id
        ) as is_following
    FROM followers f
    JOIN profiles p ON p.id = f.follower_id
    WHERE f.followed_id = p_user_id
    ORDER BY p.full_name;
END;
$$;

-- Função para buscar quem um usuário está seguindo
CREATE OR REPLACE FUNCTION get_user_following(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    avatar_url TEXT,
    is_following BOOLEAN
) LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.avatar_url,
        EXISTS (
            SELECT 1 
            FROM followers f2 
            WHERE f2.follower_id = auth.uid() 
            AND f2.followed_id = p.id
        ) as is_following
    FROM followers f
    JOIN profiles p ON p.id = f.followed_id
    WHERE f.follower_id = p_user_id
    ORDER BY p.full_name;
END;
$$;

-- Conceder permissões
GRANT EXECUTE ON FUNCTION get_user_followers(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_following(UUID) TO authenticated;

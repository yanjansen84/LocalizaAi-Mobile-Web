-- Adicionar colunas necessárias à tabela posts
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- Criar tabela de likes se não existir
CREATE TABLE IF NOT EXISTS post_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, post_id)
);

-- Criar função para atualizar contador de likes
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts 
        SET likes_count = likes_count + 1
        WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts 
        SET likes_count = likes_count - 1
        WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar contador de likes
DROP TRIGGER IF EXISTS update_post_likes_count_trigger ON post_likes;
CREATE TRIGGER update_post_likes_count_trigger
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW
EXECUTE FUNCTION update_post_likes_count();

-- Função para buscar posts de um usuário com contadores
CREATE OR REPLACE FUNCTION get_user_posts(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    image_url TEXT,
    caption TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    likes_count INTEGER,
    comments_count INTEGER,
    is_liked BOOLEAN,
    user_full_name TEXT,
    user_avatar_url TEXT
) LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.user_id,
        p.image_url,
        p.caption,
        p.location,
        p.created_at,
        p.likes_count,
        p.comments_count,
        EXISTS (
            SELECT 1 
            FROM post_likes pl 
            WHERE pl.post_id = p.id 
            AND pl.user_id = auth.uid()
        ) as is_liked,
        pr.full_name as user_full_name,
        pr.avatar_url as user_avatar_url
    FROM posts p
    JOIN profiles pr ON pr.id = p.user_id
    WHERE p.user_id = p_user_id
    ORDER BY p.created_at DESC;
END;
$$;

-- Conceder permissões
GRANT ALL ON TABLE post_likes TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_posts(UUID) TO authenticated;

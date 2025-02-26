-- Insere um perfil padrão para o usuário atual se não existir
INSERT INTO profiles (id, full_name, avatar_url)
SELECT 
    id,
    COALESCE(raw_user_meta_data->>'full_name', email) as full_name,
    raw_user_meta_data->>'avatar_url' as avatar_url
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);

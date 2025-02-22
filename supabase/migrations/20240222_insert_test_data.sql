-- Inserir alguns posts de teste (substitua USER_ID pelo seu ID de usuário)
INSERT INTO posts (user_id, image_url, caption) VALUES 
    ('USER_ID', 'https://picsum.photos/800/600', 'Meu primeiro post no feed!'),
    ('USER_ID', 'https://picsum.photos/800/601', 'Testando o sistema de posts');

-- Para testar likes e comentários, você precisará criar mais alguns usuários
-- e usar seus IDs para criar interações.

-- Para testar, você pode executar estas consultas:

-- Ver todos os posts
SELECT p.*, pr.full_name 
FROM posts p 
JOIN profiles pr ON pr.id = p.user_id;

-- Ver todos os seguidores
SELECT 
    f.*, 
    p1.full_name as follower_name,
    p2.full_name as followed_name
FROM followers f
JOIN profiles p1 ON p1.id = f.follower_id
JOIN profiles p2 ON p2.id = f.followed_id;

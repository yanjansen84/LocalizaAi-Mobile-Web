-- Verificar perfis existentes
SELECT p.*, u.email 
FROM profiles p 
JOIN auth.users u ON u.id = p.id;

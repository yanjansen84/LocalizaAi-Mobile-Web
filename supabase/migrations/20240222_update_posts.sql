-- Adicionar colunas se não existirem
alter table public.posts
add column if not exists image_url text,
add column if not exists caption text,
add column if not exists location text;

-- Criar índices para melhor performance
create index if not exists posts_user_id_idx on posts(user_id);
create index if not exists posts_created_at_idx on posts(created_at desc);

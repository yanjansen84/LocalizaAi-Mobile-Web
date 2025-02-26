-- Criar tabela de posts
create table if not exists public.posts (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    image_url text not null,
    caption text,
    location text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.posts enable row level security;

-- Criar política para permitir que todos vejam os posts
create policy "Posts are viewable by everyone"
    on posts for select
    using (true);

-- Criar política para permitir que usuários criem seus próprios posts
create policy "Users can create their own posts"
    on posts for insert
    with check (auth.uid() = user_id);

-- Criar política para permitir que usuários deletem seus próprios posts
create policy "Users can delete their own posts"
    on posts for delete
    using (auth.uid() = user_id);

-- Criar índices para melhor performance
create index if not exists posts_user_id_idx on posts(user_id);
create index if not exists posts_created_at_idx on posts(created_at desc);

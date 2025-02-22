-- Criar a tabela de perfis se não existir
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade not null primary key,
    full_name text,
    avatar_url text,
    bio text,
    phone text,
    birth_date date,
    country text default 'Brasil',
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    constraint username_length check (char_length(full_name) >= 3)
);

-- Habilitar RLS
alter table public.profiles enable row level security;

-- Criar política para permitir que usuários vejam outros perfis
create policy "Profiles are viewable by everyone"
    on profiles for select
    using (true);

-- Criar política para permitir que usuários atualizem seus próprios perfis
create policy "Users can update their own profiles"
    on profiles for update
    using (auth.uid() = id);

-- Criar função para criar perfil automaticamente
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, full_name, avatar_url)
    values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
    return new;
end;
$$ language plpgsql security definer;

-- Criar trigger para criar perfil quando um novo usuário for criado
create or replace trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();
